<script>
    import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
    import { onMount, onDestroy } from 'svelte';
  
    /**
     * Aurora component props
     * @typedef {Object} AuroraProps
     * @property {[string, string, string]} colorStops - Three color stops for the gradient
     * @property {number} speed - Animation speed
     * @property {number} amplitude - Wave amplitude
     * @property {() => void} onReady - Callback when component is ready
     */
  
    /** @type {[string, string, string]} */
    export let colorStops = ["#3A29FF", "#FF94B4", "#FF3232"];
    /** @type {number} */
    export let speed = 1.0;
    /** @type {number} */
    export let amplitude = 1.0;
    /** @type {(() => void) | undefined} */
    export let onReady = undefined;
  
    /** @type {HTMLDivElement} */
    let container;
    /** @type {Renderer | null} */
    let renderer = null;
    /** @type {number} */
    let rafId = 0;
  
    // Vertex Shader
    const VERT = `#version 300 es
      in vec2 uv;
      in vec2 position;
      out vec2 vUv;
      void main() {
          vUv = uv;
          gl_Position = vec4(position, 0.0, 1.0);
      }`;
  
    // Fragment Shader
    const FRAG = `#version 300 es
      precision highp float;
      uniform float uTime;
      uniform float uAmplitude;
      uniform vec3 uColorStops[3];
      in vec2 vUv;
      out vec4 fragColor;
  
      vec3 permute(vec3 x) {
          return mod(((x * 34.0) + 1.0) * x, 289.0);
      }
  
      float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                            -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m * m;
          m = m * m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x = a0.x * x0.x + h.x * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
      }
  
      void main() {
          float noise = snoise(vec2(vUv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
          noise = exp(noise);
          float height = (vUv.y * 2.0 - noise + 0.2);
          
          vec3 color1 = uColorStops[0];
          vec3 color2 = uColorStops[1];
          vec3 color3 = uColorStops[2];
          
          float t = vUv.x;
          vec3 color;
          if (t < 0.5) {
              color = mix(color1, color2, t * 2.0);
          } else {
              color = mix(color2, color3, (t - 0.5) * 2.0);
          }
          
          fragColor.rgb = 0.6 * height * color;
          fragColor.a = 1.0;
      }`;
  
    let isBrowser = typeof window !== 'undefined';
  
    onMount(() => {
      if (!isBrowser) return;
  
      // Create WebGL renderer
      renderer = new Renderer({ dpr: Math.min(2, window.devicePixelRatio) });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
  
      container.appendChild(gl.canvas);
  
      // Handle resize to match container dimensions
      const handleResize = () => {
        if (container && renderer) {
          renderer.setSize(container.offsetWidth, container.offsetHeight);
        }
      };
  
      window.addEventListener('resize', handleResize);
      handleResize();
  
      // Create triangle geometry covering entire screen
      const geometry = new Triangle(gl);
      geometry.addAttribute('uv', {
        size: 2,
        data: new Float32Array([0, 0, 2, 0, 0, 2])
      });
  
      // Convert hex colors to RGB arrays
      const colorStopsArray = colorStops.map(hex => {
        const color = new Color(hex);
        return [color.r, color.g, color.b];
      });
  
      // Create shader program
      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: amplitude },
          uColorStops: { value: colorStopsArray }
        }
      });
  
      // Create mesh with geometry and program
      const mesh = new Mesh(gl, { geometry, program });
  
      let startTime = performance.now();
  
      // Animation loop
      const animate = () => {
        if (typeof window !== 'undefined') {
          rafId = requestAnimationFrame(animate);
        if (!renderer) return;
        
        const currentTime = performance.now();
        const elapsedTime = (currentTime - startTime) * 0.001; // Convert to seconds
        
        // Update uniforms with current props
        program.uniforms.uTime.value = elapsedTime * speed;
        program.uniforms.uAmplitude.value = amplitude;
        
        // Update colors if they change
        const updatedColors = colorStops.map(hex => {
          const color = new Color(hex);
          return [color.r, color.g, color.b];
        });
        program.uniforms.uColorStops.value = updatedColors;
  
        renderer.render({ scene: mesh });
      }
      };
  
      if (typeof window !== 'undefined') {
        rafId = requestAnimationFrame(animate);
      }
      if (onReady) onReady();
    });
  
    onDestroy(() => {
      // Vérifier si nous sommes dans un environnement navigateur
      if (typeof window !== 'undefined') {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', () => {});
        
        if (renderer && container) {
          const gl = renderer.gl;
          if (gl.canvas && container.contains(gl.canvas)) {
            container.removeChild(gl.canvas);
          }
          gl.getExtension('WEBGL_lose_context')?.loseContext();
          renderer = null;
        }
      }
    });
  </script>
  
  <div 
    bind:this={container} 
    class="w-full h-full absolute inset-0"
    style="background: transparent"
  ></div>