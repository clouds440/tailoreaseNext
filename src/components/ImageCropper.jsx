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

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-lg overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-md rounded-2xl shadow-2xl ${theme.colorBg} border ${theme.colorBorder}`}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center">
                <i className={`fas fa-crop-alt mr-3 ${theme.iconColor}`}></i>
                {modalTitle}
              </h2>
              <button
                onClick={handleClose}
                className={`p-1 rounded-full ${theme.colorText} hover:${theme.colorBgHover}`}
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <p className={`mt-1 text-sm ${theme.colorText} opacity-80`}>
              {instructionText}
            </p>
          </div>

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
                  min={1}
                  max={3}
                  step={0.1}
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

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end space-x-3">
              <SimpleButton
                btnText="Cancel"
                type="default"
                onClick={handleClose}
                extraclasses="px-4 py-1.5 text-sm"
              />
              <SimpleButton
                btnText={
                  <>
                    <i className="fas fa-crop mr-2"></i> Crop
                  </>
                }
                type="primary"
                onClick={handleCropComplete}
                extraclasses="px-4 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageCropper;