import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];

        this.createGround();
        this.createLevel();
        this.createCoins();
        this.createClouds();
    }

    createGround() {
        // Extended ground with texture-like appearance
        const groundWidth = 150;
        const groundDepth = 30;

        const geometry = new THREE.BoxGeometry(groundWidth, 2, groundDepth);
        const material = new THREE.MeshStandardMaterial({
            color: 0x6BBF59,
            roughness: 0.85,
            metalness: 0.0
        });
        const ground = new THREE.Mesh(geometry, material);
        ground.position.set(25, -1, 0);
        ground.receiveShadow = true;
        ground.castShadow = true;
        this.scene.add(ground);
        this.colliders.push(ground);

        // Add underground layer for depth
        const underGeo = new THREE.BoxGeometry(groundWidth, 5, groundDepth);
        const underMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const underground = new THREE.Mesh(underGeo, underMat);
        underground.position.set(25, -5, 0);
        underground.receiveShadow = true;
        this.scene.add(underground);
    }

    createLevel() {
        // Enhanced materials
        const brickMat = new THREE.MeshStandardMaterial({
            color: 0xC84C09,
            roughness: 0.8,
            metalness: 0.0
        });

        const questionMat = new THREE.MeshStandardMaterial({
            color: 0xFBD000,
            roughness: 0.4,
            metalness: 0.3,
            emissive: 0xFBD000,
            emissiveIntensity: 0.25
        });

        const pipeMat = new THREE.MeshStandardMaterial({
            color: 0x00AA00,
            roughness: 0.6,
            metalness: 0.1
        });

        const createBlock = (x, y, z, material, isQuestion = false) => {
            const geo = new THREE.BoxGeometry(2, 2, 2);
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
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 96px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
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
            createBlock(i * 2, 2, 0, brickMat);
        }

        // First question block series
        createBlock(-4, 6, 0, questionMat, true);
        createBlock(0, 6, 0, questionMat, true);
        createBlock(4, 6, 0, questionMat, true);

        // Floating brick platforms
        for (let i = 0; i < 4; i++) {
            createBlock(8 + i * 2.5, 4, 0, brickMat);
        }

        // Pyramid structure
        createBlock(20, 2, 0, brickMat);
        createBlock(22, 2, 0, brickMat);
        createBlock(24, 2, 0, brickMat);
        createBlock(22, 4, 0, brickMat);
        createBlock(22, 6, 0, questionMat, true);

        // High platform with question blocks
        for (let i = 0; i < 5; i++) {
            createBlock(30 + i * 2.5, 8, 0, brickMat);
        }
        createBlock(34, 10, 0, questionMat, true);

        // Staircase up
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j <= i; j++) {
                createBlock(45 + i * 2, j * 2, 0, brickMat);
            }
        }

        // Staircase down
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j <= 4 - i; j++) {
                createBlock(56 + i * 2, j * 2, 0, brickMat);
            }
        }

        // Final question blocks
        for (let i = 0; i < 3; i++) {
            createBlock(68 + i * 4, 6, 0, questionMat, true);
        }

        // Pipes
        this.createPipe(-15, pipeMat);
        this.createPipe(15, pipeMat);
        this.createPipe(40, pipeMat);

        // Goal flag
        this.createFlag(80);
    }

    createPipe(x, material) {
        const pipeHeight = 6;
        const pipeRadius = 1.5;

        const pipeGeo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeHeight, 16);
        const pipe = new THREE.Mesh(pipeGeo, material);
        pipe.position.set(x, pipeHeight / 2, 0);
        pipe.castShadow = true;
        pipe.receiveShadow = true;
        this.scene.add(pipe);
        this.colliders.push(pipe);

        // Pipe rim
        const rimGeo = new THREE.CylinderGeometry(pipeRadius * 1.2, pipeRadius * 1.2, 0.5, 16);
        const rim = new THREE.Mesh(rimGeo, material);
        rim.position.set(x, pipeHeight, 0);
        rim.castShadow = true;
        this.scene.add(rim);
    }

    createFlag(x) {
        // Flag pole
        const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 10, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(x, 5, 0);
        pole.castShadow = true;
        this.scene.add(pole);

        // Flag
        const flagGeo = new THREE.PlaneGeometry(3, 2);
        const flagMat = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            side: THREE.DoubleSide
        });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(x + 1.5, 8.5, 0);
        flag.castShadow = true;
        this.scene.add(flag);
        this.flag = flag;
    }

    createCoins() {
        const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 16);
        const coinMat = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0xFFD700,
            emissiveIntensity: 0.3
        });

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
            const coin = new THREE.Mesh(coinGeo, coinMat);
            coin.position.set(...pos);
            coin.rotation.x = Math.PI / 2;
            coin.castShadow = true;
            this.scene.add(coin);
            this.coins.push(coin);
        });
    }

    createClouds() {
        const cloudMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

        for (let i = 0; i < 8; i++) {
            const cloud = new THREE.Group();

            // Create fluffy cloud shape
            const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), cloudMat);
            sphere1.position.set(0, 0, 0);
            cloud.add(sphere1);

            const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), cloudMat);
            sphere2.position.set(1.5, 0.3, 0);
            cloud.add(sphere2);

            const sphere3 = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), cloudMat);
            sphere3.position.set(-1.2, 0.2, 0);
            cloud.add(sphere3);

            cloud.position.set(
                Math.random() * 100 - 20,
                15 + Math.random() * 10,
                -5 - Math.random() * 5
            );

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
