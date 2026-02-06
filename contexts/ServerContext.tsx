"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Channel, StreamChat } from "stream-chat";
import { DefaultStreamChatGenerics } from "stream-chat-react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";

/* ----------------------------------
 * TYPES
 * ---------------------------------- */

type ChannelsByCategory = Map<string, Channel<DefaultStreamChatGenerics>[]>;

type Server = {
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
};

/* ----------------------------------
 * CONTEXT
 * ---------------------------------- */

const ServerContext = createContext<ServerContextType | null>(null);

/* ----------------------------------
 * PROVIDER
 * ---------------------------------- */

export function ServerProvider({ children }: { children: ReactNode }) {
  const [server, setServer] = useState<Server | null>({
    id: "default",
    name: "My Server",
  });

  const [channelsByCategories] = useState<ChannelsByCategory>(new Map());

  /* ----------------------------------
   * CREATE SERVER (DISCORD STYLE)
   * ---------------------------------- */
  async function createServer(
    chatClient: StreamChat,
    _videoClient: StreamVideoClient,
    serverName: string,
    serverImage: string,
    members: string[],
  ) {
    const serverId = serverName.toLowerCase().replace(/\s+/g, "-");

    // Create server as a "team" channel
    const serverChannel = chatClient.channel("team", serverId, {
      name: serverName,
      image: serverImage,
      members,
    });

    await serverChannel.create();

    // Create default channels
    await chatClient
      .channel("messaging", `${serverId}-general`, {
        name: "general",
        category: "Text Channels",
        members,
      })
      .create();

    await chatClient
      .channel("messaging", `${serverId}-voice`, {
        name: "General",
        category: "Voice Channels",
        isVoice: true,
        members,
      })
      .create();

    setServer({
      id: serverId,
      name: serverName,
      image: serverImage,
    });
  }

  return (
    <ServerContext.Provider
      value={{
        server,
        channelsByCategories,
        createServer,
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
