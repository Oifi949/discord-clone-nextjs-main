"use client";

import { Call, StreamVideoClient } from "@stream-io/video-react-sdk";
import { createContext, useContext, useState } from "react";
import { Channel } from "stream-chat";
import { DefaultStreamChatGenerics } from "stream-chat-react";

type DiscordContextType = {
  activeCall: Call | null;
  joinVoiceChannel: (
    videoClient: StreamVideoClient,
    channel: Channel<DefaultStreamChatGenerics>,
  ) => Promise<void>;
  leaveVoiceChannel: () => Promise<void>;
};

const DiscordContext = createContext<DiscordContextType | undefined>(undefined);

export function DiscordProvider({ children }: { children: React.ReactNode }) {
  const [activeCall, setActiveCall] = useState<Call | null>(null);

  async function joinVoiceChannel(
    videoClient: StreamVideoClient,
    channel: Channel<DefaultStreamChatGenerics>,
  ) {
    const callId = channel.id;
    if (!callId) return;

    // Discord rule: only one active voice channel
    if (activeCall && activeCall.id !== callId) {
      await activeCall.leave();
    }

    const call = videoClient.call("default", callId);

    await call.join({ create: true });

    // Discord behavior: join muted
    call.microphone.disable();

    setActiveCall(call);
  }

  async function leaveVoiceChannel() {
    if (!activeCall) return;
    await activeCall.leave();
    setActiveCall(null);
  }

  return (
    <DiscordContext.Provider
      value={{ activeCall, joinVoiceChannel, leaveVoiceChannel }}
    >
      {children}
    </DiscordContext.Provider>
  );
}

export function useDiscordContext() {
  const ctx = useContext(DiscordContext);
  if (!ctx) {
    throw new Error("useDiscordContext must be used inside DiscordProvider");
  }
  return ctx;
}
