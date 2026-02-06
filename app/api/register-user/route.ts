import { clerkClient } from "@clerk/nextjs/server";
import { StreamChat } from "stream-chat";

export async function POST(request: Request) {
  try {

    console.log("API KEY:", process.env.NEXT_PUBLIC_STREAM_API_KEY);
    console.log("HAS SECRET:", !!process.env.STREAM_SECRET_KEY);
    if (!process.env.STREAM_SECRET_KEY) {
      throw new Error("Missing STREAM_SECRET_KEY");
    }

    const serverClient = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      process.env.STREAM_SECRET_KEY
    );

    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing userId or email" }),
        { status: 400 }
      );
    }

    await serverClient.upsertUser({
      id: userId,
      name: email,
      role: "user",
      image: `https://getstream.io/random_png/?id=${userId}&name=${email}`,
    });

    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        streamRegistered: true,
      },
    });

    return Response.json({ userId, email });
  } catch (error) {
    console.error("[/api/register-user] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
