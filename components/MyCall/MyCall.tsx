"use client";

import { Call, StreamCall } from "@stream-io/video-react-sdk";
import CallLayout from "./CallLayout";

type Props = {
  call: Call;
};

export default function MyCall({ call }: Props): JSX.Element {
  return (
    <StreamCall call={call}>
      <div className="h-full w-full bg-[#313338] text-gray-200">
        <CallLayout />
      </div>
    </StreamCall>
  );
}
