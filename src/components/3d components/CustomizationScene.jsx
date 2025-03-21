import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Mannequin from "./Mannequin";
import Jacket from "./Jacket"; // You can swap this with any other outfit

const CustomizationScene = ({
  morphValues,
  setMorphValues,
  setMorphTargets,
}) => {
  const [morphTargets, localSetMorphTargets] = useState([]);

  useEffect(() => {
    // Simulating getting morph targets from the outfit
    const defaultTargets = ["Chest", "Shoulders", "Arms", "Length"];
    localSetMorphTargets(defaultTargets);
    setMorphTargets(defaultTargets);
    setMorphValues(Array(defaultTargets.length).fill(0)); // Reset morphValues when outfit changes
  }, [setMorphTargets, setMorphValues]);

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

      {/* Mannequin always present */}
      <Mannequin />

      {/* Outfit (Replace Jacket with other outfits dynamically) */}
      <Jacket morphValues={morphValues} morphTargets={morphTargets} />

      <OrbitControls />
    </Canvas>
  );
};

export default CustomizationScene;
