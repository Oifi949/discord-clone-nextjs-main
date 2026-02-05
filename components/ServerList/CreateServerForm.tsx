"use client";

import { UserObject } from "@/model/UserObject";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChatContext } from "stream-chat-react";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

import { CloseMark } from "../ChannelList/Icons";
import UserRow from "../ChannelList/CreateChannelForm/UserRow";
import { useServerContext } from "@/contexts/ServerContext";

type FormState = {
  serverName: string;
  serverImage: string;
  users: UserObject[];
};

const CreateServerForm = () => {
  const params = useSearchParams();
  const showCreateServerForm = params.get("createServer");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const { client } = useChatContext();
  const videoClient = useStreamVideoClient();
  const { createServer } = useServerContext();

  const initialState: FormState = {
    serverName: "",
    serverImage: "",
    users: [],
  };

  const [formData, setFormData] = useState<FormState>(initialState);
  const [users, setUsers] = useState<UserObject[]>([]);

  const loadUsers = useCallback(async () => {
    const response = await client.queryUsers({});
    const mappedUsers: UserObject[] = response.users
      .filter((user) => user.id !== client.userID)
      .map((user) => ({
        id: user.id,
        name: user.name ?? user.id,
        image: user.image as string,
        online: user.online,
        lastOnline: user.last_active,
      }));

    setUsers(mappedUsers);
  }, [client]);

  useEffect(() => {
    if (showCreateServerForm && dialogRef.current) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [showCreateServerForm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function userChanged(user: UserObject, checked: boolean) {
    setFormData((prev) => ({
      ...prev,
      users: checked
        ? [...prev.users, user]
        : prev.users.filter((u) => u.id !== user.id),
    }));
  }

  function buttonDisabled() {
    return (
      !formData.serverName || !formData.serverImage || formData.users.length < 1
    );
  }

  async function createClicked() {
    if (!videoClient) return;

    await createServer(
      client,
      videoClient,
      formData.serverName,
      formData.serverImage,
      formData.users.map((u) => u.id),
    );

    setFormData(initialState);
    router.replace("/");
  }

  return (
    <dialog ref={dialogRef} className="absolute z-10 space-y-2 rounded-xl">
      <div className="w-full flex items-center justify-between py-8 px-6">
        <h2 className="text-3xl font-semibold text-gray-600">
          Create new server
        </h2>
        <Link href="/">
          <CloseMark className="w-10 h-10 text-gray-400" />
        </Link>
      </div>

      <form method="dialog" className="flex flex-col space-y-2 px-6">
        <label className="labelTitle">Server Name</label>
        <input
          value={formData.serverName}
          onChange={(e) =>
            setFormData({ ...formData, serverName: e.target.value })
          }
          required
        />

        <label className="labelTitle">Image URL</label>
        <input
          value={formData.serverImage}
          onChange={(e) =>
            setFormData({ ...formData, serverImage: e.target.value })
          }
          required
        />

        <h2 className="labelTitle mt-4">Add Users</h2>
        <div className="max-h-64 overflow-y-scroll">
          {users.map((user) => (
            <UserRow key={user.id} user={user} userChanged={userChanged} />
          ))}
        </div>
      </form>

      <div className="flex justify-end gap-4 p-6 bg-gray-200">
        <Link href="/" className="text-gray-500 font-semibold">
          Cancel
        </Link>
        <button
          disabled={buttonDisabled()}
          onClick={createClicked}
          className={`bg-discord px-4 py-2 rounded text-white font-bold ${
            buttonDisabled() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Create Server
        </button>
      </div>
    </dialog>
  );
};

export default CreateServerForm;
