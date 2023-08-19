import { Fragment, useEffect, useState } from "react";
import ChatRoom from "./ChatRoom";
import { io, Socket } from "socket.io-client";

function App() {
  const [inputUserId, setInputUserId] = useState<string>("");
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [socket, setSocket] = useState<Socket>();
  const [roomId, setRoomId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [rooms, setRooms] = useState<string[]>([]);

  useEffect(() => {
    const s = io("http://localhost:3000", {
      auth: {
        token: userId,
      },
    });
    setSocket(s);
  }, [userId]);

  useEffect(() => {
    socket?.emit("get-rooms", (rms: string[]) => {
      setRooms(rms);
      console.log(rms);
    });
  }, [socket, userId]);
  useEffect(() => {
    socket?.on("connect_error", (err) => {
      console.log(err.message); // prints the message associated with the error
    });

    socket?.on("disconnect", () => {
      setConnected(false);
    });

    socket?.on("connect", () => {
      setConnected(true);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const handleJoin = () => {
    socket?.emit("join-room", inputRoomId);
    getRooms();
  };

  const handleSignIn = () => {
    setUserId(inputUserId);
  };

  const handleSignOut = () => {
    setUserId("");
  };

  const getRooms = () => {
    socket?.emit("get-rooms", (rms: string[]) => {
      setRooms(rms);
      console.log(rms);
    });
  };

  const handleRoomClick = (roomId: string) => {
    setRoomId(roomId);
  };

  return (
    <div>
      <button
        onClick={handleSignOut}
        style={{ position: "absolute", top: "20px", right: "20px" }}
      >
        Sign out
      </button>
      {userId === "" && (
        <Fragment>
          <input
            type="text"
            value={inputUserId}
            onChange={(e) => setInputUserId(e.target.value)}
            name=""
            id=""
            placeholder="userid"
          />
          <button onClick={handleSignIn}>Sign in</button>
        </Fragment>
      )}
      {userId && (
        <Fragment>
          <input
            type="text"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
            name=""
            id=""
            placeholder="roomid"
          />
          <button onClick={handleJoin}>Join Room</button>
          <button onClick={getRooms}>Get Rooms</button>
        </Fragment>
      )}

      {userId && (
        <div>
          {rooms.map((room) => (
            <button onClick={() => handleRoomClick(room)}>{room}</button>
          ))}
        </div>
      )}
      {userId && socket && connected && roomId && inputUserId ? (
        <ChatRoom key={roomId} roomId={roomId} userId={userId} />
      ) : (
        <div>No room selected</div>
      )}
    </div>
  );
}

export default App;
