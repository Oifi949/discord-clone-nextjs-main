"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useChatContext } from "stream-chat-react";
import type { Channel } from "stream-chat";

/* ---------------- TYPES ---------------- */

interface Server {
  name: string;
}

interface ServerContextType {
  server: Server;
  channels: Channel[];
}

/* ---------------- CONTEXT ---------------- */

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
    if (!client?.userID) return;

    const userId = client.userID; // now TS knows it's string

    const loadChannels = async () => {
      try {
        const res = await client.queryChannels(
          {
            type: "messaging",
            members: { $in: [userId] },
            "data.server": { $eq: server.name },
          },
          { last_message_at: -1 },
        );

        setChannels(res);
      } catch (err) {
        console.error("Query channels error:", err);
      }
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

/* ---------------- SERVER LIST UI ---------------- */

export default function ServerList() {
  const { channels } = useServerContext();

  return (
    <aside className="w-16 bg-zinc-900 text-white flex flex-col items-center py-4">
      {channels.map((channel) => (
        <div
          key={channel.id}
          className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center mb-3 cursor-pointer hover:bg-zinc-600"
        >
          #
        </div>
      ))}
    </aside>
  );
}
