import {
  createContext,
  use,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Message {
  id: string;
  text: string;
  timestamp: number;
  sender: "user" | "ai" | "system";
}

interface MessagesContextProps {
  messages: Message[];
  addMessage: (message: Message, op: "new" | "add") => void;
}

const MessagesContext = createContext<MessagesContextProps>({
  messages: [],
  addMessage: () => {},
});

export const useMessages = () => useContext(MessagesContext);

export default function MessagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((message: Message, op: "new" | "add") => {
    setMessages((prevMessages) => {
      if (op === "new") {
        return [...prevMessages, message];
      } else {
        return prevMessages.map((msg, idx) =>
          idx < prevMessages.length - 1 ? msg : message
        );
      }
    });
  }, []);

  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

  return (
    <MessagesContext.Provider value={{ messages, addMessage }}>
      {children}
    </MessagesContext.Provider>
  );
}
