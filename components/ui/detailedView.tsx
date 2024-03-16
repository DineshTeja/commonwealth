import React, { useEffect, useRef, useState, useCallback } from 'react';
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
// import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress for the loading spinner
import Image from 'next/image';

// Adjusted utility function to display dash lists as bullet lists
function formatTextToHTML(text: string) {
    return text.split('\n').map((item, key) => {
        // Check if the line starts with a dash, indicating a list item
        if (item.trim().startsWith("-")) {
            return (
                <li key={key}>{item.trim().substring(1).trim()}</li>
            );
        } else {
            return (
                <React.Fragment key={key}>
                    {item}
                    <br />
                </React.Fragment>
            );
        }
    });
}

function DetailedView({ open, onClose, article }) {
    const { messages, addMessage, clearMessages } = useMessages();
    const [isAnswering, setIsAnswering] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const [aiResponse, setAiResponse] = useState("");
    const [hasGenerated, setHasGenerated] = useState(false); // Flag to track if the response has been generated
    const [isLoading, setIsLoading] = useState(false); // State to track loading status

    const handleSubmit = useCallback(async (articleText) => {
        if (hasGenerated) return; // Prevent running if already generated
        setIsLoading(true); // Start loading

        const prompt = "Generate a detailed summary of this article with key information, numbers, statistics, weaknesses, strengths, and apparent political alignment."
        console.log(prompt);

        // Ensure articleText is passed to callOpenAI
        const response = await callOpenAI(prompt, articleText);
        console.log(response);
        setAiResponse(response); 
        setHasGenerated(true); // Set flag to true after generating
        setIsLoading(false); // Stop loading
    }, [hasGenerated]);

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
    
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
        return data.response;
    };

    useEffect(() => {
        if (open && article.content && !hasGenerated) {
            handleSubmit(article.content);
        }
    }, [article.content, handleSubmit, open, hasGenerated]);

    useEffect(() => {
        if (open) {
            setAiResponse(""); // Clear aiResponse when the dialog is opened
            setHasGenerated(false); // Reset hasGenerated to allow new generation
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
                            Detailed View
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 w-full">
                        {isLoading ? (
                            <div className="flex justify-center items-center">
                                <Image src="/images/commonwealth.png" alt="Loading..." width={100} height={100} className="animate-pulse" />
                            </div>
                        ) : (
                            <div className="text-slate-800 text-sm">
                                {formatTextToHTML(aiResponse)}
                            </div>
                        )}
                    </div>
                    <div ref={bottomRef} />
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

export default DetailedView;