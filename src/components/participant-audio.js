import { useParticipant } from "livekit-react";
import { useEffect, useRef, useState } from "react";

export default function ParticipantAudio({ participant, delay }) {
  const { publications } = useParticipant(participant);
  const [track, setTrack] = useState(null);

  const AudioCtxRef = useRef();
  const mediaStream = useRef();
  const mediaStreamSource = useRef();
  const delayNode = useRef();

  useEffect(() => {
    AudioCtxRef.current = new AudioContext();
    delayNode.current = new DelayNode(AudioCtxRef.current, {
      maxDelayTime: 5,
      delayTime: 0,
    });

    return () => {
      mediaStream.current = null;
      mediaStreamSource.current?.disconnect();
      delayNode.current?.disconnect();
      AudioCtxRef.current.close();
    };
  }, []);

  useEffect(() => {
    const audioPub = publications.find((p) => {
      return p.kind === "audio";
    });

    if (audioPub && typeof audioPub.setSubscribed === "function") {
      audioPub.setSubscribed(true);
    }

    setTrack(audioPub?.track);
  }, [publications]);

  useEffect(() => {
    if (
      !mediaStream.current &&
      track &&
      track.mediaStreamTrack instanceof MediaStreamTrack
    ) {
      mediaStream.current = new MediaStream([track.mediaStreamTrack]);
      mediaStreamSource.current = AudioCtxRef.current.createMediaStreamSource(
        mediaStream.current
      );
      mediaStreamSource.current
        .connect(delayNode.current)
        .connect(AudioCtxRef.current.destination);
    }
  }, [track]);

  useEffect(() => {
    if (delayNode.current) {
      delayNode.current.delayTime.value = delay;
    }
  }, [delay]);

  return <></>;
}
