"use client";

import { useChatContext } from "stream-chat-react";
import { useRouter } from "next/navigation";

export default function InvitePage({ params }: any) {
  const { client } = useChatContext();
  const router = useRouter();

  async function join() {
    const channel = client.channel("team", params.serverId);
    await channel.addMembers([client.user!.id]);
    router.push("/");
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={join}
        className="bg-discord text-white px-6 py-3 rounded"
      >
        Join Server
      </button>
    </div>
  );
}
