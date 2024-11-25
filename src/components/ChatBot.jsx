"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SyncLoader } from "react-spinners";
import UserContext from "@/utils/UserContext";
import { ShiftingBounceLoader } from "./LoadingSpinner";

const ChatBot = () => {
  const { theme } = useContext(UserContext);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [animatedMessage, setAnimatedMessage] = useState("");
  const chatBoxRef = useRef(null);
  const messagesEndRef = useRef(null);

  const websiteContent = `TailorEase Documentation:
Theme:
In the user settings, you can choose from multiple themes according to your choice. The themes include:
•	Midnight Whisper: A dark gray theme.
•	Lunar Glow: A basic, vibrant white theme.
•	Ocean Haze: A blue theme.
User Registration
To register, visit TailorEase Signup. Fill the registration form by providing a valid email and choosing a password at least 6 characters long. Registering a new account takes a maximum of 60 seconds.
Opening Business Account/Becoming a Tailor
To open a business account, visit Become a Tailor. Fill the form(s) by providing details about your business and selecting your specialties (e.g., Men's Specialist, Kids' Specialist). After submitting the application, you'll receive a confirmation email. Your business account will be pending until you confirm your email.
Business Dashboard
Your business dashboard contains details about your business. You can:
•	Add products.
•	Provide customization options.
•	List pricing, delivery charges/times, return policies.
•	Add business description, FAQ, etc.
General/About Us/What is TailorEase:
"Our platform is designed to revolutionize the tailoring experience, making it more user-friendly, efficient, and innovative for both customers and tailors."
We understand the challenges people face with traditional tailoring, such as:
•	Struggling to find skilled tailors.
•	Difficulty visualizing how clothing will look.
•	Limited knowledge about fabrics and options.
•	The inconvenience of trying on garments multiple times.
•	Inaccurate measurements leading to dissatisfaction.
•	The need for repeated visits to the tailor.
•	Inefficient communication throughout the process.
How We Solve These Problems:
Our platform offers a modern solution by creating a seamless online tailoring experience. With advanced tools and features, we aim to reshape the tailoring industry while meeting the changing needs of today's customers.
What You’ll Gain as a Customer
We’re here to make your tailoring journey hassle-free and more enjoyable by offering:
•	Unmatched Convenience: Save time and effort with our streamlined online platform.
•	Personalized Service: Get tailored recommendations and services that suit your style and preferences.
•	Minimized Fitting Concerns: Accurate measurements and visualization tools mean fewer worries about fit.
•	Enhanced Transparency: Track every step of the process, from fabric selection to final delivery.
•	Valuable Feedback Channels: Share your input and see it make a difference in improving your experience.
How Tailors Benefit
For tailors, our platform provides:
•	Increased Efficiency: Manage orders, measurements, and customer preferences more effectively.
•	Greater Visibility: Expand your reach and connect with more customers than ever before.
Authentication/Account Security
Your account is secured using the highest security measures provided by Firebase Google. Your user data is NOT public, except the information required for general identity on our platform.
Market/Products/Outfits
In the market section, you can find products, outfits, and services provided by different tailors. You can choose an outfit design from the list and start customizing it.
Customization/3D Model Customization
After selecting a model/outfit, you can start customizing it to your preferred styling. You can customize:
•	Size
•	Color
•	Texture
•	Button style and color
•	Collar shape and design
•	Sleeves shape and design
•	Any additional custom designs
You will be able to view a virtual 3D try-on to visualize how the customized outfit will look and feel in real life.
Virtual Try-on/Virtual Try-room
You can view customized outfits in a virtual 3D try-room. The virtual try-room is based on the customizations, sizes, and preferences provided by the user. It provides a near real-life look and feel of the customized outfit/model, helping customers and tailors ensure the final product meets expectations.
Contact Us/Contact Information
If you need personal assistance, try contacting us using one of the following means:
•	Email: support@tailorease.com
•	WhatsApp: +92 (310) 8646268
•	Address: 3rd Floor, Ufone Tower, Office No. 248, Islamabad, Pakistan
Tailors/Businesses/Who are Tailors?
Tailors are registered business accounts on the TailorEase platform. They provide users with services, customization options, etc. Users can access information about tailors, their store policies, return policies, pricing, address, work hours, delivery charges/timing, etc. For more information, visit Tailors.
Tailor Ratings/Reviews
Users can rate tailors based on their experience, helping build trust and accountability. To earn high ratings (1 to 5 stars), tailors need to focus on creating a customer-friendly environment and delivering top-notch services.
Sentiment Analysis/Top Rated Tailors/How to Find the Best Tailor?
On the TailorEase platform, we use sentiment analysis to evaluate customer reviews and identify the top-rated tailors. This trusted system ensures you can easily find the best tailor to meet your specific needs, based on real feedback from other customers.
How Can I Find Tailors Who Provide Services I Need?
Applying Filters/Searching for a Tailor
On the TailorEase platform, you can easily search for tailors who meet your specific needs by using our filtering options. These filters let you narrow down your search based on criteria like:
•	Specializations: Men's or Kid's tailoring experts.
•	Open/Close Timing: Find tailors available at your preferred time.
•	Location: Locate tailors near you.
•	Pricing: Choose tailors that fit your budget.
•	Products Offered: Check what garments or services they provide.
•	Customization Options: See if they offer the specific customizations you need.
How to Change Information of My Business?
Business Settings:
Changing Business Details:
To update your business details or preferences, visit Business Settings. This is where you can easily manage and change your business information to keep it up to date.
What Happens if I'm Not Satisfied with the Tailoring Service?
If you're not satisfied with a service, you can leave a detailed review and rate the tailor accordingly. Additionally, our platform's support team is here to assist with disputes or unresolved issues, ensuring a fair and transparent process.
How Do I Leave a Review for a Tailor I Worked With?
To leave a review, go to the "Order History" section of your account, find the completed order, and click on the "Leave Review" button. You can rate the tailor from 1 to 5 stars and share your feedback about the experience.
Are There Any Fees for Tailors to Join TailorEase?
Yes, tailors may be required to pay a subscription fee or commission for using the TailorEase platform. For details on pricing and plans, please visit Business Pricing.
How Can I Track the Progress of My Order?
You can track your order directly through the TailorEase platform. Simply log in to your account, go to the "Orders" section, and view real-time updates on the status of your tailoring request.
Can I Reschedule or Cancel an Order After Placing It?
Yes, you can reschedule or cancel an order through your account. Simply navigate to the "Orders" section, select the order you want to modify, and choose the reschedule or cancel option. Keep in mind that cancellation policies may vary depending on the tailor.

`;

  const generateResponse = async (userInput) => {
    const apiKey = "AIzaSyD7GNyhfLL0sHivNLaJbLHjmA9FNc_ltMw";
    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

    const payload = {
      contents: [
        {
          parts: [
            {
              text:
                "You're an AI assistant for a website called TailorEase. Please use the following content of the website so you can answer user questions accordingly. And DONOT respond anything outside the scope of this information. Content:" +
                websiteContent +
                "The user says: " +
                userInput,
            },
          ],
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
