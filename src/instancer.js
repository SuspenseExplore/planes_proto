import * as THREE from 'three';

export function build(meshes, instCount) {
	var instMeshes = [];
	for (var i = 0; i < meshes.length; i++) {
		let instMesh = new THREE.InstancedMesh(meshes[i].geometry, meshes[i].material, instCount);
		instMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		instMeshes[i] = instMesh;
	}

	return instMeshes;
}