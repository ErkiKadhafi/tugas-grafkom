import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/MTLLoader.js";

function main() {
    const canvas = document.querySelector("#myCanvas");
    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.shadowMap.enabled = true;

    const fov = 45;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("black");

    {
        const planeSize = 40;

        const loader = new THREE.TextureLoader();
        const texture = loader.load("sand.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
            reflectivity: 0,
            shininess: 0,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.receiveShadow = true;
        mesh.rotation.x = Math.PI * -0.5;
        scene.add(mesh);
    }

    {
        const near = 0.5;
        const far = 90;
        const color = 0x0d0c0b;
        scene.fog = new THREE.Fog(color, near, far);
        scene.background = new THREE.Color(color);
    }

    {
        const skyColor = 0xb1e1ff; // light blue
        const groundColor = 0xb97a20; // brownish orange
        const intensity = 0.3;
        const light = new THREE.HemisphereLight(
            skyColor,
            groundColor,
            intensity
        );
        scene.add(light);
    }

    {
        const color = 0xebebeb;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.castShadow = true;
        light.position.set(-7, 20, -7);
        scene.add(light);

        const helper = new THREE.PointLightHelper(light);
        // scene.add(helper);
        scene.add(light);
    }

    {
        const color = 0xffffff;
        const intensity = 0.6;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(5, 10, 2);
        light.castShadow = true;
        scene.add(light);
        scene.add(light.target);
    }

    //load obj car
    {
        const mtlLoader = new MTLLoader();
        mtlLoader.load("car.mtl", (mtl) => {
            mtl.preload();
            const objLoader = new OBJLoader();
            // mtl.materials.Material.side = THREE.DoubleSide;
            objLoader.setMaterials(mtl);
            objLoader.load("car.obj", (root) => {
                root.position.x = -29.5;
                root.position.z = 3;
                root.position.y = -0.2;
                root.rotation.x = -Math.PI / 2;
                root.castShadow = true;
                root.receiveShadow = true;
                root.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                scene.add(root);
            });
        });
    }
    //load obj road
    {
        const mtlLoader = new MTLLoader();
        mtlLoader.load("roada.mtl", (mtl) => {
            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load("roada.obj", (root) => {
                root.position.x = -10;
                root.position.z = 20;
                root.rotation.x = -Math.PI / 2;
                root.castShadow = true;
                root.receiveShadow = true;
                root.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                scene.add(root);
            });
        });
    }
    // {
    //     const cubeSize = 4;
    //     const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    //     const cubeMat = new THREE.MeshPhongMaterial({ color: "#8AC" });
    //     const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    //     mesh.castShadow = true;
    //     mesh.receiveShadow = true;
    //     mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    //     scene.add(mesh);
    // }
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
