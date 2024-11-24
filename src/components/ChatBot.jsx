"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SyncLoader } from "react-spinners";
import UserContext from "@/utils/UserContext";
import { ShiftingBounceLoader } from "./LoadingSpinner";
import axios from "axios";

const ChatBot = () => {
  const { theme } = useContext(UserContext);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [animatedMessage, setAnimatedMessage] = useState("");
  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);

  const generateResponse = async (userInput) => {
    const apiKey = "AIzaSyD7GNyhfLL0sHivNLaJbLHjmA9FNc_ltMw";
    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/tunedModels/tailorease-9xsolh78gt2a:generateContent";

    const payload = {
      contents: [
        {
          parts: [{ text: userInput }],
        },
      ],
    };

    try {
      const response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error communicating with AI:", error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsTyping(true);

    const botResponseData = await generateResponse(input);

    // Check if the response contains the expected structure
    const botResponse =
      botResponseData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I didn't quite catch that."; // Fallback message

    setIsTyping(false);
    animateBotMessage(botResponse);
  };

  const animateBotMessage = (text) => {
    if (!text || typeof text !== "string") return;

    const words = text.split(" ");
    let currentWordIndex = 0;
    setAnimatedMessage("");

    const interval = setInterval(() => {
      setAnimatedMessage(
        (prev) => prev + (prev ? " " : "") + words[currentWordIndex]
      );
      currentWordIndex++;

      if (currentWordIndex >= words.length) {
        clearInterval(interval);
        setMessages((prev) => [...prev, { text, sender: "bot" }]);
        setAnimatedMessage("");
      }
    }, 50);
  };

  const handleClickOutside = (e) => {
    if (chatBoxRef.current && !chatBoxRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      scrollToBottom(); // Scroll when chat opens
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, animatedMessage]);

  const chatBoxVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <>
      {/* ChatBot Trigger Icon */}
      <div
        className={`fixed bottom-8 right-8 w-14 h-14 flex items-center justify-center rounded-full shadow-lg cursor-pointer hover:scale-105 z-[9999] ${theme.mainTheme}`}
        onClick={() => setIsOpen(true)}
      >
        {isOpen ? (
          <ShiftingBounceLoader size={35} color="white" /> // sort of a thinking animation when the chatbox is open
        ) : (
          <i className={`fas fa-robot text-2xl ${theme.iconColor}`}></i>
        )}
      </div>

      {/* ChatBot Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed bottom-[6rem] right-8 w-[340px] max-w-full h-[510px] bg-white rounded-lg shadow-lg flex flex-col z-[99999] ${theme.mainTheme} ${theme.colorBorder}`}
            ref={chatBoxRef}
            variants={chatBoxVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* ChatBot Header */}
            <div
              className={`flex items-center justify-between p-4 border-b ${theme.colorBorder}`}
            >
              <div className="flex items-center space-x-2">
                <i className={`fas fa-robot text-4xl ${theme.iconColor}`}></i>
                <div>
                  <h3 className={`text-lg font-bold ${theme.colorText}`}>
                    VT-AI ChatBot
                  </h3>
                  <p className="text-sm font-semibold text-green-600">Online</p>
                </div>
              </div>
              <i
                className="fas fa-times cursor-pointer text-xl"
                onClick={() => setIsOpen(false)}
              ></i>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg text-white ${
                      msg.sender === "user"
                        ? "bg-blue-600"
                        : `${theme.mainTheme}`
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-lg flex items-center">
                    <SyncLoader size={8} speedMultiplier={0.5} color="white" />
                  </div>
                </div>
              )}
              {animatedMessage && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-lg ${theme.colorText}`}>
                    {animatedMessage}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Input Box */}
            <div
              className={`flex items-center p-3 border-t ${theme.colorBorder}`}
            >
              <input
                type="text"
                className="flex-1 p-2 rounded-lg bg-gray-100 outline-none text-gray-800"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                className="w-10 h-10 flex items-center justify-center ml-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                onClick={handleSendMessage}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
