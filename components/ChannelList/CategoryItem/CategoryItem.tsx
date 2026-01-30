import Link from "next/link";
import { Channel } from "stream-chat";
import CustomChannelPreview from "../CustomChannelPreview";
import { useState } from "react";
import { ChevronDown, PlusIcon } from "../Icons";
import { DefaultStreamChatGenerics } from "stream-chat-react";

type CategoryItemProps = {
  category: string;
  channels: Channel<DefaultStreamChatGenerics>[];
  serverName: string;
};

export default function CategoryItem({
  category,
  serverName,
  channels,
}: CategoryItemProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-3">
      {/* Category Header */}
      <div className="flex items-center justify-between px-2 text-xs uppercase font-semibold text-gray-400 tracking-wide">
        <button
          aria-label={`Toggle ${category}`}
          className="flex items-center gap-1 hover:text-gray-200 transition-colors"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div
            className={`transform transition-transform duration-200 ${
              isOpen ? "rotate-0" : "-rotate-90"
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </div>
          <span>{category}</span>
        </button>
        <Link
          href={`/?createChannel=true&serverName=${serverName}&category=${category}`}
          className="hover:text-white transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
        </Link>
      </div>

      {/* Channel List */}
      {isOpen && (
        <div className="mt-1 space-y-1 px-2">
          {channels.map((channel) => (
            <CustomChannelPreview
              key={channel.id}
              channel={channel}
              className="w-full hover:bg-gray-700 hover:text-white rounded-md px-2 py-1 transition-colors"
            />
          ))}
        </div>
      )}
    </div>
  );
}
