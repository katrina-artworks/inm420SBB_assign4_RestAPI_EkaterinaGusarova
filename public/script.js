"use strict";

const API_URL = "https://mashape-community-urban-dictionary.p.rapidapi.com/define";
const RAPIDAPI_HOST = "mashape-community-urban-dictionary.p.rapidapi.com";
const RAPIDAPI_KEY = "XXX";

const searchForm = document.getElementById("search-form");
const termInput = document.getElementById("term-input");
const searchBtn = document.getElementById("search-btn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const resultTermEl = document.getElementById("result-term");
const resultDefinitionEl = document.getElementById("result-definition");
const resultExampleEl = document.getElementById("result-example");
const resultAuthorEl = document.getElementById("result-author");
const resultVotesEl = document.getElementById("result-votes");

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = "status";
  if (type) {
    statusEl.classList.add(type);
  }
}

function clearResult() {
  resultEl.classList.add("hidden");
  resultTermEl.textContent = "";
  resultDefinitionEl.textContent = "";
  resultExampleEl.textContent = "";
  resultAuthorEl.textContent = "";
  resultVotesEl.textContent = "";
}

function cleanText(text) {
  if (!text) return "";
  return text.replace(/\[|\]/g, "");
}

async function fetchDefinition(term) {
  const requestUrl = `${API_URL}?term=${encodeURIComponent(term)}`;
  console.log(`[UrbanLookup] Fetching definition for: "${term}"`);
  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": RAPIDAPI_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function showResult(item) {
  resultTermEl.textContent = cleanText(item.word || "Unknown term");
  resultDefinitionEl.textContent = cleanText(item.definition || "No definition available.");

  const example = cleanText(item.example || "");
  resultExampleEl.textContent = example ? `Example: ${example}` : "Example: none provided.";

  resultAuthorEl.textContent = `Author: ${item.author || "unknown"}`;
  resultVotesEl.textContent = `Votes: ${item.thumbs_up || 0} up / ${item.thumbs_down || 0} down`;
  resultEl.classList.remove("hidden");
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const term = termInput.value.trim();
  console.log("[UrbanLookup] Search submitted.");
  if (!term) {
    console.warn("[UrbanLookup] Empty term submitted.");
    clearResult();
    setStatus("Please enter a term to search.", "error");
    termInput.focus();
    return;
  }

  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === "YOUR_RAPIDAPI_KEY") {
    console.warn("[UrbanLookup] Missing or placeholder RapidAPI key.");
    clearResult();
    setStatus("Add your RapidAPI key in script.js before searching.", "error");
    return;
  }

  searchBtn.disabled = true;
  setStatus(`Searching for "${term}"...`);
  clearResult();

  try {
    const data = await fetchDefinition(term);
    if (!data.list || data.list.length === 0) {
      console.log(`[UrbanLookup] No results found for "${term}".`);
      setStatus(`No results found for "${term}".`, "error");
      return;
    }

    showResult(data.list[0]);
    console.log(`[UrbanLookup] Showing first result for "${term}".`);
    setStatus(`Showing first definition for "${term}".`, "success");
  } catch (error) {
    console.error("Definition lookup failed:", error);
    setStatus(`Unable to fetch results. ${error.message}`, "error");
  } finally {
    searchBtn.disabled = false;
    console.log("[UrbanLookup] Search flow completed.");
  }
});
