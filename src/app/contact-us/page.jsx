"use client";

import React, { useState, useContext } from "react";
import UserContext from "@/utils/UserContext";
import SimpleButton from "@/components/SimpleButton";
import LoadingSpinner from "@/components/LoadingSpinner";

const ContactUs = () => {
  const { theme, setShowMessage, setPopUpMessageTrigger, userData } =
    useContext(UserContext);
  const [formData, setFormData] = useState({
    name: userData?.fullName ? userData.fullName : "",
    email: userData?.email ? userData.email : "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { inputStyles, placeHolderStyles } = useContext(UserContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setShowMessage({ type: "warning", message: "Please enter your name" });
      setPopUpMessageTrigger(true);
      return;
    }
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setShowMessage({
        type: "warning",
        message: "Provide a valid email",
      });
      setPopUpMessageTrigger(true);
      return;
    }
    if (!formData.message.trim()) {
      setShowMessage({
        type: "warning",
        message: "Please write a message",
      });
      setPopUpMessageTrigger(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setTimeout(() => {
        setShowMessage({
          type: "success",
          message: "Message sent successfully!",
        });
        setPopUpMessageTrigger(true);
        console.log(formData);
        setFormData({ name: "", email: "", message: "" });
      }, 1000);
    } catch (error) {
      setShowMessage({
        type: "danger",
        message: "Failed to send the message.",
      });
      setPopUpMessageTrigger(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-[85%] h-[80%] flex-grow mx-auto mt-8 rounded-xl border border-gray-300">
      <div className="flex flex-col h-full rounded-xl md:flex-row">
        {/* Left Section */}
        <div
          className={`w-full md:w-1/2 p-6 ${theme.mainTheme} flex flex-col items-start justify-center border-b md:border-b-0 md:border-r border-gray-300 rounded-l-xl`}
        >
          <h2 className={`text-3xl text-${theme.themeColor} font-bold mb-4`}>
            Get in Touch
          </h2>
          <p className={`${theme.colorText} mb-6 text-lg`}>
            Have questions or need assistance? Fill out the form, and we’ll get
            back to you as soon as possible. You can also reach us via email or
            phone for immediate support.
          </p>
          <ul className={`${theme.colorText} space-y-3 mb-6`}>
            <li>
              <strong>Email:</strong> support@tailorease.com
            </li>
            <li>
              <strong>WhatsApp:</strong> +92 (310) 8646268
            </li>
            <li>
              <strong>Address:</strong> 3rd Floor, Ufone Tower, Office No. 248,
              Islamabad, Pakistan
            </li>
          </ul>

          {/* Social Media Links */}
          <div className="flex space-x-4 mt-6">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl text-blue-600 hover:text-blue-800"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl text-blue-400 hover:text-blue-600"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl text-pink-600 hover:text-pink-800"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl text-blue-700 hover:text-blue-900"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl text-red-600 hover:text-red-800"
            >
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        {/* Right Section (Form) */}
        <div className={`w-full md:w-1/2 p-6 rounded-r-xl ${theme.mainTheme}`}>
          <h2 className={`text-xl text-${theme.themeColor} font-bold mb-4`}>
            Contact Us
          </h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="relative mb-6">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${inputStyles}`}
                placeholder=" "
              />
              <label className={`${placeHolderStyles}`} htmlFor="name">
                Name
              </label>
            </div>
            <div className="relative mb-6">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${inputStyles}`}
                placeholder=" "
              />
              <label className={`${placeHolderStyles}`} htmlFor="email">
                Email
              </label>
            </div>
            <div className="relative mb-6">
              <textarea
                maxLength={500}
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`${inputStyles} h-36 resize-none`}
                placeholder=" "
              />
              <label className={`${placeHolderStyles}`} htmlFor="message">
                Message
              </label>
            </div>
            <SimpleButton
              btnText={
                isSubmitting ? <LoadingSpinner size={24} /> : "Send Message"
              }
              type="primary-submit"
              extraclasses={"w-full"}
              disabled={isSubmitting}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
