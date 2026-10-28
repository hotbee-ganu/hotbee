'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Sparkles,
  Maximize2,
  Sun,
  Eye,
  Layers,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ThreeProductStageProps {
  imageUrl?: string;
  secondaryImageUrl?: string;
  title?: string;
  price?: number;
  category?: string;
  className?: string;
}

export default function ThreeProductStage({
  imageUrl = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&auto=format&fit=crop&q=80',
  secondaryImageUrl = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80',
  title = 'HOTBEE Cyber Honey Tee',
  price = 1199,
  category = '240 GSM Combed Cotton',
  className = '',
}: ThreeProductStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const podiumRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isRotating, setIsRotating] = useState(true);
  const [lightPreset, setLightPreset] = useState<'gold' | 'studio' | 'neon'>('gold');
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  // Read inside the render loop, so toggling them must not rebuild the WebGL scene.
  const isRotatingRef = useRef(true);
  const lightPresetRef = useRef<'gold' | 'studio' | 'neon'>('gold');

  // Interaction tracking state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });
  const targetZoomRef = useRef(3.8);
  const currentZoomRef = useRef(3.8);

  const lightsRef = useRef<{
    ambient?: THREE.AmbientLight;
    keyLight?: THREE.DirectionalLight;
    rimLight?: THREE.DirectionalLight;
    pointGold?: THREE.PointLight;
  }>({});

  // Lighting Preset Switcher
  const updateLights = useCallback((preset: 'gold' | 'studio' | 'neon') => {
    const l = lightsRef.current;
    if (!l.keyLight || !l.rimLight || !l.pointGold || !l.ambient) return;

    if (preset === 'gold') {
      l.ambient.color.setHex(0x1a150e);
      l.ambient.intensity = 1.4;
      l.keyLight.color.setHex(0xffaa22);
      l.keyLight.intensity = 2.8;
      l.rimLight.color.setHex(0xffdd66);
      l.rimLight.intensity = 2.0;
      l.pointGold.color.setHex(0xff9d00);
      l.pointGold.intensity = 3.5;
    } else if (preset === 'studio') {
      l.ambient.color.setHex(0x222226);
      l.ambient.intensity = 2.0;
      l.keyLight.color.setHex(0xffffff);
      l.keyLight.intensity = 3.0;
      l.rimLight.color.setHex(0xe8f0ff);
      l.rimLight.intensity = 2.2;
      l.pointGold.color.setHex(0xffffff);
      l.pointGold.intensity = 2.0;
    } else if (preset === 'neon') {
      l.ambient.color.setHex(0x0d0d1a);
      l.ambient.intensity = 1.2;
      l.keyLight.color.setHex(0xff0077);
      l.keyLight.intensity = 3.2;
      l.rimLight.color.setHex(0x00f0ff);
      l.rimLight.intensity = 3.0;
      l.pointGold.color.setHex(0xffd000);
      l.pointGold.intensity = 4.0;
    }
  }, []);

  useEffect(() => {
    lightPresetRef.current = lightPreset;
    updateLights(lightPreset);
  }, [lightPreset, updateLights]);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  // Respect the OS "reduce motion" setting: start paused.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setIsRotating(false);
  }, []);

  // Flip Front/Back
  const toggleSide = () => {
    if (activeSide === 'front') {
      targetRotationRef.current.y += Math.PI;
      setActiveSide('back');
    } else {
      targetRotationRef.current.y += Math.PI;
      setActiveSide('front');
    }
  };

  // Reset View
  const resetView = () => {
    targetRotationRef.current = { x: 0, y: 0 };
    targetZoomRef.current = 3.8;
    setActiveSide('front');
    setIsRotating(true);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050608, 0.12);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.8);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and alpha
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambient = new THREE.AmbientLight(0x1a150e, 1.4);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffaa22, 2.8);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffdd66, 2.0);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    const pointGold = new THREE.PointLight(0xff9d00, 3.5, 8);
    pointGold.position.set(0, -1.2, 1.5);
    scene.add(pointGold);

    lightsRef.current = { ambient, keyLight, rimLight, pointGold };
    updateLights(lightPresetRef.current);

    // 5. Main Product 3D Mesh Group
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Texture Loader with CrossOrigin handling
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    // Create high-detail realistic garment model
    // Using a curved subdivided plane with physical fabric shader
    const garmentGeo = new THREE.PlaneGeometry(1.65, 2.05, 32, 32);
    
    // Add subtle organic fabric draping wave to geometry vertices
    const posAttr = garmentGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      // Symmetric pillow bulge: zero at every edge, so the front and back
      // sheets meet and the garment reads as a closed, solid volume.
      const nx = x / 0.825;
      const ny = y / 1.025;
      const zWave = 0.1 * (1 - nx * nx) * (1 - ny * ny);
      posAttr.setZ(i, zWave);
    }
    garmentGeo.computeVertexNormals();

    // Default procedural fallback canvas texture while remote image loads
    const createPlaceholderCanvas = (text: string) => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 640;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#0a0c10';
      ctx.fillRect(0, 0, 512, 640);
      // Gold frame
      ctx.strokeStyle = '#ff9d00';
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, 472, 600);
      // Text
      ctx.fillStyle = '#ff9d00';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HOTBEE', 256, 300);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px sans-serif';
      ctx.fillText(text, 256, 350);
      return new THREE.CanvasTexture(c);
    };

    const frontTex = textureLoader.load(
      imageUrl,
      () => {},
      undefined,
      () => {
        // Fallback on error
        frontMat.map = createPlaceholderCanvas('3D MODEL');
        frontMat.needsUpdate = true;
      }
    );
    frontTex.colorSpace = THREE.SRGBColorSpace;
    frontTex.generateMipmaps = true;

    const backTex = textureLoader.load(
      secondaryImageUrl || imageUrl,
      () => {},
      undefined,
      () => {
        backMat.map = createPlaceholderCanvas('BACK PRINT');
        backMat.needsUpdate = true;
      }
    );
    backTex.colorSpace = THREE.SRGBColorSpace;

    // Physical Material for ultra-realistic combed cotton & DTF sheen
    const frontMat = new THREE.MeshPhysicalMaterial({
      map: frontTex,
      roughness: 0.72,
      metalness: 0.05,
      clearcoat: 0.18,
      clearcoatRoughness: 0.4,
      side: THREE.FrontSide,
    });

    const backMat = new THREE.MeshPhysicalMaterial({
      map: backTex,
      roughness: 0.72,
      metalness: 0.05,
      clearcoat: 0.18,
      clearcoatRoughness: 0.4,
      side: THREE.FrontSide,
    });

    const frontMesh = new THREE.Mesh(garmentGeo, frontMat);
    frontMesh.castShadow = true;
    frontMesh.receiveShadow = true;
    meshGroup.add(frontMesh);

    // Back mesh slightly offset and rotated 180 degrees
    const backMesh = new THREE.Mesh(garmentGeo, backMat);
    backMesh.rotation.y = Math.PI;
    backMesh.castShadow = true;
    meshGroup.add(backMesh);

    // Golden Hologram Border Rim
    const rimPoints = [
      new THREE.Vector3(-0.84, -1.04, 0),
      new THREE.Vector3(0.84, -1.04, 0),
      new THREE.Vector3(0.84, 1.04, 0),
      new THREE.Vector3(-0.84, 1.04, 0),
      new THREE.Vector3(-0.84, -1.04, 0),
    ];
    const rimGeo = new THREE.BufferGeometry().setFromPoints(rimPoints);
    const rimMat = new THREE.LineBasicMaterial({
      color: 0xff9d00,
      transparent: true,
      opacity: 0.45,
    });
    const rimLine = new THREE.Line(rimGeo, rimMat);
    meshGroup.add(rimLine);

    // 6. Holographic Floor Podium & Energy Rings
    const podiumGroup = new THREE.Group();
    podiumGroup.position.y = -1.35;
    scene.add(podiumGroup);
    podiumRef.current = podiumGroup;

    // Outer Hexagonal Glowing Ring
    const hexGeo = new THREE.RingGeometry(1.1, 1.15, 6);
    const hexMat = new THREE.MeshBasicMaterial({
      color: 0xff9d00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const hexRing = new THREE.Mesh(hexGeo, hexMat);
    hexRing.rotation.x = Math.PI / 2;
    podiumGroup.add(hexRing);

    // Inner Glowing Disc
    const innerDiscGeo = new THREE.CircleGeometry(0.9, 32);
    const innerDiscMat = new THREE.MeshStandardMaterial({
      color: 0x0c0f16,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0xff9d00,
      emissiveIntensity: 0.12,
    });
    const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
    innerDisc.rotation.x = -Math.PI / 2;
    innerDisc.receiveShadow = true;
    podiumGroup.add(innerDisc);

    // 7. Floating 3D Golden Honey Sparks Particle Field
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 4.5;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
      particleScales[i] = Math.random() * 0.04 + 0.015;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    // Particle Material
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d')!;
    const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 208, 0, 1)');
    grad.addColorStop(0.4, 'rgba(255, 157, 0, 0.6)');
    grad.addColorStop(1, 'rgba(255, 157, 0, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 32, 32);

    const particleTexture = new THREE.CanvasTexture(pCanvas);
    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffbb33,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particleSystemRef.current = particles;

    // 8. Mouse & Pointer Event Listeners for 360° Drag & Zoom
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      setIsRotating(false);
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) {
        // Parallax hover when not dragging
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        targetRotationRef.current.x = normY * 0.25;
        if (!isRotatingRef.current) {
          targetRotationRef.current.y += normX * 0.01;
        }
        return;
      }

      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;

      targetRotationRef.current.y += deltaX * 0.012;
      targetRotationRef.current.x += deltaY * 0.008;

      // Clamp vertical tilt so garment doesn't flip upside down
      targetRotationRef.current.x = Math.max(-0.6, Math.min(0.6, targetRotationRef.current.x));

      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoomRef.current += e.deltaY * 0.003;
      targetZoomRef.current = Math.max(2.2, Math.min(5.2, targetZoomRef.current));
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 9. Resize Observer
    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 10. Animation Loop
    let clock = new THREE.Clock();

    // Skip rendering while the stage is scrolled out of view.
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(container);

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (!visible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera zoom damping
      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.08;
      camera.position.z = currentZoomRef.current;

      // Auto-rotation when enabled and not dragging
      if (isRotatingRef.current && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.006;
      }

      // Smooth rotation damping (inertial physics)
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (meshGroup) {
        meshGroup.rotation.x = currentRotationRef.current.x;
        meshGroup.rotation.y = currentRotationRef.current.y;
        // Gentle organic floating bobbing
        meshGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.06;
      }

      // Podium subtle counter-rotation and pulsation
      if (podiumGroup) {
        podiumGroup.rotation.y = elapsedTime * 0.2;
        innerDiscMat.emissiveIntensity = 0.12 + Math.sin(elapsedTime * 3) * 0.06;
      }

      // Orbiting particles
      if (particles) {
        particles.rotation.y = elapsedTime * 0.08;
        const positions = particles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += Math.sin(elapsedTime + i) * 0.002;
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);

      garmentGeo.dispose();
      frontMat.dispose();
      backMat.dispose();
      frontTex.dispose();
      backTex.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      hexGeo.dispose();
      hexMat.dispose();
      innerDiscGeo.dispose();
      innerDiscMat.dispose();

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
      }
    };
  }, [imageUrl, secondaryImageUrl, updateLights]);

  // Fallback if WebGL disabled
  if (!hasWebGL) {
    return (
      <div className={`relative aspect-[4/5] rounded-3xl overflow-hidden glass-panel border border-hotbee-500/30 flex items-center justify-center p-6 text-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full aspect-[4/5] sm:aspect-[4/5] rounded-3xl overflow-hidden glass-panel border border-hotbee-500/30 shadow-[0_0_50px_rgba(255,157,0,0.22)] select-none group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        title="Click and drag to spin 360°"
      />

      {/* Top Floating Holographic Badges */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-hotbee-500/40 text-hotbee-500 text-[10px] font-extrabold uppercase tracking-wider shadow-lg animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-hotbee-500" />
          <span>3D LIVE HOLOGRAM</span>
        </div>

        <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-hotbee-500/30 text-white font-extrabold text-xs shadow-lg">
          ₹{price.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Subtle Drag Hint Overlay (Fades out when interacting) */}
      <div className="absolute inset-x-0 bottom-16 flex justify-center pointer-events-none z-10">
        <div className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-hotbee-500/20 text-[11px] text-gray-300 font-medium flex items-center gap-2 shadow-lg transition-opacity duration-300 opacity-90 group-hover:opacity-100">
          <RotateCcw className="w-3.5 h-3.5 text-hotbee-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Drag to rotate 360° • Scroll to zoom</span>
        </div>
      </div>

      {/* Bottom Floating Interactive 3D Control Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-hotbee-500/30 z-20">
        {/* Auto-Rotation Toggle */}
        <button
          onClick={() => setIsRotating((prev) => !prev)}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
            isRotating
              ? 'bg-hotbee-500 text-black shadow-glow-gold'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Auto Spin"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          <span className="hidden sm:inline">{isRotating ? 'Spinning' : 'Spin'}</span>
        </button>

        {/* Flip Side Toggle */}
        <button
          onClick={toggleSide}
          className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-200 hover:text-hotbee-500 hover:bg-white/10 flex items-center gap-1.5 transition-all border border-hotbee-500/20"
          title="Flip Front/Back"
        >
          <Layers className="w-3.5 h-3.5 text-hotbee-500" />
          <span>{activeSide === 'front' ? 'View Back' : 'View Front'}</span>
        </button>

        {/* Studio Lighting Mode Switcher */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-0.5 border border-white/10">
          <button
            onClick={() => setLightPreset('gold')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              lightPreset === 'gold' ? 'bg-hotbee-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
            title="Gold Ambient Lighting"
          >
            Amber
          </button>
          <button
            onClick={() => setLightPreset('studio')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              lightPreset === 'studio' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
            title="Neutral Studio Lighting"
          >
            Studio
          </button>
          <button
            onClick={() => setLightPreset('neon')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              lightPreset === 'neon' ? 'bg-cyan-400 text-black' : 'text-gray-400 hover:text-white'
            }`}
            title="Cyberpunk Neon Lighting"
          >
            Cyber
          </button>
        </div>

        {/* Reset View Button */}
        <button
          onClick={resetView}
          className="p-1.5 rounded-xl text-gray-400 hover:text-hotbee-500 hover:bg-white/10 transition-colors"
          title="Reset 3D camera"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
