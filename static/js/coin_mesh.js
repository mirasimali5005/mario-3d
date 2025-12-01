import * as THREE from 'three';

export function createCoinMesh() {
    const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32);
    const coinMat = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        metalness: 1.0,
        roughness: 0.1,
        emissive: 0xFFD700,
        emissiveIntensity: 0.4
    });

    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.rotation.x = Math.PI / 2;
    coin.castShadow = true;
    return coin;
}
