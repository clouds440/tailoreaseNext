"use client";
import React, { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const Shirt = ({ morphValues, morphTargets, texture, color }) => {
  const modelRef = useRef();
  const [gltf, setGltf] = useState(null);
  const textureLoader = useRef(new THREE.TextureLoader());
  const [loadedTexture, setLoadedTexture] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load("/models/shirt/shirt.glb", (loadedGltf) => {
      setGltf(loadedGltf);
    });
  }, []);

  useEffect(() => {
    if (gltf && texture) {
      textureLoader.current.load(texture, (newTexture) => {
        newTexture.colorSpace = THREE.SRGBColorSpace; // Better color accuracy
        setLoadedTexture(newTexture);
      });
    } else {
      setLoadedTexture(null); // Reset texture if none is selected
    }
  }, [texture, gltf]);

  useEffect(() => {
    if (gltf) {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: loadedTexture || null,
            color: loadedTexture
              ? new THREE.Color(color || "#ffffff")
              : new THREE.Color(color || "#d1cfc9"), // Default to gray/cream
            metalness: 0.1,
            roughness: 0.6,
          });
          child.material.needsUpdate = true;
        }
      });
    }
  }, [gltf, loadedTexture, color]);

  useFrame(() => {
    if (modelRef.current && gltf) {
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences) {
          morphTargets.forEach((_, index) => {
            child.morphTargetInfluences[index] = morphValues[index] || 0;
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

Shirt.morphTargets = ["Belly", "Chest", "Arms", "Length"];

export default Shirt;
