import { useEffect, useState } from "react";
import IMessage from "./IMessage";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  roomid: string;
  userid: string;
}

export default function ChatRoom({ socket, roomid, userid }: Props) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState<string>("");
  const updateMessages = (roomid: string) => {
    socket.emit("get-messages", roomid, (msgs: IMessage[]) => {
      setMessages(msgs);
    });
  };
  useEffect(() => {
    socket.on("update", () => {
      updateMessages(roomid);
    });
  }, [socket, roomid]);

  useEffect(() => {
    updateMessages(roomid);
    socket.emit("connect-to-room", roomid, userid);
  }, [roomid, userid]);

  const handleSend = () => {
    socket.emit("post-message", roomid, userid, text);
    socket.emit("update-all", roomid); //Säger åt alla att ladda om chatten.
  };

  return (
    <div>
      <h1>{roomid}</h1>
      <ul>
        {messages.map(({ text, sender }) => (
          <li>
            <b>{sender}</b>:{text}
          </li>
        ))}
        {messages.length === 0 && "No messages in this room :("}
      </ul>
      <div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          name=""
          style={{
            width: "70%",
          }}
          id=""
        />
        <button style={{ width: "25%" }} onClick={handleSend}>
          send
        </button>
      </div>
    </div>
  );
}
