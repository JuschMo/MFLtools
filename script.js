const activityDetails = {
  show: {
    title: "Show Sentences",
    category: "Your choice of sentence-based task",
    summary: "Simply display sentences one by one, with or without translations. Ideal for no-prep listening, reading, and translation activities.",
    instruction: "Read the sentences carefully. Your teacher will tell you what to do with them.",
  },
  speed: {
    title: "Speed Reader",
    category: "Read-aloud practice",
    summary: "Plays your sentences word by word at 50-300 words per minute, so students can say each word as it appears.",
    instruction: "Say each word aloud as it appears on the screen.",
  },
  jumble: {
    title: "Jumble Words",
    category: "Sentence structure awareness",
    summary: "Shows all the words of a sentence in a random order for students to reconstruct in the target language, with optional support from the translated version.",
    instruction: "Rewrite the sentences in the target language, with all the words in the correct order.",
  },
  vowels: {
    title: "Remove Vowels",
    category: "Word-level vocab recognition",
    summary: "Builds recognition of key vocab by showing words without vowels.",
    instruction: "Rewrite the sentences in the target language by adding all of the vowels back in.",
  },
  letters: {
    title: "Jumble Letters",
    category: "Word-level vocab recognition",
    summary: "Shows anagrammed forms of each word of a sentence for students to identify and write the words correctly.",
    instruction: "Unjumble the letters of each word to write the sentences correctly.",
  },
  spaces: {
    title: "Remove Spaces",
    category: "Contextual knowledge of vocab & structure",
    summary: "Displays sentences as one long string of input with no spaces between words.",
    instruction: "Rewrite the sentences in the target language by adding all of the spaces back in the right places.",
  },
  initials: {
    title: "Initial Letters",
    category: "Contextual knowledge of vocab & structure",
    summary: "Provides just the first letters of each word as a hint to support structured translation of full sentences.",
    instruction: "Rewrite the sentences in the target language, using the first letter of each word to help you.",
  },
  delayed: {
    title: "Delayed Translation",
    category: "Processing meaning under time constraint",
    summary: "Displays the target language sentence briefly before it disappears, then students write the translation in English.",
    instruction: "Read and memorise the sentence. Then once it disappears, write its translation.",
  },
  missing: {
    title: "Missing Words",
    category: "Processing vocab & structure of full sentences",
    summary: "Shows sentences with one or more words missing for students to add.",
    instruction: "Write the full correct sentence, including the missing word(s) in the right place(s).",
  },
  disappearing: {
    title: "Disappearing Words",
    category: "Memorising & processing input",
    summary: "The full sentence appears first, then random words disappear for students to write down.",
    instruction: "Read and memorise the sentence. Then write the word(s) that disappear(s) in the target language.",
  },
  alternate: {
    title: "Alternate Words",
    category: "Processing vocab & structure of full sentences",
    summary: "Every other word is missing from the sentences to support structured writing.",
    instruction: "Write the full sentence, including the missing words. Every other word is provided to help you.",
  },
  moving: {
    title: "Moving Words",
    category: "Decoding & memorising sentence chunks",
    summary: "Shows sentences gradually, one or a few words at a time. Each chunk disappears before the next one begins.",
    instruction: "Read and memorise the full sentence as it moves up the screen in sections. Once it has all finished, write the full sentence.",
  },
};

const activityOrder = [
  "show", "speed", "jumble", "vowels", "letters", "spaces", "initials", "delayed", "missing", "disappearing", "alternate", "moving",
];

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
  textSize: "l",
  option: "",
  playing: false,
  playTimer: null,
};

const landingPage = document.querySelector("#landingPage");
const activityPage = document.querySelector("#activityPage");
const targetInput = document.querySelector("#targetInput");
const englishInput = document.querySelector("#englishInput");
const activityHelp = document.querySelector("#activityHelp");
const activityButtons = document.querySelector("#activityButtons");
const puzzleList = document.querySelector("#puzzleList");
const activityTitle = document.querySelector("#activityTitle");
const studentInstruction = document.querySelector("#studentInstruction");
const activitySwitcher = document.querySelector("#activitySwitcher");
const showAllButton = document.querySelector("#showAllButton");
const showEnglishButton = document.querySelector("#showEnglishButton");
const copyButton = document.querySelector("#copyButton");
const textSizeSelect = document.querySelector("#textSizeSelect");
const activityOptionSelect = document.querySelector("#activityOptionSelect");
const startButton = document.querySelector("#startButton");

function buildActivityControls() {
  activityOrder.forEach((key) => {
    const details = activityDetails[key];

    const button = document.createElement("button");
    button.className = "activity-button";
    button.dataset.activity = key;
    button.type = "button";
    button.innerHTML = `<span>${escapeHtml(details.title)}</span><small>${escapeHtml(details.category)}</small>`;
    button.addEventListener("click", () => showActivity(key));
    button.addEventListener("mouseenter", () => {
      activityHelp.innerHTML = `<strong>${escapeHtml(details.title)}</strong><br>${escapeHtml(details.summary)}`;
    });
    button.addEventListener("focus", () => {
      activityHelp.innerHTML = `<strong>${escapeHtml(details.title)}</strong><br>${escapeHtml(details.summary)}`;
    });
    activityButtons.appendChild(button);

    const option = document.createElement("option");
    option.value = key;
    option.textContent = details.title;
    activitySwitcher.appendChild(option);
  });
}

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

  stopPlayback();
  state.activity = activityName;
  state.sentences = sentences;
  state.translations = translations;
  state.showEnglish = false;
  state.allRevealed = false;
  setDefaultOptionForActivity(activityName);

  landingPage.classList.add("hidden");
  activityPage.classList.remove("hidden");
  activitySwitcher.value = activityName;
  renderActivity();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setDefaultOptionForActivity(activityName) {
  const defaults = {
    speed: "120",
    delayed: "5",
    disappearing: "2",
    missing: "1",
    alternate: "odd",
    moving: "2",
  };
  state.option = defaults[activityName] || "";
}

function renderActivity() {
  stopPlayback();
  const details = activityDetails[state.activity];
  activityTitle.textContent = details.title;
  studentInstruction.textContent = details.instruction;
  showEnglishButton.textContent = state.showEnglish ? "Hide English" : "Show English";
  showAllButton.textContent = state.allRevealed ? "Hide All Answers" : "Show All Answers";
  setupActivityOption();

  puzzleList.innerHTML = "";
  puzzleList.classList.toggle("reader-mode", isPlaybackActivity());

  state.sentences.forEach((sentence, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "puzzle-card";
    card.dataset.answer = sentence;
    card.dataset.puzzle = createPuzzle(sentence, state.activity, index);

    const puzzleText = document.createElement("div");
    puzzleText.className = "puzzle-text";

    const translation = document.createElement("div");
    translation.className = "translation-box";
    if (state.showEnglish && state.translations[index]) translation.classList.add("visible");
    translation.innerHTML = escapeHtml(state.translations[index] || "No English translation entered.");

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

function setupActivityOption() {
  activityOptionSelect.innerHTML = "";
  activityOptionSelect.classList.add("hidden-control");
  startButton.classList.add("hidden-control");
  startButton.textContent = "Start";

  const options = {
    speed: { label: "Speed", values: [["50", "50 wpm"], ["80", "80 wpm"], ["120", "120 wpm"], ["160", "160 wpm"], ["200", "200 wpm"], ["250", "250 wpm"], ["300", "300 wpm"]] },
    delayed: { label: "Time", values: [["3", "3 sec"], ["5", "5 sec"], ["8", "8 sec"], ["10", "10 sec"]] },
    disappearing: { label: "Hide", values: [["1", "1 word"], ["2", "2 words"], ["3", "3 words"], ["4", "4 words"]] },
    missing: { label: "Missing", values: [["1", "1 word"], ["2", "2 words"], ["3", "3 words"], ["4", "4 words"]] },
    alternate: { label: "Pattern", values: [["odd", "Odd words"], ["even", "Even words"], ["alt", "Alternating"]] },
    moving: { label: "Chunk", values: [["1", "1 word"], ["2", "2 words"], ["3", "3 words"]] },
  };

  const config = options[state.activity];
  if (!config) return;

  config.values.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    activityOptionSelect.appendChild(option);
  });
  activityOptionSelect.value = state.option;
  activityOptionSelect.title = config.label;
  activityOptionSelect.classList.remove("hidden-control");

  if (isPlaybackActivity() || state.activity === "disappearing") {
    startButton.classList.remove("hidden-control");
    startButton.textContent = state.activity === "disappearing" ? "Hide Words" : "Start";
  }
}

function isPlaybackActivity() {
  return ["speed", "moving", "delayed"].includes(state.activity);
}

function createPuzzle(sentence, activityName, index) {
  if (activityName === "show") return sentence;
  if (activityName === "jumble") return jumbleWords(sentence);
  if (activityName === "initials") return initialLetters(sentence);
  if (activityName === "letters") return jumbleLetters(sentence);
  if (activityName === "vowels") return removeVowels(sentence);
  if (activityName === "spaces") return sentence.replace(/\s+/g, "");
  if (activityName === "missing") return missingWords(sentence, Number(state.option || 1));
  if (activityName === "disappearing") return sentence;
  if (activityName === "alternate") return alternateWords(sentence, state.option, index);
  if (activityName === "speed") return "Click Start to begin.";
  if (activityName === "moving") return "Click Start to begin.";
  if (activityName === "delayed") return sentence;
  return sentence;
}

function jumbleWords(sentence) {
  const words = sentence.match(/\S+/g) || [];
  if (words.length <= 1) return sentence;
  const shuffled = shuffleArray(words);
  if (shuffled.join(" ") === words.join(" ")) shuffled.reverse();
  return shuffled.join("     ");
}

function jumbleLetters(sentence) {
  return sentence.replace(/[\p{L}ÄÖÜäöüß]+/gu, (word) => {
    if (word.length <= 2) return word;
    const letters = [...word];
    const shuffled = shuffleArray(letters);
    if (shuffled.join("") === word) shuffled.reverse();
    return shuffled.join("");
  });
}

function initialLetters(sentence) {
  const words = sentence.match(/\S+/g) || [];
  return words
    .map((word) => {
      const firstLetter = word.match(/\p{L}/u)?.[0] || word[0] || "";
      const finalPunctuation = word.match(/[.!?,;:)]$/u)?.[0] || "";
      return `${firstLetter}_${finalPunctuation}`;
    })
    .join("  ");
}

function removeVowels(sentence) {
  return sentence.replace(/[aeiouäöüAEIOUÄÖÜ]/g, "_");
}

function missingWords(sentence, count) {
  const words = sentence.match(/\S+/g) || [];
  const hidden = randomIndexes(words.length, Math.min(count, words.length));
  return words.map((word, index) => hidden.has(index) ? blankForWord(word) : word).join(" ");
}

function alternateWords(sentence, pattern, sentenceIndex) {
  const words = sentence.match(/\S+/g) || [];
  const useOdd = pattern === "odd" || (pattern === "alt" && sentenceIndex % 2 === 0);
  return words.map((word, index) => {
    const hide = useOdd ? index % 2 === 0 : index % 2 === 1;
    return hide ? blankForWord(word) : word;
  }).join(" ");
}

function hideWordsInExistingCards() {
  document.querySelectorAll(".puzzle-card").forEach((card, index) => {
    card.classList.remove("revealed");
    card.dataset.puzzle = missingWords(state.sentences[index], Number(state.option || 2));
    updateCardText(card, index);
  });
  updateShowAllStateFromCards();
}

function blankForWord(word) {
  const punctuation = word.match(/[.!?,;:)]$/u)?.[0] || "";
  return "_____" + punctuation;
}

function shuffleArray(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomIndexes(length, count) {
  const indexes = shuffleArray([...Array(length).keys()]);
  return new Set(indexes.slice(0, count));
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
  stopPlayback();
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
    const puzzle = card?.dataset.puzzle || createPuzzle(sentence, state.activity, index);
    lines.push(`${index + 1}. ${puzzle}`);
    if (state.showEnglish && state.translations[index]) lines.push(state.translations[index]);
    if (card?.classList.contains("revealed")) lines.push(`Answer: ${sentence}`);
    lines.push("");
  });

  navigator.clipboard.writeText(lines.join("\n")).then(() => {
    copyButton.textContent = "Copied!";
    setTimeout(() => (copyButton.textContent = "Copy"), 1200);
  }).catch(() => alert("Copy did not work in this browser. You can still select and copy the text manually."));
}

function startPlayback() {
  stopPlayback();
  if (state.activity === "disappearing") {
    hideWordsInExistingCards();
    return;
  }
  if (state.activity === "speed") playSpeedReader();
  if (state.activity === "moving") playMovingWords();
  if (state.activity === "delayed") playDelayedTranslation();
}

function stopPlayback() {
  state.playing = false;
  if (state.playTimer) clearTimeout(state.playTimer);
  state.playTimer = null;
}

function playSpeedReader() {
  const words = state.sentences.flatMap((sentence, sentenceIndex) => {
    const sentenceWords = sentence.match(/\S+/g) || [];
    return sentenceWords.map((word) => ({ word, sentenceIndex }));
  });
  const cards = [...document.querySelectorAll(".puzzle-card")];
  cards.forEach((card) => card.classList.add("reader-card"));
  const delay = 60000 / Number(state.option || 120);
  let position = 0;
  state.playing = true;

  function step() {
    cards.forEach((card) => card.querySelector(".puzzle-text").innerHTML = "");
    if (position >= words.length) {
      cards.forEach((card, index) => updateCardText(card, index));
      stopPlayback();
      return;
    }
    const item = words[position];
    const card = cards[item.sentenceIndex];
    card.querySelector(".puzzle-text").innerHTML = `<span class="reader-word">${escapeHtml(item.word)}</span>`;
    position += 1;
    state.playTimer = setTimeout(step, delay);
  }
  step();
}

function playMovingWords() {
  const cards = [...document.querySelectorAll(".puzzle-card")];
  const chunkSize = Number(state.option || 2);
  let sentenceIndex = 0;
  let chunkIndex = 0;
  state.playing = true;

  function step() {
    cards.forEach((card) => card.querySelector(".puzzle-text").innerHTML = "");
    if (sentenceIndex >= state.sentences.length) {
      cards.forEach((card, index) => updateCardText(card, index));
      stopPlayback();
      return;
    }
    const words = state.sentences[sentenceIndex].match(/\S+/g) || [];
    const chunk = words.slice(chunkIndex, chunkIndex + chunkSize).join(" ");
    const card = cards[sentenceIndex];
    card.querySelector(".puzzle-text").innerHTML = `<span class="number">${sentenceIndex + 1}.</span><span class="moving-chunk">${escapeHtml(chunk)}</span>`;
    chunkIndex += chunkSize;
    if (chunkIndex >= words.length) {
      chunkIndex = 0;
      sentenceIndex += 1;
    }
    state.playTimer = setTimeout(step, 1150);
  }
  step();
}

function playDelayedTranslation() {
  const cards = [...document.querySelectorAll(".puzzle-card")];
  const delay = Number(state.option || 5) * 1000;
  cards.forEach((card, index) => {
    card.classList.remove("revealed");
    card.dataset.puzzle = state.sentences[index];
    updateCardText(card, index);
  });
  state.playTimer = setTimeout(() => {
    cards.forEach((card, index) => {
      card.querySelector(".puzzle-text").innerHTML = `<span class="number">${index + 1}.</span>_____`;
    });
    stopPlayback();
  }, delay);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function goBack() {
  stopPlayback();
  activityPage.classList.add("hidden");
  landingPage.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

buildActivityControls();

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
  setDefaultOptionForActivity(state.activity);
  renderActivity();
});

activityOptionSelect.addEventListener("change", (event) => {
  state.option = event.target.value;
  state.allRevealed = false;
  renderActivity();
});

startButton.addEventListener("click", startPlayback);
showAllButton.addEventListener("click", () => setAllCardsRevealed(!state.allRevealed));
showEnglishButton.addEventListener("click", toggleEnglish);
copyButton.addEventListener("click", copyCurrentActivity);
textSizeSelect.addEventListener("change", (event) => {
  state.textSize = event.target.value;
  document.body.classList.remove("text-size-s", "text-size-m", "text-size-l", "text-size-xl");
  document.body.classList.add(`text-size-${state.textSize}`);
});
document.querySelector("#backButton").addEventListener("click", goBack);
document.querySelector("#backTopButton").addEventListener("click", goBack);

targetInput.value = exampleTarget;
englishInput.value = exampleEnglish;
document.body.classList.add("text-size-l");
