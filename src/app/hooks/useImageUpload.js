const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };
  
  const useImageUpload = () => {
    const uploadImage = async (file, oldImagePath = null) => {
      if (!file) return { error: "No file selected" };
  
      const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"];
      if (!allowedTypes.includes(file.type)) {
        return { error: "Unsupported file type" };
      }
  
      try {
        const base64 = await convertToBase64(file);
        const fileName = `business-${Date.now()}.jpg`;
        const targetPath = "images/profile/business";
  
        const uploadRes = await fetch("/api/imageUpload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64, fileName, targetPath }),
        });
  
        if (!uploadRes.ok) {
          const errMsg = await uploadRes.text();
          return { error: `Upload failed: ${errMsg}` };
        }
  
        if (oldImagePath) {
          await fetch("/api/imageDelete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imagePath: oldImagePath }),
          });
        }
  
        const { url } = await uploadRes.json();
        return { url: "/" + url };
      } catch (err) {
        return { error: err.message || "Upload error" };
      }
    };
  
    return { uploadImage };
  };
  
  export default useImageUpload;
  