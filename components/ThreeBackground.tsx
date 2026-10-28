'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    // WebGL capability check
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) return;
    } catch {
      return;
    }

    // ─── Scene / Camera / Renderer ──────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040507, 0.018);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 26);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    // ─── 1. Organic Wave Grid (the "honey grid floor") ──────────────────────
    const gridCols = isTouch ? 28 : 55;
    const gridRows = isTouch ? 28 : 55;
    const planeGeo = new THREE.PlaneGeometry(80, 80, gridCols, gridRows);
    planeGeo.rotateX(-Math.PI / 2.2);

    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xff9d00,
      wireframe: true,
      transparent: true,
      opacity: 0.055,
    });
    const waveMesh = new THREE.Mesh(planeGeo, planeMat);
    waveMesh.position.set(0, -7, -3);
    scene.add(waveMesh);

    const originalPositions = planeGeo.attributes.position.clone();

    // ─── 2. Hex-like Energy Rings (ambient depth) ───────────────────────────
    const rings: THREE.Mesh[] = [];
    const ringConfigs = [
      { radius: 6, pos: [-20, 8, -12], rotX: 0.4, rotZ: 0.2, scale: 1.0, speed: 0.07 },
      { radius: 4, pos: [ 22, -5, -14], rotX: 0.7, rotZ: 0.5, scale: 0.75, speed: -0.09 },
      { radius: 9, pos: [  4, 12, -18], rotX: 1.2, rotZ: 0.1, scale: 1.3, speed: 0.05 },
      { radius: 3, pos: [-10, -8, -8], rotX: 0.2, rotZ: 0.8, scale: 0.6, speed: -0.12 },
    ];

    ringConfigs.forEach(({ radius, pos, rotX, rotZ, scale, speed }) => {
      const geo = new THREE.TorusGeometry(radius, 0.025, 6, 64);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff9d00,
        transparent: true,
        opacity: isTouch ? 0.06 : 0.10,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.rotation.x = rotX;
      mesh.rotation.z = rotZ;
      mesh.scale.setScalar(scale);
      mesh.userData.speed = speed;
      scene.add(mesh);
      rings.push(mesh);
    });

    // ─── 3. Gold Particle Dust Field ────────────────────────────────────────
    const particleCount = isTouch ? 80 : 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pPhases = new Float32Array(particleCount);
    const pSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 70;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 45;
      pPhases[i] = Math.random() * Math.PI * 2;
      pSizes[i]  = Math.random() * 0.6 + 0.3;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    // Radial glow sprite
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32; pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d')!;
    const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0,   'rgba(255, 220, 100, 1)');
    grad.addColorStop(0.25,'rgba(255, 157,   0, 0.6)');
    grad.addColorStop(0.7, 'rgba(255, 100,   0, 0.10)');
    grad.addColorStop(1,   'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 32, 32);
    const pTex = new THREE.CanvasTexture(pCanvas);

    const pMat = new THREE.PointsMaterial({
      size: isTouch ? 0.85 : 1.1,
      map: pTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffb800,
      opacity: 0.60,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ─── 4. Distant Nebula Plane (background depth) ─────────────────────────
    if (!isTouch) {
      const nebulaGeo = new THREE.PlaneGeometry(120, 60);
      const nebulaMat = new THREE.MeshBasicMaterial({
        color: 0xff7700,
        transparent: true,
        opacity: 0.012,
        side: THREE.DoubleSide,
      });
      const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
      nebula.position.set(0, 10, -40);
      nebula.rotation.x = 0.2;
      scene.add(nebula);
    }

    // ─── 5. Mouse Parallax ──────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // ─── Render Loop ────────────────────────────────────────────────────────
    let frameId: number;
    const clock = new THREE.Clock();
    const posAttr = planeGeo.attributes.position;
    const count = posAttr.count;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Fluid wave
      const orig = originalPositions.array as Float32Array;
      const curr = posAttr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const u = orig[i * 3];
        const v = orig[i * 3 + 1];
        curr[i * 3 + 2] =
          Math.sin(u * 0.15 + t * 1.1) * 1.6 +
          Math.cos(v * 0.15 + t * 0.85) * 1.3 +
          Math.sin((u + v) * 0.10 + t * 0.6) * 0.7;
      }
      posAttr.needsUpdate = true;

      // Particle organic drift
      const pArr = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pArr[i * 3 + 1] += Math.sin(t * 1.4 + pPhases[i]) * 0.012;
        pArr[i * 3]     += Math.cos(t * 0.8 + pPhases[i]) * 0.005;
      }
      pGeo.attributes.position.needsUpdate = true;

      // Smooth camera parallax
      camera.position.x += (mouseX * 3.0 - camera.position.x) * 0.035;
      camera.position.y += (5 - mouseY * 2.2 - camera.position.y) * 0.035;
      camera.lookAt(0, 0, 0);

      // Ambient rotations
      particles.rotation.y = t * 0.018;
      particles.rotation.x = t * 0.006;
      rings.forEach((ring) => {
        ring.rotation.y += ring.userData.speed * 0.01;
        ring.rotation.x += ring.userData.speed * 0.006;
      });

      renderer.render(scene, camera);
    };
    animate();

    // ─── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);

      planeGeo.dispose(); planeMat.dispose();
      pGeo.dispose(); pMat.dispose(); pTex.dispose();
      rings.forEach((r) => { r.geometry.dispose(); (r.material as THREE.Material).dispose(); });

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }
      if (mount && renderer.domElement) {
        mount.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-75 overflow-hidden"
      aria-hidden="true"
    />
  );
}
