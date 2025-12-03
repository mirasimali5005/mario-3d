import * as THREE from 'three';

export function createMarioMesh(color = 0x0000FF) {
    const mesh = new THREE.Group();

    // Enhanced Mario materials
    const redMat = new THREE.MeshStandardMaterial({
        color: color, // Custom color (Red/Green/Blue)
        roughness: 0.6,
        metalness: 0.1,
        envMapIntensity: 1.0
    });
    const blueMat = new THREE.MeshStandardMaterial({
        color: 0x0000FF,
        roughness: 0.7,
        metalness: 0.1
    });
    const skinMat = new THREE.MeshStandardMaterial({
        color: 0xFFCCAA,
        roughness: 0.3, // Sweaty skin?
        metalness: 0.0
    });
    const brownMat = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.4, // Leather boots
        metalness: 0.0
    });
    const blackMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.2,
        metalness: 0.0
    });
    const whiteMat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.2,
        metalness: 0.0
    });

    const createBox = (w, h, d, mat, x, y, z) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const box = new THREE.Mesh(geo, mat);
        box.position.set(x, y, z);
        box.castShadow = true;
        box.receiveShadow = true;
        mesh.add(box);
    };

    // Detailed Mario model
    // Head
    createBox(0.7, 0.7, 0.7, skinMat, 0, 1.4, 0);

    // Hat
    createBox(0.75, 0.3, 0.75, redMat, 0, 1.8, 0);
    createBox(0.8, 0.12, 0.4, redMat, 0, 1.68, 0.38);

    // Eyes (white)
    createBox(0.15, 0.15, 0.05, whiteMat, -0.2, 1.45, 0.36);
    createBox(0.15, 0.15, 0.05, whiteMat, 0.2, 1.45, 0.36);

    // Pupils
    createBox(0.08, 0.08, 0.05, blackMat, -0.2, 1.45, 0.38);
    createBox(0.08, 0.08, 0.05, blackMat, 0.2, 1.45, 0.38);

    // Nose
    createBox(0.2, 0.2, 0.25, skinMat, 0, 1.35, 0.4);

    // Mustache
    createBox(0.6, 0.18, 0.18, blackMat, 0, 1.25, 0.38);

    // Body (shirt)
    createBox(0.8, 0.8, 0.55, redMat, 0, 0.75, 0);

    // Overalls
    createBox(0.85, 0.55, 0.58, blueMat, 0, 0.5, 0);

    // Overalls straps
    createBox(0.18, 0.8, 0.58, blueMat, -0.28, 0.75, 0);
    createBox(0.18, 0.8, 0.58, blueMat, 0.28, 0.75, 0);

    // Buttons
    createBox(0.12, 0.12, 0.05, whiteMat, -0.28, 0.9, 0.3);
    createBox(0.12, 0.12, 0.05, whiteMat, 0.28, 0.9, 0.3);

    // Legs
    createBox(0.32, 0.65, 0.38, blueMat, -0.22, 0.12, 0);
    createBox(0.32, 0.65, 0.38, blueMat, 0.22, 0.12, 0);

    // Shoes
    createBox(0.38, 0.28, 0.55, brownMat, -0.22, -0.14, 0.12);
    createBox(0.38, 0.28, 0.55, brownMat, 0.22, -0.14, 0.12);

    // Arms
    createBox(0.28, 0.7, 0.28, redMat, -0.55, 0.75, 0);
    createBox(0.28, 0.7, 0.28, redMat, 0.55, 0.75, 0);

    // Gloves
    createBox(0.32, 0.32, 0.32, whiteMat, -0.55, 0.4, 0);
    createBox(0.32, 0.32, 0.32, whiteMat, 0.55, 0.4, 0);

    return mesh;
}
