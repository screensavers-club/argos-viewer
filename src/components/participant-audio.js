import { useParticipant, AudioRenderer } from "livekit-react";
import { useEffect, useRef, useState } from "react";

export default function ParticipantAudio({ participant, delay, startPlay }) {
  const { publications } = useParticipant(participant);
  const [track, setTrack] = useState(null);

  const AudioCtxRef = useRef();
  const mediaStream = useRef();
  const mediaStreamSource = useRef();
  const delayNode = useRef();

  const [initAudio, setInitAudio] = useState(false);

  useEffect(() => {
    const audioPub = publications.find((p) => {
      return p.kind === "audio";
    });

    setTrack(audioPub?.track);
  }, [publications]);

  useEffect(() => {
    if (delayNode.current) {
      delayNode.current.delayTime.value = delay;
    }
  }, [delay]);

  return (
    <>
      {!initAudio && (
        <button
          style={{ zIndex: 200, position: "fixed", top: "2" }}
          onClick={() => {
            if (
              !mediaStream.current &&
              track &&
              track.mediaStreamTrack instanceof MediaStreamTrack
            ) {
              const AudioContext =
                window.AudioContext || window.webkitAudioContext;

              AudioCtxRef.current = new AudioContext();
              delayNode.current = new DelayNode(AudioCtxRef.current, {
                maxDelayTime: 5,
                delayTime: delay,
              });

              const audioDom = track.attach();
              audioDom.muted = true;

              mediaStream.current = new MediaStream([track.mediaStreamTrack]);
              mediaStreamSource.current =
                AudioCtxRef.current.createMediaStreamSource(
                  mediaStream.current
                );
              mediaStreamSource.current
                .connect(delayNode.current)
                .connect(AudioCtxRef.current.destination);
            }
            setInitAudio(true);
          }}
        >
          start audio {participant.metadata}
        </button>
      )}
      {/* <audio ref={audioDomRef} /> */}
    </>
  );
}
