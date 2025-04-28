"use client";
import React, { useState, useCallback, useContext } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { UserContext } from "@/utils/UserContext";
import SimpleButton from "./SimpleButton";

// Load image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous"; // Important for cross-origin images
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = url;
  });

// Properly get cropped image
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas size to final cropped size
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
  instructionText = "Adjust your image within the crop area to maintain the required aspect ratio",
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

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black bg-opacity-70 backdrop-blur-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`relative max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden ${theme.colorBg} border ${theme.colorBorder} max-h-[90vh] flex flex-col`}
      >
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <i className={`fas fa-crop-alt mr-3 ${theme.iconColor}`}></i>
              {modalTitle}
            </h2>
            <button
              onClick={handleClose}
              className={`p-2 rounded-full ${theme.colorText} hover:${theme.colorBgHover}`}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <p className={`mb-6 ${theme.colorText} opacity-80`}>
            {instructionText}
          </p>

          <div className="relative h-64 w-full rounded-lg overflow-hidden">
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

          <div className="mt-6 space-y-4">
            <div>
              <label className={`block mb-2 ${theme.colorText} font-medium`}>
                Zoom: {zoom.toFixed(1)}x
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme.colorPrimaryBg}`}
              />
            </div>

            <div>
              <label className={`block mb-2 ${theme.colorText} font-medium`}>
                Rotation: {rotation}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme.colorPrimaryBg}`}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end space-x-3">
            <SimpleButton
              btnText="Cancel"
              type="default"
              onClick={handleClose}
              extraclasses="px-6 py-2"
            />
            <SimpleButton
              btnText={
                <>
                  <i className="fas fa-crop mr-2"></i> Crop Image
                </>
              }
              type="primary"
              onClick={handleCropComplete}
              extraclasses="px-6 py-2"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageCropper;
