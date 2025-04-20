"use client";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Mannequin from "./Mannequin";
import Jacket, { jacketMorphTargets } from "./Jacket";
import Shirt, { shirtMorphTargets } from "./Shirt";
import Pants, { pantsMorphTargets } from "./Pants";
import FemaleDress, { femaleDressMorphTargets } from "./FemaleDress";

const outfitComponents = {
  jacket: { component: Jacket, morphTargets: jacketMorphTargets },
  shirt: { component: Shirt, morphTargets: shirtMorphTargets },
  pants: { component: Pants, morphTargets: pantsMorphTargets },
  femaleDress: {
    component: FemaleDress,
    morphTargets: femaleDressMorphTargets,
  },
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
    newOutfits.forEach(({ component, morphTargets }) => {
      newMorphTargets[component.name] = morphTargets || [];
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

      {selectedOutfits.map(({ component: OutfitComponent }, index) => (
        <OutfitComponent
          key={index}
          morphValues={morphValues[OutfitComponent.name] || []}
          morphTargets={morphTargets[OutfitComponent.name] || []}
          texture={texture[OutfitComponent.name]}
          color={color[OutfitComponent.name]}
          buttonTexturePath={buttonTexturePath}
        />
      ))}

      <OrbitControls minDistance={1} maxDistance={5} />
    </Canvas>
  );
};

export default React.memo(CustomizationScene);
