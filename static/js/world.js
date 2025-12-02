import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createMarioMesh } from './mario_mesh.js';
import { createCoinMesh } from './coin_mesh.js';
import { createCloudMesh } from './cloud_mesh.js';
import { createMaterials } from './materials.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];

        this.createMaterials();
        this.createGround();
        this.createLevel();
        this.createCoins();
        this.createCoins();
        this.createClouds();
        this.createNPCs();
    }

    createNPCs() {
        // NPC 1
        const npc1 = createMarioMesh();
        npc1.position.set(-5, 3, 5);
        npc1.rotation.y = Math.PI / 4;
        this.scene.add(npc1);
        this.colliders.push(npc1); // Optional: make them solid

        // NPC 2
        const npc2 = createMarioMesh();
        npc2.position.set(5, 3, 5);
        npc2.rotation.y = -Math.PI / 4;
        this.scene.add(npc2);
        this.colliders.push(npc2);
    }

    createMaterials() {
        const materials = createMaterials();
        this.brickMat = materials.brickMat;
        this.groundMat = materials.groundMat;
        this.questionMat = materials.questionMat;
        this.pipeMat = materials.pipeMat;
    }

    createGround() {
        const groundWidth = 150;
        const groundDepth = 30;

        const geometry = new THREE.BoxGeometry(groundWidth, 2, groundDepth);
        const ground = new THREE.Mesh(geometry, this.groundMat);
        ground.position.set(25, -1, 0);
        ground.receiveShadow = true;
        ground.castShadow = true;
        this.scene.add(ground);
        this.colliders.push(ground);

        // Add underground layer for depth
        const underGeo = new THREE.BoxGeometry(groundWidth, 5, groundDepth);
        const underMat = new THREE.MeshStandardMaterial({ color: 0x5C3A21 });
        const underground = new THREE.Mesh(underGeo, underMat);
        underground.position.set(25, -5, 0);
        underground.receiveShadow = true;
        this.scene.add(underground);
    }

    createLevel() {
        const createBlock = (x, y, z, material, isQuestion = false) => {
            const geo = new RoundedBoxGeometry(2, 2, 2, 4, 0.2);
            const block = new THREE.Mesh(geo, material);
            block.position.set(x, y, z);
            block.castShadow = true;
            block.receiveShadow = true;
            this.scene.add(block);
            this.colliders.push(block);

            if (isQuestion) {
                // Add ? symbol
                const canvas = document.createElement('canvas');
                canvas.width = 128;
                canvas.height = 128;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#000000'; // Shadow
                ctx.font = 'bold 96px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', 68, 68);

                ctx.fillStyle = '#FFFFFF';
                ctx.fillText('?', 64, 64);

                const texture = new THREE.CanvasTexture(canvas);
                const symbolMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
                const symbolGeo = new THREE.PlaneGeometry(1.6, 1.6);

                const sides = [
                    { pos: [0, 0, 1.01], rot: [0, 0, 0] },
                    { pos: [0, 0, -1.01], rot: [0, Math.PI, 0] },
                    { pos: [1.01, 0, 0], rot: [0, Math.PI / 2, 0] },
                    { pos: [-1.01, 0, 0], rot: [0, -Math.PI / 2, 0] }
                ];

                sides.forEach(side => {
                    const symbol = new THREE.Mesh(symbolGeo, symbolMat);
                    symbol.position.set(...side.pos);
                    symbol.rotation.set(...side.rot);
                    block.add(symbol);
                });
            }

            return block;
        };

        // Starting area
        for (let i = -10; i < -4; i++) {
            createBlock(i * 2, 2, 0, this.brickMat);
        }

        // First question block series
        createBlock(-4, 6, 0, this.questionMat, true);
        createBlock(0, 6, 0, this.questionMat, true);
        createBlock(4, 6, 0, this.questionMat, true);

        // Floating brick platforms
        for (let i = 0; i < 4; i++) {
            createBlock(8 + i * 2.5, 4, 0, this.brickMat);
        }

        // Pyramid structure
        createBlock(20, 2, 0, this.brickMat);
        createBlock(22, 2, 0, this.brickMat);
        createBlock(24, 2, 0, this.brickMat);
        createBlock(22, 4, 0, this.brickMat);
        createBlock(22, 6, 0, this.questionMat, true);

        // High platform with question blocks
        for (let i = 0; i < 5; i++) {
            createBlock(30 + i * 2.5, 8, 0, this.brickMat);
        }
        createBlock(34, 10, 0, this.questionMat, true);

        // Staircase up
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j <= i; j++) {
                createBlock(45 + i * 2, j * 2, 0, this.brickMat);
            }
        }

        // Staircase down
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j <= 4 - i; j++) {
                createBlock(56 + i * 2, j * 2, 0, this.brickMat);
            }
        }

        // Final question blocks
        for (let i = 0; i < 3; i++) {
            createBlock(68 + i * 4, 6, 0, this.questionMat, true);
        }

        // Pipes
        this.createPipe(-15, this.pipeMat);
        this.createPipe(15, this.pipeMat);
        this.createPipe(40, this.pipeMat);

        // Goal flag
        this.createFlag(80);
    }

    createPipe(x, material) {
        const pipeHeight = 6;
        const pipeRadius = 1.5;

        const pipeGeo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeHeight, 32);
        const pipe = new THREE.Mesh(pipeGeo, material);
        pipe.position.set(x, pipeHeight / 2, 0);
        pipe.castShadow = true;
        pipe.receiveShadow = true;
        this.scene.add(pipe);
        this.colliders.push(pipe);

        // Pipe rim
        const rimGeo = new THREE.CylinderGeometry(pipeRadius * 1.2, pipeRadius * 1.2, 0.5, 32);
        const rim = new THREE.Mesh(rimGeo, material);
        rim.position.set(x, pipeHeight, 0);
        rim.castShadow = true;
        this.scene.add(rim);
    }

    createFlag(x) {
        // Flag pole
        const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 10, 16);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.8, roughness: 0.2 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(x, 5, 0);
        pole.castShadow = true;
        this.scene.add(pole);

        // Flag
        const flagGeo = new THREE.PlaneGeometry(3, 2);
        const flagMat = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            side: THREE.DoubleSide,
            roughness: 0.6
        });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(x + 1.5, 8.5, 0);
        flag.castShadow = true;
        this.scene.add(flag);
        this.flag = flag;
    }

    createCoins() {
        this.coins = [];

        const coinPositions = [
            [-4, 8, 0], [0, 8, 0], [4, 8, 0],
            [10, 6, 0], [13, 6, 0], [16, 6, 0],
            [22, 8, 0],
            [34, 12, 0],
            [50, 10, 0],
            [68, 8, 0], [72, 8, 0], [76, 8, 0]
        ];

        coinPositions.forEach(pos => {
            const coin = createCoinMesh();
            coin.position.set(...pos);
            this.scene.add(coin);
            this.coins.push(coin);
        });
    }

    removeCoin(coin) {
        const index = this.coins.indexOf(coin);
        if (index > -1) {
            this.coins.splice(index, 1);
            this.scene.remove(coin);
        }
    }

    createClouds() {
        for (let i = 0; i < 15; i++) {
            const cloud = createCloudMesh();

            cloud.position.set(
                Math.random() * 200 - 50,
                15 + Math.random() * 15,
                -10 - Math.random() * 20
            );

            // Random scale
            const scale = 0.8 + Math.random() * 0.5;
            cloud.scale.set(scale, scale, scale);

            this.scene.add(cloud);
        }
    }

    update(delta) {
        // Rotate coins
        if (this.coins) {
            this.coins.forEach(coin => {
                coin.rotation.z += delta * 3;
            });
        }

        // Wave flag
        if (this.flag) {
            this.flag.rotation.y = Math.sin(Date.now() * 0.003) * 0.2;
        }
    }
}
