import * as THREE from 'three';
import { createMarioMesh } from './mario_mesh.js';

export class Player {
    constructor(scene, camera, keyMap = null, color = 0x0000FF) {
        this.scene = scene;
        this.camera = camera;
        this.color = color;

        // Default to WASD if no keyMap provided
        this.keyMap = keyMap || {
            forward: 'KeyW',
            backward: 'KeyS',
            left: 'KeyA',
            right: 'KeyD',
            jump: 'Space'
        };

        this.position = new THREE.Vector3(-20, 3, 0);
        this.velocity = new THREE.Vector3();

        // Enhanced physics
        this.moveSpeed = 15; // Max speed
        this.acceleration = 50;
        this.friction = 10;
        this.airControl = 0.3; // Multiplier for air movement

        this.jumpForce = 20;
        this.gravity = 50; // Increased gravity for snappier feel
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
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };

        this.score = 0;

        this.createMesh();
        this.setupInputs();
        this.setupPointerLock();
        this.updateScoreDisplay();
    }

    createMesh() {
        this.mesh = createMarioMesh(this.color);
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
            case this.keyMap.forward: this.keys.forward = true; break;
            case this.keyMap.left: this.keys.left = true; break;
            case this.keyMap.backward: this.keys.backward = true; break;
            case this.keyMap.right: this.keys.right = true; break;
            case this.keyMap.jump:
                this.keys.jump = true;
                event.preventDefault();
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case this.keyMap.forward: this.keys.forward = false; break;
            case this.keyMap.left: this.keys.left = false; break;
            case this.keyMap.backward: this.keys.backward = false; break;
            case this.keyMap.right: this.keys.right = false; break;
            case this.keyMap.jump: this.keys.jump = false; break;
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

        if (this.keys.forward) moveDir.add(forward);
        if (this.keys.backward) moveDir.sub(forward);
        if (this.keys.left) moveDir.sub(right);
        if (this.keys.right) moveDir.add(right);

        // Normalize input vector
        if (moveDir.length() > 0) {
            moveDir.normalize();
        }

        // Apply acceleration
        const accel = this.isGrounded ? this.acceleration : this.acceleration * this.airControl;

        // Calculate target velocity based on input
        const targetVelX = moveDir.x * this.moveSpeed;
        const targetVelZ = moveDir.z * this.moveSpeed;

        // Smoothly interpolate current velocity towards target velocity (acceleration/friction)
        // We do this manually for more control than simple lerp

        // X Axis
        if (moveDir.x !== 0) {
            // Accelerating
            if (this.velocity.x < targetVelX) {
                this.velocity.x += accel * delta;
                if (this.velocity.x > targetVelX) this.velocity.x = targetVelX;
            } else {
                this.velocity.x -= accel * delta;
                if (this.velocity.x < targetVelX) this.velocity.x = targetVelX;
            }
        } else {
            // Decelerating (Friction)
            const friction = this.isGrounded ? this.friction : 0; // No air friction for now, or low
            if (this.velocity.x > 0) {
                this.velocity.x -= this.friction * this.moveSpeed * delta; // Scale friction by speed for snappy stop
                if (this.velocity.x < 0) this.velocity.x = 0;
            } else if (this.velocity.x < 0) {
                this.velocity.x += this.friction * this.moveSpeed * delta;
                if (this.velocity.x > 0) this.velocity.x = 0;
            }
        }

        // Z Axis
        if (moveDir.z !== 0) {
            // Accelerating
            if (this.velocity.z < targetVelZ) {
                this.velocity.z += accel * delta;
                if (this.velocity.z > targetVelZ) this.velocity.z = targetVelZ;
            } else {
                this.velocity.z -= accel * delta;
                if (this.velocity.z < targetVelZ) this.velocity.z = targetVelZ;
            }
        } else {
            // Decelerating (Friction)
            if (this.velocity.z > 0) {
                this.velocity.z -= this.friction * this.moveSpeed * delta;
                if (this.velocity.z < 0) this.velocity.z = 0;
            } else if (this.velocity.z < 0) {
                this.velocity.z += this.friction * this.moveSpeed * delta;
                if (this.velocity.z > 0) this.velocity.z = 0;
            }
        }

        // Face movement direction (visual only)
        if (moveDir.length() > 0) {
            const angle = Math.atan2(moveDir.x, moveDir.z);
            // Smooth rotation
            let rotDiff = angle - this.mesh.rotation.y;
            // Normalize angle to -PI to PI
            while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
            while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
            this.mesh.rotation.y += rotDiff * 10 * delta;
        }

        // Move X
        const oldPos = this.position.clone();
        this.position.x += this.velocity.x * delta;
        if (this.checkCollisions(colliders)) {
            this.position.x = oldPos.x;
            this.velocity.x = 0; // Stop on wall hit
        }

        // Move Z
        this.position.z += this.velocity.z * delta;
        if (this.checkCollisions(colliders)) {
            this.position.z = oldPos.z;
            this.velocity.z = 0; // Stop on wall hit
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
            this.reset();
        }

        // Jump
        if (this.keys.jump && this.isGrounded) {
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

    reset() {
        this.position.set(-20, 3, 0);
        this.velocity.set(0, 0, 0);
        this.cameraYaw = 0;
        this.cameraPitch = 0.4;
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
