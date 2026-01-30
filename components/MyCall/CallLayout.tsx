import { useDiscordContext } from "@/contexts/DiscordContext";
import { CallingState } from "@stream-io/video-client";
import {
  useCallStateHooks,
  StreamTheme,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

export default function CallLayout(): JSX.Element {
  const { setCall } = useDiscordContext();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const participantCount = useParticipantCount();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1f22] text-gray-300">
        <span className="animate-pulse">Joining call...</span>
      </div>
    );
  }

  return (
    <StreamTheme>
      <div className="flex flex-col h-full bg-[#313338] text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Voice Channel
          </h2>
          <span className="text-xs text-gray-400">
            {participantCount} participant{participantCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Video layout */}
        <div className="flex-1 flex items-center justify-center bg-[#2e2f33]">
          <SpeakerLayout participantsBarPosition="bottom" />
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-t border-gray-700 bg-[#1e1f22]">
          <CallControls
            onLeave={() => {
              setCall(undefined);
            }}
          />
        </div>
      </div>
    </StreamTheme>
  );
}
