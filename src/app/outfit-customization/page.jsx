"use client";
import { useContext, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import UserContext from "@/utils/UserContext";
import CustomizationScene from "@/components/3d components/CustomizationScene";
import { Resizable } from "re-resizable";
import ColorPicker from "@/components/ColorPicker";
import SimpleButton from "@/components/SimpleButton";

const outfitCategories = {
  jacket: "torso",
  pants: "legs",
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
  const [colorValue, setColorValue] = useState(0.5); // Default color brightness
  const [texture, setTexture] = useState({});
  const [color, setColor] = useState({});
  const [selectedOutfit, setSelectedOutfit] = useState(null); // Track the selected outfit for color picker visibility

  const handleMorphChange = (outfit, index, value) => {
    setMorphValues((prev) => ({
      ...prev,
      [outfit]:
        prev[outfit]?.map((val, i) => (i === index ? value : val)) || [],
    }));
  };

  const handleSetMorphTargets = useCallback((targets) => {
    setMorphTargets(targets);
  }, []);

  const handleSetMorphValues = useCallback((values) => {
    setMorphValues(values);
  }, []);

  const handleTextureUpload = (outfit, e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const objectURL = URL.createObjectURL(file); // Convert file to URL
      setTexture((prevTextures) => ({
        ...prevTextures,
        [outfit]: objectURL, // Store texture per outfit
      }));
    }
  };

  const handleColorPickerChange = (outfit, color) => {
    setColor((prevColors) => ({
      ...prevColors,
      [outfit]: color, // Store texture per outfit
    }));
  };

  const [isMobile, setIsMobile] = useState(false);
  const [width, setWidth] = useState(30); // Default width for desktop
  const [height, setHeight] = useState("40vh"); // Default height for mobile

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div
      className={`max-w-[99.5%] mx-auto flex flex-col md:flex-row items-center p-6 my-4 md:my-1 rounded-lg h-full overflow-y-auto select-none justify-center ${theme.mainTheme}`}
    >
      {/* Customization panel (Left Side) */}
      <Resizable
        defaultSize={
          isMobile
            ? { width: "100%", height }
            : { width: `${width}%`, height: "full" }
        }
        minWidth={isMobile ? "100%" : "28%"}
        maxWidth={isMobile ? "100%" : "40%"}
        minHeight={isMobile ? "30vh" : "full"}
        maxHeight={isMobile ? "30vh" : "full"}
        enable={!isMobile && { right: true }}
        onResizeStop={(d) => {
          if (isMobile) {
            setHeight(`${parseFloat(height) + d.height}px`);
          } else {
            setWidth(width + d.width);
          }
        }}
        className={`p-6 rounded-lg overflow-y-auto overflow-x-hidden ${
          isMobile ? "mb-1" : "h-full"
        } ${theme.mainTheme}`}
      >
        {/* Morph sliders for each outfit */}
        {Object.keys(morphTargets).map((outfit) => (
          <div key={outfit} className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {outfit.toUpperCase()}
            </h3>
            {morphTargets[outfit]?.map((target, index) => (
              <div key={`${outfit}-${index}`} className="mb-3">
                <label className="block text-sm font-medium">{target}</label>
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

            <div className="flex items-center justify-between mb-6">
              {/* Color Picker Button on the left */}
              <SimpleButton
                btnText={selectedOutfit === outfit ? "Hide" : "Color Picker"}
                type={"primary"}
                onClick={() => {
                  if (selectedOutfit === outfit) {
                    setSelectedOutfit(null); // If the same outfit is clicked, hide the picker
                  } else {
                    setSelectedOutfit(outfit); // Show the picker for this outfit
                  }
                }}
              />

              {/* Texture image input on the right */}
              <div className="flex items-center">
                <label
                  htmlFor={`file-input-${outfit}`}
                  className={`px-4 py-2 rounded cursor-pointer hover:ring-2 ${theme.colorBg} ${theme.hoverBg}`}
                >
                  {texture[outfit] ? "Change Texture" : "Choose a Texture"}
                </label>
                <input
                  id={`file-input-${outfit}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleTextureUpload(outfit, e)}
                  className="hidden" // Hide the default input element
                />
              </div>
            </div>

            {/* Color Picker */}
            {selectedOutfit === outfit && (
              <ColorPicker
                onColorChange={(color) =>
                  handleColorPickerChange(outfit, color)
                } // Pass the outfit name along with the color
              />
            )}
          </div>
        ))}

        {/* Skin Tone slider */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Skin Tone</h3>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={colorValue}
            onChange={(e) => setColorValue(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500 
               [&::-webkit-slider-thumb]:appearance-none 
               [&::-webkit-slider-thumb]:w-4 
               [&::-webkit-slider-thumb]:h-4 
               [&::-webkit-slider-thumb]:bg-blue-500 
               [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>
      </Resizable>

      {/* Preview panel (Right Side) */}
      <div
        className={`w-full md:w-[${
          100 - width
        }%] h-[80%] md:h-[100%] flex justify-center items-center`}
      >
        <CustomizationScene
          outfitTypes={outfitTypes}
          morphValues={morphValues}
          setMorphValues={handleSetMorphValues}
          setMorphTargets={handleSetMorphTargets}
          colorValue={colorValue}
          texture={texture}
          color={color}
        />
      </div>
    </div>
  );
};

export default OutfitCustomization;
