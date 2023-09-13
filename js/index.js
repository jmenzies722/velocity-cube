
// Global variables
let container, scene, camera, renderer, controls;
let keyboard = new THREEx.KeyboardState();
let clock = new THREE.Clock();

let movingCube, collideMeshList = [], cubes = [];
let crash = false, score = 0, id = 0, crashId = "", lastCrashId = "";
let scoreText = document.getElementById("score");

let currentLevel = 1; // Track the current level
let cubesPerLevel = 10; // Number of cubes to generate per level
let cubeSpeed = 5; // Initial cube speed (adjusted for slower start)
let lastLevelUpdateScore = 0; // Track the last score when the level was updated
// Flag to track if the game is paused
let paused = false;

// Initialize the scene, camera, and renderer
init();
// Start the animation loop
animate();

updateHighScore(); // Display high score at the beginning

function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Set up the camera
    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, screenWidth / screenHeight, 2, 20000);
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

    // Add two lines with neon purple color
    let geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-250, -1, -3000));
    geometry.vertices.push(new THREE.Vector3(-300, -1, 200));
    let material = new THREE.LineBasicMaterial({
        color: 0xFFFFFF,
        linewidth: 5,
        fog: true
    });
    let line1 = new THREE.Line(geometry, material);
    scene.add(line1);

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(250, -1, -3000));
    geometry.vertices.push(new THREE.Vector3(300, -1, 200));
    let line2 = new THREE.Line(geometry, material);
    scene.add(line2);

    // Add the controlled cube with neon green color
    let cubeGeometry = new THREE.CubeGeometry(50, 25, 50, 10, 5, 5);
    let wireMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF6EFF, // Neon green color
        wireframe: false
    });

    movingCube = new THREE.Mesh(cubeGeometry, wireMaterial);
    movingCube.position.set(0, 25, -20);
    scene.add(movingCube);
}

function animate() {
    requestAnimationFrame(animate);

    // Check if the game is paused
    if (!paused) {
        update(); // Only update if the game is not paused
    }

    renderer.render(scene, camera);
}

// Function to update the level display
function updateLevelDisplay() {
    let levelDisplay = document.getElementById("level-text");
    levelDisplay.innerText = "Level: " + currentLevel;
}

function update() {
    let delta = clock.getDelta();
    let moveDistance = 200 * delta;
    let rotateAngle = Math.PI / 2 * delta;
    let gameOver = false;

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
        // Change cube color to indicate collision
        movingCube.material.color.setHex(0x346386);

        // Check if the current score is higher than the stored high score
        let highScore = localStorage.getItem("highScore");
        if (score > highScore || highScore === null) {
            // Update the high score in local storage
            localStorage.setItem("highScore", score);
        }

        // Reload the page after 2 seconds
        setTimeout(function () {
            location.reload();
        });
    } else {
        // Change cube color to indicate normal state
        movingCube.material.color.setHex(0x00FFFF);
    }

    // Update the score
    score += 0.1;
    scoreText.innerText = "Score:" + Math.floor(score);

    // Inside the update function, update the level when the score reaches a milestone
    if (Math.floor(score) % 50 === 0 && currentLevel < Math.floor(score) / 50) {
        currentLevel = Math.floor(score) / 50;
        cubesPerLevel += 5; // Increase difficulty for the next level
        cubeSpeed += 2; // Increase cube speed for the next level
        updateLevelDisplay();
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
}

function updateHighScore() {
    let highScoreElement = document.getElementById("high-score");
    let highScore = localStorage.getItem("highScore") || 0;
    highScore = Math.round(parseFloat(highScore));
    highScoreElement.innerText = "High Score: " + highScore;
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
        color: Math.random() * 0x80461B,
        size: 3
    });

    let object = new THREE.Mesh(geometry, material);
    let box = new THREE.BoxHelper(object);
    box.material.color.setHex(0xFF0000);

    box.position.x = getRandomArbitrary(-250, 250);
    box.position.y = 1 + b / 2;
    box.position.z = getRandomArbitrary(-800, -1200);
    cubes.push(box);
    box.name = "box_" + id;
    id++;
    collideMeshList.push(box);

    scene.add(box);
}

// Reset the game for the next level
function resetGame() {
    // Remove all existing cubes and clear collision list
    for (let i = 0; i < cubes.length; i++) {
        scene.remove(cubes[i]);
    }
    cubes = [];
    collideMeshList = [];

    // Reset player position and cube color
    movingCube.position.set(0, 25, -20);
    movingCube.material.color.setHex(0xFF6EFF);

    // Update the score display
    score = 0;
    scoreText.innerText = "Score: " + Math.floor(score);

    // Update the level display and object frequency
    updateLevelDisplay();

    // Start generating cubes for the next level
    for (let i = 0; i < cubesPerLevel; i++) {
        makeRandomCube();
    }
}

// Initialize the level display
updateLevelDisplay();

