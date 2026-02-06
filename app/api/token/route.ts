import { StreamChat } from "stream-chat";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.STREAM_CHAT_SECRET) {
      throw new Error("STREAM_CHAT_SECRET is missing");
    }

    const serverClient = StreamChat.getInstance(
      "qgu6ryg3aekm",
      process.env.STREAM_CHAT_SECRET
    );

    const body = await request.json();
    console.log("[/api/token] Body:", body);

    const userId = body?.userId;

    if (!userId) {
      return Response.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const token = serverClient.createToken(userId);

    return Response.json({
      userId,
      token,
    });
  } catch (err) {
    console.error("TOKEN API ERROR:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
