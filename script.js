// Import Firebase and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB02pehEYT40ON39bpP_63nGTypF17HUBI",
  authDomain: "mtg-hot-or-not.firebaseapp.com",
  databaseURL: "https://mtg-hot-or-not-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mtg-hot-or-not",
  storageBucket: "mtg-hot-or-not.firebasestorage.app",
  messagingSenderId: "627806220702",
  appId: "1:627806220702:web:795ba74a6f8e435cca268f",
  measurementId: "G-2E1Y90KS2B"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Save vote data to Firebase
async function saveVote(cardName, vote) {
  const cardRef = doc(db, "votes", cardName);
  const cardDoc = await getDoc(cardRef);

  if (cardDoc.exists()) {
    const newWins = vote === "left" ? cardDoc.data().wins + 1 : cardDoc.data().wins;
    const newMatches = cardDoc.data().matches + 1;
    await updateDoc(cardRef, { wins: newWins, matches: newMatches });
  } else {
    await setDoc(cardRef, {
      wins: vote === "left" ? 1 : 0,
      matches: 1
    });
  }
}

// Fetch a random card from the TDM set
async function fetchRandomCardFromTDM() {
  const response = await fetch("https://api.scryfall.com/cards/random?q=set%3Atdm");
  const data = await response.json();
  return data;
}

// Load two cards and set up vote handlers
async function loadCards() {
  const leftCardData = await fetchRandomCardFromTDM();
  let rightCardData;

  // Ensure different cards
  do {
    rightCardData = await fetchRandomCardFromTDM();
  } while (rightCardData.id === leftCardData.id);

  const leftCard = leftCardData.name;
  const rightCard = rightCardData.name;

  const leftImg = document.getElementById("card-left-img");
  const rightImg = document.getElementById("card-right-img");

  leftImg.src = leftCardData.image_uris.normal;
  rightImg.src = rightCardData.image_uris.normal;

  // Vote handlers with flash animation
  document.getElementById("vote-left").onclick = async () => {
    leftImg.classList.add("vote-flash");
    await saveVote(leftCard, "left");
    setTimeout(() => {
      leftImg.classList.remove("vote-flash");
      loadCards();
    }, 100);
  };

  document.getElementById("vote-right").onclick = async () => {
    rightImg.classList.add("vote-flash");
    await saveVote(rightCard, "right");
    setTimeout(() => {
      rightImg.classList.remove("vote-flash");
      loadCards();
    }, 300);
  };
}

// (Optional utility, not currently used)
async function fetchCardImage(name) {
  try {
    const res = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`);
    const data = await res.json();
    return data.image_uris?.normal || null;
  } catch (e) {
    console.error(`Failed to fetch image for ${name}`);
    return null;
  }
}

// Run on load
loadCards();
