import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * WaterFlowBackground
 * 
 * A high-performance WebGL shader-based water flow animation background.
 * - Flow direction: Top-Right to Bottom-Left.
 * - Realistic fluid water currents, caustics, wave distortion, and glossy reflections.
 * - No mesh grid / wireframe / fabric texture.
 * - Floating translucent water droplets / bubble particles drifting down-left.
 * - Mouse interactive water ripple displacement.
 */

const WaterFlowBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId;
    const isMobile = window.innerWidth < 768;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Mouse tracking for interactive water disturbance
    const mouse = new THREE.Vector2(0.5, 0.5);
    const targetMouse = new THREE.Vector2(0.5, 0.5);

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMouse.set(x, y);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Custom WebGL Liquid Water Flow Shader
    const waterVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const waterFragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      varying vec2 vUv;

      // 2D Simplex/Perlin noise helper functions for fluid motion
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      // Fractional Brownian Motion (FBM) for multi-layered water turbulence
      float fbm(vec2 p) {
        float val = 0.0;
        float amp = 0.5;
        float freq = 1.0;
        for (int i = 0; i < 4; i++) {
          val += amp * snoise(p * freq);
          freq *= 2.05;
          amp *= 0.48;
        }
        return val;
      }

      void main() {
        vec2 st = gl_FragCoord.xy / uResolution.xy;
        float aspect = uResolution.x / uResolution.y;
        st.x *= aspect;

        // Flow Direction Vector: TOP-RIGHT to BOTTOM-LEFT (-x, -y)
        vec2 flowDir = normalize(vec2(-0.85, -0.65));
        float t = uTime * 0.35;

        // Base UV position animated along Top-Right to Bottom-Left flow
        vec2 flowUv = st + flowDir * t;

        // Mouse interaction wave ripple
        vec2 mouseSt = uMouse;
        mouseSt.x *= aspect;
        float distToMouse = distance(st, mouseSt);
        float mouseRipple = sin(distToMouse * 25.0 - uTime * 6.0) * exp(-distToMouse * 4.0) * 0.12;

        // Fluid Warp 1: Primary water stream currents
        vec2 q = vec2(0.0);
        q.x = fbm(flowUv * 2.2 + vec2(0.0, 0.0) + mouseRipple);
        q.y = fbm(flowUv * 2.2 + vec2(1.7, 3.2) - mouseRipple);

        // Fluid Warp 2: Secondary caustic ripples & turbulence
        vec2 r = vec2(0.0);
        r.x = fbm(flowUv * 3.5 + 1.2 * q + vec2(1.7, 9.2) + vec2(-t * 0.4, -t * 0.4));
        r.y = fbm(flowUv * 3.5 + 1.2 * q + vec2(8.3, 2.8) + vec2(-t * 0.3, -t * 0.5));

        // Combined water surface noise height map
        float waterHeight = fbm(flowUv * 2.8 + r);

        // Calculate water surface normals for glossy specular reflections
        float e = 0.005;
        float hL = fbm((flowUv - vec2(e, 0.0)) * 2.8 + r);
        float hR = fbm((flowUv + vec2(e, 0.0)) * 2.8 + r);
        float hD = fbm((flowUv - vec2(0.0, e)) * 2.8 + r);
        float hU = fbm((flowUv + vec2(0.0, e)) * 2.8 + r);
        vec3 normal = normalize(vec3(hL - hR, hD - hU, 0.15));

        // Light direction for liquid highlight reflection (coming from top-right)
        vec3 lightDir = normalize(vec3(0.6, 0.8, 0.7));
        float diff = max(dot(normal, lightDir), 0.0);
        float spec = pow(max(dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0)), 0.0), 32.0);

        // Rich Oceanic & Aqua Palette
        vec3 deepAbyss    = vec3(0.01, 0.04, 0.10);  // Dark deep water base (#030a1a)
        vec3 oceanBlue    = vec3(0.02, 0.22, 0.48);  // Mid ocean blue (#05387a)
        vec3 aquaCurrent  = vec3(0.02, 0.52, 0.78);  // Vibrant aqua current (#0585c7)
        vec3 brightCyan   = vec3(0.04, 0.75, 0.88);  // Glowing cyan water surge (#0bc0e0)
        vec3 foamHighlight= vec3(0.70, 0.94, 1.00);  // Sunlight water specular shimmer (#b3f0ff)

        // Blend liquid colors based on flow warping and height map
        vec3 color = mix(deepAbyss, oceanBlue, clamp(waterHeight * 1.4, 0.0, 1.0));
        color = mix(color, aquaCurrent, clamp(length(q), 0.0, 1.0));
        color = mix(color, brightCyan, clamp(r.x * r.y * 1.8, 0.0, 1.0));

        // Add caustics network lines (liquid light refractions)
        float caustic = pow(1.0 - abs(snoise(flowUv * 6.0 + r * 2.0)), 3.0);
        color += aquaCurrent * caustic * 0.35;

        // Add specular sunlight highlights on liquid surface waves
        color += foamHighlight * spec * 0.45;
        color += foamHighlight * pow(diff, 4.0) * 0.15;

        // Vignette at edges for dark hero integration
        float edgeDist = length((vUv - 0.5) * 1.2);
        color *= smoothstep(1.4, 0.3, edgeDist);

        gl_FragColor = vec4(color, 0.95);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    };

    const waterMaterial = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: uniforms,
      transparent: true,
    });

    const planeGeo = new THREE.PlaneGeometry(2, 2);
    const planeMesh = new THREE.Mesh(planeGeo, waterMaterial);
    scene.add(planeMesh);

    // -----------------------------------------------------------------
    // Floating Water Bubbles / Droplets Particle System
    // Drifting from Top-Right (X+, Y+) to Bottom-Left (X-, Y-)
    // -----------------------------------------------------------------
    const bubbleCount = isMobile ? 45 : 90;
    const bubblePositions = new Float32Array(bubbleCount * 3);
    const bubbleData = [];

    for (let i = 0; i < bubbleCount; i++) {
      // Spread across screen bounds (-1 to 1)
      const x = (Math.random() - 0.3) * 2.4;
      const y = (Math.random() - 0.3) * 2.4;
      const z = Math.random() * 0.5;

      bubblePositions[i * 3] = x;
      bubblePositions[i * 3 + 1] = y;
      bubblePositions[i * 3 + 2] = z;

      bubbleData.push({
        // Diagonal velocity moving towards Bottom-Left
        vx: -(Math.random() * 0.003 + 0.0015),
        vy: -(Math.random() * 0.004 + 0.002),
        wobbleSpeed: Math.random() * 2 + 1,
        wobbleAmp: Math.random() * 0.0015 + 0.0005,
        size: Math.random() * 0.04 + 0.015,
        baseX: x,
        baseY: y,
      });
    }

    // Create custom smooth circle texture for glowing water bubbles
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const radGrad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    radGrad.addColorStop(0, "rgba(224, 242, 254, 0.9)");
    radGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.5)");
    radGrad.addColorStop(0.7, "rgba(6, 182, 212, 0.2)");
    radGrad.addColorStop(1, "rgba(2, 132, 199, 0)");
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    const bubbleTexture = new THREE.CanvasTexture(canvas);
    const bubbleGeo = new THREE.BufferGeometry();
    bubbleGeo.setAttribute("position", new THREE.BufferAttribute(bubblePositions, 3));

    const bubbleMat = new THREE.PointsMaterial({
      size: isMobile ? 0.06 : 0.08,
      map: bubbleTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const bubbleParticles = new THREE.Points(bubbleGeo, bubbleMat);
    scene.add(bubbleParticles);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update uniforms
      uniforms.uTime.value = elapsedTime;
      
      // Smoothly interpolate mouse position for fluid disturbance
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;
      uniforms.uMouse.value.copy(mouse);

      // Animate Water Bubbles diagonally Top-Right -> Bottom-Left
      const positions = bubbleGeo.attributes.position.array;
      for (let i = 0; i < bubbleCount; i++) {
        const b = bubbleData[i];

        // Move position towards bottom-left
        positions[i * 3] += b.vx + Math.sin(elapsedTime * b.wobbleSpeed + i) * b.wobbleAmp;
        positions[i * 3 + 1] += b.vy;

        // Wrap around when bubble exits bottom or left edge
        if (positions[i * 3] < -1.4 || positions[i * 3 + 1] < -1.4) {
          // Re-spawn near top or right edge
          if (Math.random() > 0.5) {
            positions[i * 3] = Math.random() * 1.2 + 0.2; // Right side
            positions[i * 3 + 1] = 1.3;                    // Top
          } else {
            positions[i * 3] = 1.3;                        // Right
            positions[i * 3 + 1] = Math.random() * 1.2 + 0.2; // Top side
          }
        }
      }
      bubbleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      waterMaterial.dispose();
      planeGeo.dispose();
      bubbleGeo.dispose();
      bubbleMat.dispose();
      bubbleTexture.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{ minHeight: "100%" }}
    />
  );
};

export default WaterFlowBackground;
