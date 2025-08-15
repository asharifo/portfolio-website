import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
raycaster.far = 8;
const pointer = new THREE.Vector2();
const canvas = document.getElementById('experience-canvas');
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.75;

const intersectObjects = [];
const intersectObjectsNames = [
  "billboard1",
  "billboard2",
  "billboard3",
  "billboard4",
];

const Loader = new GLTFLoader();
Loader.load(
  "/website-model.glb",
  function (glb) {
    glb.scene.traverse((child) => {
      if (intersectObjectsNames.includes(child.name)) {
        intersectObjects.push(child);
      }
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(glb.scene);
  },
  undefined,
  (error) => {
    console.error('An error occurred while loading the model:', error);
  }
);

const moon = new THREE.DirectionalLight(0xffffff, 1);
moon.castShadow = true;
moon.position.set(0, 15, -100);
moon.shadow.mapSize.width = 4096;
moon.shadow.mapSize.height = 4096;
moon.shadow.normalBias = 0.1;
scene.add(moon);

const billboardLight1 = new THREE.PointLight(0xffffff, 3, 100);
billboardLight1.position.set(0.735, 3.74, 0.114);
scene.add(billboardLight1);

const billboardLight2 = new THREE.PointLight(0xffffff, 3, 100);
billboardLight2.position.set(1.935, 3.74, 0.114);
scene.add(billboardLight2);

const billboardLight3 = new THREE.PointLight(0xffffff, 3, 100);
billboardLight3.position.set(-2.96, 4.18, -8.98);
scene.add(billboardLight3);

const bilboardLight4 = new THREE.PointLight(0xffffff, 3, 100);
bilboardLight4.position.set(-1.76, 4.18, -8.98);
scene.add(bilboardLight4);

const billboarLight5 = new THREE.PointLight(0xffffff, 3, 100);
billboarLight5.position.set(2.32, 3.337, -19.228);
scene.add(billboarLight5);

const billBoardLight6 = new THREE.PointLight(0xffffff, 3, 100);
billBoardLight6.position.set(1.12, 3.337, -19.228);
scene.add(billBoardLight6);

const billBoardLight7 = new THREE.PointLight(0xffffff, 3, 100);
billBoardLight7.position.set(-1.34, 4.22, -28.79);
scene.add(billBoardLight7);

const billBoardLight8 = new THREE.PointLight(0xffffff, 3, 100);
billBoardLight8.position.set(-2.54, 4.22, -28.79);
scene.add(billBoardLight8);

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000);

camera.position.x = -0.33523441487767175;
camera.position.y = 2.1082812638682764;
camera.position.z = 4.9329414086097865;

const controls = new OrbitControls(camera, canvas);
controls.update();

function onResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onClick(event) {
}

window.addEventListener('click', onClick);
window.addEventListener('resize', onResize);
window.addEventListener('pointermove', onPointerMove);

function animate() {
  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(pointer, camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(intersectObjects, true);

  // cursor feedback
  document.body.style.cursor = intersects.length ? 'pointer' : 'default';

  // track which objects are hovered this frame
  const hovered = new Set();

  // add/show yellow edge overlays for hovered meshes
  for (let i = 0; i < intersects.length; i++) {
    let obj = intersects[i].object;

    // ensure we act on a mesh
    while (obj && !obj.isMesh) obj = obj.parent;
    if (!obj) continue;

    hovered.add(obj);

    if (!obj.userData.edgeOutline && obj.geometry) {
      const edgesGeom = new THREE.EdgesGeometry(obj.geometry, /* thresholdAngle */ 15);
      const edgesMat = new THREE.LineBasicMaterial({
        color: 0xffff00,
        depthTest: false,     // keep edges visible on top of the mesh
        transparent: true,
        opacity: 1.0
      });
      const outline = new THREE.LineSegments(edgesGeom, edgesMat);
      outline.renderOrder = 999;     // draw last to reduce flicker
      outline.frustumCulled = false; // avoid disappearing at frustum edges

      obj.add(outline);
      obj.userData.edgeOutline = outline;
    }

    if (obj.userData.edgeOutline) {
      obj.userData.edgeOutline.visible = true;
    }
  }

  // hide overlays on non-hovered objects
  for (const pickable of intersectObjects) {
    if (pickable.userData && pickable.userData.edgeOutline && !hovered.has(pickable)) {
      pickable.userData.edgeOutline.visible = false;
    }
  }
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);