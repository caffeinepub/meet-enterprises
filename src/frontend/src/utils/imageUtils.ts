export function uint8ToDataUrl(bytes: Uint8Array, mimeType: string): string {
  if (!bytes || bytes.length === 0) return "";
  let binary = "";
  const len = bytes.length;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return `data:${mimeType};base64,${btoa(binary)}`;
}

export async function fileToUint8Array(
  file: File,
): Promise<{ bytes: Uint8Array; type: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target!.result as ArrayBuffer);
      resolve({ bytes: arr, type: file.type });
    };
    reader.readAsArrayBuffer(file);
  });
}

export function formatPrice(amount: bigint | number): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  return `₹${n.toLocaleString("en-IN")}`;
}
