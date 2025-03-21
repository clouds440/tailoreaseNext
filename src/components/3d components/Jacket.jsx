import React, { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const Jacket = ({ morphValues, morphTargets }) => {
  const modelRef = useRef();
  const [gltf, setGltf] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load("/models/shirt/shirt.glb", (loadedGltf) => {
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
        }
      });
    }
  });

  return gltf ? (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      position={[-0.03, -2.5, 1]}
      scale={[1.7, 1.7, 1.7]}
    />
  ) : null;
};

export default Jacket;
