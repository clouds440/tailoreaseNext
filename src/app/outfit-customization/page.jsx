"use client";
import { useContext, useState } from "react";
import { useSearchParams } from "next/navigation";
import UserContext from "@/utils/UserContext";
import CustomizationScene from "@/components/3d components/CustomizationScene";

const outfitCategories = {
  jacket: "torso",
  shirt: "torso",
  jeans: "legs",
  // Add more outfits and their categories here
};

const OutfitCustomization = () => {
  const { theme } = useContext(UserContext);
  const searchParams = useSearchParams();

  // Get outfit(s) from URL and convert them into an array
  const outfitTypes = searchParams.get("outfit")?.split(",") || [];

  const uniqueOutfits = [];
  const usedCategories = new Set();

  outfitTypes.forEach((outfit) => {
    const category = outfitCategories[outfit];
    if (category && !usedCategories.has(category)) {
      uniqueOutfits.push(outfit);
      usedCategories.add(category);
    }
  });

  const [morphTargets, setMorphTargets] = useState({});
  const [morphValues, setMorphValues] = useState({});

  const handleMorphChange = (outfit, index, value) => {
    setMorphValues((prev) => ({
      ...prev,
      [outfit]:
        prev[outfit]?.map((val, i) => (i === index ? value : val)) || [],
    }));
  };

  return (
    <div
      className={`max-w-[99.5%] mx-auto items-center p-6 my-4 md:my-1 rounded-lg h-screen overflow-hidden select-none justify-center flex ${theme.mainTheme}`}
    >
      {/* Morph sliders for each outfit */}
      <div className="absolute top-5 left-5 bg-white p-4 shadow-lg rounded-lg z-10">
        {Object.keys(morphTargets).map((outfit) => (
          <div key={outfit} className="mb-6">
            {" "}
            {/* Added margin-bottom to separate outfits */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {outfit.toUpperCase()}
            </h3>
            {morphTargets[outfit]?.map((target, index) => (
              <div key={`${outfit}-${index}`} className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  {target}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={morphValues[outfit]?.[index] || 0}
                  onChange={(e) =>
                    handleMorphChange(outfit, index, parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500 
             [&::-webkit-slider-thumb]:appearance-none 
             [&::-webkit-slider-thumb]:w-4 
             [&::-webkit-slider-thumb]:h-4 
             [&::-webkit-slider-thumb]:bg-blue-500 
             [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pass multiple outfits to Scene */}
      <CustomizationScene
        outfitTypes={uniqueOutfits} // Send multiple outfits
        morphValues={morphValues}
        setMorphValues={setMorphValues}
        setMorphTargets={setMorphTargets}
      />
    </div>
  );
};

export default OutfitCustomization;
