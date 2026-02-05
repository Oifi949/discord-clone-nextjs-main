import { UserObject } from "@/model/UserObject";
import Image from "next/image";
import { PersonIcon } from "../Icons";

export default function UserSelectRow({
  user,
  userChanged,
}: {
  user: UserObject;
  userChanged: (user: UserObject, checked: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-4 overflow-auto my-2">
      <input
        id={user.id}
        type="checkbox"
        className="w-4 h-4"
        onChange={(e) => userChanged(user, e.target.checked)}
      />

      <label htmlFor={user.id} className="flex items-center space-x-4 w-full">
        {user.image ? (
          <Image
            src={user.image}
            width={32}
            height={32}
            alt={user.name}
            className="rounded-full"
          />
        ) : (
          <PersonIcon />
        )}

        <div>
          <p className="text-gray-600">{user.name}</p>
          {user.lastOnline && (
            <p className="text-sm text-gray-400">
              Last online: {user.lastOnline.split("T")[0]}
            </p>
          )}
        </div>
      </label>
    </div>
  );
}
