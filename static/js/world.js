import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];

        // Maze settings
        this.cellSize = 4;
        this.rows = 15;
        this.cols = 15;
        this.width = this.cols * this.cellSize;
        this.depth = this.rows * this.cellSize;

        this.createGround();
        this.createMaze();
    }

    createGround() {
        // Limit ground to maze size
        const geometry = new THREE.PlaneGeometry(this.width, this.depth);
        const material = new THREE.MeshStandardMaterial({
            color: 0x228B22, // Grass Green
            roughness: 1.0,
            metalness: 0.0
        });
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, 0, 0); // Centered at 0,0
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.colliders.push(ground);
    }

    createMaze() {
        // Recursive Backtracker Algorithm
        const grid = [];
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push({
                    r, c,
                    visited: false,
                    walls: { top: true, right: true, bottom: true, left: true }
                });
            }
            grid.push(row);
        }

        const stack = [];
        const start = grid[0][0];
        start.visited = true;
        stack.push(start);

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = [];

            // Check neighbors
            const dirs = [
                { r: -1, c: 0, wall: 'top', opp: 'bottom' },
                { r: 0, c: 1, wall: 'right', opp: 'left' },
                { r: 1, c: 0, wall: 'bottom', opp: 'top' },
                { r: 0, c: -1, wall: 'left', opp: 'right' }
            ];

            for (let d of dirs) {
                const nr = current.r + d.r;
                const nc = current.c + d.c;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && !grid[nr][nc].visited) {
                    neighbors.push({ cell: grid[nr][nc], dir: d });
                }
            }

            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                // Remove walls
                current.walls[next.dir.wall] = false;
                next.cell.walls[next.dir.opp] = false;
                next.cell.visited = true;
                stack.push(next.cell);
            } else {
                stack.pop();
            }
        }

        // Render Maze
        const wallHeight = 4;
        const wallThickness = 0.5;
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Wood/Brick

        // Offset to center the maze
        const offsetX = -this.width / 2 + this.cellSize / 2;
        const offsetZ = -this.depth / 2 + this.cellSize / 2;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = grid[r][c];
                const x = c * this.cellSize + offsetX;
                const z = r * this.cellSize + offsetZ;

                // Top Wall
                if (cell.walls.top) {
                    const w = new THREE.Mesh(new THREE.BoxGeometry(this.cellSize, wallHeight, wallThickness), wallMat);
                    w.position.set(x, wallHeight / 2, z - this.cellSize / 2);
                    w.castShadow = true;
                    w.receiveShadow = true;
                    this.scene.add(w);
                    this.colliders.push(w);
                }
                // Bottom Wall (only for last row usually, but redundancy is fine)
                if (cell.walls.bottom && r === this.rows - 1) {
                    const w = new THREE.Mesh(new THREE.BoxGeometry(this.cellSize, wallHeight, wallThickness), wallMat);
                    w.position.set(x, wallHeight / 2, z + this.cellSize / 2);
                    w.castShadow = true;
                    w.receiveShadow = true;
                    this.scene.add(w);
                    this.colliders.push(w);
                }
                // Left Wall
                if (cell.walls.left) {
                    const w = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, this.cellSize), wallMat);
                    w.position.set(x - this.cellSize / 2, wallHeight / 2, z);
                    w.castShadow = true;
                    w.receiveShadow = true;
                    this.scene.add(w);
                    this.colliders.push(w);
                }
                // Right Wall
                if (cell.walls.right && c === this.cols - 1) {
                    const w = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, this.cellSize), wallMat);
                    w.position.set(x + this.cellSize / 2, wallHeight / 2, z);
                    w.castShadow = true;
                    w.receiveShadow = true;
                    this.scene.add(w);
                    this.colliders.push(w);
                }

                // Add pillars at corners to fill gaps
                const pillar = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, wallThickness), wallMat);
                pillar.position.set(x - this.cellSize / 2, wallHeight / 2, z - this.cellSize / 2);
                this.scene.add(pillar);
                this.colliders.push(pillar);
            }
        }
    }
}
