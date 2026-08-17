import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const HeroFabricBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const isMobile = window.innerWidth < 768;

    // Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.0022);

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    camera.position.set(0, 5, 95);

    // WebGL Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x030712, 1);
    container.appendChild(renderer.domElement);

    // -------------------------------------------------------------
    // 1. Primary Smooth Satin Textile Mesh
    // -------------------------------------------------------------
    const planeW = 240;
    const planeH = 170;
    const segsX = isMobile ? 50 : 100;
    const segsY = isMobile ? 40 : 80;

    const fabricGeo = new THREE.PlaneGeometry(planeW, planeH, segsX, segsY);
    const fabricPos = fabricGeo.attributes.position;
    const origPositions = new Float32Array(fabricPos.array.length);
    for (let i = 0; i < fabricPos.array.length; i++) {
      origPositions[i] = fabricPos.array[i];
    }

    const fabricMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.28,
      metalness: 0.35,
      wireframe: false,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });

    const fabricMesh = new THREE.Mesh(fabricGeo, fabricMat);
    fabricMesh.rotation.x = -Math.PI / 3.2;
    fabricMesh.position.set(0, -12, -5);
    scene.add(fabricMesh);

    // Wireframe Overlay for High-Tech AI Weave Aesthetic
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireMesh = new THREE.Mesh(fabricGeo, wireMat);
    wireMesh.rotation.x = -Math.PI / 3.2;
    wireMesh.position.set(0, -11.8, -4.8);
    scene.add(wireMesh);

    // -------------------------------------------------------------
    // 2. Interwoven 3D Recycled Fiber Ribbon Strands
    // -------------------------------------------------------------
    const ribbonGeo = new THREE.PlaneGeometry(260, 100, isMobile ? 40 : 80, 40);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.18,
      metalness: 0.6,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.rotation.x = -Math.PI / 3.8;
    ribbonMesh.rotation.z = Math.PI / 14;
    ribbonMesh.position.set(0, -2, -25);
    scene.add(ribbonMesh);

    // Deep Backdrop Wave Layer for Depth of Field
    const backGeo = new THREE.PlaneGeometry(280, 140, 40, 30);
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x047857,
      roughness: 0.5,
      metalness: 0.2,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.rotation.x = -Math.PI / 4;
    backMesh.position.set(0, 10, -50);
    scene.add(backMesh);

    // -------------------------------------------------------------
    // 3. Floating Textile Micro-Fiber Dust Motes
    // -------------------------------------------------------------
    const particleCount = isMobile ? 90 : 160;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 240;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 160;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: Math.random() * 0.05 + 0.02,
        z: (Math.random() - 0.5) * 0.04,
      });
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    // Glowing Fiber Particle Canvas Texture
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext("2d");
    const radGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    radGrad.addColorStop(0, "rgba(56, 189, 248, 0.95)");
    radGrad.addColorStop(0.3, "rgba(16, 185, 129, 0.6)");
    radGrad.addColorStop(1, "rgba(3, 7, 18, 0)");
    pCtx.fillStyle = radGrad;
    pCtx.fillRect(0, 0, 32, 32);
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 2.8,
      map: particleTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // -------------------------------------------------------------
    // 4. Volumetric Lighting & Atmospheric Shading
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.4);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 4.5, 280);
    cyanLight.position.set(-70, 50, 60);
    scene.add(cyanLight);

    const electricBlueLight = new THREE.PointLight(0x2563eb, 5.0, 320);
    electricBlueLight.position.set(70, -30, 70);
    scene.add(electricBlueLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 3.2, 240);
    emeraldLight.position.set(0, 60, -20);
    scene.add(emeraldLight);

    // Directional Rim Light for Silk Specular Highlights
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(0, 80, 100);
    scene.add(rimLight);

    // -------------------------------------------------------------
    // 5. Mouse Parallax & Smooth Damping Logic
    // -------------------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      targetMouseX = (x / rect.width - 0.5) * 2;
      targetMouseY = (y / rect.height - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    // -------------------------------------------------------------
    // 6. Animation Loop (60fps Fluid Wave Simulation)
    // -------------------------------------------------------------
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Smooth Lerp Mouse Parallax
      mouseX += (targetMouseX - mouseX) * 0.035;
      mouseY += (targetMouseY - mouseY) * 0.035;

      camera.position.x = mouseX * 9;
      camera.position.y = 5 - mouseY * 7;
      camera.lookAt(0, 0, 0);

      // Displace Primary Fabric Mesh Vertices & Recalculate Normals for Satin Sheen
      const posArr = fabricGeo.attributes.position.array;
      for (let i = 0; i < posArr.length; i += 3) {
        const u = origPositions[i];
        const v = origPositions[i + 1];

        // Multi-frequency organic sine wave (simulating heavy fluid silk fabric)
        const zWave =
          Math.sin(u * 0.05 + elapsed * 0.9) * 5.2 +
          Math.cos(v * 0.07 + elapsed * 0.7) * 4.0 +
          Math.sin((u * 0.8 + v * 1.2) * 0.035 + elapsed * 1.1) * 3.2;

        posArr[i + 2] = zWave;
      }
      fabricGeo.attributes.position.needsUpdate = true;
      fabricGeo.computeVertexNormals();

      // Displace Secondary Interwoven Ribbon
      const ribArr = ribbonGeo.attributes.position.array;
      for (let i = 0; i < ribArr.length; i += 3) {
        const u = ribbonGeo.attributes.position.array[i];
        const v = ribbonGeo.attributes.position.array[i + 1];

        const zWave =
          Math.cos(u * 0.045 - elapsed * 0.65) * 7.0 +
          Math.sin(v * 0.06 + elapsed * 0.85) * 4.8;

        ribArr[i + 2] = zWave;
      }
      ribbonGeo.attributes.position.needsUpdate = true;

      // Drift Floating Micro-Fiber Particles
      const pPositions = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pPositions[i * 3 + 1] += particleVelocities[i].y;

        // Reset if drifted beyond top boundary
        if (pPositions[i * 3 + 1] > 80) {
          pPositions[i * 3 + 1] = -80;
          pPositions[i * 3] = (Math.random() - 0.5) * 240;
        }

        // Slight fluid sway
        pPositions[i * 3] += Math.sin(elapsed * 0.5 + i) * 0.02;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Orbit Volumetric Lights for Shimmering Material Reflection
      cyanLight.position.x = Math.sin(elapsed * 0.35) * 90;
      cyanLight.position.z = Math.cos(elapsed * 0.35) * 70 + 20;

      electricBlueLight.position.x = Math.cos(elapsed * 0.28) * 85;
      electricBlueLight.position.y = Math.sin(elapsed * 0.4) * 50 - 20;

      emeraldLight.position.x = Math.sin(elapsed * 0.25) * 75;
      emeraldLight.position.y = Math.cos(elapsed * 0.35) * 45;

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

      fabricGeo.dispose();
      fabricMat.dispose();
      wireMat.dispose();
      ribbonGeo.dispose();
      ribbonMat.dispose();
      backGeo.dispose();
      backMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#030712] pointer-events-none select-none">
      {/* Three.js WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Cinematic Dark Radial Vignette overlay to guarantee 100% text readability */}
      <div className="absolute inset-0 bg-radial from-slate-950/30 via-slate-950/75 to-slate-950/98 pointer-events-none" />

      {/* Subtle Cyan/Emerald Glow Orbs for ambient depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[48rem] h-[28rem] bg-blue-600/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[36rem] h-[36rem] bg-emerald-500/08 rounded-full filter blur-[140px] pointer-events-none" />
    </div>
  );
};

export default HeroFabricBackground;
