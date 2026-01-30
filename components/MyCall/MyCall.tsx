import {
  Call,
  StreamCall,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useCallback, useEffect, useState } from "react";
import CallLayout from "./CallLayout";

export default function MyCall({ callId }: { callId: string }): JSX.Element {
  const [call, setCall] = useState<Call | undefined>(undefined);
  const [joining, setJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const client = useStreamVideoClient();

  const createCall = useCallback(async () => {
    try {
      if (!client) {
        setError("Video client not available.");
        return;
      }
      const callToCreate = client.call("default", callId);
      // Disable camera by default
      await callToCreate.camera.disable();
      // Join or create the call
      await callToCreate.join({ create: true });
      setCall(callToCreate);
    } catch (err) {
      console.error("Error joining call:", err);
      setError("Failed to join call. Please try again.");
    } finally {
      setJoining(false);
    }
  }, [client, callId]);

  useEffect(() => {
    if (!call && joining) {
      createCall();
    }
  }, [call, joining, createCall]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1f22] text-red-400 font-semibold">
        {error}
      </div>
    );
  }

  if (joining || !call) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1f22] text-gray-300 animate-pulse">
        <span>Joining call…</span>
      </div>
    );
  }

  return (
    <StreamCall call={call}>
      <div className="h-full w-full bg-[#313338] text-gray-200">
        <CallLayout />
      </div>
    </StreamCall>
  );
}
