import * as THREE from 'three';

export function createCloudMesh() {
    const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.9,
        metalness: 0.0,
        emissive: 0x333333
    });

    const cloud = new THREE.Group();

    // Create fluffy cloud shape
    const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 16), cloudMat);
    sphere1.position.set(0, 0, 0);
    cloud.add(sphere1);

    const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), cloudMat);
    sphere2.position.set(1.5, 0.3, 0);
    cloud.add(sphere2);

    const sphere3 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), cloudMat);
    sphere3.position.set(-1.2, 0.2, 0);
    cloud.add(sphere3);

    return cloud;
}
