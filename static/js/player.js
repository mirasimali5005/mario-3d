import * as THREE from 'three';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Start higher to avoid initial stuck
        this.position = new THREE.Vector3(0, 5, 0);
        this.velocity = new THREE.Vector3();

        this.moveSpeed = 10;
        this.jumpForce = 15;
        this.gravity = 30;

        this.isGrounded = false;

        // Player dimensions (Box)
        this.size = new THREE.Vector3(0.8, 1.8, 0.8);

        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        };

        this.createMesh();
        this.setupInputs();
    }

    createMesh() {
        this.mesh = new THREE.Group();

        // Materials
        const redMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const blueMat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffccaa });
        const brownMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

        const createBox = (w, h, d, mat, x, y, z) => {
            const geo = new THREE.BoxGeometry(w, h, d);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.mesh.add(mesh);
        };

        // Simplified Voxel Mario
        // Head
        createBox(0.5, 0.5, 0.5, skinMat, 0, 1.5, 0);
        createBox(0.52, 0.2, 0.52, redMat, 0, 1.7, 0); // Hat
        // Body
        createBox(0.6, 0.6, 0.4, redMat, 0, 1.0, 0);
        createBox(0.62, 0.4, 0.42, blueMat, 0, 0.8, 0); // Overalls
        // Legs
        createBox(0.2, 0.5, 0.2, blueMat, -0.2, 0.3, 0);
        createBox(0.2, 0.5, 0.2, blueMat, 0.2, 0.3, 0);

        this.scene.add(this.mesh);
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
            case 'Space': this.keys.space = true; break;
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
        // 1. Physics Step
        this.velocity.y -= this.gravity * delta;

        // 2. Horizontal Movement
        const moveDir = new THREE.Vector3();
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

        if (this.keys.w) moveDir.add(forward);
        if (this.keys.s) moveDir.sub(forward);
        if (this.keys.a) moveDir.sub(right);
        if (this.keys.d) moveDir.add(right);

        if (moveDir.length() > 0) {
            moveDir.normalize();
            this.mesh.lookAt(this.mesh.position.clone().add(moveDir));
        }

        // 3. Collision Detection & Resolution
        // We move X, check, move Z, check, move Y, check.

        const oldPos = this.position.clone();

        // Move X
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
                // Hit ground
                this.isGrounded = true;
                this.velocity.y = 0;
                // Snap to integer-ish? Or just revert.
                // Reverting is safe but might be jittery.
                // Let's revert and add a tiny epsilon to stay above.
                // Actually, simple revert is fine if we don't sink deep.

                // Better: Find the contact point? Too complex for now.
                // Simple fix: Revert Y.
                this.position.y -= this.velocity.y * delta;

                // Ensure we are slightly above ground to avoid immediate collision next frame?
                // Or just rely on the fact that gravity will pull us down again.
                // The issue before was likely that we were *already* intersecting.
            } else if (this.velocity.y > 0) {
                // Hit ceiling
                this.velocity.y = 0;
                this.position.y -= this.velocity.y * delta;
            }
        }

        // World Floor Safety
        if (this.position.y < -10) {
            this.position.set(0, 5, 0);
            this.velocity.set(0, 0, 0);
        }

        // 4. Jump
        if (this.keys.space && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            // Move up slightly to break ground contact
            this.position.y += 0.1;
        }

        this.mesh.position.copy(this.position);

        // Camera Follow
        const targetPos = this.position.clone().add(new THREE.Vector3(0, 8, 12));
        this.camera.position.lerp(targetPos, 0.1);
        this.camera.lookAt(this.position);
    }

    checkCollisions(colliders) {
        // Create a box for the player
        const playerBox = new THREE.Box3();
        // Center the box on player position
        const min = new THREE.Vector3(
            this.position.x - this.size.x / 2,
            this.position.y, // Anchor at feet? No, mesh is centered usually.
            // My mesh creation code: y=0 is feet?
            // In createMesh: Legs start at y=0.3.
            // Let's assume position is at the feet (y=0).
            // But createMesh offsets everything up.
            // Let's define the box relative to `this.position`.
            // If `this.position` is the center of the base:
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
}
