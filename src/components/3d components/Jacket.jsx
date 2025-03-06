import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const RotatingModel = ({ morphValues, setMorphTargets }) => {
  const modelRef = useRef();
  const [gltf, setGltf] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load("/models/jacket/jacket.glb", (loadedGltf) => {
      setGltf(loadedGltf);

      // Find mesh with morph targets and ensure they match "Shoulders", "Arms", "Chest"
      loadedGltf.scene.traverse((child) => {
        if (child.isMesh && child.morphTargetDictionary) {
          const validTargets = ["Shoulders", "Arms", "Chest", "Length"];
          const filteredTargets = Object.keys(
            child.morphTargetDictionary
          ).filter((target) => validTargets.includes(target));
          setMorphTargets(filteredTargets);
        }
      });
    });
  }, [setMorphTargets]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences) {
          morphValues.forEach((value, index) => {
            child.morphTargetInfluences[index] = value;
          });
        }
      });
    }
  });

  return gltf ? (
    <primitive
      object={gltf.scene}
      ref={modelRef}
      position={[0, -3.5, 0]}
      scale={[7, 7, 7]}
    />
  ) : null;
};

const Jacket = ({ morphValues, setMorphTargets }) => {
  return (
    <Canvas style={{ width: "90%", height: "650px" }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} />
      <RotatingModel
        morphValues={morphValues}
        setMorphTargets={setMorphTargets}
      />
      <OrbitControls />
    </Canvas>
  );
};

export default Jacket;
