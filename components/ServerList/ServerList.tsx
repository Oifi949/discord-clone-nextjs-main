"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useChatContext } from "stream-chat-react";
import type { Channel } from "stream-chat";

interface Server {
  name: string;
}

interface ServerContextType {
  server: Server | null;
  channels: Channel[];
}

const ServerContext = createContext<ServerContextType | null>(null);

export function ServerProvider({
  server,
  children,
}: {
  server: Server;
  children: React.ReactNode;
}) {
  const { client } = useChatContext();
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    if (!client.userID) return;

    const loadChannels = async () => {
      const res = await client.queryChannels(
        {
          type: "messaging",
          members: { $in: [client.userID as string] },
          "data.server": { $eq: server.name },
        },
        { last_message_at: -1 },
      );

      setChannels(res);
    };

    loadChannels();
  }, [client, server.name]);

  return (
    <ServerContext.Provider value={{ server, channels }}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServerContext() {
  const ctx = useContext(ServerContext);
  if (!ctx) {
    throw new Error("useServerContext must be used inside ServerProvider");
  }
  return ctx;
}
