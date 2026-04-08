import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";

// ── Orb mesh rendered inside Canvas ──────────────────────────────────────────
function OrbMesh({
  mouseNorm,
  isHovering,
  isClicking,
}: {
  mouseNorm: React.MutableRefObject<{ x: number; y: number }>;
  isHovering: React.MutableRefObject<boolean>;
  isClicking: React.MutableRefObject<boolean>;
}) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const { camera } = useThree();

  // Smoothed world position for lerp
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));

  const goldMat = useRef<THREE.MeshStandardMaterial>(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd4af37),
      emissive: new THREE.Color(0xd4af37),
      emissiveIntensity: 1.8,
      metalness: 0.9,
      roughness: 0.1,
    }),
  );

  useFrame((state) => {
    const { x: nx, y: ny } = mouseNorm.current;
    const hovering = isHovering.current;
    const clicking = isClicking.current;

    // Convert normalised screen coords (-1..1) to world units
    // camera is at z=5, fov=60, near plane at z=0
    const fov = (camera as THREE.PerspectiveCamera).fov;
    const dist = 5; // camera z distance
    const halfH = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * dist;
    const halfW = halfH * (camera as THREE.PerspectiveCamera).aspect;

    const targetX = nx * halfW;
    const targetY = ny * halfH;

    // Lerp toward target for spring-like movement
    const lerpFactor = 0.12;
    currentPos.current.x += (targetX - currentPos.current.x) * lerpFactor;
    currentPos.current.y += (targetY - currentPos.current.y) * lerpFactor;

    // Scale based on state
    const targetScale = clicking ? 0.7 : hovering ? 1.5 : 1.0;
    const emissive = clicking ? 3.5 : hovering ? 2.8 : 1.8;

    if (sphereRef.current) {
      sphereRef.current.position.copy(currentPos.current);
      sphereRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.18,
      );
      sphereRef.current.rotation.y += 0.02;
      sphereRef.current.rotation.x += 0.01;
      goldMat.current.emissiveIntensity +=
        (emissive - goldMat.current.emissiveIntensity) * 0.12;
    }

    if (torusRef.current) {
      torusRef.current.position.copy(currentPos.current);
      torusRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.18,
      );
      torusRef.current.rotation.x = state.clock.elapsedTime * 0.8 + Math.PI / 4;
      torusRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }

    if (lightRef.current) {
      lightRef.current.position.copy(currentPos.current);
      const targetIntensity = clicking ? 5 : hovering ? 3.5 : 2;
      lightRef.current.intensity +=
        (targetIntensity - lightRef.current.intensity) * 0.12;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight
        ref={lightRef}
        color={0xd4af37}
        intensity={2}
        distance={3}
        decay={2}
      />
      {/* Sphere orb */}
      <mesh ref={sphereRef} material={goldMat.current}>
        <sphereGeometry args={[0.15, 20, 20]} />
      </mesh>
      {/* Torus ring */}
      <mesh ref={torusRef} material={goldMat.current}>
        <torusGeometry args={[0.22, 0.015, 8, 40]} />
      </mesh>
    </>
  );
}

// ── Error boundary for Three canvas ─────────────────────────────────────────
class OrbErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// ── Touch ripple element ──────────────────────────────────────────────────────
interface Ripple {
  id: number;
  x: number;
  y: number;
}

// ── Main export ───────────────────────────────────────────────────────────────
export function CursorOrb() {
  const mouseNorm = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const isClicking = useRef(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isTouch, setIsTouch] = useState(false);

  // Detect touch-only device
  useEffect(() => {
    const onTouch = () => setIsTouch(true);
    window.addEventListener("touchstart", onTouch, { once: true });
    return () => window.removeEventListener("touchstart", onTouch);
  }, []);

  // Hide native cursor on desktop
  useEffect(() => {
    if (isTouch) return;
    document.body.classList.add("cursor-none");
    return () => document.body.classList.remove("cursor-none");
  }, [isTouch]);

  // Mouse tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Convert pixel coords to normalised -1..1
    mouseNorm.current = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -((e.clientY / window.innerHeight) * 2 - 1),
    };
  }, []);

  // Hover detection
  const handleMouseOver = useCallback((e: MouseEvent) => {
    const el = e.target as Element;
    if (
      el.closest(
        "button, a, [role='button'], input, select, textarea, .cursor-hover",
      )
    ) {
      isHovering.current = true;
    }
  }, []);

  const handleMouseOut = useCallback((e: MouseEvent) => {
    const el = e.target as Element;
    if (
      el.closest(
        "button, a, [role='button'], input, select, textarea, .cursor-hover",
      )
    ) {
      isHovering.current = false;
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    isClicking.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isClicking.current = false;
  }, []);

  // Touch ripple
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: touch.clientX, y: touch.clientY }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 700);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchstart", handleTouchStart);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [
    handleMouseMove,
    handleMouseOver,
    handleMouseOut,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
  ]);

  return (
    <>
      {/* Desktop 3D orb canvas */}
      {!isTouch && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <OrbErrorBoundary>
            <Canvas
              dpr={[1, 1.5]}
              camera={{ position: [0, 0, 5], fov: 60 }}
              gl={{ antialias: false, alpha: true }}
              style={{ background: "transparent" }}
            >
              <OrbMesh
                mouseNorm={mouseNorm}
                isHovering={isHovering}
                isClicking={isClicking}
              />
            </Canvas>
          </OrbErrorBoundary>
        </div>
      )}

      {/* Mobile touch ripples */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="touch-ripple"
          style={{
            position: "fixed",
            left: r.x,
            top: r.y,
            zIndex: 9999,
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </>
  );
}
