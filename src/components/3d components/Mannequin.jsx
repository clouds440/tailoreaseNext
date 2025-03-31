"use client";
import React, { useEffect, useRef, useState } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

const Mannequin = ({ colorValue }) => {
  const mannequinRef = useRef();
  const mannequin = useLoader(
    OBJLoader,
    "/models/mannequin/mannequin-male.obj"
  );

  // Map the value to a skin tone range
  const getSkinTone = (value) => {
    const skinTones = [
      new THREE.Color(1.0, 0.87, 0.77), // Very Light
      new THREE.Color(0.98, 0.78, 0.64), // Light
      new THREE.Color(0.87, 0.62, 0.45), // Medium
      new THREE.Color(0.76, 0.53, 0.36), // Tan
      new THREE.Color(0.63, 0.42, 0.28), // Brown
      new THREE.Color(0.5, 0.33, 0.21), // Dark Brown
      new THREE.Color(0.38, 0.26, 0.15), // Deep Brown
      new THREE.Color(0.25, 0.17, 0.1), // Very Dark Skin
    ];

    // Interpolating between skin tones
    const index = Math.floor(value * (skinTones.length - 1));
    const nextIndex = Math.min(index + 1, skinTones.length - 1);
    const blendFactor = value * (skinTones.length - 1) - index;

    return skinTones[index].lerp(skinTones[nextIndex], blendFactor);
  };

  useEffect(() => {
    if (mannequin) {
      mannequin.scale.set(1.7, 1.7, 1.7);
      mannequin.position.set(-0.03, -3.3, 1);

      // Apply material and skin tone
      mannequin.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: getSkinTone(colorValue), // Use mapped skin tone
            metalness: 0.05,
            roughness: 0.7,
          });
        }
      });
    }
  }, [mannequin, colorValue]);

  return <primitive ref={mannequinRef} object={mannequin} />;
};

export default Mannequin;
