export async function compressImage(file: File, maxSizeMB: number = 1): Promise<File> {
  const maxBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size <= maxBytes) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      
      // Scale down if image is too large
      const maxDimension = 1920;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // Fallback to original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Attempt compression with webp or jpeg
      const type = "image/webp"; // WebP generally provides better compression
      let quality = 0.8;
      
      const attemptCompression = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            
            if (blob.size <= maxBytes || quality <= 0.2) {
              // Found a good size, or we can't compress further
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // Still too large, reduce quality and try again
              quality -= 0.1;
              attemptCompression();
            }
          },
          type,
          quality
        );
      };

      attemptCompression();
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original
    };

    img.src = objectUrl;
  });
}
