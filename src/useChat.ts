import { useEffect, useState } from "react";
import IMessage from "./IMessage";
import { Socket, io} from "socket.io-client";

export default function useChat(roomId:string,userId:string) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [socket, setSocket] = useState<Socket>();
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [optimisticMessages, setOptimisticMessages] = useState<IMessage[]>([]);
  
  useEffect(() => {
    const s = io("http://localhost:3000", {
      auth: {
        token: userId,
      },
    });
    setIsConnecting(true);
    s.emit("connect-to-room", roomId, (success: boolean) => {
      if (success) 
      {
        console.log("success")
        setIsConnecting(false);
      }
      else {
        console.log("Error joining room")
      }
    });
    setSocket(s);
  }, [])

  useEffect(() => {
    socket?.on("new-message", handleNewMessage);

    return () => {
      socket?.removeListener("new-message", handleNewMessage);
    };
  }, [socket]);

  const handleNewMessage = (message: IMessage) => {
    setMessages((prev) => [...prev, message]);
    
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

  useEffect(() => {
    const updateMessages = () => {
      setIsLoadingMessages(true);
      socket?.emit("get-messages", (msgs: IMessage[]) => {
        setMessages(msgs);
        console.log(msgs)
        setIsLoadingMessages(false);
      });
    };
    if (!isConnecting) {
      updateMessages();
    }
  }, [socket,socket?.id, isConnecting]);

  const send = (text:string) => {
    setOptimisticMessages((prev) => [...prev, { text, sender: userId }]);
    socket?.emit("post-message", text);
  };

  return {messages,isLoadingMessages, optimisticMessages, send, isConnecting};
}