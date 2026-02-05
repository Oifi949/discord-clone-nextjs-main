import { ChannelListMessengerProps } from "stream-chat-react";

import { useServerContext } from "@/contexts/ServerContext"; // 👈 example
import CreateChannelForm from "./CreateChannelForm/CreateChannelForm";
import UserBar from "./BottomBar/ChannelListBottomBar";
import ChannelListTopBar from "./TopBar/ChannelListTopBar";
import CategoryItem from "./CategoryItem/CategoryItem";
import CallList from "./CallList/CallList";

const CustomChannelList = () => {
  const { server, channelsByCategories } = useServerContext();

  return (
    <div className="w-72 bg-medium-gray h-full flex flex-col items-start">
      <ChannelListTopBar serverName={server?.name || "Direct Messages"} />

      <div className="w-full">
        {Array.from(channelsByCategories.entries()).map(
          ([category, channels]) => (
            <CategoryItem
              key={category}
              category={category}
              serverName={server?.name || "Direct Messages"}
              channels={channels}
            />
          ),
        )}
      </div>

      <CallList />
      <CreateChannelForm />
      <UserBar />
    </div>
  );
};

export default CustomChannelList;
