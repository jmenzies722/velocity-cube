// Global variables
let container, scene, camera, renderer, controls;
let keyboard = new THREEx.KeyboardState();
let clock = new THREE.Clock();

let movingCube, collideMeshList = [], cubes = [];
let crash = false, score = 0, id = 0, crashId = "", lastCrashId = "";
let scoreText = document.getElementById("score");

// Initialize the scene, camera, and renderer
init();
// Start the animation loop
animate();

function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Set up the camera
    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, screenWidth / screenHeight, 1, 20000);
    camera.position.set(0, 170, 400);

    // Create the renderer
    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
    } else {
        renderer = new THREE.CanvasRenderer();
    }
    renderer.setSize(screenWidth * 0.85, screenHeight * 0.85);
    container = document.getElementById("ThreeJS");
    container.appendChild(renderer.domElement);

    // Add window resize handling
    THREEx.WindowResize(renderer, camera);
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Add two lines
    let geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-250, -1, -3000));
    geometry.vertices.push(new THREE.Vector3(-300, -1, 200));
    let material = new THREE.LineBasicMaterial({
        color: 0x6699FF, linewidth: 5, fog: true
    });
    let line1 = new THREE.Line(geometry, material);
    scene.add(line1);

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(250, -1, -3000));
    geometry.vertices.push(new THREE.Vector3(300, -1, 200));
    let line2 = new THREE.Line(geometry, material);
    scene.add(line2);

    // Add the controlled cube
    let cubeGeometry = new THREE.CubeGeometry(50, 25, 60, 5, 5, 5);
    let wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x0000ff, // Blue color
        wireframe: false
    });

    movingCube = new THREE.Mesh(cubeGeometry, wireMaterial);
    movingCube.position.set(0, 25, -20);
    scene.add(movingCube);
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

function update() {
    let delta = clock.getDelta();
    let moveDistance = 200 * delta;
    let rotateAngle = Math.PI / 2 * delta;

    // Handle keyboard inputs
    if (keyboard.pressed("left") || keyboard.pressed("A")) {
        // Move left
        if (movingCube.position.x > -270)
            movingCube.position.x -= moveDistance;
        if (camera.position.x > -150) {
            camera.position.x -= moveDistance * 0.6;
            if (camera.rotation.z > -5 * Math.PI / 180) {
                camera.rotation.z -= 0.2 * Math.PI / 180;
            }
        }
    }
    if (keyboard.pressed("right") || keyboard.pressed("D")) {
        // Move right
        if (movingCube.position.x < 270)
            movingCube.position.x += moveDistance;
        if (camera.position.x < 150) {
            camera.position.x += moveDistance * 0.6;
            if (camera.rotation.z < 5 * Math.PI / 180) {
                camera.rotation.z += 0.2 * Math.PI / 180;
            }
        }
    }
    if (keyboard.pressed("up") || keyboard.pressed("W")) {
        // Move forward
        movingCube.position.z -= moveDistance;
    }
    if (keyboard.pressed("down") || keyboard.pressed("S")) {
        // Move backward
        movingCube.position.z += moveDistance;
    }

    if (!(keyboard.pressed("left") || keyboard.pressed("right") ||
        keyboard.pressed("A") || keyboard.pressed("D"))) {
        // Reset rotation if no left/right input
        delta = camera.rotation.z;
        camera.rotation.z -= delta / 10;
    }

    let originPoint = movingCube.position.clone();

    // Check for collisions with cubes
    for (let vertexIndex = 0; vertexIndex < movingCube.geometry.vertices.length; vertexIndex++) {
        let localVertex = movingCube.geometry.vertices[vertexIndex].clone();
        let globalVertex = localVertex.applyMatrix4(movingCube.matrix);
        let directionVector = globalVertex.sub(movingCube.position);

        let ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        let collisionResults = ray.intersectObjects(collideMeshList);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            crash = true;
            crashId = collisionResults[0].object.name;
            break;
        }
        crash = false;
    }

    // Handle collisions
    if (crash) {
        movingCube.material.color.setHex(0x346386);
        if (crashId !== lastCrashId) {
            score -= 100;
            lastCrashId = crashId;
        }
        document.getElementById('explode_sound').play();
    } else {
        movingCube.material.color.setHex(0x00ff00);
    }

    // Generate random cubes
    if (Math.random() < 0.03 && cubes.length < 30) {
        makeRandomCube();
    }

    // Update cube positions and remove those out of view
    for (var i = 0; i < cubes.length; i++) {
        if (cubes[i].position.z > camera.position.z) {
            scene.remove(cubes[i]);
            cubes.splice(i, 1);
            collideMeshList.splice(i, 1);
        } else {
            cubes[i].position.z += 10;
        }
    }

    // Update the score
    score += 0.1;
    scoreText.innerText = "Score:" + Math.floor(score);
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function makeRandomCube() {
    let a = 1 * 50,
        b = getRandomInt(1, 3) * 50,
        c = 1 * 50;
    let geometry = new THREE.CubeGeometry(a, b, c);
    let material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        size: 3
    });

    let object = new THREE.Mesh(geometry, material);
    let box = new THREE.BoxHelper(object);
    box.material.color.setHex(0xff0000);

    box.position.x = getRandomArbitrary(-250, 250);
    box.position.y = 1 + b / 2;
    box.position.z = getRandomArbitrary(-800, -1200);
    cubes.push(box);
    box.name = "box_" + id;
    id++;
    collideMeshList.push(box);

    scene.add(box);
}
