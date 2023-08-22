import { useEffect, useState } from "react";
import useChat from "./useChat";
import IMessage from "./IMessage";

interface Props {
  roomId: string;
  userId: string;
}

export default function ChatRoom({ roomId, userId }: Props) {
  const {
    messages,
    isLoadingMessages,
    optimisticMessages,
    sendMessage,
    isConnecting,
    usersTyping,
    setIsTyping,
    deleteMessage,
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
    sendMessage(text);
    setText("");
  };

  const displayMessage = ({ text, sender, timestamp, id }: IMessage) => {
    const date = new Date(timestamp);
    const h = date.getHours();
    const m = date.getMinutes();
    return (
      <li key={id} style={sender == userId ? { textAlign: "right" } : {}}>
        <div style={{ textAlign: "left", display: "inline-block" }}>
          <div>
            <b style={{ fontSize: 20 }}>{sender}</b>
            &nbsp;
            <span style={{ color: "gray", fontSize: 15 }}>{h + ":" + m}</span>
          </div>
          <div style={{ fontSize: 40 }}>{text}</div>
          <button onClick={() => deleteMessage(id)}>X</button>
        </div>
      </li>
    );
  };

  return (
    <div>
      <h1>{roomId}</h1>
      {isConnecting || isLoadingMessages ? (
        <div style={{ fontSize: 50 }}>Loading...</div>
      ) : (
        <div>
          <ul style={{ listStyle: "none" }}>
            {messages.map(displayMessage)}
            <span style={{ color: "gray" }}>
              {optimisticMessages.map(displayMessage)}
            </span>
            {messages.length === 0 &&
              optimisticMessages.length === 0 &&
              "No messages in this room :("}
          </ul>
          {usersTyping.length !== 0 && (
            <div>
              {usersTyping.join(" and ") +
                (usersTyping.length == 1 ? " is" : " are")}{" "}
              typing
            </div>
          )}
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
            boxSizing: "border-box",
          }}
          id=""
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button style={{ width: "30%" }} onClick={handleSend}>
          send
        </button>
      </div>
    </div>
  );
}
