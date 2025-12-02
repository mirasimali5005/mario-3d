import * as THREE from 'three';
import { Player } from './player.js';
import { World } from './world.js';
import { setupLights } from './lights.js';

// Post-processing
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { SSRPass } from 'three/addons/postprocessing/SSRPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ReflectorForSSRPass } from 'three/addons/objects/ReflectorForSSRPass.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: false }); // Antialias false for post-processing

        this.setupRenderer();
        this.setupLights();

        this.world = new World(this.scene);
        this.player = new Player(this.scene, this.camera);

        this.setupPostProcessing();

        this.clock = new THREE.Clock();
        this.fpsCounter = document.getElementById('fps-counter');
        this.frameCount = 0;
        this.lastTime = 0;

        window.addEventListener('resize', () => this.onWindowResize(), false);

        this.animate();
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        document.body.appendChild(this.renderer.domElement);
    }

    setupLights() {
        setupLights(this.scene);
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // SSAO (Ambient Occlusion)
        const ssaoPass = new SSAOPass(this.scene, this.camera, window.innerWidth, window.innerHeight);
        ssaoPass.kernelRadius = 16;
        ssaoPass.minDistance = 0.005;
        ssaoPass.maxDistance = 0.1;
        this.composer.addPass(ssaoPass);

        // SSR (Screen Space Reflections)
        const ssrPass = new SSRPass({
            renderer: this.renderer,
            scene: this.scene,
            camera: this.camera,
            width: window.innerWidth,
            height: window.innerHeight,
            groundReflector: null,
            selects: null
        });
        ssrPass.thickness = 0.018;
        ssrPass.infiniteThick = false;
        ssrPass.maxDistance = 0.1;
        this.composer.addPass(ssrPass);

        // Bloom
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0.5;
        bloomPass.strength = 0.4;
        bloomPass.radius = 0.5;
        this.composer.addPass(bloomPass);

        // Output
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) {
            this.fpsCounter.innerText = `FPS: ${this.frameCount}`;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        this.player.update(delta, this.world.colliders);
        this.world.update(delta);
        this.updateFPS();

        // Use composer for rendering
        this.composer.render();
    }
}

// Start the game
new Game();
