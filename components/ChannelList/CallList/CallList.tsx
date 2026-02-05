import { useDiscordContext } from "@/contexts/DiscordContext";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, PlusIcon, Speaker } from "../Icons";
import Link from "next/link";

export default function CallList(): JSX.Element {
  const { server, callId, setCall } = useDiscordContext();
  const client = useStreamVideoClient();

  const [isOpen, setIsOpen] = useState(true);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);

  const serverName = useMemo(() => server?.name ?? "default-server", [server]);

  const loadVoiceSessions = useCallback(async () => {
    if (!client) return;

    setLoading(true);

    const res = await client.queryCalls({
      filter_conditions: {
        type: "default",
        "custom.serverName": serverName,
      },
      sort: [{ field: "created_at", direction: 1 }],
      watch: false, // 👈 important change
    });

    setCalls(res.calls ?? []);
    setLoading(false);
  }, [client, serverName]);

  useEffect(() => {
    loadVoiceSessions();
  }, [loadVoiceSessions]);

  const handleJoinCall = async (call: Call) => {
    if (call.id === callId) return;

    // lazy-join: only connect when user clicks
    await call.join({ create: true });
    setCall(call.id);
  };

  return (
    <div className="w-full my-2">
      {/* Header */}
      <div className="flex text-gray-500 items-center mb-2 pr-2">
        <button
          className="flex w-full items-center px-2"
          onClick={() => setIsOpen((v) => !v)}
        >
          <div
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          >
            <ChevronRight />
          </div>
          <h2 className="uppercase text-sm font-bold px-2">Voice Channels</h2>
        </button>

        <Link
          href={`/?createChannel=true&isVoice=true&category=Voice Channels`}
        >
          <PlusIcon />
        </Link>
      </div>

      {/* Channels */}
      {isOpen && (
        <div className="px-2 space-y-1">
          {loading && <p className="text-xs text-gray-400 px-2">Loading…</p>}

          {calls.map((call) => {
            const isActive = call.id === callId;
            const participants = call.state.participants?.length ?? 0;

            return (
              <button
                key={call.id}
                onClick={() => handleJoinCall(call)}
                className={`w-full flex items-center px-2 py-1 rounded-md transition
                  ${
                    isActive ? "bg-gray-300 font-semibold" : "hover:bg-gray-200"
                  }`}
              >
                <Speaker
                  className={`w-5 h-5 mr-2 ${
                    isActive ? "text-green-600" : "text-gray-500"
                  }`}
                />
                <span className="text-sm flex-1 truncate">
                  {call.state.custom.callName ?? "Voice Channel"}
                </span>

                {participants > 0 && (
                  <span className="text-xs text-gray-500">{participants}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
