import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "operation-rakshak-3",
  appId: "1:612003640918:web:f29636add0b15aacbfedf7",
  apiKey: "AIzaSyAOtx5-TkTC1PW9QqdNE6kd-LSiRgW49JI",
  authDomain: "operation-rakshak-3.firebaseapp.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-8461df94-4cda-4418-a901-1f7ca7c273f3");

async function check() {
  const q = collection(db, "customers");
  const snap = await getDocs(q);
  console.log("Found", snap.docs.length, "customers in DB");
  
  const d = await getDoc(doc(db, "customers", "USR329614"));
  if (d.exists()) {
    console.log("FOUND USR329614 in Firestore!", d.data());
  } else {
    console.log("NOT FOUND USR329614 in Firestore");
  }
}
check().then(() => process.exit(0)).catch(console.error);
