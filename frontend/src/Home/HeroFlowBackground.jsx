import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * HeroFlowBackground
 * 
 * Inspired by Spline / Lusion interactive 3D web experiences.
 * - Smooth diagonal flow from TOP-LEFT -> CENTER -> BOTTOM-RIGHT.
 * - Elegant 3D textile fiber ribbons & satin wave surfaces.
 * - Very slow, cinematic fluid motion with zero harsh bouncing or spinning.
 * - Mouse parallax tilt & depth shift.
 * - Dark blue, cyan, and emerald green visual theme.
 * - High text readability with background vignette protection.
 */

const HeroFlowBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId;
    const isMobile = window.innerWidth < 768;

    // -------------------------------------------------------------
    // 1. Scene, Camera, Renderer Setup
    // -------------------------------------------------------------
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 75);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x030712, 1);
    container.appendChild(renderer.domElement);

    // -------------------------------------------------------------
    // 2. Lighting Setup (Cinematic Studio Lighting)
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0x0a192f, 1.8);
    scene.add(ambientLight);

    // Top-Left Primary Light (Cyan / Blue)
    const topLeftLight = new THREE.DirectionalLight(0x06b6d4, 2.5);
    topLeftLight.position.set(-60, 50, 40);
    scene.add(topLeftLight);

    // Bottom-Right Accent Light (Emerald / Teal)
    const bottomRightLight = new THREE.DirectionalLight(0x10b981, 2.0);
    bottomRightLight.position.set(60, -50, 30);
    scene.add(bottomRightLight);

    // Subtle Center Glow Point Light
    const centerPointLight = new THREE.PointLight(0x3b82f6, 1.5, 120);
    centerPointLight.position.set(0, 0, 20);
    scene.add(centerPointLight);

    // -------------------------------------------------------------
    // 3. Primary 3D Textile Fluid Ribbon (Top-Left -> Bottom-Right)
    // -------------------------------------------------------------
    const planeW = isMobile ? 180 : 260;
    const planeH = isMobile ? 120 : 160;
    const segsX = isMobile ? 60 : 120;
    const segsY = isMobile ? 40 : 80;

    const fabricGeo = new THREE.PlaneGeometry(planeW, planeH, segsX, segsY);
    const posAttr = fabricGeo.attributes.position;
    const initialPositions = new Float32Array(posAttr.array.length);
    for (let i = 0; i < posAttr.array.length; i++) {
      initialPositions[i] = posAttr.array[i];
    }

    // Satin Material with Subtle Glossy Reflection
    const fabricMat = new THREE.MeshStandardMaterial({
      color: 0x0f2b5c,
      roughness: 0.32,
      metalness: 0.45,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });

    const fabricMesh = new THREE.Mesh(fabricGeo, fabricMat);
    // Align ribbon diagonally across top-left to bottom-right trajectory
    fabricMesh.rotation.x = -Math.PI / 3.4;
    fabricMesh.rotation.z = -Math.PI / 14;
    fabricMesh.position.set(0, -5, -10);
    scene.add(fabricMesh);

    // -------------------------------------------------------------
    // 4. Interwoven 3D Fiber Strands (Diagonal Pathways)
    // -------------------------------------------------------------
    const strandGroup = new THREE.Group();
    scene.add(strandGroup);

    const createFiberStrand = (curvePoints, color, radius, opacity) => {
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 100, radius, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.6,
        transparent: true,
        opacity: opacity,
      });
      return new THREE.Mesh(tubeGeo, tubeMat);
    };

    // Strand 1: Top-Left to Bottom-Right Cyan Fiber
    const strand1 = createFiberStrand(
      [
        new THREE.Vector3(-110, 55, 10),
        new THREE.Vector3(-45, 25, 2),
        new THREE.Vector3(0, 0, -8),
        new THREE.Vector3(50, -25, -5),
        new THREE.Vector3(110, -55, -20),
      ],
      0x06b6d4,
      0.45,
      0.85
    );

    // Strand 2: Top-Left to Bottom-Right Emerald Eco-Fiber
    const strand2 = createFiberStrand(
      [
        new THREE.Vector3(-120, 45, -15),
        new THREE.Vector3(-60, 15, -5),
        new THREE.Vector3(10, -10, 5),
        new THREE.Vector3(65, -35, 0),
        new THREE.Vector3(120, -65, -10),
      ],
      0x10b981,
      0.35,
      0.75
    );

    // Strand 3: Deep Blue Core Ribbon
    const strand3 = createFiberStrand(
      [
        new THREE.Vector3(-100, 65, -5),
        new THREE.Vector3(-30, 35, 12),
        new THREE.Vector3(25, 5, -10),
        new THREE.Vector3(80, -20, 8),
        new THREE.Vector3(130, -50, -5),
      ],
      0x3b82f6,
      0.5,
      0.65
    );

    strandGroup.add(strand1);
    strandGroup.add(strand2);
    strandGroup.add(strand3);

    // -------------------------------------------------------------
    // 5. Floating Micro-Fiber Spark Particles
    // (Drifting smoothly from Top-Left -> Bottom-Right)
    // -------------------------------------------------------------
    const particleCount = isMobile ? 65 : 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = [];

    for (let i = 0; i < particleCount; i++) {
      // Distributed diagonally across top-left to bottom-right
      const x = (Math.random() - 0.5) * 220;
      const y = (Math.random() - 0.5) * 160;
      const z = (Math.random() - 0.5) * 80;

      particlePos[i * 3] = x;
      particlePos[i * 3 + 1] = y;
      particlePos[i * 3 + 2] = z;

      particleVel.push({
        // Movement vector: Top-Left (+X, -Y) drift towards Bottom-Right
        vx: Math.random() * 0.035 + 0.015,
        vy: -(Math.random() * 0.03 + 0.012),
        vz: (Math.random() - 0.5) * 0.015,
        phase: Math.random() * Math.PI * 2,
      });
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePos, 3)
    );

    // Glowing Particle Texture
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext("2d");
    const radGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    radGrad.addColorStop(0, "rgba(56, 189, 248, 0.95)");
    radGrad.addColorStop(0.4, "rgba(16, 185, 129, 0.5)");
    radGrad.addColorStop(1, "rgba(3, 7, 18, 0)");
    pCtx.fillStyle = radGrad;
    pCtx.fillRect(0, 0, 32, 32);

    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 1.8 : 2.4,
      map: particleTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // -------------------------------------------------------------
    // 6. Smooth Mouse Parallax & Interaction (Lerped Damping)
    // -------------------------------------------------------------
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      // Convert to normalized coordinates [-1, 1]
      mouse.targetX = (relX - 0.5) * 2;
      mouse.targetY = -(relY - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // -------------------------------------------------------------
    // 7. Handle Resize
    // -------------------------------------------------------------
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // -------------------------------------------------------------
    // 8. Main Animation Loop (Ultra-Slow Cinematic Motion)
    // -------------------------------------------------------------
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Mouse Lerp (Damping factor 0.03 for silky feel)
      mouse.x += (mouse.targetX - mouse.x) * 0.03;
      mouse.y += (mouse.targetY - mouse.y) * 0.03;

      // Parallax Camera Tilt
      camera.position.x = mouse.x * 6.0;
      camera.position.y = mouse.y * 4.0;
      camera.lookAt(0, 0, 0);

      // Subtle Scene Parallax Rotation
      strandGroup.rotation.y = mouse.x * 0.06;
      strandGroup.rotation.x = -mouse.y * 0.04;

      // -----------------------------------------------------------
      // Wave Deformation across Top-Left -> Bottom-Right Vector
      // -----------------------------------------------------------
      const positions = fabricGeo.attributes.position.array;
      const timeSlow = elapsedTime * 0.45; // Very slow, smooth movement

      for (let i = 0; i < posAttr.count; i++) {
        const x = initialPositions[i * 3];
        const y = initialPositions[i * 3 + 1];

        // Diagonal flow metric: top-left (x min, y max) to bottom-right (x max, y min)
        const diagPos = (x * 0.035 - y * 0.035);

        // Smooth multi-layered sine wave traveling diagonally
        const wave1 = Math.sin(diagPos - timeSlow) * 4.5;
        const wave2 = Math.cos(diagPos * 1.5 + timeSlow * 0.8) * 2.2;
        const wave3 = Math.sin(x * 0.02 + y * 0.02 + timeSlow * 0.5) * 1.5;

        // Apply Z-axis elevation displacement
        positions[i * 3 + 2] = wave1 + wave2 + wave3;
      }
      fabricGeo.attributes.position.needsUpdate = true;
      fabricGeo.computeVertexNormals();

      // -----------------------------------------------------------
      // Animate Interwoven Fiber Strands
      // -----------------------------------------------------------
      strand1.rotation.z = Math.sin(timeSlow * 0.5) * 0.04;
      strand2.rotation.z = Math.cos(timeSlow * 0.4) * 0.03;
      strand3.rotation.z = Math.sin(timeSlow * 0.6) * 0.05;

      // -----------------------------------------------------------
      // Animate Micro-Fiber Particles (Top-Left -> Bottom-Right Drift)
      // -----------------------------------------------------------
      const pArray = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const v = particleVel[i];

        // Advance particle position diagonally
        pArray[i * 3] += v.vx + Math.sin(elapsedTime + v.phase) * 0.01; // Move right (+X)
        pArray[i * 3 + 1] += v.vy;                                      // Move down (-Y)
        pArray[i * 3 + 2] += Math.cos(elapsedTime * 0.5 + v.phase) * 0.01;

        // Wrap around smoothly when particle leaves bottom-right boundary
        if (pArray[i * 3] > 120 || pArray[i * 3 + 1] < -90) {
          pArray[i * 3] = -120 + (Math.random() - 0.5) * 30; // Reset to top-left X
          pArray[i * 3 + 1] = 90 + (Math.random() - 0.5) * 20; // Reset to top-left Y
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // -------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      fabricGeo.dispose();
      fabricMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Subtle Radial Gradient Vignette Overlay to ensure 100% Text Readability */}
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/50 to-slate-950 pointer-events-none z-10" />

      {/* Soft Ambient Corner Glow Accents */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
    </div>
  );
};

export default HeroFlowBackground;
