import QueryString from "qs";
import { useEffect, useState, useRef } from "react";
import { useRoom } from "livekit-react";
import axios from "axios";
import ViewParticipant from "./components/view-participant";
import styled from "styled-components";
import ParticipantAudio from "./components/participant-audio";

function App() {
  const { connect, participants } = useRoom();
  const [err, setErr] = useState(null);
  const [withAudio, setWithAudio] = useState(false);
  const [targetNickname, setTargetNickname] = useState(null);
  const [target, setTarget] = useState(null);
  const [delay, setDelay] = useState(0);
  const intervalRef = useRef();
  const [startPlay, setStartPlay] = useState(false);

  useEffect(() => {
    let query = QueryString.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    let room = query.room;
    let passcode = query.passcode;
    let nickname = query.target;

    setWithAudio(query.audio === "1");
    setTargetNickname(nickname);

    //authenticate upon load
    axios
      .post(process.env.REACT_APP_PEER_SERVER + "/viewer/room/join", {
        room,
        passcode,
      })
      .then((response) => {
        const token = response.data.token;
        connect(process.env.REACT_APP_LIVEKIT_SERVER, token, {
          autoSubscribe: false,
        });
      })
      .catch((err) => {
        setErr(err);
      });

    intervalRef.current = window.setInterval(() => {
      axios
        .get(`${process.env.REACT_APP_PEER_SERVER}/${room}/${nickname}/mix`)
        .then(({ data }) => {
          let _delay = data?.mix?.delay;
          if (_delay === 0 || _delay) {
            setDelay(parseInt(_delay) / 1000);
          }
        });
    }, 2000);

    return () => {
      window.clearInterval(intervalRef);
    };
  }, []);

  useEffect(() => {
    if (!targetNickname) {
      return;
    }
    let p = participants.find((p) => {
      return JSON.parse(p.metadata || "{}")?.nickname === targetNickname;
    });
    if (p) {
      setTarget(p);
    }
  }, [targetNickname, participants]);

  if (err) {
    return (
      <div>
        An error has occurred.
        <br />
        {JSON.stringify(err)}
      </div>
    );
  }

  if (!target) {
    return <>Target node not found.</>;
  }

  return (
    <Frame>
      {withAudio ? (
        <ParticipantAudio
          participant={target}
          delay={delay}
          startPlay={startPlay}
        />
      ) : (
        false
      )}
      <ViewParticipant participant={target} withAudio={withAudio} />
    </Frame>
  );
}

export default App;

const Frame = styled.main`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
