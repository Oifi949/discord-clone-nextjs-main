"use client";

import { useChatContext, useMessageContext } from "stream-chat-react";
import { Trash2, Pencil, Smile } from "lucide-react";
import { useState } from "react";

export default function MessageActions() {
  const { message } = useMessageContext();
  const { client, channel } = useChatContext();
  const [showReactions, setShowReactions] = useState(false);

  const isMine = message.user?.id === client.user?.id;

  async function deleteMessage() {
    await client.deleteMessage(message.id);
  }

  async function editMessage() {
    const newText = prompt("Edit message", message.text);
    if (!newText) return;

    await client.updateMessage({
      id: message.id,
      text: newText,
    });
  }

  async function addReaction(type: string) {
    if (!channel) return;
    await channel.sendReaction(message.id, { type });
    setShowReactions(false);
  }

  return (
    <div className="relative flex items-center gap-2 bg-[#1e1f22] rounded px-2 py-1 shadow">
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="hover:text-yellow-400"
      >
        <Smile size={16} />
      </button>

      {showReactions && (
        <div className="absolute top-8 right-0 bg-[#2b2d31] p-2 rounded flex gap-2 z-50">
          {["👍", "🔥", "😂", "❤️"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => addReaction(emoji)}
              className="text-lg hover:scale-125 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {isMine && (
        <button onClick={editMessage} className="hover:text-blue-400">
          <Pencil size={16} />
        </button>
      )}

      {isMine && (
        <button onClick={deleteMessage} className="hover:text-red-400">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
