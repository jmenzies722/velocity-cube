import { GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();
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
export const auth = getAuth(app);
export default firebaseConfig;