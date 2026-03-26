# Meet Enterprises

## Current State
The admin panel's Add/Edit Product dialog has an "Additional Images" section that appears only when editing an existing product (after save). It supports up to 7 images with a single multi-select file input button. The image limit is hardcoded to 7.

## Requested Changes (Diff)

### Add
- A dedicated **Product Images Page** (`/admin/product-images/:productId`) that opens after saving a product, providing unlimited image upload capability
- On the Add Product form, the primary image upload section should show **two buttons**: "Upload Image" (single image) and "Bulk Image" (multi-select)
- An "Add Images" button appears after a product is saved that navigates to the dedicated Product Images page

### Modify
- **Add Product dialog**: Replace the single upload input with two options side by side: "Upload Image" (single file) and "Bulk Image" (multiple files at once)
- **Additional Images section**: Keep the current thumbnail preview in the dialog but add an "Open Image Manager" button that goes to the full dedicated page
- **Product Images dedicated page**: No cap of 7 images -- unlimited uploads; shows all current images with delete buttons; has both single and bulk upload options; has a back button to return to admin

### Remove
- The hardcoded 7-image limit on the dedicated Product Images page (keep it on the inline dialog section if desired, but the dedicated page has no limit)

## Implementation Plan
1. Add a new `AdminProductImagesPage` component at `src/frontend/src/pages/AdminProductImagesPage.tsx`
   - Accepts `productId` from URL params
   - Loads all images for the product via `useProductImages`
   - Shows image grid with delete buttons for all non-primary images
   - Has two upload buttons: "Upload Image" (single) and "Bulk Image" (multiple, no limit)
   - Back button returns to admin panel
2. Add route `/admin/product-images/:productId` in `App.tsx`
3. In `AdminPage.tsx`, modify the primary image upload in the Add Product form to show two buttons: single and bulk
4. In `AdminPage.tsx`, after a product is saved (when `editingId` is set), show an "Manage Images" button that navigates to the dedicated page
5. Remove the 7-image cap from the dedicated page upload logic (the inline dialog section can retain the 7 cap)
