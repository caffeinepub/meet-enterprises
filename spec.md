# Meet Enterprises

## Current State
The app has a ShopPage that displays products in a grid using ProductCard components. Clicking 'Add to Cart' opens a ProductOptionsModal for size/colour selection. There is no dedicated product detail page -- all product interaction happens on the shop grid or via a modal.

## Requested Changes (Diff)

### Add
- New `ProductDetailPage` at route `/product/:productId`
- Page shows: large product image, name, category badge, price (with discount), description, size selector buttons, colour selector buttons, quantity stepper, Add to Cart button
- Related Products section at bottom: 4 random products from the store (excluding current product) in a horizontal scrollable row
- Clicking a related product navigates to its detail page

### Modify
- `ProductCard`: clicking the card (image or name area) navigates to `/product/:productId` instead of only triggering add-to-cart
- `App.tsx`: add the new product route `/product/$productId`

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/ProductDetailPage.tsx` with all product detail UI, size/colour/quantity selection, add-to-cart logic, and related products section
2. Register route `/product/$productId` in `App.tsx`
3. Update `ProductCard` so clicking the card image or product name navigates to the detail page; the Add button still opens the modal/adds directly
