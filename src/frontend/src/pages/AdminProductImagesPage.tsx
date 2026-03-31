import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddProductImage,
  useProductImages,
  useProducts,
  useRemoveProductImage,
} from "../hooks/useQueries";
import { getAdminToken } from "../utils/adminStore";
import { fileToUint8Array, uint8ToDataUrl } from "../utils/imageUtils";

interface Props {
  productId: string;
}

export function AdminProductImagesPage({ productId }: Props) {
  const pid = BigInt(productId);
  const adminToken = getAdminToken();

  const { data: productImages, isLoading } = useProductImages(pid);
  const { data: products } = useProducts();
  const addProductImage = useAddProductImage();
  const removeProductImage = useRemoveProductImage();

  const singleRef = useRef<HTMLInputElement>(null);
  const bulkRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  if (!adminToken) {
    window.location.href = "/admin";
    return null;
  }

  const product = products?.find(
    (p: any) => p.id === pid || BigInt(p.id) === pid,
  );
  const productName = product?.name ?? `Product #${productId}`;

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    let success = 0;
    let failed = 0;
    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      setUploadStatus(
        files.length > 1
          ? `Compressing & uploading ${idx + 1} of ${files.length}...`
          : "Compressing & uploading...",
      );
      try {
        const result = await fileToUint8Array(file);
        await addProductImage.mutateAsync({
          productId: pid,
          imageData: result.bytes,
          imageType: result.type || "image/jpeg",
        });
        success++;
      } catch {
        failed++;
      }
    }
    setUploading(false);
    setUploadStatus("");
    if (success > 0) toast.success(`${success} image(s) uploaded`);
    if (failed > 0) toast.error(`${failed} image(s) failed`);
    if (singleRef.current) singleRef.current.value = "";
    if (bulkRef.current) bulkRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-9 h-9 rounded-full border border-gold-border/50 flex items-center justify-center text-gold-muted hover:text-gold hover:border-gold transition-colors"
          data-ocid="admin.product_images.back.button"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Admin / Products
          </p>
          <h1 className="font-serif text-xl text-gold tracking-wide leading-tight">
            {productName}
          </h1>
        </div>
      </div>

      {/* Upload Buttons */}
      <div className="card-luxury p-4 mb-6">
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
          Add Images — No Limit
        </p>
        <input
          ref={singleRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadFiles(Array.from(e.target.files || []))}
        />
        <input
          ref={bulkRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(Array.from(e.target.files || []))}
        />
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-gold-border text-muted-foreground hover:text-gold"
            onClick={() => singleRef.current?.click()}
            disabled={uploading}
            data-ocid="admin.product_images.upload_button"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Upload Image
          </Button>
          <Button
            type="button"
            className="flex-1 btn-gold tracking-wide"
            onClick={() => bulkRef.current?.click()}
            disabled={uploading}
            data-ocid="admin.product_images.bulk_upload_button"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4 mr-2" />
            )}
            Bulk Image
          </Button>
        </div>
        {uploading && (
          <p
            className="text-xs text-gold-muted mt-2 text-center animate-pulse"
            data-ocid="admin.product_images.loading_state"
          >
            {uploadStatus || "Uploading..."}
          </p>
        )}
      </div>

      {/* Images Grid */}
      <div className="card-luxury p-4">
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
          Current Images ({productImages?.length ?? 0})
        </p>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : !productImages?.length ? (
          <div
            className="py-12 text-center"
            data-ocid="admin.product_images.empty_state"
          >
            <ImagePlus className="w-10 h-10 mx-auto text-gold/30 mb-3" />
            <p className="text-muted-foreground text-sm">No images yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Upload images using the buttons above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {productImages.map((img: any, i: number) => (
              <div
                key={`${img.imageType}-${i}-${productImages.length}`}
                className="relative group"
                data-ocid={`admin.product_images.item.${i + 1}`}
              >
                <img
                  src={uint8ToDataUrl(img.imageData, img.imageType)}
                  alt={`Gallery item ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-lg border border-gold-border/30"
                  loading="lazy"
                />
                {i === 0 ? (
                  <span className="absolute bottom-0 left-0 right-0 text-[10px] text-center bg-background/80 text-gold rounded-b-lg py-0.5 font-semibold tracking-wider">
                    PRIMARY
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Remove this image?")) return;
                      try {
                        await removeProductImage.mutateAsync({
                          productId: pid,
                          imageIndex: BigInt(i),
                        });
                        toast.success("Image removed");
                      } catch {
                        toast.error("Failed to remove image");
                      }
                    }}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    data-ocid={`admin.product_images.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
                <span className="absolute top-1.5 left-1.5 text-[10px] bg-background/70 text-muted-foreground rounded px-1 py-0.5">
                  #{i + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
