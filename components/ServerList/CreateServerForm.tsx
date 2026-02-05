"use client";

import { useState } from "react";
import { useChatContext } from "stream-chat-react";
import { useServerContext } from "@/contexts/ServerContext";

interface Props {
  category: string;
  isVoice?: boolean;
}

export default function CreateChannelForm({
  category,
  isVoice = false,
}: Props) {
  const { client } = useChatContext();
  const { server } = useServerContext();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateChannel = async () => {
    if (!name || !server) return;

    try {
      setLoading(true);

      const channelId = `${server.name}-${name}`;

      const channel = client.channel("messaging", channelId, {
        name,
        category,
        isVoice,
        server: server.name,
        members: [client.userID as string],
      });

      await channel.create();

      setName("");
    } catch (err) {
      console.error("Create channel error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Channel name"
        className="flex-1 rounded px-2 py-1 text-black"
      />
      <button
        disabled={loading}
        onClick={handleCreateChannel}
        className="px-3 py-1 rounded bg-indigo-600 text-white"
      >
        Create
      </button>
    </div>
  );
}
