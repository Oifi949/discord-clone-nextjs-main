import Image from "next/image";
import { useState } from "react";
import { Gear, LeaveServer, Mic, Speaker } from "../Icons";
import { useChatContext } from "stream-chat-react";
import { useClerk } from "@clerk/nextjs";
import ChannelListMenuRow from "../TopBar/ChannelListMenuRow";

export default function ChannelListBottomBar(): JSX.Element {
  const { client } = useChatContext();
  const { signOut } = useClerk();

  const [micActive, setMicActive] = useState(false);
  const [audioActive, setAudioActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = client.user;

  return (
    <div className="mt-auto p-3 bg-gray-100 w-full flex items-center gap-3 relative border-t border-gray-200">
      {/* User Profile Button */}
      <button
        className="flex flex-1 items-center gap-2 p-2 rounded-md hover:bg-gray-200 transition-colors"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {user?.image && (
          <div
            className={`relative ${user?.online ? "ring-2 ring-green-400 rounded-full" : ""}`}
          >
            <Image
              src={user.image ?? "https://thispersondoesnotexist.com/"}
              alt="User avatar"
              width={36}
              height={36}
              className="rounded-full"
            />
          </div>
        )}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-800 truncate">
            {user?.name}
          </span>
          <span className="text-xs text-gray-500">
            {user?.online ? "Online" : "Offline"}
          </span>
        </div>
      </button>

      {/* Mic Toggle */}
      <IconToggleButton
        active={micActive}
        onClick={() => setMicActive((prev) => !prev)}
        icon={<Mic />}
        label="Toggle microphone"
      />

      {/* Speaker Toggle */}
      <IconToggleButton
        active={audioActive}
        onClick={() => setAudioActive((prev) => !prev)}
        icon={<Speaker />}
        label="Toggle audio"
      />

      {/* Settings */}
      <button
        aria-label="Settings"
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors text-gray-700"
      >
        <Gear className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute bottom-14 left-2 w-56 bg-white rounded-md shadow-lg border border-gray-200">
          <button className="w-full text-left" onClick={() => signOut()}>
            <ChannelListMenuRow
              name="Sign out"
              icon={<LeaveServer />}
              bottomBorder={false}
              red
            />
          </button>
        </div>
      )}
    </div>
  );
}

/** Reusable toggle button for mic/speaker */
function IconToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-gray-200 text-gray-700"
          : "bg-red-100 text-red-500 hover:bg-red-200"
      }`}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
