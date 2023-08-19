import { useEffect, useState } from "react";
import useChat from "./useChat";

interface Props {
  roomId: string;
  userId: string;
}

export default function ChatRoom({ roomId, userId }: Props) {
  const {
    messages,
    isLoadingMessages,
    optimisticMessages,
    send,
    isConnecting,
    usersTyping,
    setIsTyping,
  } = useChat(roomId, userId);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (text == "") {
      setIsTyping(false);
    } else {
      setIsTyping(true);
    }
  }, [text]);

  const handleSend = () => {
    send(text);
  };

  return (
    <div>
      <h1>{roomId}</h1>
      {isConnecting || isLoadingMessages ? (
        <div style={{ fontSize: 50 }}>Loading...</div>
      ) : (
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
          {messages.length === 0 &&
            optimisticMessages.length === 0 &&
            "No messages in this room :("}
        </ul>
      )}
      {usersTyping.length !== 0 && (
        <div>
          {usersTyping.join(",") + (usersTyping.length == 1 ? " is" : " are")}{" "}
          typing
        </div>
      )}
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
