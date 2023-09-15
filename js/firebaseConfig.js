import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
    apiKey: "AIzaSyCauWdVviDk9LQ75mCuRuMTFYTlAFtDTDI",
    authDomain: "velocity-cube.firebaseapp.com",
    projectId: "velocity-cube",
    storageBucket: "velocity-cube.appspot.com",
    messagingSenderId: "1013031361568",
    appId: "1:1013031361568:web:0f5081f6befdd975d87045",
    measurementId: "G-KSEQ07BTX1"
  };
  
  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };

  // Import necessary parts of Firebase
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from "firebase/auth";

function signOut() {
  const auth = getAuth();
  
  // Show a confirmation dialog before signing out
  const shouldSignOut = window.confirm("Are you sure you want to sign out?");
  
  if (shouldSignOut) {
    firebaseSignOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log('Successfully signed out');
      })
      .catch((error) => {
        // An error happened.
        console.error('Error signing out:', error);
      });
  }
}


function signInWithGoogle() {
  // Create a new instance of GoogleAuthProvider
  const provider = new GoogleAuthProvider();

  // Get an instance of the Auth service
  const auth = getAuth();

  // Use signInWithPopup
  signInWithPopup(auth, provider)
    .then((result) => {
      // The signed-in user info.
      const user = result.user;
      console.log('Successfully signed in with Google:', user);
    })
    .catch((error) => {
      console.error('Error signing in with Google:', error);
    });
}

// Export the signOut function
export { signInWithGoogle, signOut };
