"use client";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Mannequin from "./Mannequin";
import Jacket from "./Jacket";
import Shirt from "./Shirt";
import Pants from "./Pants";
import FemaleDress from "./FemaleDress";
import KameezShalwar from "./KameezShalwar";
import FemaleCoat from "./FemaleCoat";
import FemaleGown from "./FemaleGown";
import FemaleJacket from "./FemaleJacket";
import FullShirt from "./FullShirt";
import Trousers from "./Trousers";
import { MORPH_TARGETS } from "@/utils/morphTargets.config";

const outfitComponents = {
  jacket: Jacket,
  shirt: Shirt,
  pants: Pants,
  femaleDress: FemaleDress,
  kameezShalwar: KameezShalwar,
  femaleCoat: FemaleCoat,
  femaleGown: FemaleGown,
  femaleJacket: FemaleJacket,
  fullShirt: FullShirt,
  trousers: Trousers,
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
  shalwarTexurePath,
  collarVisible,
}) => {
  const [selectedOutfits, setSelectedOutfits] = useState([]);
  const [morphTargets, localSetMorphTargets] = useState({});

  useEffect(() => {
    // pick the React components
    const comps = outfitTypes
      .map((key) => outfitComponents[key])
      .filter(Boolean);
    setSelectedOutfits(comps);

    // build your morphTargets map straight from MORPH_TARGETS
    const newMorphTargets = {};
    outfitTypes.forEach((key) => {
      newMorphTargets[key] = MORPH_TARGETS[key] || [];
    });
    localSetMorphTargets(newMorphTargets);
    setMorphTargets((prev) =>
      JSON.stringify(prev) !== JSON.stringify(newMorphTargets)
        ? newMorphTargets
        : prev
    );

    // build initial morphValues if missing
    setMorphValues((prev) => {
      const updated = { ...prev };
      outfitTypes.forEach((key) => {
        if (!Array.isArray(updated[key])) {
          updated[key] = MORPH_TARGETS[key].map(() => 0);
        }
      });
      return JSON.stringify(prev) === JSON.stringify(updated) ? prev : updated;
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
          !outfitTypes.some((t) =>
            [
              "pants",
              "shorts",
              "skirt",
              "jeans",
              "femaleDress",
              "kameezShalwar",
              "trousers",
            ].includes(t)
          )
        }
      />

      {selectedOutfits.map((Comp, i) => {
        const key = outfitTypes[i];
        return (
          <Comp
            key={key}
            morphValues={morphValues[key] || []}
            morphTargets={morphTargets[key] || []}
            texture={texture[key]}
            color={color[key]}
            buttonTexturePath={buttonTexturePath}
            shalwarTexturePath={shalwarTexurePath}
            collarVisible={collarVisible}
          />
        );
      })}

      <OrbitControls minDistance={1} maxDistance={7} />
    </Canvas>
  );
};

export default React.memo(CustomizationScene);
