import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import * as THREE from "three";

const RotatingModel = () => {
  const modelRef = useRef();
  const [obj, setObj] = useState(null);

  useEffect(() => {
    // Load materials first
    const mtlLoader = new MTLLoader();
    mtlLoader.load("/graphics/jacket.mtl", (materials) => {
      materials.preload();

      // Ensure all materials render both sides
      for (const materialKey in materials.materials) {
        const material = materials.materials[materialKey];
        material.side = THREE.DoubleSide; // Render both sides
      }

      // Load the OBJ with the modified materials
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load("/graphics/jacket.obj", (loadedObj) => {
        setObj(loadedObj);
      });
    });
  }, []);

  // Add rotation animation
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005; // Rotate on the Y-axis
    }
  });

  return obj ? (
    <mesh ref={modelRef} position={[0, -3.5, 0]} scale={[7, 7, 7]}>
      <primitive object={obj} />
    </mesh>
  ) : null; // Return null until the object is loaded
};

const RotatingJacket = () => {
  return (
    <Canvas style={{ width: "100%", height: "420px" }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} />
      <RotatingModel />
      <OrbitControls />
    </Canvas>
  );
};

export default RotatingJacket;
