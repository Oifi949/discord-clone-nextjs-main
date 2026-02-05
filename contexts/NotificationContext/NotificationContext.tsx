"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useChatContext } from "stream-chat-react";

/* ----------------------------------
 * TYPES
 * ---------------------------------- */

type NotificationContextType = {
  unread: Record<string, number>;
  clearUnread: (channelId: string) => void;
};

/* ----------------------------------
 * CONTEXT
 * ---------------------------------- */

const NotificationContext = createContext<NotificationContextType | null>(null);

/* ----------------------------------
 * HELPERS (DECLARE FIRST ✅)
 * ---------------------------------- */

function playSound() {
  const audio = new Audio("/sounds/message.mp3");
  audio.play().catch(() => {});
}

function showBrowserNotification(event: any) {
  if (typeof window === "undefined") return;
  if (Notification.permission !== "granted") return;

  new Notification(event.user?.name ?? "New message", {
    body: event.message?.text ?? "",
  });
}

/* ----------------------------------
 * PROVIDER
 * ---------------------------------- */

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { client } = useChatContext();
  const [unread, setUnread] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!client) return;

    const handleEvent = (event: any) => {
      if (event.type !== "message.new") return;

      setUnread((prev) => ({
        ...prev,
        [event.channel_id]: (prev[event.channel_id] || 0) + 1,
      }));

      playSound();
      showBrowserNotification(event);
    };

    client.on(handleEvent);
    return () => client.off(handleEvent);
  }, [client]);

  function clearUnread(channelId: string) {
    setUnread((prev) => ({ ...prev, [channelId]: 0 }));
  }

  return (
    <NotificationContext.Provider value={{ unread, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

/* ----------------------------------
 * HOOK
 * ---------------------------------- */

export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotificationContext);

  if (!ctx) {
    throw new Error(
      "useNotifications must be used inside <NotificationProvider>",
    );
  }

  return ctx;
}
