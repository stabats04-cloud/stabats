/**
 * Stabats - 3D Organic Particle Sphere (Dynamic Morphing Orb)
 * High-performance WebGL / Three.js custom shader implementation
 * - Spherical contour: closer to a round sphere while maintaining dynamic organic wave undulations
 * - Front-facing only interactive mouse repulsion (back side particles do not react)
 * - 48,400 dense particles (220x220 lattice)
 * - Layered with "Architecting Intelligence." behind the orb, and "Engineering Scale." in front of the orb
 */

(function initParticleOrbModule() {
  function init() {
    const container = document.getElementById('particle-orb-container');
    const canvas = document.getElementById('particle-orb-canvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    let scene, camera, renderer, pointsMesh, material;
    let width = container.clientWidth || 720;
    let height = container.clientHeight || 720;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isVisible = true;

    // Interactive mouse tracking in 3D world space
    const targetMouseWorld = new THREE.Vector3(999, 999, 0);
    const currentMouseWorld = new THREE.Vector3(999, 999, 0);
    let mouseActiveTarget = 0.0;
    let currentMouseActive = 0.0;

    // 1. Scene & Perspective Camera with generous view frustum
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // 2. High-Performance WebGL Renderer with Alpha Transparency
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // 100% transparent background

    // 3. Hyper-Dense Sphere Geometry (440x440 = 193,600 particles, radius 2.065)
    const sphereRadius = 2.065;
    const geometry = new THREE.SphereGeometry(sphereRadius, 440, 440);

    // 4. Custom GLSL Shader Material: Refined Spherical Form with Living Dynamic Surface
    const vertexShader = `
      uniform float uTime;
      uniform vec3 uMousePos;
      uniform float uMouseActive;
      uniform float uPixelRatio;

      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vDisplacement;
      varying float vDepth;

      // Stefan Gustavson's Simplex Noise 3D
      vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
      vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v){
        const vec2  C = vec2(1.0/6.0, 1.0/3.0);
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0);
        vec4 p = permute( permute( permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
      }

      void main() {
        vec3 norm = normalize(position);
        vNormal = norm;

        // Controlled organic wave displacement:
        // Silhouette stays close to a round sphere, while waves, folds, and ripples move dynamically
        float t = uTime * 0.38;
        float broadNoise  = snoise(norm * 1.25 + vec3(t * 0.25, t * 0.20, 0.10)) * 0.095;
        float ribbonFold  = sin(norm.x * 2.8 + norm.y * 3.6 + norm.z * 1.8 + t * 0.85) * 0.065;
        float rippleNoise = snoise(norm * 3.2 - vec3(t * 0.32, 0.0, t * 0.26)) * 0.040;

        float totalDisp = broadNoise + ribbonFold + rippleNoise;
        vDisplacement = totalDisp;

        // Displace along spherical normal
        vec3 displacedPos = position + norm * totalDisp;

        // Compute world position
        vec3 worldBasePos = (modelMatrix * vec4(displacedPos, 1.0)).xyz;

        // Camera-space normal: positive Z faces directly towards the viewer
        vec3 eyeNorm = normalize(mat3(modelViewMatrix) * norm);
        
        // Only particles facing towards the user react to the mouse pointer
        // Particles on the other side of the orb (backside) do NOT react at all
        float facingViewer = clamp(eyeNorm.z, 0.0, 1.0);
        float frontOnlyFactor = smoothstep(0.04, 0.40, facingViewer);

        float interactiveSizeBoost = 0.0;

        if (uMouseActive > 0.01 && frontOnlyFactor > 0.001) {
          vec2 diff = worldBasePos.xy - uMousePos.xy;
          float dist = length(diff);
          
          // Polar angle around cursor center for circular modulation
          float angle = atan(diff.y, diff.x);
          
          // Dynamic organic contour near to a circle (base radius 1.45)
          float contourPulse = sin(angle * 3.0 + uTime * 3.2) * 0.08
                             + cos(angle * 5.0 - uTime * 2.6) * 0.05
                             + sin(angle * 2.0 + uTime * 1.5) * 0.04;
          float repelRadius = 1.45 + contourPulse;

          if (dist < repelRadius) {
            float normDist = dist / repelRadius; // 0.0 at cursor center, 1.0 at outer circular rim
            
            // Smooth circular boundary falloff
            float envelope = smoothstep(1.0, 0.0, normDist) * uMouseActive * frontOnlyFactor;
            
            // Dynamically changing concentric liquid ripple waves
            float dynamicWave = sin(normDist * 9.42 - uTime * 5.5) * 0.5 + 0.5;
            
            // Directional vectors
            vec2 repelDir = dist > 0.001 ? normalize(diff) : vec2(0.0, 1.0);
            vec2 swirlDir = vec2(-repelDir.y, repelDir.x);
            
            // Dynamic radial push with breathing magnitude
            float dynamicPush = (0.34 + 0.08 * sin(uTime * 3.6 + normDist * 6.28)) * (1.0 - normDist * 0.65);
            worldBasePos.xy += repelDir * (dynamicPush * envelope);
            
            // Subtle dynamic vortex swirl around the circular perimeter
            worldBasePos.xy += swirlDir * (sin(uTime * 3.8 - normDist * 8.0) * 0.045 * envelope);
            
            // Dynamic 3D depth impulse: cratering depression at center, cresting ripple wave at ring
            float depthWave = (sin(normDist * 3.14159) * 0.20 + sin(normDist * 12.56 - uTime * 4.8) * 0.065);
            worldBasePos.z += depthWave * envelope;
            
            // Dynamic iridescent light shift along the ripples
            vDisplacement += (sin(normDist * 6.28 - uTime * 5.5) * 0.09) * envelope;
            
            // Dynamic visual feedback: subtle point size boost along the circular wave crest
            interactiveSizeBoost = dynamicWave * envelope * 0.28;
          }
        }

        vec4 mvPosition = viewMatrix * vec4(worldBasePos, 1.0);
        vWorldPosition = worldBasePos;
        vDepth = -mvPosition.z;

        // Point size calibrated for hyper-dense 194k particle sphere
        float baseSize = 1.55 * uPixelRatio * (1.0 + interactiveSizeBoost);
        gl_PointSize = baseSize * (6.6 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      precision highp float;

      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vDisplacement;
      varying float vDepth;

      void main() {
        // Anti-aliased circular point sprite
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;
        float circleAlpha = smoothstep(0.5, 0.2, dist);

        // Normalized horizontal coordinate (-1.0 on left to +1.0 on right)
        float xGrad = clamp((vWorldPosition.x / 2.22) * 0.5 + 0.5, 0.0, 1.0);
        
        // Exact reference color palette:
        // 1. Far Left rim: warm glowing peach / coral
        vec3 colPeach  = vec3(1.0, 0.68, 0.48);
        // 2. Left hemisphere: rich vibrant neon pink / magenta
        vec3 colPink   = vec3(0.94, 0.14, 0.62);
        // 3. Center fold & core: deep royal purple / violet
        vec3 colPurple = vec3(0.48, 0.10, 0.76);
        // 4. Center-right: intense indigo / electric blue
        vec3 colIndigo = vec3(0.22, 0.32, 0.94);
        // 5. Far Right rim: vivid neon cyan / sky blue
        vec3 colCyan   = vec3(0.15, 0.72, 0.98);

        // Chroma gradient across the sphere
        vec3 color;
        if (xGrad < 0.20) {
          float f = xGrad / 0.20;
          color = mix(colPeach, colPink, f);
        } else if (xGrad < 0.46) {
          float f = (xGrad - 0.20) / 0.26;
          color = mix(colPink, colPurple, f);
        } else if (xGrad < 0.74) {
          float f = (xGrad - 0.46) / 0.28;
          color = mix(colPurple, colIndigo, f);
        } else {
          float f = (xGrad - 0.74) / 0.26;
          color = mix(colIndigo, colCyan, f);
        }

        // Shading with depth in crevices
        if (vDisplacement < 0.0) {
          color = mix(color, colPurple * 0.45, clamp(-vDisplacement * 4.5, 0.0, 0.65));
        } else {
          color += vec3(0.12, 0.08, 0.16) * (vDisplacement * 3.5);
        }

        // Soft volumetric depth modulation:
        // Complete solid full 360 sphere without missing points
        float depthAlpha = mix(0.72, 1.0, smoothstep(9.5, 5.5, vDepth));
        float finalAlpha = circleAlpha * depthAlpha;

        gl_FragColor = vec4(color, finalAlpha);
      }
    `;

    material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMousePos: { value: new THREE.Vector3(999, 999, 0) },
        uMouseActive: { value: 0.0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    pointsMesh = new THREE.Points(geometry, material);
    scene.add(pointsMesh);

    // Initial slight angle twist matching reference
    pointsMesh.rotation.z = -0.15;
    pointsMesh.rotation.x = 0.18;

    // 5. Mouse Pointer Tracking & Interaction
    const heroSection = container.closest('section') || document.body;

    function handlePointerMove(clientX, clientY) {
      if (!canvas || !camera) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      // Unproject NDC coordinates to world space at z = 0 plane
      const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const worldPos = camera.position.clone().add(dir.multiplyScalar(dist));

      targetMouseWorld.set(worldPos.x, worldPos.y, 0);
      mouseActiveTarget = 1.0;

      // Gentle ambient tilt (scaled by 20%)
      targetRotationY = Math.max(-0.42, Math.min(0.42, ndcX * 0.36));
      targetRotationX = Math.max(-0.42, Math.min(0.42, -ndcY * 0.24));
    }

    heroSection.addEventListener('mousemove', (e) => {
      handlePointerMove(e.clientX, e.clientY);
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      mouseActiveTarget = 0.0;
      targetRotationX = 0;
      targetRotationY = 0;
    }, { passive: true });

    heroSection.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    heroSection.addEventListener('touchend', () => {
      mouseActiveTarget = 0.0;
    }, { passive: true });

    // 6. Resize Observer
    function handleResize() {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 1.5);
    }

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Visibility: pause WebGL when scrolled past the hero or document is hidden
    function updateOrbVisibility() {
      const isScrolledPast = window.scrollY > (window.innerHeight * 0.90);
      isVisible = !isScrolledPast && document.visibilityState === 'visible';
    }

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) {
        isVisible = false;
      } else {
        updateOrbVisibility();
      }
    }, { threshold: 0.01 });
    io.observe(container);

    window.addEventListener('scroll', updateOrbVisibility, { passive: true });
    document.addEventListener('visibilitychange', updateOrbVisibility);

    // 7. Dynamic Animation Loop
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for mouse position and active repulsion weight
      currentMouseWorld.lerp(targetMouseWorld, 0.16);
      currentMouseActive += (mouseActiveTarget - currentMouseActive) * 0.10;

      // Update shader uniforms
      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uMousePos.value.copy(currentMouseWorld);
      material.uniforms.uMouseActive.value = currentMouseActive;

      // Continuous dynamic 3D rotation & organic undulating tumble
      pointsMesh.rotation.y += 0.003;
      pointsMesh.rotation.x += (targetRotationX + 0.08 * Math.sin(elapsedTime * 0.36) - pointsMesh.rotation.x) * 0.04;
      pointsMesh.rotation.z += (Math.cos(elapsedTime * 0.30) * 0.07 - pointsMesh.rotation.z) * 0.03;

      renderer.render(scene, camera);
    }

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
