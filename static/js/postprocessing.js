import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { SSRPass } from 'three/addons/postprocessing/SSRPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function setupPostProcessing(renderer, scene, camera) {
    const composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // SSAO (Ambient Occlusion)
    const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
    ssaoPass.kernelRadius = 16;
    ssaoPass.minDistance = 0.005;
    ssaoPass.maxDistance = 0.1;
    composer.addPass(ssaoPass);

    // SSR (Screen Space Reflections)
    const ssrPass = new SSRPass({
        renderer: renderer,
        scene: scene,
        camera: camera,
        width: window.innerWidth,
        height: window.innerHeight,
        groundReflector: null,
        selects: null
    });
    ssrPass.thickness = 0.018;
    ssrPass.infiniteThick = false;
    ssrPass.maxDistance = 0.1;
    composer.addPass(ssrPass);

    // Bloom
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.5;
    bloomPass.strength = 0.4;
    bloomPass.radius = 0.5;
    composer.addPass(bloomPass);

    // Output
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    return composer;
}
