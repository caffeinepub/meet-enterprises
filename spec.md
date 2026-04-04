# Meet Enterprises - 3D Movable Products

## Current State

ProductCard (`src/frontend/src/components/ProductCard.tsx`) already has a basic mouse-tilt effect via `onMouseMove`/`onMouseLeave` handlers that apply `perspective(800px) rotateX/rotateY` transforms. There is no auto-rotation and no drag-to-rotate.

ProductDetailPage (`src/frontend/src/pages/ProductDetailPage.tsx`) has a 3D perspective carousel for images (rotateY offset for adjacent slides), but no interactive tilt, no auto-rotation, and no drag-to-rotate behavior.

ThreeHero already uses `@react-three/fiber` and Three.js for the background hero scene.

## Requested Changes (Diff)

### Add
- **ProductCard**: Auto-slow-rotation animation (gentle continuous X/Y oscillation) when the card is idle/not being interacted with.
- **ProductCard**: Drag-to-rotate on touch devices — user drags finger across the card image to rotate the product view in 3D.
- **ProductDetailPage**: Interactive 3D tilt on touch — as the user moves their finger across the image area, the image tilts in 3D following the touch position (like a holographic card).
- **ProductDetailPage**: Auto-rotation when idle (subtle slow spin on Y axis).
- **ProductDetailPage**: Drag-to-rotate — user drags the image to manually spin the product 360° (using the uploaded images in sequence to simulate a 360° view).
- A new `useProduct3D` hook (or inline logic) to manage the 3D state (rotation angles, drag state, auto-rotate timer).

### Modify
- **ProductCard**: Replace existing simple mouse-tilt with a combined system: tilt on hover/touch-move + auto-rotation when idle + drag-to-spin.
- **ProductDetailPage**: Enhance the existing perspective carousel to also support drag-to-rotate (drag horizontally advances images + applies 3D rotation) and auto-rotation when idle.
- Use `requestAnimationFrame` or `useFrame` for smooth animation. For CSS-only 3D (product cards), use `transform` with `will-change: transform` for GPU acceleration.
- Auto-rotation pauses when user is interacting (hovering/dragging), resumes after 2 seconds of inactivity.

### Remove
- The existing simple `handleMouseMove`/`handleMouseLeave` raw DOM style mutations in ProductCard (replaced by the new unified system).

## Implementation Plan

1. **ProductCard 3D system**:
   - Replace raw `card.style.transform` mutations with React state (`rotateX`, `rotateY`).
   - Add a `useEffect` that runs a `requestAnimationFrame` auto-rotation loop (gentle sin/cos oscillation, ~±8 degrees, ~0.5 rpm).
   - Pause auto-rotation on `onMouseEnter`/`onTouchStart`, resume 2s after `onMouseLeave`/`onTouchEnd`.
   - On touch: `onTouchMove` calculates delta from touch start, maps to rotateX/rotateY (capped ±15 degrees).
   - Keep existing swipe-to-change-image logic (swipe > 50px triggers image change, smaller movements are 3D tilt).
   - Apply `style={{ transform: \`perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)\`, willChange: 'transform', transition: isDragging ? 'none' : 'transform 0.4s ease' }}`.

2. **ProductDetailPage 3D system**:
   - Add `rotateX`, `rotateY` state for the image container.
   - Auto-rotation: slow Y-axis spin (±15 degrees oscillation) when idle.
   - Touch tilt: `onTouchMove` maps touch position to rotateX/rotateY.
   - Drag-to-advance: horizontal drag > 60px advances to next/prev image (existing logic, keep it).
   - Apply 3D transform to the image container wrapper div (not individual images).
   - Wrap the entire image area in a `style={{ perspective: '1200px' }}` container, and apply `rotateX/rotateY` to the inner content div.

3. **Performance**:
   - Use `will-change: transform` on animated elements.
   - Auto-rotation uses `requestAnimationFrame` with a ref to avoid re-renders.
   - Rotation state stored in a `useRef` and applied directly to DOM for the auto-rotation path (no React re-render per frame).
   - Auto-rotation particle count kept low (already done in ThreeHero).
   - On mobile, reduce tilt range to ±8 degrees (vs ±15 on desktop).

4. No backend changes needed.
5. No admin panel changes.
