import React, { useEffect, useState, useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const Mannequin = () => {
  const mannequinRef = useRef();
  const mannequin = useLoader(
    OBJLoader,
    "/models/mannequin/mannequin-male.obj"
  );

  useEffect(() => {
    if (mannequin) {
      mannequin.scale.set(1.7, 1.7, 1.7);
      mannequin.position.set(-0.03, -2.5, 1);
    }
  }, [mannequin]);

  return <primitive ref={mannequinRef} object={mannequin} />;
};

export default Mannequin;
