"use client";
import { useContext, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import UserContext from "@/utils/UserContext";
import CustomizationScene from "@/components/3d components/CustomizationScene";
import { Resizable } from "re-resizable";
import ColorPicker from "@/components/ColorPicker";
import SimpleButton from "@/components/SimpleButton";
import useImageUpload from "../hooks/useImageUpload";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";
import ShareLinkDialog from "@/components/ShareLinkDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const outfitCategories = {
  jacket: { category: "torso", gender: "male" },
  pants: { category: "legs", gender: "male" },
  shirt: { category: "torso", gender: "male" },
  jeans: { category: "legs", gender: "unisex" },
  femaleDress: { category: "full", gender: "female" },
  // Add more here...
};

const OutfitCustomization = () => {
  const { theme, userData, userLoggedIn } = useContext(UserContext);
  const [selectedGender, setSelectedGender] = useState(null);
  const searchParams = useSearchParams();
  const [shareLink, setShareLink] = useState(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("share", "");
    return url.toString();
  });

  const [linkGenerated, setLinkGenerated] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  // Get outfit(s) from URL and convert them into an array
  const outfitTypes = searchParams.get("outfit")?.split(",") || [];
  const shareId = searchParams.get("share");

  const fetchSharedOutfit = async (shareId) => {
    try {
      const docRef = doc(db, "myOutfits", shareId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const outfitData = docSnap.data();
        console.log("Shared outfit:", outfitData);
        return outfitData;
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching shared outfit:", error);
      throw error;
    }
  };

  let selectedGenderLocal = null;
  const uniqueOutfits = [];
  const usedCategories = new Set();

  outfitTypes.forEach((outfit) => {
    const outfitInfo = outfitCategories[outfit];
    if (!outfitInfo) return;

    const { category, gender } = outfitInfo;

    // If outfit is non-unisex and we haven't set a selected gender yet, set it.
    if (gender !== "unisex" && !selectedGenderLocal) {
      selectedGenderLocal = gender;
    }

    // Filter: only accept outfits that are either unisex or match the selected gender.
    if (gender !== "unisex" && gender !== selectedGenderLocal) return;

    if (category === "full") {
      uniqueOutfits.length = 0;
      usedCategories.clear();
      uniqueOutfits.push(outfit);
      usedCategories.add("full");
    } else if (
      !usedCategories.has("full") &&
      category &&
      !usedCategories.has(category)
    ) {
      uniqueOutfits.push(outfit);
      usedCategories.add(category);
    }
  });

  // Now update your state once:
  if (!selectedGender) {
    setSelectedGender(selectedGenderLocal);
  }

  const [morphTargets, setMorphTargets] = useState({});
  const [morphValues, setMorphValues] = useState({});
  const [colorValue, setColorValue] = useState(0.5); // Default color brightness
  const [texture, setTexture] = useState({});
  const [color, setColor] = useState({});
  const [selectedOutfit, setSelectedOutfit] = useState(null); // Track the selected outfit for color picker visibility

  useEffect(() => {
    const getSharedOutfit = async () => {
      const outfitData = await fetchSharedOutfit(shareId);
      if (outfitData) {
        setColor(outfitData.color);
        setMorphValues(outfitData.morphValues);
        setColorValue(outfitData.colorValue);
        setTexture(outfitData.texture);
      }
    };

    if (shareId) {
      getSharedOutfit();
    }
  }, [shareId]);

  const { uploadImage } = useImageUpload();

  const updateShareLink = (id) => {
    const url = new URL(shareLink);
    url.searchParams.set("share", id);
    setShareLink(url.toString());
  };

  // call this to push all textures up:
  const handleUploadAllTextures = useCallback(async () => {
    const newTextures = {};

    for (const [outfit, blobUrl] of Object.entries(texture)) {
      // only upload real blobs
      if (!blobUrl.startsWith("blob:")) continue;

      try {
        // fetch the blob from the blob‑URL
        const resp = await fetch(blobUrl);
        const blob = await resp.blob();

        // Extract the file extension from the MIME type
        const mimeType = blob.type; // e.g., 'image/png'
        const extension = mimeType.split("/")[1] || "jpg"; // Fallback to 'jpg' if undefined

        // Create a File object with the correct extension
        const file = new File([blob], `${outfit}-${Date.now()}.${extension}`, {
          type: mimeType,
        });

        // upload it; pass oldImagePath if you have one
        const { url, error } = await uploadImage(
          file,
          null,
          "images/user/customizations"
        );

        if (error) {
          console.error(`Failed to upload ${outfit}:`, error);
        } else {
          newTextures[outfit] = url;
        }
      } catch (e) {
        console.error(`Error processing ${outfit}:`, e);
      }
    }

    return newTextures;
  }, [texture, uploadImage]);

  const uploadCustomization = async () => {
    try {
      if (!userLoggedIn) {
        throw new Error("User not authenticated");
      }
      setGeneratingLink(true);
      let newTextures = await handleUploadAllTextures();
      const customizations = {
        morphValues,
        colorValue,
        color,
        texture: newTextures,
      };
      // Reference to the 'myOutfits' collection
      const outfitsRef = collection(db, "myOutfits");

      // Add a new document with a generated ID
      const docRef = await addDoc(outfitsRef, {
        userId: userData.uid,
        ...customizations,
        createdAt: serverTimestamp(),
      });

      setLinkGenerated(true);
      updateShareLink(docRef.id);
    } catch (error) {
      console.error("Error uploading customization: ", error);
      throw error;
    } finally {
      setGeneratingLink(false);
    }
  };

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
                  accept=".jpg, .png"
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
        <div className={`border-y pb-5 ${theme.borderColor}`}>
          <h3 className="text-lg font-semibold my-3">Model</h3>
          <h3 className="text-sm font-medium">Skin Tone</h3>
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
        {userLoggedIn && (
          <div className="block mt-5 space-y-3">
            {!linkGenerated && (
              <div className="space-y-2">
                <span>Generate customized outfit sharing link</span>
                <SimpleButton
                  btnText={
                    generatingLink ? (
                      <>
                        <LoadingSpinner size={24} />
                        <span className="ml-2">Generating...</span>
                      </>
                    ) : (
                      "Generate"
                    )
                  }
                  type={"default"}
                  onClick={uploadCustomization}
                  disabled={generatingLink}
                />
              </div>
            )}
            {linkGenerated && (
              <div className="space-y-2">
                <span>
                  Link Generated{" "}
                  <i className="fas fa-check ml-3 font-bold text-lg text-green-500"></i>
                </span>
                <ShareLinkDialog
                  sender={userData}
                  shareLink={shareLink}
                  subject={"Custom Outfit"}
                />
              </div>
            )}
          </div>
        )}
      </Resizable>

      {/* Preview panel (Right Side) */}
      <div
        className={`w-full md:w-[${
          100 - width
        }%] h-[80%] md:h-[100%] flex justify-center items-center`}
      >
        <CustomizationScene
          outfitTypes={uniqueOutfits}
          morphValues={morphValues}
          setMorphValues={handleSetMorphValues}
          setMorphTargets={handleSetMorphTargets}
          colorValue={colorValue}
          texture={texture}
          color={color}
          gender={selectedGender}
        />
      </div>
    </div>
  );
};

export default OutfitCustomization;
