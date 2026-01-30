import { ArrowUturnLeft, Emoji, Thread } from "@/components/ChannelList/Icons";
import { Dispatch, SetStateAction } from "react";

export default function MessageOptions({
  showEmojiReactions,
}: {
  showEmojiReactions: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  return (
    <div className="absolute flex items-center gap-1 -top-6 right-2 rounded-md bg-[#1e1f22] shadow-md p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      {/* Emoji Reaction */}
      <button
        aria-label="Add reaction"
        className="p-2 rounded-md hover:bg-[#2e2f33] text-gray-300 hover:text-white transition-colors"
        onClick={() => showEmojiReactions((currentValue) => !currentValue)}
      >
        <Emoji className="w-5 h-5" />
      </button>

      {/* Reply */}
      <button
        aria-label="Reply"
        className="p-2 rounded-md hover:bg-[#2e2f33] text-gray-300 hover:text-white transition-colors"
      >
        <ArrowUturnLeft className="w-5 h-5" />
      </button>

      {/* Thread */}
      <button
        aria-label="Start thread"
        className="p-2 rounded-md hover:bg-[#2e2f33] text-gray-300 hover:text-white transition-colors"
      >
        <Thread className="w-5 h-5" />
      </button>
    </div>
  );
}
