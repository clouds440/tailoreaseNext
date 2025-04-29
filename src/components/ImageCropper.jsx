"use client";
import React, { useState, useCallback, useContext } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { UserContext } from "@/utils/UserContext";
import SimpleButton from "./SimpleButton";
import DialogBox from "./DialogBox";

// Load image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = url;
  });

// Get cropped image
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob));
    }, "image/jpeg", 0.9);
  });
}

const ImageCropper = ({
  aspectRatio = 1,
  onCropComplete,
  showModal,
  setShowModal,
  imageSrc,
  modalTitle = "TailorEase Image Cropper",
  instructionText = "Adjust your image within the crop area",
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const { theme } = useContext(UserContext);

  const onCropCompleteCallback = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleClose = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setShowModal(false);
  }, [setShowModal]);

  const handleCropComplete = useCallback(async () => {
    try {
      if (!croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
      handleClose();
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  }, [croppedAreaPixels, imageSrc, rotation, onCropComplete, handleClose]);

  const cropperBody = (
    <div className="flex flex-col h-full">
      {/* Cropper Preview */}
      <div className="p-5 flex-1 overflow-hidden">
        <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteCallback}
            cropShape="rect"
            showGrid={false}
          />
        </div>

        {/* Controls - Both sliders in one row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block mb-1 text-sm ${theme.colorText} font-medium`}>
              Zoom: {zoom.toFixed(1)}x
            </label>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${theme.colorPrimaryBg}`}
            />
          </div>

          <div>
            <label className={`block mb-1 text-sm ${theme.colorText} font-medium`}>
              Rotation: {rotation}°
            </label>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${theme.colorPrimaryBg}`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const buttons = [
    {
      label: "Cancel",
      onClick: handleClose,
      type: "default"
    },
    {
      label: (
        <>
          <i className="fas fa-crop mr-2"></i> Crop
        </>
      ),
      onClick: handleCropComplete,
      type: "primary"
    }
  ];

  return (
    <DialogBox
      showDialog={showModal}
      setShowDialog={setShowModal}
      title={modalTitle}
      body={cropperBody}
      type="info"
      buttons={buttons}
    />
  );
};

export default ImageCropper;