import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js";

function main() {
    const canvas = document.querySelector("#myCanvas");
    const renderer = new THREE.WebGLRenderer({ canvas });

    //set scene
    const fov = 70;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 180;
    // camera.position.x = 180;
    camera.position.y = 80;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb0883e);

    // Camera Orbit
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

    //set lighting
    let lights = [];
    const directLight1 = new THREE.DirectionalLight(0xffffff, 1);
    const ambientLight = new THREE.AmbientLight(0x555555, 1);

    directLight1.position.set(0, 6, 0);
    directLight1.target.position.set(0, 0, 0);

    lights.push(directLight1);
    lights.push(ambientLight);

    lights.forEach((light) => {
        scene.add(light);
        light.visible = false;
    });

    lights[0].visible = true;
    lights[1].visible = true;

    //set objects
    const objects = [];

    function addObject(x, y, z, obj, spread) {
        obj.position.x = x * spread;
        obj.position.y = y * 15;
        obj.position.z = z * spread;

        scene.add(obj);
        objects.push(obj);
    }

    function addGeometry(x, y, z, spread, geometry, material) {
        const mesh = new THREE.Mesh(geometry, material);
        addObject(x, y, z, mesh, spread);
    }

    //make plane 1
    let plane;
    {
        const width = 160;
        const height = 5;
        const depth = 160;
        plane = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshStandardMaterial({
                color: "rgb(0,255,255)",
                roughness: 0.55,
                metalness: 1,
                side: THREE.DoubleSide,
                emissive: 0x454545,
            })
        );
        addObject(0, -2.8, 0, plane, 15);
    }

    let xPos = 0;
    let yPos = 0;
    let zPos = 0;
    let count = 0;
    let timer = 1000;

    //make ball
    function makeBall() {
        const radius = 5.0;
        const detail = 5;
        addGeometry(
            xPos - 2.5 + Math.random() / 2,
            yPos - 2 + Math.random() / 2,
            zPos - 2.5 + Math.random() / 2,
            25,
            new THREE.DodecahedronGeometry(radius, detail),
            new THREE.MeshPhongMaterial({
                color: randomColor(),
                shininess: 150,
            })
        );
        // count++;
        // xPos++;
        // if (yPos < 3) {
        //     if (count % 54 == 0) {
        //         yPos++;
        //         xPos = 0;
        //         zPos = 1;
        //         console.log("hehe");
        //         // count = 0;
        //     }
        //     if (count % 6 === 0) {
        //         xPos = 0;
        //         zPos--;
        //     }
        //     if (count < 54 * 3) {
        //         timer *= 0.8;
        //         setTimeout(makeBall, timer);
        //     }
        // }

        xPos++;
        if (xPos % 6 == 0 && xPos != 0) {
            xPos = 0;
            zPos++;
        }
        count++;
        if (count % 36 == 0 && count != 0) {
            xPos = 0;
            zPos = 0;
            yPos++;
        }
        if (count < 216) {
            timer = (timer / 10) * 9;
            setTimeout(makeBall, timer);
        }
    }
    makeBall();

    // let x = 0,
    //     y = 0,
    //     z = 0,
    //     count = 0,
    //     speedGenerate = 1000;

    function randomColor() {
        const r = Math.floor(Math.random() * 2) * 128 + 64;
        const g = Math.floor(Math.random() * 2) * 128 + 64;
        const b = Math.floor(Math.random() * 2) * 128 + 64;
        const rgb = `rgb(${r},${g},${b})`;

        return rgb;
    }

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

    let yPosSpeed = 8 / 1000;
    let xRotSpeed = 0.75 / 1000;
    let speed = 0;
    function moveCamera() {
        speed += yPosSpeed;
        camera.position.x = 200 * Math.sin(speed);
        camera.position.z = 200 * Math.cos(speed);
        camera.rotation.y += yPosSpeed;

        requestAnimationFrame(moveCamera);
    }
    // moveCamera();

    //set raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const scoreBoard = document.querySelector(".score");
    let selectedPiece1,
        selectedPiece2,
        score = 0;

    function onMouseMove(event) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    function resetMaterials() {
        for (let i = 0; i < scene.children.length; i++) {
            if (scene.children[i].material) {
                if (selectedPiece2 && selectedPiece1) {
                    if (
                        selectedPiece1.material.color.getHex() ===
                        selectedPiece2.material.color.getHex()
                    ) {
                        console.log(selectedPiece1.material.color.getHex());
                        console.log(selectedPiece2.material.color.getHex());

                        scene.remove(selectedPiece1);
                        scene.remove(selectedPiece2);
                        score++;
                        scoreBoard.innerHTML = score;
                    }
                    selectedPiece1 = null;
                    selectedPiece2 = null;
                }

                if (
                    scene.children[i] == selectedPiece1 ||
                    scene.children[i] == selectedPiece2
                )
                    scene.children[i].material.opacity = 0.5;
                else {
                    scene.children[i].material.opacity = 1.0;
                }
            }
        }
    }

    function hoverPieces() {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, false);
        // console.log(intersects);
        // for (let i = 0; i < intersects.length; i++) {
        //     intersects[i].object.material.transparent = true;
        //     intersects[i].object.material.opacity = 0.5;
        // }
        if (intersects.length > 0) {
            if (intersects[0].object !== plane) {
                intersects[0].object.material.transparent = true;
                intersects[0].object.material.opacity = 0.3;
            }
        }
    }

    function onClick() {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            if (!selectedPiece1 && !selectedPiece2) {
                selectedPiece1 = intersects[0].object;
            } else if (
                selectedPiece1 &&
                !selectedPiece2 &&
                intersects[0].object != selectedPiece1
            ) {
                selectedPiece2 = intersects[0].object;
            } else if (selectedPiece1 && selectedPiece2) {
                selectedPiece1 = intersects[0].object;
                selectedPiece2 = null;
            }
        } else {
            selectedPiece1 = null;
            selectedPiece2 = null;
        }
    }

    window.addEventListener("mousemove", onMouseMove, false);
    window.addEventListener("click", onClick);

    // function
    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        resetMaterials();
        hoverPieces();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();
