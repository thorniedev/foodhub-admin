export async function compressImage(file: File, maxSizeMB: number = 1): Promise<File> {
  const maxBytes = maxSizeMB * 1024 * 1024;

  return new Promise((resolve) => {
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
        resolve(file);
        return;
      }

      // Draw white background in case PNG had transparency
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Always encode to image/webp for universal backend compatibility
      const type = "image/webp";
      let quality = 0.85;

      const attemptCompression = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            if (blob.size <= maxBytes || quality <= 0.2) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, "") + ".webp",
                {
                  type: type,
                  lastModified: Date.now(),
                },
              );
              resolve(compressedFile);
            } else {
              quality -= 0.1;
              attemptCompression();
            }
          },
          type,
          quality,
        );
      };

      attemptCompression();
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
