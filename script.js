const activityDetails = {
  jumble: {
    title: "Jumble Words",
    category: "Sentence structure awareness",
    summary:
      "Great for building accurate sentence structure. It shows all the words of a sentence in a random order for students to reconstruct in the target language, with optional support from the translated version.",
    instruction:
      "Rewrite the sentences in the target language, with all the words in the correct order.",
  },
  initials: {
    title: "Initial Letters",
    category: "Contextual knowledge of vocab & structure",
    summary:
      "Provides just the first letters of each word as a hint to support structured translation of full sentences. Great for building confidence with familiar vocab and structures before more creative writing tasks.",
    instruction:
      "Rewrite the sentences in the target language, using the first letter of each word to help you.",
  },
};

const exampleTarget = [
  "Ich bin in die Stadt gegangen",
  "Ich habe einen Film gesehen",
  "Es war lustig",
].join("\n");

const exampleEnglish = [
  "I went into town.",
  "I watched a film.",
  "It was funny.",
].join("\n");

const state = {
  activity: "jumble",
  sentences: [],
  translations: [],
  showEnglish: false,
  allRevealed: false,
};

const landingPage = document.querySelector("#landingPage");
const activityPage = document.querySelector("#activityPage");
const targetInput = document.querySelector("#targetInput");
const englishInput = document.querySelector("#englishInput");
const activityHelp = document.querySelector("#activityHelp");
const puzzleList = document.querySelector("#puzzleList");
const activityTitle = document.querySelector("#activityTitle");
const activityCategory = document.querySelector("#activityCategory");
const activitySummary = document.querySelector("#activitySummary");
const studentInstruction = document.querySelector("#studentInstruction");
const activitySwitcher = document.querySelector("#activitySwitcher");
const showAllButton = document.querySelector("#showAllButton");
const showEnglishButton = document.querySelector("#showEnglishButton");
const copyButton = document.querySelector("#copyButton");
const xlButton = document.querySelector("#xlButton");

function splitLines(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function collectInputs() {
  const sentences = splitLines(targetInput.value);
  const translationsRaw = englishInput.value.split(/\r?\n/).map((line) => line.trim());
  const translations = sentences.map((_, index) => translationsRaw[index] || "");
  return { sentences, translations };
}

function showActivity(activityName) {
  const { sentences, translations } = collectInputs();

  if (sentences.length === 0) {
    targetInput.focus();
    alert("Please enter at least one sentence first.");
    return;
  }

  state.activity = activityName;
  state.sentences = sentences;
  state.translations = translations;
  state.showEnglish = false;
  state.allRevealed = false;

  landingPage.classList.add("hidden");
  activityPage.classList.remove("hidden");
  activitySwitcher.value = activityName;
  renderActivity();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderActivity() {
  const details = activityDetails[state.activity];

  activityTitle.textContent = details.title;
  activityCategory.textContent = details.category;
  activitySummary.textContent = details.summary;
  studentInstruction.textContent = details.instruction;
  showEnglishButton.textContent = state.showEnglish ? "Hide English" : "Show English";
  showAllButton.textContent = state.allRevealed ? "Hide All Answers" : "Show All Answers";

  puzzleList.innerHTML = "";

  state.sentences.forEach((sentence, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "puzzle-card";
    card.dataset.answer = sentence;
    card.dataset.puzzle = createPuzzle(sentence, state.activity);

    const puzzleText = document.createElement("div");
    puzzleText.className = "puzzle-text";

    const translation = document.createElement("div");
    translation.className = "translation-box";
    if (state.showEnglish && state.translations[index]) {
      translation.classList.add("visible");
    }
    translation.innerHTML = `<strong>English</strong>${escapeHtml(state.translations[index] || "No English translation entered.")}`;

    card.appendChild(puzzleText);
    card.appendChild(translation);

    card.addEventListener("click", () => {
      card.classList.toggle("revealed");
      updateShowAllStateFromCards();
      updateCardText(card, index);
    });

    puzzleList.appendChild(card);
    updateCardText(card, index);
  });
}

function createPuzzle(sentence, activityName) {
  if (activityName === "jumble") return jumbleWords(sentence);
  if (activityName === "initials") return initialLetters(sentence);
  return sentence;
}

function jumbleWords(sentence) {
  const words = sentence.match(/\S+/g) || [];
  if (words.length <= 1) return sentence;

  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  if (shuffled.join(" ") === words.join(" ")) {
    shuffled.reverse();
  }

  return shuffled.join("     ");
}

function initialLetters(sentence) {
  const words = sentence.match(/\S+/g) || [];
  return words
    .map((word) => {
      const firstLetter = word.match(/\p{L}/u)?.[0] || word[0] || "";
      const finalPunctuation = word.match(/[.!?,;:)]$/u)?.[0] || "";
      return `${firstLetter}${finalPunctuation}`;
    })
    .join("  ");
}

function updateCardText(card, index) {
  const isRevealed = card.classList.contains("revealed");
  const textElement = card.querySelector(".puzzle-text");
  const label = isRevealed ? `<span class="answer-label">Answer</span><br>` : "";
  const content = isRevealed ? state.sentences[index] : card.dataset.puzzle;
  textElement.innerHTML = `${label}<span class="number">${index + 1}.</span>${escapeHtml(content)}`;
}

function updateShowAllStateFromCards() {
  const cards = [...document.querySelectorAll(".puzzle-card")];
  state.allRevealed = cards.length > 0 && cards.every((card) => card.classList.contains("revealed"));
  showAllButton.textContent = state.allRevealed ? "Hide All Answers" : "Show All Answers";
}

function setAllCardsRevealed(reveal) {
  state.allRevealed = reveal;
  document.querySelectorAll(".puzzle-card").forEach((card, index) => {
    card.classList.toggle("revealed", reveal);
    updateCardText(card, index);
  });
  showAllButton.textContent = reveal ? "Hide All Answers" : "Show All Answers";
}

function toggleEnglish() {
  state.showEnglish = !state.showEnglish;
  showEnglishButton.textContent = state.showEnglish ? "Hide English" : "Show English";
  document.querySelectorAll(".translation-box").forEach((box, index) => {
    box.classList.toggle("visible", state.showEnglish && Boolean(state.translations[index]));
  });
}

function copyCurrentActivity() {
  const lines = [];
  const details = activityDetails[state.activity];
  lines.push(details.title);
  lines.push(details.instruction);
  lines.push("");

  state.sentences.forEach((sentence, index) => {
    const card = document.querySelectorAll(".puzzle-card")[index];
    const puzzle = card?.dataset.puzzle || createPuzzle(sentence, state.activity);
    lines.push(`${index + 1}. ${puzzle}`);
    if (state.showEnglish && state.translations[index]) {
      lines.push(`English: ${state.translations[index]}`);
    }
    if (card?.classList.contains("revealed")) {
      lines.push(`Answer: ${sentence}`);
    }
    lines.push("");
  });

  navigator.clipboard
    .writeText(lines.join("\n"))
    .then(() => {
      copyButton.textContent = "Copied!";
      setTimeout(() => (copyButton.textContent = "Copy"), 1200);
    })
    .catch(() => alert("Copy did not work in this browser. You can still select and copy the text manually."));
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function goBack() {
  activityPage.classList.add("hidden");
  landingPage.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".activity-button").forEach((button) => {
  const activityName = button.dataset.activity;
  const details = activityDetails[activityName];

  button.addEventListener("click", () => showActivity(activityName));
  button.addEventListener("mouseenter", () => {
    activityHelp.innerHTML = `<strong>${details.title}</strong><br>${details.summary}`;
  });
  button.addEventListener("focus", () => {
    activityHelp.innerHTML = `<strong>${details.title}</strong><br>${details.summary}`;
  });
});

document.querySelector("#exampleButton").addEventListener("click", () => {
  targetInput.value = exampleTarget;
  englishInput.value = exampleEnglish;
  targetInput.focus();
});

document.querySelector("#clearButton").addEventListener("click", () => {
  targetInput.value = "";
  englishInput.value = "";
  targetInput.focus();
});

activitySwitcher.addEventListener("change", (event) => {
  state.activity = event.target.value;
  state.allRevealed = false;
  renderActivity();
});

showAllButton.addEventListener("click", () => setAllCardsRevealed(!state.allRevealed));
showEnglishButton.addEventListener("click", toggleEnglish);
copyButton.addEventListener("click", copyCurrentActivity);
xlButton.addEventListener("click", () => document.body.classList.toggle("xl-mode"));
document.querySelector("#backButton").addEventListener("click", goBack);
document.querySelector("#backTopButton").addEventListener("click", goBack);

targetInput.value = exampleTarget;
englishInput.value = exampleEnglish;
