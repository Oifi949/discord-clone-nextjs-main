import { StreamChat } from "stream-chat";

export async function POST(request: Request) {

  try {
    if (!process.env.STREAM_SECRET_KEY) {
      console.log("ENV FILE CHECK");
      console.log("API KEY =", process.env.NEXT_PUBLIC_STREAM_API_KEY);
      console.log("SECRET =", process.env.STREAM_SECRET_KEY);
      console.log("ALL ENV KEYS =", Object.keys(process.env).filter(k =>
        k.includes("STREAM")
      ));

      console.error("Missing STREAM_SECRET_KEY");
      return new Response(
        JSON.stringify({ error: "Server misconfigured" }),
        { status: 500 }
      );
    }

    const serverClient = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      process.env.STREAM_SECRET_KEY
    );

    const body = await request.json();
    const userId = body?.userId;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400 }
      );
    }

    const token = serverClient.createToken(userId);

    return Response.json({ token });
  } catch (error) {
    console.error("[/api/token] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
