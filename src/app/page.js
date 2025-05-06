"use client";
import React, { useContext } from "react";
import { motion } from "framer-motion";
import UserContext from "@/utils/UserContext";
import Logo from "@/components/Logo";
import SimpleButton from "@/components/SimpleButton";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { theme, inputStyles, placeHolderStyles } = useContext(UserContext);
  const year = new Date().getFullYear();

  const socialLinks = {
    facebook: "https://www.facebook.com/profile.php?id=61575302895431",
    linkedin: "https://www.linkedin.com/company/107202971",
    youtube: "https://youtube.com/@tailoreaseplatform?si=pXMDwaLdXmXtQkri",
    twitter: "#",
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const features = [
    {
      title: "Tailor/Customer Focus",
      description:
        "Personalized experiences tailored to meet unique needs of both tailors and customers.",
      icon: "user-tie",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      link: "/tailors",
    },
    {
      title: "24/7 AI Chatbot Support",
      description:
        "Get assistance anytime with our advanced AI chatbot, always ready to help.",
      icon: "robot",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      link: "",
    },
    {
      title: "Customizable Products",
      description:
        "Choose from wide designs and customize products to suit your style.",
      icon: "palette",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      link: "/market",
    },
    {
      title: "Free Virtual Try-On",
      description: "Experience realistic virtual try-on for your convenience.",
      icon: "vr-cardboard",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      link: "/outfit-customization?outfit=jacket,pants",
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section */}
      <div className={`relative overflow-hidden ${theme.mainTheme}`}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-600/10 to-pink-500/10 animate-gradient-shift"></div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="space-y-8"
            >
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
              >
                Revolutionizing <br /> Tailoring Experience
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl md:text-2xl text-gray-700 dark:text-gray-300"
              >
                Where AI meets craftsmanship to deliver perfect fits every time
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/market">
                  <SimpleButton
                    btnText={
                      <div className="flex items-center">
                        Explore Marketplace{" "}
                        <i className="fas fa-arrow-right ml-3 transition-transform group-hover:translate-x-1"></i>
                      </div>
                    }
                    extraclasses="px-8 py-4 text-lg group"
                  />
                </Link>
                <Link href="/tailors">
                  <SimpleButton
                    btnText={
                      <div className="flex items-center">
                        Find Tailors{" "}
                        <i className="fas fa-user-tie ml-3 transition-transform group-hover:translate-x-1"></i>
                      </div>
                    }
                    extraclasses="px-8 py-4 text-lg bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600/10 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20 group"
                  />
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-6 pt-4"
              >
                <div className="flex items-center">
                  <i className="fas fa-users text-blue-500 text-xl mr-2"></i>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    500+ Happy Customers
                  </span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 text-xl mr-2"></i>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    97% Satisfaction Rate
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - 3D Model Showcase */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="relative"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Main product showcase */}
                <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-blue-500/20 to-purple-600/20 shadow-2xl backdrop-blur-sm border border-white/10"></div>
                <div className="absolute inset-8 rounded-3xl overflow-hidden border-8 border-white/20 shadow-xl">
                  <Image
                    src="/images/assets/hero-model.png"
                    alt="TailorEase Platform"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Floating 3D try-on badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-white dark:bg-gray-800 shadow-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  whileHover={{ y: -5 }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/assets/3d-tryon.png"
                      alt="3D Try-On"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-2">
                      <span className="text-xs font-medium bg-black/70 text-white px-2 py-1 rounded-full">
                        <i className="fas fa-vr-cardboard mr-1"></i> Try It!
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Satisfaction badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border border-gray-200 dark:border-gray-700"
                  whileHover={{ rotate: 5 }}
                >
                  <div className="text-center p-4">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      97%
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      <i className="fas fa-thumbs-up mr-1"></i> Satisfaction
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <section
        className={` ${theme.mainTheme} py-20 px-6 bg-gradient-to-b from-white/50 to-blue-50/50 dark:from-gray-900/50 dark:to-gray-800/50`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose TailorEase
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The perfect blend of technology and traditional craftsmanship
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`${theme.colorBg} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 group`}
                whileHover={{ y: -10 }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.iconColor} flex items-center justify-center mb-6 text-2xl group-hover:rotate-6 transition-transform`}
                >
                  <i className={`fas fa-${feature.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={feature.link}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                  >
                    Learn more{" "}
                    <i className="fas fa-arrow-right ml-2 text-xs"></i>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: "500+", label: "Happy Customers", icon: "users" },
              { value: "97%", label: "Satisfaction Rate", icon: "thumbs-up" },
              { value: "50+", label: "Expert Tailors", icon: "user-tie" },
              { value: "24/7", label: "Support Available", icon: "headset" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className={`p-6 rounded-2xl ${
                  index % 2 === 0
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "bg-purple-50 dark:bg-purple-900/20"
                } text-center`}
              >
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300 flex items-center justify-center">
                  <i className={`fas fa-${stat.icon} mr-2 text-blue-500`}></i>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        {/* Floating elements */}
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Ready to Transform Your Tailoring Experience?
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl mb-8"
          >
            Join thousands of satisfied customers and tailors who are already
            revolutionizing their craft with TailorEase.
          </motion.p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/market">
              <SimpleButton
                btnText={
                  <div className="flex items-center justify-center group-hover:text-blue-600">
                    Explore Marketplace{" "}
                    <i className="fas fa-store ml-3 transition-transform group-hover:translate-x-1"></i>
                  </div>
                }
                extraclasses="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100 group"
              />
            </Link>
            <Link href="/tailors">
              <SimpleButton
                btnText={
                  <div className="flex items-center justify-center">
                    Find Tailors{" "}
                    <i className="fas fa-user-tie ml-3 transition-transform group-hover:translate-x-1"></i>
                  </div>
                }
                extraclasses="px-8 py-4 text-lg bg-transparent border-2 border-white text-white hover:bg-white/10 group"
              />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${theme.mainTheme} py-16 px-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo + About */}
            <div className="space-y-6">
              <Logo />
              <p className={`${theme.subTextColor}`}>
                Revolutionizing the tailoring industry with cutting-edge
                technology and personalized experiences.
              </p>
              <div className="flex gap-4">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <motion.a
                    key={platform}
                    whileHover={{ y: -5 }}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition duration-300 shadow-md"
                  >
                    <i className={`fab fa-${platform}`}></i>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className={`text-xl font-bold mb-6 ${theme.colorText}`}>
                Quick Links
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "/about-us", text: "About Us", icon: "info-circle" },
                  { href: "/contact-us", text: "Contact Us", icon: "envelope" },
                  { href: "/market", text: "Marketplace", icon: "store" },
                  { href: "/tailors", text: "Find Tailors", icon: "user-tie" },
                  {
                    href: "/privacy",
                    text: "Privacy Policy",
                    icon: "shield-alt",
                  },
                ].map(({ href, text, icon }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className={`${theme.hoverText} hover:underline flex items-center transition-colors`}
                    >
                      <i
                        className={`fas fa-${icon} text-xs mr-3 opacity-70`}
                      ></i>
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className={`text-xl font-bold mb-6 ${theme.colorText}`}>
                Contact Us
              </h3>
              <ul className={`${theme.subTextColor} space-y-4`}>
                <li className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 mt-1">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <a
                    href="mailto:support@tailorease.com"
                    className="hover:underline"
                  >
                    support@tailorease.com
                  </a>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mr-3 mt-1">
                    <i className="fab fa-whatsapp"></i>
                  </div>
                  <a
                    href="https://wa.me/923108646268"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    +92 (310) 8646268
                  </a>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mr-3 mt-1">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <span>3rd Floor, Ufone Tower, Islamabad</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className={`text-xl font-bold mb-6 ${theme.colorText}`}>
                Newsletter
              </h3>
              <p className={`${theme.subTextColor} mb-4`}>
                Subscribe to our newsletter for the latest updates and offers.
              </p>
              <form className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    id="newsletter-email"
                    className={`${inputStyles}`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="newsletter-email"
                    className={`${placeHolderStyles}`}
                  >
                    Your Email
                  </label>
                </div>
                <SimpleButton
                  btnText={
                    <div className="flex items-center justify-center">
                      Subscribe <i className="fas fa-paper-plane ml-2"></i>
                    </div>
                  }
                  extraclasses="w-full py-3"
                  type="primary"
                />
              </form>
            </div>
          </div>

          <div
            className={`border-t ${theme.colorBorder} mt-12 pt-6 text-center ${theme.subTextColor}`}
          >
            © {year} TailorEase. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
