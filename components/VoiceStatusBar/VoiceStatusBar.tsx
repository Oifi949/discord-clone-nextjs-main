"use client";

import { Call } from "@stream-io/video-react-sdk";
import { motion } from "framer-motion";
import { Mic, MicOff, Headphones, PhoneOff } from "lucide-react";
import { useState } from "react";

type Props = {
  call: Call;
  onLeave: () => void;
};

export default function VoiceStatusBar({ call, onLeave }: Props) {
  const micEnabled = call.microphone?.state?.status === "enabled";
  const [deafened, setDeafened] = useState(false);

  function toggleMute() {
    if (micEnabled) {
      call.microphone.disable();
    } else {
      call.microphone.enable();
    }
  }

  function toggleDeafen() {
    if (!deafened) {
      // Deafen: mute mic + mute all audio output
      call.microphone.disable();
      muteAllAudio(true);
    } else {
      // Undeafen
      call.microphone.enable();
      muteAllAudio(false);
    }

    setDeafened(!deafened);
  }

  return (
    <motion.div
      initial={{ y: 60 }}
      animate={{ y: 0 }}
      exit={{ y: 60 }}
      className="fixed bottom-0 left-0 right-0 h-16 bg-[#232428] text-white flex items-center justify-between px-4"
    >
      {/* INFO */}
      <div className="text-sm">
        <p className="font-semibold">🔊 Voice Connected</p>
        <p className="text-xs text-gray-400">
          {deafened ? "Deafened" : "Good connection"}
        </p>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-4">
        <button onClick={toggleMute} className="p-2 rounded hover:bg-gray-700">
          {micEnabled ? <Mic /> : <MicOff />}
        </button>

        <button
          onClick={toggleDeafen}
          className={`p-2 rounded hover:bg-gray-700 ${
            deafened ? "text-red-400" : ""
          }`}
        >
          <Headphones />
        </button>

        <button
          onClick={onLeave}
          className="p-2 rounded bg-red-600 hover:bg-red-700"
        >
          <PhoneOff />
        </button>
      </div>
    </motion.div>
  );
}

/* ----------------------------------
 * AUDIO OUTPUT CONTROL
 * ---------------------------------- */
function muteAllAudio(mute: boolean) {
  const mediaElements = document.querySelectorAll<
    HTMLAudioElement | HTMLVideoElement
  >("audio, video");

  mediaElements.forEach((el) => {
    el.muted = mute;
  });
}
