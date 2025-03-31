"use client";
import React, { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const Pants = ({ morphValues, morphTargets }) => {
  const modelRef = useRef();
  const [gltf, setGltf] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load("/models/pants/pants.glb", (loadedGltf) => {
      setGltf(loadedGltf);
    });
  }, []);

  useFrame(() => {
    if (modelRef.current && gltf) {
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences) {
          morphTargets.forEach((target, index) => {
            child.morphTargetInfluences[index] = morphValues[index] || 0;
          });
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0.9, 0.87, 0.87), // color of the pants
            metalness: 0.1,
            roughness: 0.6,
          });
        }
      });
    }
  });

  return gltf ? (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      position={[-0.03, -3.3, 1]}
      scale={[1.7, 1.7, 1.7]}
    />
  ) : null;
};

Pants.morphTargets = ["Waist", "Length", "Legs"];

export default Pants;
