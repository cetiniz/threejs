import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6';
import Stats from 'stats.js';

import generateRandomMaze from './graph.js';

// FPS Information
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

const MAZE_SIZE = 10;
const maze = generateRandomMaze(MAZE_SIZE);

var geometry = new THREE.BoxGeometry( 1, 1, 1 );

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(50,25,30);
camera.lookAt(0,0,0);

const colors = [0x6ddada, 0xa559c7, 0x13699f, 0xe326a6, 0x5f5700, 0x169f49];
const materials = [];
for (let color in colors) {
  materials.push(new THREE.MeshLambertMaterial({color: colors[color]}));
}

var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

var controls = new OrbitControls( camera, renderer.domElement );
controls.autoRotate = true;
controls.autoRotateSpeed = 1;

window.camera = camera;
window.controls = controls;

const cubeController = new THREE.Group();
window.cubeController = cubeController;

for (let face = 0; face < 6; face ++) {
  const faceGroup = new THREE.Group();

  for (let i = 0; i < 99; i++) {
    const currentVertix = maze[i + (face * 99)];

    const graphRow = Math.floor((currentVertix.index % 100) / MAZE_SIZE);
    const actualRow = graphRow * 2 + graphRow;

    const graphCol = currentVertix.index % MAZE_SIZE
    const actualCol = graphCol * 2 + graphCol;

    //console.log({actualRow, actualCol})

    if (currentVertix.walls.up) {
      faceGroup.add(addWall(actualRow - 1, actualCol, 1, face, currentVertix.index % 100));
    }
    if (currentVertix.walls.down) {
      faceGroup.add(addWall(actualRow + 1, actualCol, 1, face, currentVertix.index % 100));
    }
    if (currentVertix.walls.left) {
      faceGroup.add(addWall(actualRow, actualCol - 1, 1, face, currentVertix.index % 100));
    }
    if (currentVertix.walls.right) {
      faceGroup.add(addWall(actualRow, actualCol + 1, 1, face, currentVertix.index % 100));
    }
    // Add Corners
    faceGroup.add(addWall(actualRow - 1, actualCol - 1, 1, face, currentVertix.index % 100));
    faceGroup.add(addWall(actualRow - 1, actualCol + 1, 1, face, currentVertix.index % 100));
    faceGroup.add(addWall(actualRow + 1, actualCol - 1, 1, face, currentVertix.index % 100));
    faceGroup.add(addWall(actualRow + 1, actualCol + 1, 1, face, currentVertix.index % 100));
  }
  const plane = addPlane(MAZE_SIZE)
  plane.translateZ(0.5);
  plane.translateX(13.5);
  plane.translateY(13.5);
  faceGroup.add(plane);
  rotateFace(face, faceGroup);
  cubeController.add(faceGroup);
}

cubeController.translateX(-13.5);
cubeController.translateY(-13.5);
cubeController.translateZ(13.5);

window.cubeController = cubeController;

scene.add(cubeController);

window.addEventListener('keypress', handleKeyPress, false);

function handleKeyPress(event) {
  switch (event.charCode) {
    case 97:
      cubeController.rotateZ(Math.PI / 40);
      break;
    case 119:
      cubeController.rotateX(Math.PI / 40);
      break;
    case 115:
      cubeController.rotateX(Math.PI / -40);
      break;
    case 100:
      cubeController.rotateZ(Math.PI / -40);
      break;
  } 
}

function rotateFace(face, group) {
  if (face === 0 ) {
    group.translateZ(-2);
  } else if (face === 1) {
    group.rotateY(Math.PI/2)
    group.translateZ(27)
    group.translateX(2)
  } else if (face === 2) {
    group.rotateY(Math.PI/2)
    group.rotateX(-Math.PI/2)
    group.translateY(-27);
    group.translateZ(27);
    group.translateX(2);
  } else if (face === 3) {
    group.rotateZ(Math.PI/2);
    group.rotateY(Math.PI);
    group.translateY(-27);
    group.translateZ(29)
    group.translateX(-27)
  } else if (face === 4) {
    group.rotateZ(-Math.PI/2)
    group.rotateX(Math.PI/2)
    group.translateX(-27)
    group.translateY(-29)
  } else if (face === 5) {
    group.rotateX(Math.PI/2);
    group.translateY(-29)
  }
}

function addWall(x, y, z, face) {
  const material = materials[face];
  const cube = new THREE.Mesh( geometry, material );

  cube.position.copy({x: x, y: y, z: z})
  cube.updateMatrix();

  return cube;
}

function addPlane(squareSize) {
  const geometry = new THREE.PlaneBufferGeometry( squareSize * 3 - 2, squareSize * 3 - 2, 1);
  const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
  const plane = new THREE.Mesh( geometry, material );
  return plane;
}

camera.position.z = 5;
function animate() {
  requestAnimationFrame( animate );
  stats.begin();
  controls.update();
  renderer.render( scene, camera );
  stats.end();
}

window.camera = camera;
window.controls = controls;

animate();
