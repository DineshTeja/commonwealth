import {
  createContext,
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
  clearMessages: () => void; // Add this line
}

const MessagesContext = createContext<MessagesContextProps>({
  messages: [],
  addMessage: () => {}, // This is a placeholder function.
  clearMessages: () => {}, // Add this line to include a placeholder `clearMessages` function.
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

  const clearMessages = useCallback(() => {
    setMessages([]); // Clear the messages array
  }, []);

  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

  return (
    <MessagesContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </MessagesContext.Provider>
  );
}
