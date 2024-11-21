"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { SyncLoader } from "react-spinners";
import UserContext from "@/utils/UserContext";

const ChatBot = () => {
  const { theme } = useContext(UserContext);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [animatedMessage, setAnimatedMessage] = useState("");
  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsTyping(true);

    setTimeout(() => {
      let botResponse = input.toLowerCase().includes("out of the box")
        ? "Sorry, I am not allowed to answer out of the box."
        : "Hello, how can I help you today?";

      if (!botResponse) {
        botResponse = "I'm sorry, I didn't quite catch that.";
      }

      setIsTyping(false);
      animateBotMessage(botResponse);
    }, 2000);
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
    }, 200);
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

  return (
    <>
      {/* ChatBot Trigger Icon */}
      <div
        className="fixed bottom-8 right-8 w-14 h-14 flex items-center justify-center rounded-full shadow-lg bg-blue-600 cursor-pointer hover:bg-blue-700 z-[9999]"
        onClick={() => setIsOpen(true)}
      >
        <i className="fas fa-robot text-2xl text-white"></i>
      </div>

      {/* ChatBot Box */}
      {isOpen && (
        <div
          className={`fixed bottom-[6rem] right-8 w-80 max-w-full h-[400px] bg-white rounded-lg shadow-lg flex flex-col z-[99999] ${theme.mainTheme} ${theme.colorBorder}`}
          ref={chatBoxRef}
        >
          {/* ChatBot Header */}
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{
              borderBottomColor: theme.colorBorder,
              backgroundColor: theme.mainTheme,
            }}
          >
            <div className="flex items-center space-x-2">
              <i
                className="fas fa-robot text-2xl"
                style={{ color: theme.colorText }}
              ></i>
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: theme.colorText }}
                >
                  VT-AI ChatBot
                </h3>
                <p className="text-sm text-green-400">Online</p>
              </div>
            </div>
            <i
              className="fas fa-times cursor-pointer text-xl"
              style={{ color: theme.colorText }}
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
                      : `${theme.colorBorder} ${theme.mainTheme}`
                  }`}
                  style={{ color: theme.colorText }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="p-3 rounded-lg flex items-center"
                  style={{
                    backgroundColor: theme.colorBorder,
                  }}
                >
                  <SyncLoader size={8} speedMultiplier={0.5} color="white" />
                </div>
              </div>
            )}
            {animatedMessage && (
              <div className="flex justify-start">
                <div
                  className={`p-3 rounded-lg`}
                  style={{
                    backgroundColor: theme.colorBorder,
                    color: theme.colorText,
                  }}
                >
                  {animatedMessage}
                </div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input Box */}
          <div className="flex items-center p-3 border-t">
            <input
              type="text"
              className="flex-1 p-2 rounded-lg bg-gray-100 outline-none text-gray-700"
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
        </div>
      )}
    </>
  );
};

export default ChatBot;
