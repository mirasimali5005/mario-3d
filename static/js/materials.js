import * as THREE from 'three';

export function createMaterials() {
    const materials = {};

    // Procedural Brick Texture
    const brickCanvas = document.createElement('canvas');
    brickCanvas.width = 512;
    brickCanvas.height = 512;
    const ctx = brickCanvas.getContext('2d');
    ctx.fillStyle = '#C84C09';
    ctx.fillRect(0, 0, 512, 512);

    // Brick pattern
    ctx.fillStyle = '#A03000';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (i % 2 === 0) {
                ctx.fillRect(j * 64, i * 64, 60, 58);
            } else {
                ctx.fillRect(j * 64 - 32, i * 64, 60, 58);
            }
        }
    }
    const brickTex = new THREE.CanvasTexture(brickCanvas);
    brickTex.colorSpace = THREE.SRGBColorSpace;

    materials.brickMat = new THREE.MeshStandardMaterial({
        map: brickTex,
        roughness: 0.3,
        metalness: 0.1
    });

    // Procedural Ground Texture
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 512;
    groundCanvas.height = 512;
    const gCtx = groundCanvas.getContext('2d');
    gCtx.fillStyle = '#6BBF59';
    gCtx.fillRect(0, 0, 512, 512);

    // Noise
    for (let i = 0; i < 5000; i++) {
        gCtx.fillStyle = Math.random() > 0.5 ? '#5AAD48' : '#7CCF6A';
        gCtx.fillRect(Math.random() * 512, Math.random() * 512, 4, 4);
    }
    const groundTex = new THREE.CanvasTexture(groundCanvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(10, 10);
    groundTex.colorSpace = THREE.SRGBColorSpace;

    materials.groundMat = new THREE.MeshStandardMaterial({
        map: groundTex,
        roughness: 0.8,
        metalness: 0.0
    });

    // Question Block
    materials.questionMat = new THREE.MeshStandardMaterial({
        color: 0xFBD000,
        roughness: 0.2,
        metalness: 0.6,
        emissive: 0xFBD000,
        emissiveIntensity: 0.2
    });

    // Pipe
    materials.pipeMat = new THREE.MeshStandardMaterial({
        color: 0x00AA00,
        roughness: 0.2,
        metalness: 0.4
    });

    return materials;
}
