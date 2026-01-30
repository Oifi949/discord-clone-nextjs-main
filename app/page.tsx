"use client";

import { User } from "stream-chat";
import { LoadingIndicator } from "stream-chat-react";

import { useClerk } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import MyChat from "@/components/MyChat";

// const userId = '7cd445eb-9af2-4505-80a9-aa8543c3343f';
// const userName = 'Harry Potter';

const apiKey = "qgu6ryg3aekm";
// const userToken =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiN2NkNDQ1ZWItOWFmMi00NTA1LTgwYTktYWE4NTQzYzMzNDNmIn0.TtrCA5VoRB2KofI3O6lYjYZd2pHdQT408u7ryeWO4Qg';

export type DiscordServer = {
  name: string;
  image: string | undefined;
};

export type Homestate = {
  apiKey: string;
  user: User;
  token: string;
};

export default function Home() {
  const [myState, setMyState] = useState<Homestate | undefined>(undefined);

  const { user: myUser } = useClerk();

  const registerUser = useCallback(
    async function registerUser() {
      // register user on Stream backend
      console.log("[registerUser] myUser:", myUser);
      const userId = myUser?.id;
      const mail = myUser?.primaryEmailAddress?.emailAddress;
      if (userId && mail) {
        const streamResponse = await fetch("/api/register-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            email: mail,
          }),
        });
        const responseBody = await streamResponse.json();
        console.log("[registerUser] Stream response:", responseBody);
        return responseBody;
      }
    },
    [myUser],
  );

  useEffect(() => {
    if (
      myUser?.id &&
      myUser?.primaryEmailAddress?.emailAddress &&
      !myUser?.publicMetadata.streamRegistered
    ) {
      console.log("[Page - useEffect] Registering user on Stream backend");
      registerUser().then((result) => {
        console.log("[Page - useEffect] Result: ", result);
        getUserToken(
          myUser.id,
          myUser?.primaryEmailAddress?.emailAddress || "Unknown",
        );
      });
    } else {
      // take user and get token
      if (myUser?.id) {
        console.log(
          "[Page - useEffect] User already registered on Stream backend: ",
          myUser?.id,
        );
        getUserToken(
          myUser?.id || "Unknown",
          myUser?.primaryEmailAddress?.emailAddress || "Unknown",
        );
      }
    }
  }, [registerUser, myUser]);

  if (!myState) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#1e1f22] text-gray-300">
        {" "}
        <img
          src="https://tse1.mm.bing.net/th/id/OIP.pmUIYBMro9lJv-rUXPxmdAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3"
          alt="App Logo"
          className="w-16 h-16 mb-6 animate-bounce"
        />{" "}
        <div className="flex flex-col space-y-2">
          {" "}
          <div className="h-2 w-40 bg-purple-500 rounded animate-pulse"></div>{" "}
          <div className="h-2 w-32 bg-blue-500 rounded animate-pulse delay-150"></div>{" "}
          <div className="h-2 w-24 bg-green-500 rounded animate-pulse delay-300"></div>{" "}
        </div>{" "}
        <p className="mt-6 text-sm text-gray-400">Connecting to chat…</p>{" "}
      </div>
    );
  }

  return <MyChat {...myState} />;

  async function getUserToken(userId: string, userName: string) {
    const response = await fetch("/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
      }),
    });
    const responseBody = await response.json();
    const token = responseBody.token;

    if (!token) {
      console.error("Couldn't retrieve token.");
      return;
    }

    const user: User = {
      id: userId,
      name: userName,
      image: `https://getstream.io/random_png/?id=${userId}&name=${userName}`,
    };
    setMyState({
      apiKey: apiKey,
      user: user,
      token: token,
    });
  }
}
