"use client";

import { DiscordServer } from "@/app/page";
import { MemberRequest, StreamVideoClient } from "@stream-io/video-client";
import { createContext, useCallback, useContext, useState } from "react";
import { Channel, ChannelFilters, StreamChat } from "stream-chat";
import { DefaultStreamChatGenerics } from "stream-chat-react";
import { v4 as uuid } from "uuid";

/**
 * Define custom channel data fields
 */
type CustomChannelData = {
  custom?: {
    server?: string;
    category?: string;
  };
};

/**
 * Extend Stream Chat generics with our custom channel data
 */
type CustomGenerics = DefaultStreamChatGenerics & {
  channelType: CustomChannelData;
};

/**
 * Discord context state
 */
type DiscordState = {
  server?: DiscordServer;
  callId: string | undefined;
  channelsByCategories: Map<string, Array<Channel<CustomGenerics>>>;
  changeServer: (
    server: DiscordServer | undefined,
    client: StreamChat<CustomGenerics>,
  ) => void;
  createServer: (
    client: StreamChat<CustomGenerics>,
    videoClient: StreamVideoClient,
    name: string,
    imageUrl: string,
    userIds: string[],
  ) => void;
  createChannel: (
    client: StreamChat<CustomGenerics>,
    name: string,
    category: string,
    userIds: string[],
  ) => void;
  createCall: (
    client: StreamVideoClient,
    server: DiscordServer,
    channelName: string,
    userIds: string[],
  ) => Promise<void>;
  setCall: (callId: string | undefined) => void;
};

const initialValue: DiscordState = {
  server: undefined,
  callId: undefined,
  channelsByCategories: new Map(),
  changeServer: () => {},
  createServer: () => {},
  createChannel: () => {},
  createCall: async () => {},
  setCall: () => {},
};

const DiscordContext = createContext<DiscordState>(initialValue);

export const DiscordContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [myState, setMyState] = useState<DiscordState>(initialValue);

  /**
   * Load channels grouped by categories for a given server
   */
  const changeServer = useCallback(
    async (
      server: DiscordServer | undefined,
      client: StreamChat<CustomGenerics>,
    ) => {
      const filters: ChannelFilters = {
        type: "messaging",
        members: { $in: [client.user?.id as string] },
      };

      if (!server) {
        filters.member_count = 2;
      }

      console.log(
        "[DiscordContext - loadServerList] Querying channels for ",
        client.user?.id,
      );

      const channels = await client.queryChannels(filters);
      const channelsByCategories = new Map<
        string,
        Array<Channel<CustomGenerics>>
      >();

      if (server) {
        const categories = new Set(
          channels
            .filter((channel) => channel.data?.custom?.server === server.name)
            .map((channel) => channel.data?.custom?.category),
        );

        for (const category of Array.from(categories)) {
          channelsByCategories.set(
            category ?? "Uncategorized",
            channels.filter(
              (channel) =>
                channel.data?.custom?.server === server.name &&
                channel.data?.custom?.category === category,
            ),
          );
        }
      } else {
        channelsByCategories.set("Direct Messages", channels);
      }

      setMyState((prev) => ({ ...prev, server, channelsByCategories }));
    },
    [setMyState],
  );

  /**
   * Create a new call (voice/video)
   */
  const createCall = useCallback(
    async (
      client: StreamVideoClient,
      server: DiscordServer,
      channelName: string,
      userIds: string[],
    ) => {
      const callId = uuid();
      const audioCall = client.call("default", callId);
      const audioChannelMembers: MemberRequest[] = userIds.map((userId) => ({
        user_id: userId,
      }));

      try {
        const createdAudioCall = await audioCall.create({
          data: {
            custom: {
              serverName: server?.name,
              callName: channelName,
            },
            members: audioChannelMembers,
          },
        });
        console.log(
          `[DiscordContext] Created Call with id: ${createdAudioCall.call.id}`,
        );
      } catch (err) {
        console.log(err);
      }
    },
    [],
  );

  /**
   * Create a new server (with a default "Welcome" channel)
   */
  const createServer = useCallback(
    async (
      client: StreamChat<CustomGenerics>,
      videoClient: StreamVideoClient,
      name: string,
      imageUrl: string,
      userIds: string[],
    ) => {
      const messagingChannel = client.channel("messaging", uuid(), {
        name: "Welcome",
        members: userIds,
        data: {
          image: imageUrl,
          custom: {
            server: name,
            category: "Text Channels",
          },
        },
      });

      try {
        const response = await messagingChannel.create();
        console.log("[DiscordContext - createServer] Response: ", response);
        if (myState.server) {
          await createCall(
            videoClient,
            myState.server,
            "General Voice Channel",
            userIds,
          );
        }
        changeServer({ name, image: imageUrl }, client);
      } catch (err) {
        console.error(err);
      }
    },
    [changeServer, createCall, myState.server],
  );

  /**
   * Create a new channel inside a server
   */
  const createChannel = useCallback(
    async (
      client: StreamChat<CustomGenerics>,
      name: string,
      category: string,
      userIds: string[],
    ) => {
      if (client.userID) {
        const channel = client.channel("messaging", {
          name,
          members: userIds,
          data: {
            custom: {
              server: myState.server?.name,
              category,
            },
          },
        });
        try {
          await channel.create();
        } catch (err) {
          console.log(err);
        }
      }
    },
    [myState.server?.name],
  );

  /**
   * Set current call ID
   */
  const setCall = useCallback(
    (callId: string | undefined) => {
      setMyState((myState) => ({ ...myState, callId }));
    },
    [setMyState],
  );

  const store: DiscordState = {
    server: myState.server,
    callId: myState.callId,
    channelsByCategories: myState.channelsByCategories,
    changeServer,
    createServer,
    createChannel,
    createCall,
    setCall,
  };

  return (
    <DiscordContext.Provider value={store}>{children}</DiscordContext.Provider>
  );
};

export const useDiscordContext = () => useContext(DiscordContext);
