"use client";

import { Channel } from "stream-chat";
import { isAdmin } from "@/utils/permission";

export default function ServerSettings({
  server,
  userId,
}: {
  server: Channel;
  userId: string;
}) {
  if (!isAdmin(server, userId)) return null;

  async function leaveServer() {
    await server.removeMembers([userId]);
    location.reload();
  }

  async function deleteServer() {
    if (!confirm("Delete this server?")) return;
    await server.delete();
    location.reload();
  }

  return (
    <div className="space-y-4">
      <button onClick={leaveServer} className="w-full bg-gray-200 py-2 rounded">
        Leave Server
      </button>

      <button
        onClick={deleteServer}
        className="w-full bg-red-500 text-white py-2 rounded"
      >
        Delete Server
      </button>
    </div>
  );
}
