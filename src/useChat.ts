import { useEffect, useState } from "react";
import IMessage from "./IMessage";
import { Socket, io} from "socket.io-client";
import { v4 } from "uuid";

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
    s.emit("connectToRoom", roomId, (success: boolean) => {
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
    socket?.on("newMessage", handleNewMessage);

    socket?.on("usersTyping", handleUsersTyping);

    socket?.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket?.removeListener("newMessage", handleNewMessage);
      socket?.removeListener("usersTyping", setUsersTyping);
      socket?.removeListener("messageDeleted", handleMessageDeleted);
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
          (msg) => (msg.sender == message.sender && msg.text == message.text)
        )
      ,1);
      return [...newMsgs];
    });
  };
    
  const handleMessageDeleted = (messageId: string) => {
    setMessages(prev => {
      const newMessages = prev.map(m => ({...m}));
      const index = newMessages.findIndex(m => m.id === messageId);
      if (index === -1 ){return prev;}
      newMessages.splice(index,1);
      return [...newMessages];
    })
  }

  useEffect(() => {
    socket?.emit("isTyping", isTyping);
  },[isTyping])


  useEffect(() => {
    const updateMessages = () => {
      setIsLoadingMessages(true);
      socket?.emit("getMessages", (msgs: IMessage[]) => {
        setMessages(msgs);
        setIsLoadingMessages(false);
      });
    };
    const getUsersTyping = () => {
      socket?.emit("getUsersTyping", handleUsersTyping)
    }
    if (!isConnecting) {
      updateMessages();
      getUsersTyping();
    }
  }, [socket,socket?.id, isConnecting]);

  const sendMessage = (text:string) => {
    setOptimisticMessages((prev) => [...prev, { text, sender: userId, timestamp:Date.now(), id: v4() }]);
    socket?.emit("postMessage", text);
  };

  const deleteMessage = (id:string) => {
    socket?.emit("deleteMessage", id);
  }

  return {deleteMessage, messages,isLoadingMessages, optimisticMessages, sendMessage, isConnecting, usersTyping, setIsTyping};
}