import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBl7Ie57yoQxYzjOoYcDhSR9ehlqWb_77I",
  authDomain: "akademia-ecom.firebaseapp.com",
  databaseURL: "https://akademia-ecom-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "akademia-ecom",
  storageBucket: "akademia-ecom.firebasestorage.app",
  messagingSenderId: "677964048001",
  appId: "1:677964048001:web:93c14855f55b5b77224f80",
  measurementId: "G-D4GXDL0GBC"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const dbGet = async (key) => {
  try {
    const snapshot = await get(ref(db, key));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (e) { return null; }
};

export const dbSet = async (key, value) => {
  try {
    await set(ref(db, key), value);
    return true;
  } catch (e) { return false; }
};

export const dbListen = (key, callback) => {
  return onValue(ref(db, key), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
};
