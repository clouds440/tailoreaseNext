"use client";
import { useContext } from "react";
import { motion } from "framer-motion";
import UserContext from "@/utils/UserContext";
import Image from "next/image";

const AboutUs = () => {
  const { theme } = useContext(UserContext);

  // Framer Motion variants for animation
  const listItemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.2, // Stagger animation for each item
        type: "spring",
        stiffness: 50,
      },
    }),
  };

  return (
    <div
      className={`${theme.mainTheme} mx-4 my-4 min-h-screen py-8 px-4 md:px-16 text-gray-100 rounded-3xl`}
    >
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="leading-7 md:max-w-3xl md:mx-auto text-center">
          Welcome to TailorEase – your one-stop destination for reimagining the
          art of tailoring. We blend tradition with technology to craft an
          experience that’s as unique as you are.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-4 text-center">Our Mission</h2>
        <p className="leading-7 md:max-w-3xl md:mx-auto text-center">
          To transform traditional tailoring by merging advanced tools with
          customer-centric services. TailorEase empowers you to explore,
          customize, and visualize outfits with unmatched ease while giving
          tailors the platform to thrive in a modern, connected world.
        </p>
      </section>

      <div className="mb-16 grid grid-cols-1 lg:grid-cols-3 gap-3 text-center lg:text-start">
        <section className="mb-10 lg:mb-0">
          <h2 className="text-3xl font-semibold mb-4">What We Offer</h2>
          <motion.ul
            initial="hidden"
            animate="visible"
            className="list-disc list-inside space-y-4"
          >
            {[
              "Convenient online tailoring solutions.",
              "Personalized recommendations and services.",
              "Accurate measurements with 3D visualization tools.",
              "Enhanced communication and transparency.",
              "Streamlined processes for tailors and customers alike.",
            ].map((item, index) => (
              <motion.li
                key={index}
                custom={index}
                variants={listItemVariants}
                className="leading-7"
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </section>

        <section className="mb-10 lg:mb-0">
          <h2 className="text-3xl font-semibold mb-4">Our Achievements</h2>
          <motion.ul
            initial="hidden"
            animate="visible"
            className="list-disc list-inside space-y-4"
          >
            {[
              "Over 239,940 satisfied users worldwide.",
              "Connected hundreds of tailors with loyal customers.",
              "95% positive feedback from our user base.",
              "Thousands of customized garments delivered seamlessly.",
              "Recognized as a leading innovator in online tailoring.",
            ].map((item, index) => (
              <motion.li
                key={index}
                custom={index}
                variants={listItemVariants}
                className="leading-7"
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </section>

        <section className="mb-10 lg:mb-0">
          <h2 className="text-3xl font-semibold mb-4">Why Choose Us?</h2>
          <motion.ul
            initial="hidden"
            animate="visible"
            className="list-disc list-inside space-y-4"
          >
            {[
              "Unmatched personal and account security for users and tailors.",
              "Seamless and secure payment methods for a worry-free experience.",
              "A dedicated support team ensuring your satisfaction every step.",
              "Transparent processes with real-time order tracking and updates.",
              "Empowering tailors with efficient tools to manage their businesses.",
            ].map((item, index) => (
              <motion.li
                key={index}
                custom={index}
                variants={listItemVariants}
                className="leading-7"
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </section>
      </div>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-4 text-center">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          <div
            className={`${theme.colorBg} p-6 rounded-lg shadow-lg flex flex-col items-center`}
          >
            <Image
              src="/team_data/zahid.jpg"
              alt="Ahmed Zahid"
              width={96}
              height={96}
              className="rounded-full mb-4"
            />
            <h3 className="text-xl font-bold mb-2">Ahmed Zahid</h3>
            <p className="text-sm italic mb-4">
              &ldquo;Passion drives perfection.&rdquo;
            </p>
            <p className="mb-2">
              <span className="font-semibold">Role:</span> Team Lead / Project
              Manager
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              zahidahmad440@gmail.com
            </p>
          </div>

          {/* Team Member 2 */}
          <div
            className={`${theme.colorBg} p-6 rounded-lg shadow-lg flex flex-col items-center`}
          >
            <Image
              src="/team_data/ali.jpg"
              alt="Syed Ali Abbas Naqvi"
              width={96}
              height={96}
              className="rounded-full mb-4"
            />
            <h3 className="text-xl font-bold mb-2">Syed Ali Abbas Naqvi</h3>
            <p className="mb-2">
              <span className="font-semibold">Role:</span> Co-Founder / Designer
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              dummyemail@domain.com
            </p>
          </div>

          {/* Team Member 3 */}
          <div
            className={`${theme.colorBg} p-6 rounded-lg shadow-lg flex flex-col items-center`}
          >
            <Image
              src="/team_data/abdul_rehman.jpg"
              alt="Abdul Rehman"
              width={96}
              height={96}
              className="rounded-full mb-4"
            />
            <h3 className="text-xl font-bold mb-2">Abdul Rehman</h3>
            <p className="mb-2">
              <span className="font-semibold">Role:</span> Documenter / Internal
              System Designer
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              dummyemail@domain.com
            </p>
          </div>
        </div>
      </section>

      <footer className="text-center mt-12">
        <p className="">
          Want to know more?{" "}
          <a href="/contact-us" className={`text-blue-600 ${theme.hoverText}`}>
            Contact Us
          </a>{" "}
          today!
        </p>
      </footer>
    </div>
  );
};

export default AboutUs;
