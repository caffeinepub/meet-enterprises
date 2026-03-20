export function uint8ToDataUrl(
  bytes: Uint8Array,
  mimeType: [] | [string] | string,
): string {
  if (!bytes || bytes.length === 0) return "";
  // Handle Candid optional: [] | [string]
  const mime = Array.isArray(mimeType)
    ? (mimeType[0] ?? "image/jpeg")
    : mimeType || "image/jpeg";
  let binary = "";
  const len = bytes.length;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return `data:${mime};base64,${btoa(binary)}`;
}

// Compress image to stay under ICP's 2MB message limit
async function compressImage(file: File, maxBytes = 1_500_000): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Scale down if needed
      const MAX_DIM = 1200;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      // Try progressively lower quality until under limit
      const tryQuality = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            if (blob.size <= maxBytes || quality <= 0.2) {
              resolve(blob);
            } else {
              tryQuality(quality - 0.1);
            }
          },
          "image/jpeg",
          quality,
        );
      };
      tryQuality(0.85);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export async function fileToUint8Array(
  file: File,
): Promise<{ bytes: Uint8Array; type: string }> {
  const MAX_BYTES = 1_500_000; // 1.5 MB safe limit

  let source: Blob = file;
  // Treat files with no MIME type as images (common on Android gallery pickers)
  const isImage =
    file.type.startsWith("image/") || file.type === "" || !file.type;
  if (file.size > MAX_BYTES && isImage) {
    source = await compressImage(file, MAX_BYTES);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target!.result as ArrayBuffer);
      resolve({ bytes: arr, type: "image/jpeg" });
    };
    reader.readAsArrayBuffer(source);
  });
}

export function formatPrice(amount: bigint | number): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  return `₹${n.toLocaleString("en-IN")}`;
}
