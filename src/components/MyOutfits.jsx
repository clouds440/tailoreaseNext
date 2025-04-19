"use client";
import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import UserContext from "@/utils/UserContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";
import ClipLoader from "react-spinners/ClipLoader";

const dummyThumbnail = "/images/assets/dummy-outfit.png";

const MyOutfits = () => {
  const { theme, userData } = useContext(UserContext);
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOutfits = async () => {
      if (!userData?.uid) return;

      try {
        setIsLoading(true);
        const q = query(
          collection(db, "myOutfits"),
          where("userId", "==", userData.uid)
        );
        const querySnapshot = await getDocs(q);

        const fetchedOutfits = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOutfits(fetchedOutfits);
      } catch (err) {
        console.error("Error fetching outfits:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOutfits();
  }, [userData?.uid]);

  return (
    <div className={`p-4 ${theme?.text}`}>
      <h3 className="text-3xl font-bold text-center mb-6">
        My Customized Outfits
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <ClipLoader color="#fff" size={45} />
        </div>
      ) : outfits.length === 0 ? (
        <p className="text-sm text-center">
          No outfits yet. Start by visiting{" "}
          <a href="/market" className="text-blue-600 font-bold">
            Market
          </a>{" "}
          and selecting an outfit
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {outfits.map((outfit, index) => {
            const textures = Object.values(outfit.texture || {});
            const outfitName = outfit.outfitNames || "Unnamed Outfit";

            return (
              <motion.a
                key={index}
                href={`${outfit.link}${outfit.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.25,
                  ease: "easeOut",
                }}
                whileHover={{ scale: 1.03 }}
                className={`relative rounded-lg overflow-hidden border shadow-md cursor-pointer ${theme?.colorBg}`}
                style={{
                  height: "16rem",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {(textures.length > 0 ? textures : [dummyThumbnail]).map(
                  (imgUrl, i) => (
                    <div
                      key={i}
                      className="relative"
                      style={{ flex: 1, width: "100%" }}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Texture ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        priority={i === 0}
                      />
                    </div>
                  )
                )}
                <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-sm px-2 py-1 text-center truncate z-10">
                  {outfitName}
                </div>
              </motion.a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOutfits;
