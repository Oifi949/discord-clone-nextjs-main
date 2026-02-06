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
  changeServer: (server: Server | null, client: any) => void;
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

  function changeServer(newServer: Server | null, _client: any) {
    setServer(newServer);
  }

  async function createServer(
    chatClient: StreamChat,
    _videoClient: StreamVideoClient,
    serverName: string,
    serverImage: string,
    members: string[],
  ) {
    const serverId = serverName.toLowerCase().replace(/\s+/g, "-");

    const serverChannel = chatClient.channel("team", serverId, {
      name: serverName,
      image: serverImage,
      members,
    });

    await serverChannel.create();

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
        changeServer,
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
