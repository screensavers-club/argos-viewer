import { useParticipant, VideoRenderer } from "livekit-react";

export default function ViewParticipant({ participant, withAudio }) {
  let { publications } = useParticipant(participant);
  console.log(publications);

  const videoPub = publications.find((p) => p.kind === "video");

  if (!videoPub) {
    return <></>;
  }

  if (typeof videoPub.setSubscribed === "function") {
    videoPub.setSubscribed(true);
  }

  console.log(videoPub);
  if (!videoPub.track) {
    return <></>;
  }
  return (
    <>
      <VideoRenderer track={videoPub.track} key={videoPub.trackSid} />
    </>
  );
}
