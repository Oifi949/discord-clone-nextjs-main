"use client";

import { useEffect, useState } from "react";
import { DefaultStreamChatGenerics, useChatContext } from "stream-chat-react";
import { ChannelSortBase, Channel as StreamChannel } from "stream-chat";
import VoiceStatusBar from "@/components/VoiceStatusBar/VoiceStatusBar";
import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";

/**
 * DISCORD MENTAL MODEL
 *
 * - Channels = persistent (Stream Chat)
 * - Voice channels are marked with: channel.data.isVoice === true
 * - Calls = ephemeral (Stream Video)
 * - Calls are created ONLY when joining
 */

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
      const filter = { type: "messaging" };
      const sort: ChannelSortBase<DefaultStreamChatGenerics>[] = [
        {
          created_at: 1,
        },
      ];
      const options = { watch: true };

      const res = await client.queryChannels(filter, sort, options);

      setChannels(res);
    }

    loadChannels();
  }, [client]);

  /* --------------------------------------------
   * CREATE CHANNEL (TEXT OR VOICE)
   * -------------------------------------------- */
  async function createChannel(
    name: string,
    category: string,
    isVoice: boolean,
  ) {
    if (!client) return;

    const channel = client.channel("messaging", name, {
      name,
      category,
      isVoice,
    });

    await channel.create();
  }

  /* --------------------------------------------
   * JOIN VOICE CHANNEL
   * -------------------------------------------- */
  async function joinVoiceChannel(channel: StreamChannel) {
    if (!videoClient || !channel.id) return;

    const callId = channel.id;
    const call = videoClient.call("default", callId);

    try {
      setConnectionState("connecting");

      // Discord rule: only one active voice channel
      if (activeCall && activeCall.id !== callId) {
        await activeCall.leave();
      }

      await call.join({ create: true });

      // Discord behavior
      call.microphone.disable();

      setActiveCall(call);
      setConnectionState("connected");
    } catch (err) {
      console.error("Failed to join voice", err);
      setConnectionState("idle");
    }
  }

  /* --------------------------------------------
   * LEAVE VOICE CHANNEL
   * -------------------------------------------- */
  async function leaveVoiceChannel() {
    if (!activeCall) return;

    await activeCall.leave();
    setActiveCall(null);
    setConnectionState("idle");
  }

  /* --------------------------------------------
   * RENDER
   * -------------------------------------------- */
  return (
    <div className="relative flex h-screen w-64 flex-col bg-[#2b2d31]">
      {/* SIDEBAR */}
      <aside className="w-72 bg-gray-100 p-4 space-y-6">
        <h2 className="font-bold uppercase text-sm text-gray-500">Channels</h2>

        {/* TEXT CHANNELS */}
        <div>
          <p className="text-xs uppercase text-gray-400 mb-1">Text</p>
          {channels
            .filter((c) => !c.data?.isVoice)
            .map((channel) => (
              <div key={channel.id} className="px-2 py-1 text-sm">
                # {channel.data?.name}
              </div>
            ))}
        </div>

        {/* VOICE CHANNELS */}
        <div>
          <p className="text-xs uppercase text-gray-400 mb-1">Voice</p>
          {channels
            .filter((c) => c.data?.isVoice)
            .map((channel) => {
              const isActive = activeCall?.id === channel.id;

              return (
                <button
                  key={channel.id}
                  onClick={() => joinVoiceChannel(channel)}
                  className={`w-full flex justify-between items-center px-2 py-1 rounded
                    ${
                      isActive
                        ? "bg-green-200 font-semibold"
                        : "hover:bg-gray-200"
                    }`}
                >
                  <span>🔊 {channel.data?.name}</span>
                  {isActive && <span className="text-xs">LIVE</span>}
                </button>
              );
            })}
        </div>

        {/* QUICK CREATE */}
        <div className="pt-4 space-y-2">
          <button
            onClick={() => createChannel("general-chat", "General", false)}
            className="w-full bg-white border px-2 py-1 text-sm"
          >
            + Text Channel
          </button>

          <button
            onClick={() => createChannel("general-voice", "General", true)}
            className="w-full bg-white border px-2 py-1 text-sm"
          >
            + Voice Channel
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 pb-20 overflow-y-auto">
        {!activeCall && (
          <p className="text-gray-500">Join a voice channel to start talking</p>
        )}

        {activeCall && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">🎤 Voice Connected</h1>

            <p className="text-sm text-gray-500">State: {connectionState}</p>

            <button
              onClick={leaveVoiceChannel}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Leave Voice
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
