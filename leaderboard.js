// Import Firebase Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

// Function to load leaderboard
async function loadLeaderboard() {
  const querySnapshot = await getDocs(collection(db, "votes"));
  const data = {};

  querySnapshot.forEach((doc) => {
    data[doc.id] = doc.data();
  });

  const sortedLeaderboard = Object.entries(data)
    .map(([cardName, stats]) => {
      const winRate = stats.matches > 0 ? (stats.wins / stats.matches * 100).toFixed(1) + "%" : "0%";
      return { name: cardName, ...stats, winRate };
    })
    .sort((a, b) => {
      const winRateA = a.matches > 0 ? a.wins / a.matches : 0;
      const winRateB = b.matches > 0 ? b.wins / b.matches : 0;
      return winRateB !== winRateA ? winRateB - winRateA : b.wins - a.wins;
    });

  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = "";  // Clear the current leaderboard

  for (const card of sortedLeaderboard) {
    const img = await fetchCardImage(card.name);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${img}" alt="${card.name}" class="card-image" style="width: 50px;"></td>  
      <td>${card.name} </td>
      <td>${card.wins}</td>
      <td>${card.matches}</td>
      <td>${card.winRate}</td>
    `;
    tbody.appendChild(row);
  }
}

// Function to fetch card image
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

// Load leaderboard when page is ready
loadLeaderboard();
