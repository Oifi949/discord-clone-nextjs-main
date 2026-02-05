import {
  ChannelPreviewUIComponentProps,
  useChatContext,
} from "stream-chat-react";
import { useNotifications } from "@/contexts/NotificationContext/NotificationContext";
import { Trash2 } from "lucide-react";
import { isAdmin } from "@/utils/permission";

const CustomChannelPreview = (props: ChannelPreviewUIComponentProps) => {
  const { channel } = props;
  const { setActiveChannel, client } = useChatContext();
  const { unread, clearUnread } = useNotifications();

  const channelId = channel.id;
  const count = channelId ? (unread[channelId] ?? 0) : 0;

  return (
    <div
      className={`flex items-center mx-2 ${
        channel.countUnread() > 0 ? "channel-container" : ""
      }`}
    >
      <button
        className="w-full flex items-center px-2 hover:bg-gray-200 rounded-md"
        onClick={() => setActiveChannel(channel)}
      >
        <span className="italic text-xl mr-2 text-gray-500">#</span>
        <span className="text-sm">
          {channel.data?.name || "Channel Preview"}
        </span>
      </button>

      {channelId && isAdmin(channel, client.user!.id) && (
        <button
          onClick={() => channel.delete()}
          className="text-red-400 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      )}

      {channelId && (
        <button onClick={() => clearUnread(channelId)} className="relative">
          {count > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
              {count}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default CustomChannelPreview;
