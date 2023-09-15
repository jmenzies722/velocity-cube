
// Actual Hosted Site using GH pages: https://jmenzies722.github.io/velocity-cube/
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { signInWithGoogle, signOut } from "./firebaseConfig";
import { getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { collection } from "firebase/firestore";
import { query } from "firebase/firestore";
import { orderBy } from "firebase/firestore";
import { limit } from "firebase/firestore";


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
let paused = false; // Flag to track if the game is paused

const gameScreen = document.querySelector('.game-screen');
const startScreen = document.querySelector('.start-screen');
const signOutButton = document.getElementById('sign-out'); // Add a sign-out button


const googleSignInButton = document.getElementById('google-sign');
googleSignInButton.addEventListener('click', () => {
   signInWithGoogle();
  });

  signOutButton.addEventListener('click', () => {
    signOut(); // Call the signOut function when the sign-out button is clicked
 });

 const auth = getAuth();

 onAuthStateChanged(auth, (user) => {
   if (user) {
     // User is signed in.
     console.log('User is signed in:', user);
 
     // Hide the sign-in screen
     startScreen.style.display = 'none';
 
     // Show the game screen
     gameScreen.style.display = 'block';
 
     // Call your game initialization function here, if needed.
     init();
     retrieveAndDisplayHighScores();
   } else {
     // No user is signed in. Keep the sign-in screen visible.
     console.log('No user is signed in');
 
     // Hide the game screen
     gameScreen.style.display = 'none';
 
     // Show the sign-in screen
     startScreen.style.display = 'block';
   }
 });
 
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
    renderer = Detector.webgl ? new THREE.WebGLRenderer({ antialias: true }) : new THREE.CanvasRenderer();
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

updateHighScore(); 

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

    if (crash) {
        // Call the resetGame function to reset the game
        resetGame();
    
        // Change cube color to indicate collision
        movingCube.material.color.setHex(0x346386);
    
        // Check if the current score is higher than the stored high score
        let highScore = localStorage.getItem("highScore");
        if (score > highScore || highScore === null) {
            // Update the high score in local storage
            localStorage.setItem("highScore", score);
        }
    } else {
        // Change cube color to indicate normal state
        movingCube.material.color.setHex(0x00FFFF);
    }
    
    // Update the score
    score += 0.1;
    scoreText.innerText = "Score:" + Math.floor(score);

    if (Math.floor(score) % 50 === 0 && currentLevel < Math.floor(score) / 50) {
        currentLevel = Math.floor(score) / 50;
        cubesPerLevel += 5; // Increase difficulty for the next level
        cubeSpeed += 2; // Increase cube speed for the next level
        updateLevelDisplay();
      
        // Assuming you have a way to identify the user (e.g., through authentication)
        const user = auth.currentUser;
        if (user) {
          const userId = user.uid; // Use the user's UID as the document ID
          updateHighScoreInFirestore(userId, Math.floor(score)); // Update or store high score in Firestore
        }
      }

    // Generate random cubes
    if (Math.random() < 0.03 && cubes.length < 30) {
        makeRandomCube();
    }

    // Update cube positions and remove those out of view
    for (let i = 0; i < cubes.length; i++) {
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
    box.material.color.setHex(0xFF00FF);

    box.position.x = getRandomArbitrary(-250, 250);
    box.position.y = 1 + b / 2;
    box.position.z = getRandomArbitrary(-800, -1200);
    cubes.push(box);
    box.name = "box_" + id;
    id++;
    collideMeshList.push(box);

    scene.add(box);
}
// Initialize the level display
updateLevelDisplay();

function resetGame() {
    // Reset game variables
    score = 0;
    currentLevel = 1;
    cubesPerLevel = 10;
    cubeSpeed = 5;
    lastLevelUpdateScore = 0;
    crash = false;
    scoreText.innerText = "Score: 0";
    updateLevelDisplay();

    // Remove all cubes from the scene
    for (const cube of cubes) {
        scene.remove(cube);
    }
    cubes = [];
    collideMeshList = [];

    // Reset cube material color
    movingCube.material.color.setHex(0xFF6EFF);

    // Center the camera and movingCube
    camera.position.set(0, 170, 400);
    movingCube.position.set(0, 25, -20);

    // Reset camera rotation
    camera.rotation.set(0, 0, 0);

    // Restart the game loop
    paused = false;
}

async function retrieveHighScoresFromFirestore() {
    const highScoresCollection = collection(db, "highScores");
    const highScoresQuery = query(highScoresCollection, orderBy("score", "desc"), limit(10));
  
    const highScoresSnapshot = await getDocs(highScoresQuery);
  
    const highScores = [];
    highScoresSnapshot.forEach((doc) => {
      const userData = doc.data();
      highScores.push({ userId: doc.id, score: userData.score });
    });
  
    return highScores;
  }

  async function retrieveAndDisplayHighScores() {
    try {
      const highScores = await retrieveHighScoresFromFirestore();
  
      // Assuming you have an HTML element with the id 'high-score' to display the scores.
      const highScoreContainer = document.getElementById('high-score');
      
      // Assuming you have an HTML element with the id 'score-text' to display the high score.
      const scoreTextElement = document.getElementById('score');
  
      // Get the highest score from the retrieved high scores.
      const highestScore = highScores.length > 0 ? highScores[0].score : 0;
  
      // Display the high score in your score container.
      scoreTextElement.innerText = "High Score: " + highestScore;
  
      // Clear the previous high scores
      highScoreContainer.innerHTML = '';
  
      // Create an ordered list to display the high scores
      const highScoreList = document.createElement('ol');
      
      // Display the high scores
      highScores.forEach((scoreData, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `${scoreData.userId}: ${scoreData.score}`;
        highScoreList.appendChild(listItem);
      });
  
      // Append the ordered list to the high-score container
      highScoreContainer.appendChild(highScoreList);
    } catch (error) {
      console.error('Error retrieving high scores:', error);
    }
  }