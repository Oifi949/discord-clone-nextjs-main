"use client";

import { useChatContext } from "stream-chat-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import CreateServerForm from "./CreateServerForm";
import { useServerContext } from "@/contexts/ServerContext";
import type { Server } from "@/contexts/ServerContext";

const ServerList = () => {
  const { client } = useChatContext();
  const { server: activeServer, changeServer } = useServerContext();
  const [serverList, setServerList] = useState<Server[]>([]);

  const loadServerList = useCallback(async () => {
    if (!client?.userID) return;

    const channels = await client.queryChannels(
      {
        type: "team", // 👈 servers
        members: { $in: [client.userID] },
      },
      { last_message_at: -1 },
      { limit: 30 },
    );

    const servers: Server[] = channels.map((channel) => ({
      id: channel.id!,
      name: channel.data?.name as string,
      image: channel.data?.image as string | undefined,
    }));

    setServerList(servers);

    // Auto-select first server
    if (!activeServer && servers.length > 0) {
      changeServer(servers[0], client);
    }
  }, [client, activeServer, changeServer]);

  useEffect(() => {
    loadServerList();
  }, [loadServerList]);

  return (
    <div className="bg-dark-gray h-full flex flex-col items-center">
      {/* Home / DM */}
      <button
        type="button"
        title="Discord Server"
        className={`block p-3 aspect-square sidebar-icon border-t-2 border-t-gray-300 ${
          activeServer === null ? "selected-icon" : ""
        }`}
        onClick={() => changeServer(null, client)}
      >
        <div className="rounded-icon discord-icon" />
      </button>

      <div className="border-t-2 border-t-gray-300">
        {serverList.map((server) => (
          <button
            key={server.id}
            className={`p-4 sidebar-icon ${
              server.id === activeServer?.id ? "selected-icon" : ""
            }`}
            onClick={() => changeServer(server, client)}
          >
            {server.image && isValidUrl(server.image) ? (
              <Image
                className="rounded-icon"
                src={server.image}
                width={50}
                height={50}
                alt="Server Icon"
              />
            ) : (
              <span className="rounded-icon bg-gray-600 w-[50px] h-[50px] flex items-center justify-center text-sm text-white">
                {server.name.charAt(0)}
              </span>
            )}
          </button>
        ))}
      </div>

      <Link
        href="/?createServer=true"
        className="flex items-center justify-center rounded-icon bg-white text-green-500 hover:bg-green-500 hover:text-white hover:rounded-xl transition-all duration-200 p-2 my-2 text-2xl font-light h-12 w-12"
      >
        +
      </Link>

      <CreateServerForm category="team" />
    </div>
  );
};

export default ServerList;

function isValidUrl(path: string): boolean {
  try {
    new URL(path);
    return true;
  } catch {
    return false;
  }
}
