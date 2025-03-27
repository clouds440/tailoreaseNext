"use client";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Mannequin from "./Mannequin";
import Jacket from "./Jacket";
import Shirt from "./Shirt";

const outfitComponents = {
  jacket: Jacket,
  shirt: Shirt,
};

const CustomizationScene = ({
  outfitTypes,
  morphValues,
  setMorphValues,
  setMorphTargets,
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
      newMorphTargets[OutfitComponent.name] = targets;
    });

    localSetMorphTargets(newMorphTargets);
    setMorphTargets(newMorphTargets);

    setMorphValues((prev) => {
      const updatedMorphValues = { ...prev };
      newOutfits.forEach((OutfitComponent) => {
        if (!updatedMorphValues[OutfitComponent.name]) {
          updatedMorphValues[OutfitComponent.name] = Array(
            OutfitComponent.morphTargets?.length || 0
          ).fill(0);
        }
      });
      return updatedMorphValues;
    });
  }, [outfitTypes, setMorphTargets, setMorphValues]);

  return (
    <Canvas
      style={{
        width: "40%",
        height: "90%",
        border: "solid 1px black",
        background: "gray",
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} />

      <Mannequin />

      {selectedOutfits.map((Outfit, index) => (
        <Outfit
          key={index}
          morphValues={morphValues[Outfit.name] || []}
          morphTargets={morphTargets[Outfit.name] || []}
        />
      ))}

      <OrbitControls />
    </Canvas>
  );
};

export default CustomizationScene;
