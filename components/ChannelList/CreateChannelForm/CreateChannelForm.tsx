import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { useChatContext } from "stream-chat-react";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useDiscordContext } from "@/contexts/DiscordContext";
import { UserObject } from "@/model/UserObject";
import UserRow from "./UserRow";
import { CloseMark, Speaker } from "../Icons";

type FormState = {
  channelType: "text" | "voice";
  channelName: string;
  category: string;
  users: UserObject[];
};

export default function CreateChannelForm(): JSX.Element {
  const params = useSearchParams();
  const showCreateChannelForm = params.get("createChannel");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const { client } = useChatContext();
  const videoClient = useStreamVideoClient();
  const { server, createChannel, createCall } = useDiscordContext();

  const initialState: FormState = {
    channelType: "text",
    channelName: "",
    category: "",
    users: [],
  };
  const [formData, setFormData] = useState<FormState>(initialState);
  const [users, setUsers] = useState<UserObject[]>([]);

  const loadUsers = useCallback(async () => {
    const response = await fetch("/api/users");
    const data = (await response.json())?.data as UserObject[];
    if (data) setUsers(data);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const category = params.get("category");
    const isVoice = params.get("isVoice");
    setFormData({
      channelType: isVoice ? "voice" : "text",
      channelName: "",
      category: category ?? "",
      users: [],
    });
  }, [params]);

  useEffect(() => {
    if (showCreateChannelForm && dialogRef.current) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [showCreateChannelForm]);

  function buttonDisabled(): boolean {
    return (
      !formData.channelName || !formData.category || formData.users.length <= 1
    );
  }

  function userChanged(user: UserObject, checked: boolean) {
    setFormData({
      ...formData,
      users: checked
        ? [...formData.users, user]
        : formData.users.filter((u) => u.id !== user.id),
    });
  }

  function createClicked() {
    if (formData.channelType === "text") {
      createChannel(
        client,
        formData.channelName,
        formData.category,
        formData.users.map((u) => u.id),
      );
    } else if (formData.channelType === "voice" && videoClient && server) {
      createCall(
        videoClient,
        server,
        formData.channelName,
        formData.users.map((u) => u.id),
      );
    }
    setFormData(initialState);
    router.replace("/");
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 w-full max-w-lg mx-auto my-20 rounded-lg shadow-xl bg-white overflow-hidden animate-fadeIn"
    >
      {/* header, form, footer same as before */}
    </dialog>
  );
}

type ChannelTypeCardProps = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
};

function ChannelTypeCard({
  id,
  label,
  description,
  icon,
  active,
  onClick,
}: ChannelTypeCardProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center gap-3 p-3 rounded-md border transition-colors ${
        active
          ? "border-indigo-600 bg-indigo-50"
          : "border-gray-200 hover:bg-gray-100"
      }`}
    >
      {icon}
      <div className="text-left">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </button>
  );
}
