"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SyncLoader } from "react-spinners";
import UserContext from "@/utils/UserContext";
import { ShiftingBounceLoader } from "./LoadingSpinner";
import { marked } from "marked";
import { Filter } from "bad-words";
import { db } from "@/utils/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

const ChatBot = () => {
  const { theme, userData, userLoggedIn } = useContext(UserContext);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi, how can I help you with your TailorEase experience today!?",
      sender: "model",
      isHTML: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [botQuery, setBotQuery] = useState(false);

  const { GoogleGenerativeAI } = require("@google/generative-ai");

  // Initialize the Generative AI Client
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: !botQuery
      ? `You're an AI assistant for the website TailorEase.
      If the user is inquiring about a query which requires fetching data from the database (e.g., orders) then respond only with "true". The system will take this in string format and work with it. Don't ask the user for further information unless the user is not logged in. The user's current log-in status is ${userLoggedIn}.
      If the user's log in status is "false" then ask the user to log in first.

    Otherwise, here's the training data for TailorEase:
    Theme: In the user settings, you can choose from multiple themes according to your choice. The themes include:
    •\tMidnight Whisper: A dark gray theme.
    •\tLunar Glow: A basic, vibrant white theme.
    •\tNeon Punk: A flashy neon theme.
    User Registration:
    To register, visit TailorEase Signup. Fill the registration form by providing a valid email and choosing a password at least 6 characters long. Registering a new account takes a maximum of 60 seconds.
    Opening Business Account/Becoming a Tailor:
    To open a business account, visit Become a Tailor. Fill the form(s) by providing details about your business and selecting your specialties (e.g., Men's Specialist, Kids' Specialist). After submitting the application, you'll receive a confirmation email. Your business account will be pending until you confirm your email.
    Business Dashboard:
    Your business dashboard contains details about your business. You can:
    •\tAdd products.
    •\tProvide customization options.
    •\tList pricing, delivery charges/times, return policies.
    •\tAdd business description, FAQ, etc.
    General/About Us/What is TailorEase:
    Our platform is designed to revolutionize the tailoring experience, making it more user-friendly, efficient, and innovative for both customers and tailors.
    We understand the challenges people face with traditional tailoring, such as:
    •\tStruggling to find skilled tailors.
    •\tDifficulty visualizing how clothing will look.
    •\tLimited knowledge about fabrics and options.
    •\tThe inconvenience of trying on garments multiple times.
    •\tInaccurate measurements leading to dissatisfaction.
    •\tThe need for repeated visits to the tailor.
    •\tInefficient communication throughout the process.
    How We Solve These Problems:
    Our platform offers a modern solution by creating a seamless online tailoring experience. With advanced tools and features, we aim to reshape the tailoring industry while meeting the changing needs of today's customers.
    What You’ll Gain as a Customer:
    We’re here to make your tailoring journey hassle-free and more enjoyable by offering:
    •\tUnmatched Convenience: Save time and effort with our streamlined online platform.
    •\tPersonalized Service: Get tailored recommendations and services that suit your style and preferences.
    •\tMinimized Fitting Concerns: Accurate measurements and visualization tools mean fewer worries about fit.
    •\tEnhanced Transparency: Track every step of the process, from fabric selection to final delivery.
    •\tValuable Feedback Channels: Share your input and see it make a difference in improving your experience.
    How Tailors Benefit:
    For tailors, our platform provides:
    •\tIncreased Efficiency: Manage orders, measurements, and customer preferences more effectively.
    •\tGreater Visibility: Expand your reach and connect with more customers than ever before.
    Authentication/Account Security:
    Your account is secured using the highest security measures provided by Firebase Google. Your user data is NOT public, except the information required for general identity on our platform.
    Market/Products/Outfits:
    In the market section, you can find products, outfits, and services provided by different tailors. You can choose an outfit design from the list and start customizing it.
    Outfit Customization:
    After selecting an outfit from the market which supports 3D viewing feature, you can start customizing it to your preferred styling. You can customize:
    •\tSize
    •\tColor
    •\tTexture
    •\tButton style and color
    •\tCollar shape and design
    •\tSleeves shape and design
    •\tAny additional custom designs.
    You will be able to view a virtual 3D try-on to visualize how the customized outfit will look and feel in real life.
    It provides a near real-life look and feel of the customized outfit, helping customers and tailors ensure the final product meets expectations.
    Contact Us/Contact Information:
    If you need personal assistance, try contacting us using one of the following means:
    •\tEmail: support@tailorease.com
    •\tWhatsApp: +92 (310) 8646268
    •\tAddress: 3rd Floor, Ufone Tower, Office No. 248, Islamabad, Pakistan.
    Tailors/Businesses/Who are Tailors?:
    Tailors are registered business accounts on the TailorEase platform. They provide users with services, customization options, etc. Users can access information about tailors, their store policies, return policies, pricing, address, work hours, delivery charges/timing, etc. For more information, visit Tailors section.
    Tailor Ratings/Reviews: Users can rate tailors based on their experience, helping build trust and accountability. To earn high ratings (1 to 5 stars), tailors need to focus on creating a customer-friendly environment and delivering top-notch services.
    Sentiment Analysis/Top Rated Tailors/How to Find the Best Tailor?:
    On the TailorEase platform, we use sentiment analysis to evaluate customer reviews and identify the top-rated tailors. This trusted system ensures you can easily find the best tailor to meet your specific needs, based on real feedback from other customers.
    How Can I Find Tailors Who Provide Services I Need?:
    Applying Filters/Searching for a Tailor On the TailorEase platform, you can easily search for tailors who meet your specific needs by using our filtering options. These filters let you narrow down your search based on criteria like:
    •\tSpecializations: Men's or Kid's tailoring experts.
    •\tOpen/Close Timing: Find tailors available at your preferred time.
    •\tLocation: Locate tailors near you.
    •\tPricing: Choose tailors that fit your budget.
    •\tProducts Offered: Check what garments or services they provide.
    •\tCustomization Options: See if they offer the specific customizations you need.
    Changing Business Details:\nTo update your business details or preferences, visit Business Settings. This is where you can easily manage and change your business information to keep it up to date.
    What Happens if I'm Not Satisfied with the Tailoring Service?:
    If you're not satisfied with a service, you can leave a detailed review and rate the tailor accordingly. Additionally, our platform's support team is here to assist with disputes or unresolved issues, ensuring a fair and transparent process.
    How Do I Leave a Review for a Tailor I Worked With?:
    To leave a review, go to the \"My Orders\" section of your account, find the completed order, and click on the \"Leave Review\" button. You can rate the tailor from 1 to 5 stars and share your feedback about the experience.
    Are There Any Fees for Tailors to Join TailorEase?:
    Yes, tailors may be required to pay a subscription fee or commission for using the TailorEase platform. For details on pricing and plans, please visit Business Pricing.
    Can I Reschedule or Cancel an Order After Placing It?:
    Yes, you can reschedule or cancel an order through your account. Simply navigate to \"My Orders\" section, select the order you want to modify, and choose the reschedule or cancel option. Keep in mind that cancellation policies may vary depending on the tailor.
    What should I do if my user account is disabled?:
    If you’re unable to log into your user account with a notification that says “account disabled”, it maybe because of a violation of our terms and conditions for users. If your user account is disabled, and you had a business account associated to your account, then your business account will also be suspended until you resolve the issue. You can try contacting our customer support. The customer support information is provided in the “Contact Us” section of this document.
    Or you can check for an email to know the reason why your account is disabled/blocked. Follow the instructions in the email to apply an appeal for re-enabling your account.
    What should I do if my business account is disabled?:
    We only suspend a business account which is in direct violation of our Terms and Conditions for Tailors. Please check your email for the exact reason why your account was suspended. And following the instructions in the email to try and re-enable your business account. While your business account is suspended, your business portfolio will not be shown to users. But don’t worry, all of your information is still secure and saved with us. You can continue using your business account as before once the suspension issue is resolved.
    WARNING: If you reply to anything outside the scope of the provided information, you will be in direct violation of both TailorEase and Google Policies.`
      : "The user has asked for infromation that needed to be fetcehd from the database. Here is the data fetcehed from the database. Summarize the information in the following stringified object for the user in natural language.",
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

  const [isHistoryFetched, setIsHistoryFetched] = useState(false);

  // Load chat history if available for the logged-in user
  useEffect(() => {
    if (userLoggedIn && userData?.uid) {
      const savedChatHistory = localStorage.getItem(
        `chatHistory.${userData.uid}`
      );
      if (savedChatHistory) {
        setMessages(JSON.parse(savedChatHistory)); // Set chat history if found
      }
      setIsHistoryFetched(true); // Mark history as fetched
    } else {
      setIsHistoryFetched(true); // Even if no user is logged in, mark history as fetched
    }
    if (!userLoggedIn) {
      setMessages([
        {
          text: "Hi, how can I help you with your TailorEase experience today!?",
          sender: "model",
          isHTML: true,
        },
      ]);
    }
  }, [userLoggedIn, userData?.uid]); // This runs when login status or userData changes

  // Save chat history to localStorage only after history is fetched and messages state is updated
  useEffect(() => {
    if (userLoggedIn && userData?.uid && isHistoryFetched) {
      // Only save messages to localStorage once history has been fetched
      localStorage.setItem(
        `chatHistory.${userData.uid}`,
        JSON.stringify(messages)
      );
    }
  }, [messages, userLoggedIn, userData?.uid, isHistoryFetched]);

  const handleSendMessage = async (querySnapshot) => {
    if (!input.trim() && !querySnapshot) {
      return;
    }

    if (detector.isProfane(input)) {
      const systemMessage = {
        text: "Warning! Your message contains explicit language. Refrain from this behavior or you'll be suspended",
        sender: "system",
      };
      setMessages((prev) => [...prev, systemMessage]);
      setInput("");
      return;
    }

    if (input.trim()) {
      const userMessage = { text: input, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
    }

    setIsTyping(true);
    const botResponse = await generateResponse(
      querySnapshot ? querySnapshot : input
    );
    setIsTyping(false);
    if (botResponse.includes("true")) {
      setBotQuery(true);
      return;
    }
    setBotQuery(false);
    const formattedText = marked.parse(botResponse);
    setMessages((prev) => [
      ...prev,
      { text: formattedText, sender: "model", isHTML: true },
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

  useEffect(() => {
    const fetchData = async () => {
      if (!botQuery) return;
      if (!userLoggedIn) {
        handleSendMessage(
          "The user is not logged in, inform the user to log in to see your orders"
        );
        return;
      }

      try {
        const botMessage = {
          text: "Please wait while we fetch that information for you...",
          sender: "model",
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(true);

        const ordersCollection = collection(db, "OrdersManagement");
        const ordersQuery = query(
          ordersCollection,
          where("userId", "==", userData?.uid)
        );
        const querySnapshot = await getDocs(ordersQuery);

        if (!querySnapshot.empty) {
          const ordersDoc = querySnapshot.docs[0];
          const data = ordersDoc.data();
          const docId = ordersDoc.id;
          const payload = {
            orderData: data,
            orderId: docId,
          };

          handleSendMessage(JSON.stringify(payload));
        } else {
          handleSendMessage("querySnapshot was empty, infrom the user");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        handleSendMessage("Something went wrong while fetching your order.");
      } finally {
        setIsTyping(false);
      }
    };
    fetchData();
  }, [botQuery, userData?.uid]);

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
        className={`fixed bottom-2 sm:bottom-8 right-2 sm:right-8 w-12 h-12 flex items-center justify-center rounded-full border-2 shadow-lg cursor-pointer hover:scale-105 z-[9999] ${theme.mainTheme} ${theme.hoverBg}`}
        onClick={() => setIsOpen(true)}
      >
        {isOpen ? (
          <ShiftingBounceLoader size={42} /> // sort of a thinking animation when the chatbox is open
        ) : (
          <i className={`fas fa-robot text-2xl ${theme.iconColor}`}></i>
        )}
      </div>

      {/* ChatBot Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed bottom-[6rem] right-2 sm:right-8 max-w-full w-[280px] h-[450px] sm:w-[400px] sm:h-[75%] bg-white rounded-lg shadow-lg flex flex-col z-[99999] ${theme.mainTheme} ${theme.colorBorder}`}
            ref={chatBoxRef}
            variants={chatBoxVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* ChatBot Header */}
            <div
              className={`flex items-center justify-between p-4 border-b select-none ${theme.colorBorder}`}
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
                    msg.sender === "model" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg text-white animated-message ${
                      msg.sender === "user"
                        ? "bg-blue-600"
                        : msg.sender === "model"
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
