import QueryString from "qs";
import { useEffect, useState, useRef } from "react";
import { useRoom } from "livekit-react";
import axios from "axios";

function App() {
  const [err, setErr] = useState(null);
  const { connect, participants, room } = useRoom();
  const [target, setTarget] = useState(null);
  const [renderState, setRenderState] = useState(0);
  const videoStreamRef = useRef({ track: null });
  const [videoStreamRefState, setVideoStreamRefState] = useState(
    videoStreamRef.current.track
  );
  const [audioStreamRefState, setAudioStreamRefState] = useState(null);
  const audioStreamRef = useRef(null);
  const audioElemRef = useRef();

  useEffect(() => {
    //authenticate upon load
    let query = QueryString.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    let room = query.room;
    let passcode = query.passcode;

    axios
      .post(process.env.REACT_APP_PEER_SERVER + "/viewer/room/join", {
        room,
        passcode,
      })
      .then((response) => {
        const token = response.data.token;
        connect(process.env.REACT_APP_LIVEKIT_SERVER, token).then(() => {
          setRenderState(renderState + 1);
        });
      })
      .catch((err) => {
        setErr(err);
      });
  }, []);

  useEffect(() => {
    // get reference to audiostream
    if (target?.audioTracks && target.metadata === "PARENT") {
      let firstAudioTrack;
      target.audioTracks.forEach((track, key) => {
        if (!firstAudioTrack) {
          firstAudioTrack = track;
        }
      });

      audioStreamRef.current = firstAudioTrack;
      setAudioStreamRefState(audioStreamRef.current);
    }
  }, [target]);

  useEffect(() => {
    console.log(audioStreamRefState?.audioTrack);
    audioStreamRefState?.audioTrack?.attach(audioElemRef.current);
  }, [audioStreamRefState, audioStreamRefState?.audioTrack]);

  useEffect(() => {
    const query = QueryString.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    const _t = query.target;

    let p = participants.find((p) => p.identity === _t);
    if (p) {
      let videoTrack;
      if (p) {
        p?.videoTracks.forEach((track, key) => {
          if (!videoTrack) {
            videoTrack = track;
          }
        });
      }
      setTarget(p);
      videoStreamRef.current.track = videoTrack;
      setVideoStreamRefState(videoStreamRef.current.track);
    }
  }, [participants, room, renderState]);

  if (err) {
    return <div>An error has occurred</div>;
  }

  return (
    <div className="App">
      {videoStreamRefState ? (
        <VideoFrame
          key={videoStreamRefState?.current?.trackSid}
          videoTrack={videoStreamRefState}
          participant={target}
          renderState={renderState}
        />
      ) : (
        <></>
      )}
      {audioStreamRefState?.trackSid && (
        <>
          <audio ref={audioElemRef} autoPlay />
          <button
            onClick={() => {
              audioElemRef.current.play();
            }}
          >
            Start audio
          </button>
        </>
      )}
    </div>
  );
}

export default App;

function VideoFrame({ videoTrack, participant, sid }) {
  const t = videoTrack?.track;
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.muted = true;

    if (videoTrack?.track) {
      videoTrack.track?.attach(el);
      console.log("attach");
    }

    return () => {
      videoTrack?.track?.detach(el);
    };
  }, [t]);

  return (
    <div>
      <video
        style={{
          width: "100%",
          height: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          objectFit: "cover",
          zIndex: 300,
        }}
        autoPlay
        ref={ref}
        key={participant?.identity}
      />
    </div>
  );
}
