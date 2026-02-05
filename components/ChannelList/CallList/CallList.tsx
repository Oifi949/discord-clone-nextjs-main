"use client";

import { DefaultStreamChatGenerics } from "stream-chat-react";
import { Speaker } from "../Icons";
import { useDiscordContext } from "@/contexts/DiscordContext";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useServerContext } from "@/contexts/ServerContext";
import { Channel } from "stream-chat";

export default function CallList() {
  const videoClient = useStreamVideoClient();
  const { activeCall, joinVoiceChannel } = useDiscordContext();
  const { channelsByCategories } = useServerContext();

  // Flatten all channels from categories
  const channels: Channel<DefaultStreamChatGenerics>[] = Array.from(
    channelsByCategories.values(),
  ).flat();

  const voiceChannels = channels.filter((c) => c.data?.isVoice === true);

  return (
    <div className="px-2">
      {voiceChannels.map((channel) => {
        const isActive = activeCall?.id === channel.id;

        return (
          <button
            key={channel.id}
            onClick={() =>
              videoClient && joinVoiceChannel(videoClient, channel)
            }
            className={`w-full flex items-center px-2 py-1 rounded
              ${isActive ? "bg-green-200 font-semibold" : "hover:bg-gray-200"}`}
          >
            <Speaker className="w-4 h-4 mr-2" />
            <span>{channel.data?.name}</span>
          </button>
        );
      })}
    </div>
  );
}
