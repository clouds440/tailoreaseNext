"use client";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Mannequin from "./Mannequin";
import Jacket from "./Jacket";
import Shirt from "./Shirt";
import Pants from "./Pants";
import FemaleDress from "./FemaleDress";

const outfitComponents = {
  jacket: Jacket,
  shirt: Shirt,
  pants: Pants,
  femaleDress: FemaleDress,
};

const CustomizationScene = ({
  outfitTypes,
  morphValues,
  setMorphValues,
  setMorphTargets,
  colorValue,
  texture,
  color,
  gender,
  buttonTexturePath,
}) => {
  const [selectedOutfits, setSelectedOutfits] = useState([]);
  const [morphTargets, localSetMorphTargets] = useState({});

  useEffect(() => {
    const newOutfits = outfitTypes
      .map((type) => outfitComponents[type])
      .filter(Boolean);

    setSelectedOutfits(newOutfits);

    const newMorphTargets = {};
    newOutfits.forEach((OutfitComponent) => {
      const targets = OutfitComponent.morphTargets || [];
      const componentName = OutfitComponent.componentName; // Use custom property here
      newMorphTargets[componentName] = targets;
      console.log(componentName);
    });

    localSetMorphTargets(newMorphTargets);

    setMorphTargets((prevTargets) => {
      // Only update if there's a change
      if (JSON.stringify(prevTargets) !== JSON.stringify(newMorphTargets)) {
        return newMorphTargets;
      }
      return prevTargets;
    });

    setMorphValues((prev) => {
      const updatedMorphValues = { ...prev };
      newOutfits.forEach((OutfitComponent) => {
        if (!updatedMorphValues[OutfitComponent.name]) {
          updatedMorphValues[OutfitComponent.name] = Array(
            OutfitComponent.morphTargets?.length || 0
          ).fill(0);
        }
      });

      // Only update if there's a change
      if (JSON.stringify(prev) !== JSON.stringify(updatedMorphValues)) {
        return updatedMorphValues;
      }
      return prev;
    });
  }, [outfitTypes, setMorphTargets, setMorphValues]);

  return (
    <Canvas
      style={{
        width: "99%",
        height: "100%",
        border: "solid 1px black",
        background: "gray",
        borderRadius: "0.375rem",
        backgroundImage: "url('/images/assets/wardrobe.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} />

      <Mannequin
        colorValue={colorValue}
        gender={gender}
        useSkirtAsDefaultLegs={
          !outfitTypes.some((type) =>
            ["pants", "shorts", "skirt", "jeans", "femaleDress"].includes(type)
          )
        }
      />

      {selectedOutfits.map((Outfit, index) => (
        <Outfit
          key={index}
          morphValues={morphValues[Outfit.name] || []}
          morphTargets={morphTargets[Outfit.name] || []}
          texture={texture[Outfit.name]}
          color={color[Outfit.name]}
          buttonTexturePath={buttonTexturePath}
        />
      ))}

      <OrbitControls minDistance={1} maxDistance={5} />
    </Canvas>
  );
};

export default React.memo(CustomizationScene);
