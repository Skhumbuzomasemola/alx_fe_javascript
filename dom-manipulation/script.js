// Load quotes from localStorage or use default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Imagination is more important than knowledge.", category: "Wisdom" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categorySelect = document.getElementById("categorySelect");

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate category dropdown
function updateCategoryOptions() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = `<option value="all">All</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Display a random quote
function displayRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;

  // Save to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Alias for compatibility
function showRandomQuote() {
  displayRandomQuote();
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();
  updateCategoryOptions();

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        updateCategoryOptions();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Load last quote from sessionStorage
function loadLastQuote() {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  }
}

// Event listeners
newQuoteBtn.addEventListener("click", displayRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Initialize
updateCategoryOptions();
loadLastQuote();
createAddQuoteForm(); // If you're dynamically building the form

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];

  // Clear existing options except "All"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    filterQuotes();
  }
}
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const quoteContainer = document.getElementById("quoteContainer");
  quoteContainer.innerHTML = "";

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  filteredQuotes.forEach(q => {
    const quoteElement = document.createElement("p");
    quoteElement.textContent = q.text;
    quoteContainer.appendChild(quoteElement);
  });
}
function addQuote(text, category) {
  quotes.push({ text, category });
  populateCategories(); // Refresh dropdown
  filterQuotes();       // Reapply filter
}

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";


setInterval(() => {
  fetchQuotesFromServer();
}, 30000);


async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();
    syncQuotes(serverQuotes);
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
}


function syncQuotes(serverQuotes) {
  const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
  const mergedQuotes = [];

  serverQuotes.forEach(serverQuote => {
    const localMatch = localQuotes.find(q => q.id === serverQuote.id);
    if (!localMatch) {
      mergedQuotes.push(serverQuote);
    } else {
      const serverTime = new Date(serverQuote.updatedAt || 0);
      const localTime = new Date(localMatch.updatedAt || 0);
      mergedQuotes.push(serverTime > localTime ? serverQuote : localMatch);
    }
  });

  localQuotes.forEach(localQuote => {
    if (!mergedQuotes.find(q => q.id === localQuote.id)) {
      mergedQuotes.push(localQuote);
    }
  });

  localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
  notifyUser("Quotes synced with server.");
  populateCategories();
  filterQuotes();
}


async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    notifyUser("Quote posted to server!");
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}


function notifyUser(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.className = "notification";
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}





