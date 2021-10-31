import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js";

function main() {
    const canvas = document.querySelector("#myCanvas");
    const renderer = new THREE.WebGLRenderer({ canvas });

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 6;

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

    const scene = new THREE.Scene();

    // {
    //     const near = 10;
    //     const far = 10;
    //     const color = "lightblue";
    //     scene.fog = new THREE.Fog(color, near, far);
    //     scene.background = new THREE.Color(color);
    // }

    //lighting
    {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    //add sphere camera for reflection
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
        format: THREE.RGBFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
    });

    let sphereCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
    sphereCamera.position.set(0, -5, 0);
    scene.add(sphereCamera);

    //make reflective balls
    {
        let sphereMaterial = new THREE.MeshBasicMaterial({
            envMap: sphereCamera.renderTarget,
        });
        let sphereGeo = new THREE.SphereGeometry(1, 30, 30);
        let sphere = makeInstance(sphereGeo, sphereMaterial, 0, 0, 0);
        scene.add(sphere);
    }

    //shapes primitives geometry
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const radiusBall = 0.7;
    const widthSegments = 30;
    const heightSegments = 30;
    const ball = new THREE.SphereGeometry(
        radiusBall,
        widthSegments,
        heightSegments
    );

    function makeInstance(geometry, material, x, y, z) {
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;

        return cube;
    }

    const loader = new THREE.TextureLoader();

    const objects = [
        makeInstance(
            ball,
            new THREE.MeshBasicMaterial({ map: loader.load("./golf.jpg") }),
            -2,
            0,
            2
        ),
        makeInstance(
            geometry,
            new THREE.MeshBasicMaterial({ map: loader.load("./brick.jpg") }),
            2,
            0,
            2
        ),
        makeInstance(
            geometry,
            new THREE.MeshBasicMaterial({
                map: loader.load("./cheese.jpg"),
            }),
            0,
            0,
            -2
        ),
    ];

    //panorama setup
    {
        const loader = new THREE.TextureLoader();
        const texture = loader.load("panorama.jpg", () => {
            const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
            rt.fromEquirectangularTexture(renderer, texture);
            scene.background = rt.texture;
        });
    }

    //for responsive scaling
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

    function animateCircularX(obj, time, reverse) {
        const speed = time;

        obj.position.x = 2 * Math.sin(speed) * 2;
        obj.position.z = 2 * Math.cos(speed) * 2;
        if (reverse) {
            obj.position.x = -obj.position.x;
            obj.position.z = -obj.position.z;
        }
    }

    function animateCircularY(obj, time, reverse) {
        const speed = time;

        obj.position.y = 2 * Math.sin(speed) * 2;
        obj.position.z = 2 * Math.cos(speed) * 2;
        if (reverse) {
            obj.position.y = -obj.position.y;
            obj.position.z = -obj.position.z;
        }
    }

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        objects.forEach((obj, ndx) => {
            const speed = 1 + ndx * 0.1;
            const rot = time * speed;
            obj.rotation.x = rot;
            obj.rotation.y = rot;
        });

        animateCircularX(objects[0], time, true);
        animateCircularX(objects[1], time, false);
        animateCircularY(objects[2], time, true);

        renderer.render(scene, camera);
        sphereCamera.updateCubeMap(renderer, scene);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
