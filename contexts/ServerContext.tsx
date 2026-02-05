"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Channel, StreamChat } from "stream-chat";
import { DefaultStreamChatGenerics } from "stream-chat-react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";

/* ----------------------------------
 * TYPES
 * ---------------------------------- */

type ChannelsByCategory = Map<string, Channel<DefaultStreamChatGenerics>[]>;

export type Server = {
  id: string;
  name: string;
  image?: string;
};

type ServerContextType = {
  server: Server | null;
  channelsByCategories: ChannelsByCategory;

  createServer: (
    chatClient: StreamChat,
    videoClient: StreamVideoClient,
    serverName: string,
    serverImage: string,
    members: string[],
  ) => Promise<void>;

  changeServer: (
    server: Server | null,
    chatClient: StreamChat,
  ) => Promise<void>;
};

/* ----------------------------------
 * CONTEXT
 * ---------------------------------- */

const ServerContext = createContext<ServerContextType | null>(null);

/* ----------------------------------
 * PROVIDER
 * ---------------------------------- */

export function ServerProvider({ children }: { children: ReactNode }) {
  const [server, setServer] = useState<Server | null>(null);
  const [channelsByCategories, setChannelsByCategories] =
    useState<ChannelsByCategory>(new Map());

  /* ----------------------------------
   * HELPERS
   * ---------------------------------- */

  function groupByCategory(
    channels: Channel<DefaultStreamChatGenerics>[],
  ): ChannelsByCategory {
    const map = new Map<string, Channel<DefaultStreamChatGenerics>[]>();

    channels.forEach((channel) => {
      const category = (channel.data?.category as string) ?? "Text Channels";

      if (!map.has(category)) {
        map.set(category, []);
      }

      map.get(category)!.push(channel);
    });

    return map;
  }

  /* ----------------------------------
   * CHANGE SERVER
   * ---------------------------------- */

  async function changeServer(
    nextServer: Server | null,
    chatClient: StreamChat,
  ) {
    setServer(nextServer);

    if (!nextServer) {
      setChannelsByCategories(new Map());
      return;
    }

    const channels = await chatClient.queryChannels(
      {
        type: "messaging",
        members: { $in: [chatClient.userID as string] },
        "data.server": { $eq: nextServer.name },
      },
      { last_message_at: -1 },
    );

    setChannelsByCategories(groupByCategory(channels));
  }

  /* ----------------------------------
   * CREATE SERVER
   * ---------------------------------- */

  async function createServer(
    chatClient: StreamChat,
    _videoClient: StreamVideoClient,
    serverName: string,
    serverImage: string,
    members: string[],
  ) {
    const serverId = serverName.toLowerCase().replace(/\s+/g, "-");

    await chatClient
      .channel("team", serverId, {
        name: serverName,
        image: serverImage,
        members,
      })
      .create();

    const textChannel = chatClient.channel("messaging", `${serverId}-general`, {
      name: "general",
      category: "Text Channels",
      server: serverName,
      members,
    });

    const voiceChannel = chatClient.channel("messaging", `${serverId}-voice`, {
      name: "General",
      category: "Voice Channels",
      isVoice: true,
      server: serverName,
      members,
    });

    await Promise.all([textChannel.create(), voiceChannel.create()]);

    setServer({ id: serverId, name: serverName, image: serverImage });
    setChannelsByCategories(groupByCategory([textChannel, voiceChannel]));
  }

  return (
    <ServerContext.Provider
      value={{
        server,
        channelsByCategories,
        createServer,
        changeServer,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
}

/* ----------------------------------
 * HOOK
 * ---------------------------------- */

export function useServerContext() {
  const ctx = useContext(ServerContext);
  if (!ctx) {
    throw new Error("useServerContext must be used inside ServerProvider");
  }
  return ctx;
}
