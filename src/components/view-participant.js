import { useParticipant, VideoRenderer } from "livekit-react";

export default function ViewParticipant({ participant, withAudio }) {
  let { publications } = useParticipant(participant);

  const videoPub = publications.find((p) => p.kind === "video");

  if (!videoPub) {
    return <></>;
  }

  if (typeof videoPub.setSubscribed === "function") {
    videoPub.setSubscribed(true);
  }

  if (!videoPub.track) {
    return <></>;
  }
  return (
    <>
      <VideoRenderer track={videoPub.track} key={videoPub.trackSid} />
    </>
  );
}
