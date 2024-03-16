import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton } from '@mui/material';
import ReactTextareaAutosize from "react-textarea-autosize";
import {
  ChevronRightIcon,
  StopCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming this is your custom button component
import MessagesProvider, { useMessages } from "@/datasources/messagesContext";
import { v4 as uuidv4 } from "uuid";
import ChatView from "@/components/ui/chatView";
import Image from "next/image";
import { firebaseConfig } from "../../firebaseConfig.ts"; // Your Firebase config
import { initializeApp } from "firebase/app";
import { doc, collection, setDoc, getDoc, updateDoc, arrayUnion, addDoc, query, where, getDocs, orderBy, getFirestore } from "firebase/firestore";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// This utility function can be defined inside both components or in a separate utility file and imported.
function formatTextToHTML(text: string) {
    return text.split('\n').map((item, key) => (
      <React.Fragment key={key}>
        {item}
        <br />
      </React.Fragment>
    ));
}

function ArticleDialog({ open, onClose, article }) {
    // const { messages, addMessage, clearMessages } = useMessages();
    
    const [messages, setMessages] = useState([]);
    const [isAnswering, setIsAnswering] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!article.url) {
                setMessages([]); // Clear messages if there's no article URL
                return;
            }
            const encodedUrl = encodeURIComponent(article.url);
            const articleRef = doc(db, "articles", encodedUrl);
            const articleSnap = await getDoc(articleRef);
            if (articleSnap.exists()) {
                const articleData = articleSnap.data();
                setMessages(articleData.chatMessages || []);
            } else {
                setMessages([]); // Clear messages if the article has no chatMessages
            }
        };

        fetchMessages();
    }, [article, open]);

    // useEffect(() => {
    //     // Clear messages when the article changes
    //     clearMessages();
    // }, [article, clearMessages]);

    const addMessageToFirestore = async (message) => {
        const articleRef = doc(db, "articles", encodeURIComponent(article.url));
        await setDoc(articleRef, {
            chatMessages: arrayUnion(message)
        }, { merge: true });
    };

    const handleSubmit = async (articleText) => {
        if (chatInput.trim() === "") return;
        const userMessage = {
            id: uuidv4(),
            text: chatInput,
            timestamp: Date.now(),
            sender: "user",
            // Removed articleId, using article.url instead
        };
        setMessages(prev => [...prev, userMessage]);
        await addMessageToFirestore(userMessage);
        setChatInput("");
        setIsAnswering(true);

        // Call the AI response function
        const aiResponseText = await callOpenAI(chatInput, articleText);
        const aiMessage = {
          id: uuidv4(),
          text: aiResponseText,
          timestamp: Date.now(),
          sender: "ai"
        };
        setMessages(prev => [...prev, aiMessage]);
        await addMessageToFirestore(aiMessage);
        setIsAnswering(false);
    };

    // const handleSubmit = async (articleText) => {
    //     console.log(articleText);
    //     if (chatInput.trim() === "") return;
    //     setChatInput("");
      
    //     setIsAnswering(true);
      
    //     addMessage({
    //       id: uuidv4(),
    //       text: chatInput,
    //       timestamp: Date.now(),
    //       sender: "user",
    //     }, "new");
      
    //     // Ensure article.text is passed to callOpenAI
    //     console.log("before ai response");
    //     const aiResponse = await callOpenAI(chatInput, articleText); // Modified line
    //     console.log("after ai response");
    //     console.log(article.content);

    //     addMessage({
    //       id: uuidv4(),
    //       text: aiResponse,
    //       timestamp: Date.now(),
    //       sender: "ai",
    //     }, "new");
      
    //     setIsAnswering(false);
    // };

    // Add this function inside your ArticleDialog component
    const callOpenAI = async (input, articleText) => {
        const response = await fetch("/call_ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // Include the article text in the request body
            body: JSON.stringify({ input, articleText }),
        });
    
        const data = await response.json();
        return data.response;
    };

    // Clear messages when the dialog is closed
    useEffect(() => {
        if (!open) {
            setMessages([]);
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth maxWidth="md" 
            PaperProps={{ style: { borderRadius: 16 }}}
        >
            {/* <DialogTitle>{article.title}</DialogTitle> */}
            <DialogContent>
                {/* <p>{article.text}</p> */}
                <div className="flex flex-col w-full overflow-scroll">
                    <div className="flex flex-col items-center justify-center gap-1 p-12 text-center">
                        <div className="font-extrabold text-3xl text-slate-800">
                            {article.title}
                        </div>
                        <div className="text-slate-500 font-medium">
                            Powered by GPT-4
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 w-full">
                        {messages.map((message) => (
                            <ChatView key={message.id} message={{...message, text: formatTextToHTML(message.text)}} />
                        ))}
                        {isAnswering ? (
                            <div className="flex justify-center items-center">
                                <Image
                                    src="/images/commonwealth.png"
                                    alt="Loading..."
                                    width={75}
                                    height={75}
                                    className="mb-3 animate-pulse"
                                />   
                            </div>                         
                        ) : (<></>)}
                    </div>
                    <div ref={bottomRef} />
                </div>
                <div className="flex flex-row gap-2 w-full border border-slate-200 rounded-xl bg-white mt-4">
                    <ReactTextareaAutosize
                        placeholder="Chat with Commonwealth.ai"
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
                        onClick={() => handleSubmit(article.content)}
                    >
                        {isAnswering ? (
                            <StopCircleIcon className="text-slate-600" />
                        ) : (
                            <ChevronRightIcon className="text-purple-400" />
                        )}
                    </Button>
                </div>
            </DialogContent>
            <DialogActions>
                <div 
                    className="text-white bg-purple-800 hover:bg-purple-400 font-medium px-4 py-2 rounded-xl flex items-center justify-center cursor-pointer"
                    onClick={onClose}
                >
                    Close
                </div>
            </DialogActions>
        </Dialog>
    );
}

export default ArticleDialog;