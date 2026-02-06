import { clerkClient } from "@clerk/nextjs/server";
import { StreamChat } from "stream-chat";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.STREAM_CHAT_SECRET) {
      throw new Error("STREAM_CHAT_SECRET is missing");
    }

    const { userId, email } = await request.json();

    if (!userId || !email) {
      return Response.json(
        { error: "Missing userId or email" },
        { status: 400 }
      );
    }

    const serverClient = StreamChat.getInstance(
      "qgu6ryg3aekm",
      process.env.STREAM_CHAT_SECRET
    );

    await serverClient.upsertUser({
      id: userId,
      role: "user",
      name: email,
      image: `https://getstream.io/random_png/?id=${userId}&name=${email}`,
    });

    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        streamRegistered: true,
      },
    });

    return Response.json({
      success: true,
      userId,
    });
  } catch (err) {
    console.error("[/api/register-user] ERROR:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
