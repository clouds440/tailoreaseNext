// src/app/layout.js
import { useContext } from "react";
import Navbar from "@/components/Navbar"; // Adjust path to Navbar component
import "./globals.css"; // Import global styles
import { UserProvider } from "@/utils/UserContext";
import PopupMessage from "@/components/PopupMessage";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "TailorEase", // Set default title
  description: "AI Enhanced Fitting Experience", // Set default description
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={roboto.className}>
      <body
        className="relative flex h-screen w-screen"
        style={{
          backgroundImage: "url(/background_mages/backgroundDefaultBlue.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <UserProvider>
          <div className={`relative flex h-screen w-screen font-sans`}>
            {/* Navbar with fixed position */}
            <div className="fixed md:relative w-full md:w-36 z-40">
              <Navbar />
            </div>

            {/* Main content with scrollable overflow */}
            <div
              className={`overflow-y-auto flex-1 mt-[85px] md:mt-0 px-[3px]`}
            >
              <PopupMessage />
              {children} {/* Renders each page's content */}
            </div>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
