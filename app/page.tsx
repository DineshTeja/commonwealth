"use client";
import ReactTextareaAutosize from "react-textarea-autosize";
import {
  ChevronRightIcon,
  Square,
  StopCircle,
  StopCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import MessagesProvider, { useMessages } from "@/datasources/messagesContext";
import { v4 as uuidv4 } from "uuid";
import ChatView from "@/components/ui/chatView";

function View() {
  const [isAnswering, setIsAnswering] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { messages, addMessage } = useMessages();

  const handleSubmit = () => {
    if (chatInput.trim() === "") return;
    setChatInput("");

    setIsAnswering(true);

    console.log("Adding", chatInput, "to messages.");

    addMessage(
      {
        id: uuidv4(),
        text: chatInput,
        timestamp: Date.now(),
        sender: "user",
      },
      "new"
    );

    // CHANGE LATER
    addMessage(
      {
        id: uuidv4(),
        text: "Add response feature later",
        timestamp: Date.now(),
        sender: "ai",
      },
      "new"
    );

    setIsAnswering(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <main className="flex h-screen flex-col items-center justify-between py-12 px-16 gap-8">
      {/* Main content */}
      <div className="flex flex-col w-full overflow-scroll">
        {/* Title card */}
        <div className="flex flex-col items-center gap-1 p-12">
          <div className="font-extrabold text-3xl text-slate-800">
            Influence.ai
          </div>
          <div className="text-slate-500 font-medium">
            Find your next brand ambassador using AI
          </div>
        </div>

        {/* Chat view */}
        <div className="flex flex-col gap-6 w-full">
          {messages.map((message) => (
            <ChatView key={message.id} message={message} />
          ))}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Text input */}
      <div className="flex flex-row gap-2 w-full border border-slate-200 rounded-xl bg-white">
        <ReactTextareaAutosize
          placeholder="Chat with Influence.ai"
          value={chatInput}
          disabled={isAnswering}
          onChange={(e) => setChatInput(e.target.value)}
          className="resize-none w-full text-sm p-3 bg-transparent focus:outline-none"
          maxRows={6}
          maxLength={1024}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-full aspect-square rounded-xl transition-all"
          onClick={() => handleSubmit()}
        >
          {isAnswering ? (
            <StopCircleIcon className="text-slate-600" />
          ) : (
            <ChevronRightIcon className="text-teal-600" />
          )}
        </Button>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <MessagesProvider>
      <View />
    </MessagesProvider>
  );
}
