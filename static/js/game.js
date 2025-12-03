import * as THREE from 'three';
import { Player } from './player.js';
import { World } from './world.js';
import { setupLights } from './lights.js';
import { setupPostProcessing } from './postprocessing.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, (window.innerWidth / 2) / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: false }); // Antialias false for post-processing

        this.setupRenderer();
        this.setupLights();

        this.world = new World(this.scene);

        // Player 1 (Mario - WASD - Blue/Red)
        this.player = new Player(this.scene, this.camera);

        // Player 2 (Luigi - Arrows - Green)
        this.camera2 = new THREE.PerspectiveCamera(75, (window.innerWidth / 2) / window.innerHeight, 0.1, 1000);
        const p2Keys = {
            forward: 'ArrowUp',
            backward: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight',
            jump: 'ShiftRight'
        };
        this.player2 = new Player(this.scene, this.camera2, p2Keys, 0x00FF00);
        this.player2.position.x = -15; // Start slightly apart

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
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = (width / 2) / height;
        this.camera.updateProjectionMatrix();

        this.camera2.aspect = (width / 2) / height;
        this.camera2.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        if (this.composer) {
            this.composer.setSize(width, height);
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
        this.player2.update(delta, this.world.colliders);
        this.world.update(delta);
        this.updateFPS();

        // Split Screen Rendering
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setScissorTest(true);

        // Player 1 (Left)
        this.renderer.setScissor(0, 0, width / 2, height);
        this.renderer.setViewport(0, 0, width / 2, height);
        this.composer.render(); // Uses main camera (P1)

        // Player 2 (Right)
        // Note: Post-processing is tricky with split screen in this setup.
        // For simplicity, we'll render P2 without post-processing or we'd need 2 composers.
        // Let's try to just render P2 scene directly for now to ensure it works.
        this.renderer.setScissor(width / 2, 0, width / 2, height);
        this.renderer.setViewport(width / 2, 0, width / 2, height);
        this.renderer.render(this.scene, this.camera2);

        this.renderer.setScissorTest(false);
    }
}

// Start the game
new Game();
