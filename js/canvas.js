// Shaders
    const vertexShader = `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        float displacement = sin(position.x * 5.0 + uTime) * 0.05
                           + sin(position.y * 7.0 + uTime * 1.5) * 0.03
                           + sin(position.z * 6.0 + uTime * 2.0) * 0.04;
        vec3 newPos = position + normal * displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      uniform sampler2D uGradient;
      uniform float uOpacity;
      void main() {
        vec4 texColor = texture2D(uGradient, vUv);
        gl_FragColor = vec4(texColor.rgb, texColor.a * uOpacity);
      }
    `;

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setSize(70, 70);
    document.getElementById('globeContainer').appendChild(renderer.domElement);

    // Gradient texture
    function createGradientTexture(color1, color2) {
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(size/2, size/2, size*0.1, size/2, size/2, size/2);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(canvas);
    }

    const layers = [];
    const colors = [
      ['#7b2ff7', '#f107a3'],
      ['#0ff', '#08f'],
      ['#a0eaff', '#00416a']
    ];

    colors.forEach((pair, i) => {
      const gradientTex = createGradientTexture(pair[0], pair[1]);
      const uniforms = {
        uTime: { value: 0 },
        uGradient: { value: gradientTex },
        uOpacity: { value: 0.15 + i * 0.1 }
      };

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });

      const geometry = new THREE.SphereGeometry(1 - i * 0.1, 64, 64);
      const mesh = new THREE.Mesh(geometry, material);
      layers.push(mesh);
      scene.add(mesh);
    });

    function animate(time = 0) {
      time *= 0.001;
      layers.forEach((layer, i) => {
        layer.material.uniforms.uTime.value = time;
        layer.rotation.y = time * (0.1 + i * 0.05);
        layer.rotation.x = time * (0.05 + i * 0.03);
      });
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    // Optional: ensure responsive canvas
    window.addEventListener('resize', () => {
      renderer.setSize(70, 70);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    });
