import QueryString from "qs";
import { useEffect, useState, useRef } from "react";
import { useRoom } from "livekit-react";
import axios from "axios";

function App() {
	const [err, setErr] = useState(null);
	const { connect, participants } = useRoom();
	const [track, setTrack] = useState(null);
	const [trackKey, setTrackKey] = useState(null);

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
				connect(process.env.REACT_APP_LIVEKIT_SERVER, token);
			})
			.catch((err) => {
				setErr(err);
			});
	}, []);

	useEffect(() => {
		let query = QueryString.parse(window.location.search, {
			ignoreQueryPrefix: true,
		});
		let subject = query.target;
		let p = participants.find((p) => p.identity === subject);

		let videoTrack, videoKey;

		p?.videoTracks.forEach((_track, _key) => {
			if (!videoTrack) {
				videoTrack = _track;
				videoKey = _key;
			}
		});

		if (videoKey !== trackKey) {
			setTrack(videoTrack);
			setTrackKey(videoKey);
		}
	}, [participants]);

	if (err) {
		return <div>An error has occurred</div>;
	}

	return (
		<div className="App">
			{trackKey}
			<VideoFrame track={track} key={trackKey} />
		</div>
	);
}

export default App;

function VideoFrame({ track }) {
	const ref = useRef(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) {
			return;
		}
		el.muted = true;

		track?.track?.attach(el);

		console.log(track, track?.track, track?.track?.attachedElements);

		return () => {
			track?.track?.detach(el);
		};
	}, []);

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
				key={track?.track?.sid}
			/>
		</div>
	);
}
