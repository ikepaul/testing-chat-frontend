import { useEffect, useState } from "react";
import IMessage from "./IMessage";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  roomId: string;
  userId: string;
}

export default function ChatRoom({ socket, roomId, userId }: Props) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState<string>("");
  const [optimisticMessages, setOptimisticMessages] = useState<IMessage[]>([]);
  const updateMessages = () => {
    socket.emit("get-messages", (msgs: IMessage[]) => {
      setMessages(msgs);
    });
  };
  useEffect(() => {
    const handleNewMessage = (message: IMessage) => {
      setMessages((prev) => [...prev, message]);

      //Removing optimistic message
      setOptimisticMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs.splice(
          newMsgs.findIndex(
            (msg) => !(msg.sender == message.sender && msg.text == message.text)
          ),
          1
        );
        return [...newMsgs];
      });
    };
    socket.on("new-message", handleNewMessage);

    return () => {
      socket.removeListener("new-message", handleNewMessage);
    };
  }, [socket, roomId]);

  useEffect(() => {
    updateMessages();
  }, [roomId]);

  const handleSend = () => {
    setOptimisticMessages((prev) => [...prev, { text, sender: userId }]);
    socket.emit("post-message", text);
  };

  return (
    <div>
      <h1>{roomId}</h1>
      <ul style={{ fontSize: 40 }}>
        {messages.map(({ text, sender }) => (
          <li>
            <b>{sender}</b>:{text}
          </li>
        ))}
        {optimisticMessages.map(({ text, sender }) => (
          <li style={{ color: "gray" }}>
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
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button style={{ width: "25%" }} onClick={handleSend}>
          send
        </button>
      </div>
    </div>
  );
}
