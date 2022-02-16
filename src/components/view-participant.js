import { useParticipant, VideoRenderer } from "livekit-react";
import { VideoQuality } from "livekit-client";

export default function ViewParticipant({ participant, withAudio }) {
  let { publications } = useParticipant(participant);

  const videoPub = publications.find((p) => p.kind === "video");

  if (!videoPub) {
    return <></>;
  }

  if (typeof videoPub.setVideoQuality === "function") {
    videoPub.setVideoQuality(VideoQuality.HIGH);
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
