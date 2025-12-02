import * as THREE from 'three';
import { Player } from './player.js';
import { World } from './world.js';
import { setupLights } from './lights.js';
import { setupPostProcessing } from './postprocessing.js';

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
        this.composer = setupPostProcessing(this.renderer, this.scene, this.camera);
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
