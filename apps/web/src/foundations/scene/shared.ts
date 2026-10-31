import * as THREE from 'three';

export const materials = {
  metal: new THREE.MeshStandardMaterial({ color: '#9aa0a8', metalness: 0.5, roughness: 0.35 }),
  handle: new THREE.MeshStandardMaterial({ color: '#a9b8a0', roughness: 0.6 }),
  yarn: new THREE.MeshStandardMaterial({ color: '#d6a1a5', roughness: 0.9 }),
  row: new THREE.MeshStandardMaterial({ color: '#c8a9ab', roughness: 0.9 }),
  focus: new THREE.MeshBasicMaterial({ color: '#c2410c', transparent: true, opacity: 0.15, depthWrite: false }),
};

// A strand of yarn through these points
export const tube = (pts: THREE.Vector3[]) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.06, 10, false);