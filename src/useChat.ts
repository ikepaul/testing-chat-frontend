import { useEffect, useState } from "react";
import IMessage from "./IMessage";
import { Socket, io} from "socket.io-client";

export default function useChat(roomId:string,userId:string) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [socket, setSocket] = useState<Socket>();
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [usersTyping, setUsersTyping] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [optimisticMessages, setOptimisticMessages] = useState<IMessage[]>([]);
  
  //Fires once on when useChat is called
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

  //Adding socket-eventlisteners
  useEffect(() => {
    socket?.on("new-message", handleNewMessage);

    socket?.on("users-typing", handleUsersTyping);

    return () => {
      socket?.removeListener("new-message", handleNewMessage);
      socket?.removeListener("users-typing", setUsersTyping);
    };
  }, [socket]);


  const handleUsersTyping = (ut:string[]) => {
    setUsersTyping(ut.filter(u => u !== userId))
  }

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
    socket?.emit("is-typing", isTyping);
  },[isTyping])


  useEffect(() => {
    const updateMessages = () => {
      setIsLoadingMessages(true);
      socket?.emit("get-messages", (msgs: IMessage[]) => {
        setMessages(msgs);
        console.log(msgs)
        setIsLoadingMessages(false);
      });
    };
    const getUsersTyping = () => {
      socket?.emit("get-users-typing", handleUsersTyping)
    }
    if (!isConnecting) {
      updateMessages();
      getUsersTyping();
    }
  }, [socket,socket?.id, isConnecting]);

  const send = (text:string) => {
    setOptimisticMessages((prev) => [...prev, { text, sender: userId, timestamp:Date.now() }]);
    socket?.emit("post-message", text);
  };

  return {messages,isLoadingMessages, optimisticMessages, send, isConnecting, usersTyping, setIsTyping};
}