"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SyncLoader } from "react-spinners";
import UserContext from "@/utils/UserContext";
import { ShiftingBounceLoader } from "./LoadingSpinner";
import { marked } from "marked";
import { Filter } from "profanity-check";

const ChatBot = () => {
  const { theme } = useContext(UserContext);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi, how can I help you with your TailorEase experience today!?",
      sender: "bot",
      isHTML: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { GoogleGenerativeAI } = require("@google/generative-ai");

  // Initialize the Generative AI Client
  const apiKey = "AIzaSyD7GNyhfLL0sHivNLaJbLHjmA9FNc_ltMw"; // Replace with your API key
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      "You're an AI assistant for the website TailorEase.\nTailorEase Documentation:\nTheme\nIn the user settings, you can choose from multiple themes according to your choice. The themes include:\n•\tMidnight Whisper: A dark gray theme.\n•\tLunar Glow: A basic, vibrant white theme.\n•\tOcean Haze: A blue theme.\nUser Registration\nTo register, visit TailorEase Signup. Fill the registration form by providing a valid email and choosing a password at least 6 characters long. Registering a new account takes a maximum of 60 seconds.\nOpening Business Account/Becoming a Tailor\nTo open a business account, visit Become a Tailor. Fill the form(s) by providing details about your business and selecting your specialties (e.g., Men's Specialist, Kids' Specialist). After submitting the application, you'll receive a confirmation email. Your business account will be pending until you confirm your email.\nBusiness Dashboard\nYour business dashboard contains details about your business. You can:\n•\tAdd products.\n•\tProvide customization options.\n•\tList pricing, delivery charges/times, return policies.\n•\tAdd business description, FAQ, etc.\nGeneral/About Us/What is TailorEase:\n\"Our platform is designed to revolutionize the tailoring experience, making it more user-friendly, efficient, and innovative for both customers and tailors.\"\nWe understand the challenges people face with traditional tailoring, such as:\n•\tStruggling to find skilled tailors.\n•\tDifficulty visualizing how clothing will look.\n•\tLimited knowledge about fabrics and options.\n•\tThe inconvenience of trying on garments multiple times.\n•\tInaccurate measurements leading to dissatisfaction.\n•\tThe need for repeated visits to the tailor.\n•\tInefficient communication throughout the process.\nHow We Solve These Problems:\nOur platform offers a modern solution by creating a seamless online tailoring experience. With advanced tools and features, we aim to reshape the tailoring industry while meeting the changing needs of today's customers.\nWhat You’ll Gain as a Customer\nWe’re here to make your tailoring journey hassle-free and more enjoyable by offering:\n•\tUnmatched Convenience: Save time and effort with our streamlined online platform.\n•\tPersonalized Service: Get tailored recommendations and services that suit your style and preferences.\n•\tMinimized Fitting Concerns: Accurate measurements and visualization tools mean fewer worries about fit.\n•\tEnhanced Transparency: Track every step of the process, from fabric selection to final delivery.\n•\tValuable Feedback Channels: Share your input and see it make a difference in improving your experience.\nHow Tailors Benefit\nFor tailors, our platform provides:\n•\tIncreased Efficiency: Manage orders, measurements, and customer preferences more effectively.\n•\tGreater Visibility: Expand your reach and connect with more customers than ever before.\nAuthentication/Account Security\nYour account is secured using the highest security measures provided by Firebase Google. Your user data is NOT public, except the information required for general identity on our platform.\nMarket/Products/Outfits\nIn the market section, you can find products, outfits, and services provided by different tailors. You can choose an outfit design from the list and start customizing it.\nCustomization/3D Model Customization\nAfter selecting a model/outfit, you can start customizing it to your preferred styling. You can customize:\n•\tSize\n•\tColor\n•\tTexture\n•\tButton style and color\n•\tCollar shape and design\n•\tSleeves shape and design\n•\tAny additional custom designs\nYou will be able to view a virtual 3D try-on to visualize how the customized outfit will look and feel in real life.\nVirtual Try-on/Virtual Try-room\nYou can view customized outfits in a virtual 3D try-room. The virtual try-room is based on the customizations, sizes, and preferences provided by the user. It provides a near real-life look and feel of the customized outfit/model, helping customers and tailors ensure the final product meets expectations.\nContact Us/Contact Information\nIf you need personal assistance, try contacting us using one of the following means:\n•\tEmail: support@tailorease.com\n•\tWhatsApp: +92 (310) 8646268\n•\tAddress: 3rd Floor, Ufone Tower, Office No. 248, Islamabad, Pakistan\nTailors/Businesses/Who are Tailors?\nTailors are registered business accounts on the TailorEase platform. They provide users with services, customization options, etc. Users can access information about tailors, their store policies, return policies, pricing, address, work hours, delivery charges/timing, etc. For more information, visit Tailors.\nTailor Ratings/Reviews\nUsers can rate tailors based on their experience, helping build trust and accountability. To earn high ratings (1 to 5 stars), tailors need to focus on creating a customer-friendly environment and delivering top-notch services.\nSentiment Analysis/Top Rated Tailors/How to Find the Best Tailor?\nOn the TailorEase platform, we use sentiment analysis to evaluate customer reviews and identify the top-rated tailors. This trusted system ensures you can easily find the best tailor to meet your specific needs, based on real feedback from other customers.\nHow Can I Find Tailors Who Provide Services I Need?\nApplying Filters/Searching for a Tailor\nOn the TailorEase platform, you can easily search for tailors who meet your specific needs by using our filtering options. These filters let you narrow down your search based on criteria like:\n•\tSpecializations: Men's or Kid's tailoring experts.\n•\tOpen/Close Timing: Find tailors available at your preferred time.\n•\tLocation: Locate tailors near you.\n•\tPricing: Choose tailors that fit your budget.\n•\tProducts Offered: Check what garments or services they provide.\n•\tCustomization Options: See if they offer the specific customizations you need.\nHow to Change Information of My Business?\nBusiness Settings:\nChanging Business Details:\nTo update your business details or preferences, visit Business Settings. This is where you can easily manage and change your business information to keep it up to date.\nWhat Happens if I'm Not Satisfied with the Tailoring Service?\nIf you're not satisfied with a service, you can leave a detailed review and rate the tailor accordingly. Additionally, our platform's support team is here to assist with disputes or unresolved issues, ensuring a fair and transparent process.\nHow Do I Leave a Review for a Tailor I Worked With?\nTo leave a review, go to the \"Order History\" section of your account, find the completed order, and click on the \"Leave Review\" button. You can rate the tailor from 1 to 5 stars and share your feedback about the experience.\nAre There Any Fees for Tailors to Join TailorEase?\nYes, tailors may be required to pay a subscription fee or commission for using the TailorEase platform. For details on pricing and plans, please visit Business Pricing.\nHow Can I Track the Progress of My Order?\nYou can track your order directly through the TailorEase platform. Simply log in to your account, go to the \"Orders\" section, and view real-time updates on the status of your tailoring request.\nCan I Reschedule or Cancel an Order After Placing It?\nYes, you can reschedule or cancel an order through your account. Simply navigate to the \"Orders\" section, select the order you want to modify, and choose the reschedule or cancel option. Keep in mind that cancellation policies may vary depending on the tailor.\n\nWhat should I do if my user account is disabled?\nIf you’re unable to log into your user account with a notification that says “account disabled”, it maybe because of a violation of our terms and conditions for users. If your user account is disabled, and you had a business account associated to your account, then your business account will also be suspended until you resolve the issue. You can try contacting our customer support. The customer support information is provided in the “Contact Us” section of this document.\nOr you can check for an email to know the reason why your account is disabled/blocked. Follow the instructions in the email to apply an appeal for re-enabling your account.\nWhat should I do if my business account is disabled?\nWe only suspend a business account which is in direct violation of our Terms and Conditions for Tailors. Please check your email for the exact reason why your account was suspended. And following the instructions in the email to try and re-enable your business account. While your business account is suspended, your business portfolio will not be shown to users. But don’t worry, all of your information is still secure and saved with us. You can continue using your business account as before once the suspension issue is resolved.\n\n",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 5500,
    responseMimeType: "text/plain",
  };

  async function generateResponse(userInput) {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [{ text: "Hi" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Hi there! How can I help you with your tailoring needs today?",
            },
          ],
        },
      ], // history is optional. It costs tokens but improves the generated response
    });

    const result = await chatSession.sendMessage(userInput);
    return result.response.text();
  }

  const detector = new Filter();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (detector.isProfane(input)) {
      const systemMessage = {
        text: "Warning! Your message contains explicit language. Refrain from this behavior or you'll be suspended",
        sender: "system",
      };
      setMessages((prev) => [...prev, systemMessage]);
      setInput("");
      return;
    }

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsTyping(true);

    const botResponse = await generateResponse(input);

    setIsTyping(false);
    const formattedText = marked.parse(botResponse);
    setMessages((prev) => [
      ...prev,
      { text: formattedText, sender: "bot", isHTML: true },
    ]);
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
      setTimeout(() => {
        scrollToBottom(); // Scroll when chat opens
      }, 350); // timeout to allow the messagesEndRef to be set before scrolling
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
        className={`fixed bottom-8 right-8 w-14 h-14 flex items-center justify-center rounded-full border-2 shadow-lg cursor-pointer hover:scale-105 z-[9999] ${theme.mainTheme}`}
        onClick={() => setIsOpen(true)}
      >
        {isOpen ? (
          <ShiftingBounceLoader size={47} color="white" /> // sort of a thinking animation when the chatbox is open
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
                    TE-AI ASSISTANT
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
                    msg.sender === "bot" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg text-white animated-message ${
                      msg.sender === "user"
                        ? "bg-blue-600"
                        : msg.sender === "bot"
                        ? `${theme.mainTheme}`
                        : "bg-rose-500 italic"
                    }`}
                  >
                    {msg.isHTML ? (
                      // Render HTML using dangerouslySetInnerHTML
                      <div
                        dangerouslySetInnerHTML={{
                          __html: msg.text,
                        }}
                      />
                    ) : (
                      // Render plain text
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-lg flex items-center">
                    <SyncLoader
                      size={8}
                      speedMultiplier={0.5}
                      color={`${theme.colorText}`}
                    />
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
                autoFocus="true"
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
