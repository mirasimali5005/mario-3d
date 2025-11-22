import * as THREE from 'three';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.position = new THREE.Vector3(-20, 3, 0);
        this.velocity = new THREE.Vector3();

        // Enhanced physics
        this.moveSpeed = 10;
        this.jumpForce = 20;
        this.gravity = 30;
        this.maxFallSpeed = 50;

        this.isGrounded = false;
        this.size = new THREE.Vector3(1.2, 1.8, 1.2);

        // Camera control
        this.cameraDistance = 12;
        this.cameraHeight = 6;
        this.cameraYaw = 0;
        this.cameraPitch = 0.4;
        this.mouseSensitivity = 0.002;
        this.isPointerLocked = false;

        // Smooth camera
        this.currentCameraPos = new THREE.Vector3();
        this.targetCameraPos = new THREE.Vector3();

        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        };

        this.score = 0;

        this.createMesh();
        this.setupInputs();
        this.setupPointerLock();
        this.updateScoreDisplay();
    }

    createMesh() {
        this.mesh = new THREE.Group();

        // Enhanced Mario materials
        const redMat = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            roughness: 0.7,
            metalness: 0.0
        });
        const blueMat = new THREE.MeshStandardMaterial({
            color: 0x0000FF,
            roughness: 0.75,
            metalness: 0.0
        });
        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xFFCCAA,
            roughness: 0.9,
            metalness: 0.0
        });
        const brownMat = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.0
        });
        const blackMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.95,
            metalness: 0.0
        });
        const whiteMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.6,
            metalness: 0.0
        });

        const createBox = (w, h, d, mat, x, y, z) => {
            const geo = new THREE.BoxGeometry(w, h, d);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.mesh.add(mesh);
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

        this.scene.add(this.mesh);
    }

    setupPointerLock() {
        const canvas = document.querySelector('canvas');

        canvas.addEventListener('click', () => {
            canvas.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === canvas;
            if (this.isPointerLocked) {
                document.getElementById('controls-hint').style.display = 'none';
            } else {
                document.getElementById('controls-hint').style.display = 'block';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                this.cameraYaw -= e.movementX * this.mouseSensitivity;
                this.cameraPitch -= e.movementY * this.mouseSensitivity;

                // Clamp pitch
                this.cameraPitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 2.5, this.cameraPitch));
            }
        });
    }

    setupInputs() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW': this.keys.w = true; break;
            case 'KeyA': this.keys.a = true; break;
            case 'KeyS': this.keys.s = true; break;
            case 'KeyD': this.keys.d = true; break;
            case 'Space':
                this.keys.space = true;
                event.preventDefault();
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW': this.keys.w = false; break;
            case 'KeyA': this.keys.a = false; break;
            case 'KeyS': this.keys.s = false; break;
            case 'KeyD': this.keys.d = false; break;
            case 'Space': this.keys.space = false; break;
        }
    }

    update(delta, colliders) {
        // Apply gravity
        this.velocity.y -= this.gravity * delta;
        this.velocity.y = Math.max(this.velocity.y, -this.maxFallSpeed);

        // Calculate movement direction based on camera
        const moveDir = new THREE.Vector3();
        const forward = new THREE.Vector3(
            Math.sin(this.cameraYaw),
            0,
            Math.cos(this.cameraYaw)
        );
        const right = new THREE.Vector3(
            Math.sin(this.cameraYaw + Math.PI / 2),
            0,
            Math.cos(this.cameraYaw + Math.PI / 2)
        );

        if (this.keys.w) moveDir.add(forward);
        if (this.keys.s) moveDir.sub(forward);
        if (this.keys.a) moveDir.sub(right);
        if (this.keys.d) moveDir.add(right);

        // Face movement direction
        if (moveDir.length() > 0) {
            moveDir.normalize();
            const angle = Math.atan2(moveDir.x, moveDir.z);
            this.mesh.rotation.y = angle;
        }

        // Move X
        const oldPos = this.position.clone();
        this.position.x += moveDir.x * this.moveSpeed * delta;
        if (this.checkCollisions(colliders)) {
            this.position.x = oldPos.x;
        }

        // Move Z
        this.position.z += moveDir.z * this.moveSpeed * delta;
        if (this.checkCollisions(colliders)) {
            this.position.z = oldPos.z;
        }

        // Move Y
        this.position.y += this.velocity.y * delta;
        this.isGrounded = false;

        if (this.checkCollisions(colliders)) {
            if (this.velocity.y < 0) {
                this.isGrounded = true;
                this.velocity.y = 0;
                this.position.y = oldPos.y;
            } else if (this.velocity.y > 0) {
                this.velocity.y = 0;
                this.position.y = oldPos.y;
            }
        }

        // Respawn if fall
        if (this.position.y < -20) {
            this.position.set(-20, 3, 0);
            this.velocity.set(0, 0, 0);
        }

        // Jump
        if (this.keys.space && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }

        this.mesh.position.copy(this.position);

        // Smooth camera follow
        const camX = this.position.x - Math.sin(this.cameraYaw) * this.cameraDistance * Math.cos(this.cameraPitch);
        const camY = this.position.y + this.cameraHeight + Math.sin(this.cameraPitch) * this.cameraDistance;
        const camZ = this.position.z - Math.cos(this.cameraYaw) * this.cameraDistance * Math.cos(this.cameraPitch);

        this.targetCameraPos.set(camX, camY, camZ);

        if (this.currentCameraPos.length() === 0) {
            this.currentCameraPos.copy(this.targetCameraPos);
        }

        this.currentCameraPos.lerp(this.targetCameraPos, 0.15);
        this.camera.position.copy(this.currentCameraPos);
        this.camera.lookAt(this.position.x, this.position.y + 1, this.position.z);

        // Collect coins
        this.checkCoinCollection();
    }

    checkCollisions(colliders) {
        const playerBox = new THREE.Box3();
        const min = new THREE.Vector3(
            this.position.x - this.size.x / 2,
            this.position.y,
            this.position.z - this.size.z / 2
        );
        const max = new THREE.Vector3(
            this.position.x + this.size.x / 2,
            this.position.y + this.size.y,
            this.position.z + this.size.z / 2
        );
        playerBox.set(min, max);

        for (let collider of colliders) {
            const colliderBox = new THREE.Box3().setFromObject(collider);
            if (playerBox.intersectsBox(colliderBox)) {
                return true;
            }
        }
        return false;
    }

    checkCoinCollection() {
        // This would need access to world.coins, simplified for now
        // In a better implementation, pass coins array or use event system
    }

    updateScoreDisplay() {
        // Update score in UI if needed
    }
}
