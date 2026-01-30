import { useDiscordContext } from "@/contexts/DiscordContext";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, PlusIcon, Speaker } from "../Icons";
import Link from "next/link";

export default function CallList(): JSX.Element {
  const { server, callId, setCall } = useDiscordContext();
  const client = useStreamVideoClient();

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [calls, setCalls] = useState<Call[]>([]);

  const loadAudioChannels = useCallback(async () => {
    const callsRequest = await client?.queryCalls({
      filter_conditions: {
        "custom.serverName": server?.name || "Test Server",
      },
      sort: [{ field: "created_at", direction: 1 }],
      watch: true,
    });
    if (callsRequest?.calls) {
      setCalls(callsRequest?.calls);
    }
  }, [client, server]);

  useEffect(() => {
    loadAudioChannels();
  }, [loadAudioChannels]);

  return (
    <div className="w-full my-2 text-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between px-2 mb-1 text-xs uppercase tracking-wide font-semibold text-gray-400">
        <button
          className="flex items-center gap-1 hover:text-gray-200 transition-colors"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div
            className={`transform transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          >
            <ChevronRight />
          </div>
          <span>Voice Channels</span>
        </button>
        <Link
          href={`/?createChannel=true&isVoice=true&category=Voice Channels`}
          className="hover:text-white transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
        </Link>
      </div>

      {/* Channel List */}
      {isOpen && (
        <div className="px-2">
          {calls.map((call) => (
            <button
              key={call.id}
              onClick={() => setCall(call.id)}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors
                ${
                  call.id === callId
                    ? "bg-gray-700 text-white font-semibold"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
            >
              <Speaker className="w-4 h-4" />
              <span className="truncate">
                {call.state.custom.callName || "Channel Preview"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
