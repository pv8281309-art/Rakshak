import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  projectId: "operation-rakshak-3",
  appId: "1:612003640918:web:f29636add0b15aacbfedf7",
  apiKey: "AIzaSyAOtx5-TkTC1PW9QqdNE6kd-LSiRgW49JI",
  authDomain: "operation-rakshak-3.firebaseapp.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const q = collection(db, "customers");
  const snap = await getDocs(q);
  console.log("Found", snap.docs.length, "users");
  snap.forEach(d => console.log(d.id, "=>", d.data()));
}
check().catch(console.error);
