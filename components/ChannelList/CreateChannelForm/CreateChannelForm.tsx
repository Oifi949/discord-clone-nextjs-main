"use client";

import { useEffect, useState } from "react";
import { useChatContext } from "stream-chat-react";
import type { Channel as StreamChannel } from "stream-chat";
import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";
import VoiceStatusBar from "@/components/VoiceStatusBar/VoiceStatusBar";

export default function DiscordLikeChannelsPage() {
  const { client } = useChatContext();
  const videoClient = useStreamVideoClient();

  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [connectionState, setConnectionState] = useState<
    "idle" | "connecting" | "connected"
  >("idle");

  /* --------------------------------------------
   * LOAD CHANNELS
   * -------------------------------------------- */
  useEffect(() => {
    if (!client) return;

    async function loadChannels() {
      const res = await client.queryChannels(
        { type: "messaging", members: { $in: [client.userID!] } },
        { created_at: 1 },
        { watch: true },
      );
      setChannels(res);
    }

    loadChannels();
  }, [client]);

  /* --------------------------------------------
   * CREATE CHANNEL
   * -------------------------------------------- */
  async function createChannel(name: string, isVoice = false) {
    if (!client) return;

    const channel = client.channel("messaging", {
      name,
      isVoice,
      members: [client.userID!],
    });

    await channel.create();
    setChannels((prev) => [...prev, channel]);
  }

  /* --------------------------------------------
   * JOIN VOICE CHANNEL
   * -------------------------------------------- */
  async function joinVoiceChannel(channel: StreamChannel) {
    if (!videoClient || !channel.id) return;

    try {
      setConnectionState("connecting");

      if (activeCall) {
        await activeCall.leave();
      }

      const call = videoClient.call("default", channel.id);
      await call.join({ create: true });
      call.microphone.disable();

      setActiveCall(call);
      setConnectionState("connected");
    } catch (err) {
      console.error("Join voice failed", err);
      setConnectionState("idle");
    }
  }

  async function leaveVoiceChannel() {
    if (!activeCall) return;
    await activeCall.leave();
    setActiveCall(null);
    setConnectionState("idle");
  }

  /* --------------------------------------------
   * UI
   * -------------------------------------------- */
  return (
    <div className="flex h-screen bg-[#313338] text-gray-200">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#2b2d31] p-4 space-y-4">
        <h2 className="text-xs font-bold uppercase text-gray-400">Channels</h2>

        {/* TEXT */}
        <div>
          <p className="text-xs uppercase text-gray-500 mb-1">Text</p>
          {channels
            .filter((c) => !c.data?.isVoice)
            .map((c) => (
              <div key={c.id} className="px-2 py-1 rounded hover:bg-[#3f4147]">
                # {c.data?.name}
              </div>
            ))}
        </div>

        {/* VOICE */}
        <div>
          <p className="text-xs uppercase text-gray-500 mb-1">Voice</p>
          {channels
            .filter((c) => c.data?.isVoice)
            .map((c) => (
              <button
                key={c.id}
                onClick={() => joinVoiceChannel(c)}
                className="w-full text-left px-2 py-1 rounded hover:bg-[#3f4147]"
              >
                🔊 {c.data?.name}
              </button>
            ))}
        </div>

        {/* CREATE */}
        <div className="pt-4 space-y-2">
          <button
            onClick={() => createChannel("new-text")}
            className="w-full bg-[#3f4147] px-2 py-1 rounded text-sm"
          >
            + Text Channel
          </button>

          <button
            onClick={() => createChannel("new-voice", true)}
            className="w-full bg-[#3f4147] px-2 py-1 rounded text-sm"
          >
            + Voice Channel
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 pb-24">
        {!activeCall && (
          <p className="text-gray-400">Join a voice channel to start talking</p>
        )}

        {activeCall && (
          <div className="space-y-2">
            <h1 className="text-xl font-bold">🎙 Voice Connected</h1>
            <p className="text-sm text-gray-400">State: {connectionState}</p>
            <button
              onClick={leaveVoiceChannel}
              className="bg-red-600 px-4 py-2 rounded"
            >
              Leave
            </button>
          </div>
        )}
      </main>

      {activeCall && (
        <VoiceStatusBar call={activeCall} onLeave={leaveVoiceChannel} />
      )}
    </div>
  );
}
