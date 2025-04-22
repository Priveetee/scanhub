<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';
  
  export let colorStops: string[] = ["#5D8BF4", "#F686BD", "#82DBF7"];
  export let speed: number = 0.002;
  export let amplitude: number = 0.3;
  export let onReady: (() => void) | undefined = undefined;
  
  export let particleCount: number = 300;
  export let particleSpread: number = 15 * amplitude;
  export let moveParticlesOnHover: boolean = false;
  export let particleHoverFactor: number = 0.1;
  export let alphaParticles: boolean = false;
  export let particleBaseSize: number = 60;
  export let sizeRandomness: number = 0.8;
  export let cameraDistance: number = 30;
  export let disableRotation: boolean = false;
  export let backgroundColor: string = "#0F0F17";
  
  function hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map((c: string) => c + c).join('');
    }
    const int = parseInt(hex, 16);
    const r = ((int >> 16) & 255) / 255;
    const g = ((int >> 8) & 255) / 255;
    const b = (int & 255) / 255;
    return [r, g, b];
  }
  
  const vertex = /* glsl */ `
    attribute vec3 position;
    attribute vec4 random;
    attribute vec3 color;
    
    uniform mat4 modelMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;
    uniform float uTime;
    uniform float uSpread;
    uniform float uBaseSize;
    uniform float uSizeRandomness;
    
    varying vec4 vRandom;
    varying vec3 vColor;
    
    void main() {
      vRandom = random;
      vColor = color;
      
      vec3 pos = position * uSpread;
      pos.z *= 5.0;
      
      vec4 mPos = modelMatrix * vec4(pos, 1.0);
      float t = uTime;
      mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.01, 0.1, random.x);
      mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.01, 0.1, random.w);
      mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.01, 0.1, random.z);
      
      vec4 mvPos = viewMatrix * mPos;
      gl_PointSize = max(3.0, (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz));
      gl_Position = projectionMatrix * mvPos;
    }
  `;

  const fragment = /* glsl */ `
    precision highp float;
    
    uniform float uTime;
    uniform float uAlphaParticles;
    varying vec4 vRandom;
    varying vec3 vColor;
    
    void main() {
      vec2 uv = gl_PointCoord.xy;
      float d = length(uv - vec2(0.5));
      
      if(uAlphaParticles < 0.5) {
        if(d > 0.5) {
          discard;
        }
        gl_FragColor = vec4(vColor * 1.5 + 0.3, 1.0);
      } else {
        float circle = smoothstep(0.5, 0.1, d) * 0.8;
        gl_FragColor = vec4(vColor * 1.5 + 0.3, circle);
      }
    }
  `;
  
  let container: HTMLElement | undefined;
  let mousePos = { x: 0, y: 0 };
  let renderer: Renderer | undefined;
  let animationFrameId: number | undefined;
  
  onMount(() => {
    if (!container) return;
    
    renderer = new Renderer({
      depth: false,
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2)
    });
    
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    
    const bgColor = hexToRgb(backgroundColor);
    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], 1);
    
    const camera = new Camera(gl, { fov: 25 });
    camera.position.set(0, 0, cameraDistance);
    
    const resize = () => {
      if (!renderer || !container) return;
// For debug    console.log("Resizing:", container.clientWidth, container.clientHeight); // Debug log
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos = { x, y };
    };
    
    if (moveParticlesOnHover) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    
    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette = colorStops;
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random());
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      positions.set([x, y, z], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      
      const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(col, i * 3);
    }
    
    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });
    
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });
    
    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    
    let lastTime = performance.now();
    let elapsed = 0;
    
    const update = (t: number) => {
      animationFrameId = requestAnimationFrame(update);
      const delta = t - lastTime;
      lastTime = t;
      elapsed += delta * speed;
      
      program.uniforms.uTime.value = elapsed * 0.001;
      
      if (moveParticlesOnHover) {
        particles.position.x = -mousePos.x * particleHoverFactor;
        particles.position.y = -mousePos.y * particleHoverFactor;
      } else {
        particles.position.x = 0;
        particles.position.y = 0;
      }
      
      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.00002) * 0.03;
        particles.rotation.y = Math.cos(elapsed * 0.00003) * 0.03;
        particles.rotation.z += 0.0005 * speed;
      }
      
      if (renderer) {
        renderer.render({ scene: particles, camera });
      }
    };
    
    animationFrameId = requestAnimationFrame(update);
    
    if (typeof onReady === 'function') {
      onReady();
    }
    
    return () => {
      window.removeEventListener('resize', resize);
      if (moveParticlesOnHover && container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  });
  
  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    if (renderer && container) {
      const canvas = renderer.gl.canvas;
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
      
// Clean up WebGL context
      renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  });
</script>

<div 
  bind:this={container} 
  class="w-full h-full absolute inset-0"
  style="background: {backgroundColor};"
></div>
