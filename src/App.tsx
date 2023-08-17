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
    const s = io("http://localhost:3000");
    setSocket(s);
  }, []);

  useEffect(() => {
    const token = "valid";
    socket?.emit("authenticate", token);

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
    socket?.emit("join-room", inputRoomId, userId);
    getRooms();
  };

  const handleSignIn = () => {
    setUserId(inputUserId);

    socket?.emit("get-rooms", inputUserId, (rms: string[]) => {
      setRooms(rms);
      console.log(rms);
    });
  };

  const getRooms = () => {
    socket?.emit("get-rooms", userId, (rms: string[]) => {
      setRooms(rms);
      console.log(rms);
    });
  };

  const handleRoomClick = (roomId: string) => {
    setRoomId(roomId);
  };

  return (
    <div>
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
        <ChatRoom roomid={roomId} userid={inputUserId} socket={socket} />
      ) : (
        <div>No room selected</div>
      )}
    </div>
  );
}

export default App;
