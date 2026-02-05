import { Channel } from "stream-chat";

export function isAdmin(channel: Channel, userId: string) {
    return channel.state.members[userId]?.role === "admin";
}

export function isOwner(channel: Channel, userId: string) {
    return channel.data?.ownerId === userId;
}
