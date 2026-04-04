# Meet Enterprises — Full 3D Visual Upgrade

## Current State
The app is a dark luxury fashion e-commerce platform with a gold/dark theme. It uses motion/react for basic fade/slide animations. The homepage has a static hero with a background image. Product cards use simple CSS hover scale. The product detail page has a flat swipeable image gallery. All pages use flat 2D layouts with oklch color tokens.

Three.js / @react-three/fiber / @react-three/drei are already installed in package.json. The `motion` library (motion/react) is also available.

## Requested Changes (Diff)

### Add
- **Homepage 3D Hero**: Animated Three.js canvas as hero background — floating gold particles, a subtle rotating 3D mesh or ring, depth fog. Lightweight, GPU-accelerated, mobile-optimized (reduces particle count on mobile).
- **3D Product Card**: Each product card gets a subtle CSS perspective `rotateX/rotateY` tilt effect on hover/touch-move (mouse tracking). Cards have a holographic shimmer border using CSS gradient animation.
- **3D Product Image Gallery**: On the Product Detail page, images are displayed in a 3D carousel — images arranged in a flat arc/perspective layout where swiping rotates them around a Z-axis with `perspective` CSS, giving a carousel-in-depth feel. The selected image is front and center, others are slightly rotated/scaled back.
- **Holographic product frame**: Each product image (on detail page) sits inside a glowing holographic frame with animated rainbow/gold border shimmer.
- **Floating particle background**: Subtle floating particles on all customer-facing pages (not admin), using a lightweight canvas or CSS-only animated dots. Very low opacity, performant.
- **3D card lift on homepage grid**: Product cards in the grid have a 3D tilt/lift effect using CSS `transform: perspective() rotateX() rotateY()` tracked to pointer position.
- **Bottom nav 3D active indicator**: Active nav item has a glowing 3D pill indicator with depth shadow.
- **Section reveal animations**: Page sections animate in with 3D perspective flip (rotateX from 10deg to 0deg) as they enter viewport, using motion/react.

### Modify
- **HomePage**: Replace flat hero background with Three.js canvas scene (particles + ambient glow). Keep existing text, buttons, logos intact. Logo section gets subtle floating animation.
- **ProductCard**: Add CSS 3D tilt tracking on hover/touch, holographic shimmer border.
- **ProductDetailPage**: Replace flat gallery with 3D perspective carousel. Keep all existing functionality (swipe, dots, arrows).
- **ShopPage**: Add 3D grid reveal animations. Category pills get a 3D depth on active state.
- **CategoriesPage**: Add 3D reveal animations to category tiles.
- **SchemesPage**: Add 3D card layout for scheme cards.
- **index.css**: Add CSS utility classes for 3D transforms, holographic shimmer animation, and perspective containers.

### Remove
- Nothing is removed. All existing features stay intact.

## Implementation Plan

1. **index.css**: Add `@keyframes holographic-shimmer`, `@keyframes float`, perspective utility classes, `.card-3d-tilt`, `.holographic-border`, `.holo-shimmer` styles.

2. **Create `src/components/ThreeHero.tsx`**: Lightweight Three.js canvas using @react-three/fiber. Renders floating gold particles (BufferGeometry points), a subtle rotating torus or ring mesh, ambient + directional gold lighting. Reduced particle count on mobile (detect via `window.innerWidth < 768`). Wrapped in a fixed-position container behind hero text. Falls back to static background if WebGL unavailable.

3. **Create `src/components/HolographicFrame.tsx`**: A wrapper div with animated holographic border CSS. Accepts children (product image). Uses the shimmer keyframe animation.

4. **Modify `ProductCard.tsx`**: Add pointer-tracking 3D tilt with `onMouseMove`/`onMouseLeave` updating CSS `transform: perspective(800px) rotateX(Xdeg) rotateY(Ydeg)`. Add holographic shimmer border class.

5. **Modify `HomePage.tsx`**: Replace background image hero section with `<ThreeHero>` component. Add floating animation to logo section. Add 3D reveal to product grid.

6. **Modify `ProductDetailPage.tsx`**: Replace flat translateX gallery with a 3D perspective carousel. Active image is `scale(1) rotateY(0deg) translateZ(0)`, adjacent images are `scale(0.85) rotateY(±15deg) translateZ(-80px)`. Use CSS `perspective: 1200px` on container. Keep swipe/touch/dot/arrow logic intact.

7. **Modify `ShopPage.tsx`**: Wrap product grid in a motion container with staggered 3D reveal (initial: `rotateX: 15, opacity: 0`, animate: `rotateX: 0, opacity: 1`).

8. **Modify `BottomNav.tsx`**: Active item gets a glowing gold 3D pill with `box-shadow: 0 4px 20px gold, 0 0 8px gold`, subtle scale-up.

9. **Performance**: ThreeHero uses `frameloop="demand"` or `frameloop="always"` with `dpr={[1, 1.5]}` cap. Particles: 80 on desktop, 30 on mobile. All 3D CSS effects use `will-change: transform` and `transform: translate3d(0,0,0)` to force GPU compositing.
