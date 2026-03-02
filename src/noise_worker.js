import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

const IMP_NOISE = new ImprovedNoise();

onmessage = function (e) {
	let heightmap = Array.from(Array(e.data.cfg.chunkSize), () => new Array(e.data.cfg.chunkSize));
	for (let x = 0; x < e.data.cfg.chunkSize; x++) {
		for (let y = 0; y < e.data.cfg.chunkSize; y++) {
			heightmap[x][y] = getNoise(x + e.data.chunkCoord[0], y + e.data.chunkCoord[1], e.data.cfg);
		}

	}
	this.postMessage({
		map: heightmap,
		id: e.data.id
	});
}

function getNoise(x, y, cfg) {
	let h = 0;
	for (let o = 0; o < cfg.octaves.length; o++) {
		let octave = cfg.octaves[o];
		let a = octave.amp * cfg.tileSize;
		h += IMP_NOISE.noise(x * octave.frq, y * octave.frq, cfg.z) * a;
	}
	return h;
}
