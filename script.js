// = Variables (the pet's state) =
let petName = "";
let hunger = 50;      // 0 = full, 100 = starving
let energy = 50;      // 0 = exhausted, 100 = full of energy
let happiness = 50;   // 0 = miserable, 100 = super happy
let actionCount = 0;
let lastAction = "";  // remembers what the user did last time

// ===== Get the elements from the page =====
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const nameInput = document.getElementById("name-input");
const nameError = document.getElementById("name-error");

const petNameText = document.getElementById("pet-name");
const petFace = document.getElementById("pet-face");
const petMessage = document.getElementById("pet-message");
const actionCountText = document.getElementById("action-count");

const feedBtn = document.getElementById("feed-btn");
const playBtn = document.getElementById("play-btn");
const sleepBtn = document.getElementById("sleep-btn");

// ===== Helper: keep a number between 0 and 100 =====
function limit(value) {
    if (value > 100) {
        return 100;
    } else if (value < 0) {
        return 0;
    } else {
        return value;
    }
}

// ===== Starting the game =====
function startGame() {
    let name = nameInput.value.trim();

    // check that the user actually typed a name
    if (name === "") {
        nameError.textContent = "Please type a name first!";
        return;
    }

    petName = name;
    localStorage.setItem("petName", petName); // remember the name next time

    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    petNameText.textContent = petName;

    updatePage();
}

// ===== Actions =====
function feed() {
    // if the pet was just fed, it doesn't want more food
    if (lastAction === "feed") {
        petMessage.textContent = petName + " is already full! Try something else.";
        happiness = happiness - 5;
    } else {
        petMessage.textContent = "Yum! " + petName + " enjoyed that.";
        hunger = hunger - 30;
        happiness = happiness + 5;
    }
    lastAction = "feed";
    afterAction();
}

function play() {
    // the pet can't play if it is too tired
    if (energy < 20) {
        petMessage.textContent = petName + " is too tired to play...";
        happiness = happiness - 5;
    } else {
        petMessage.textContent = petName + " had fun playing!";
        happiness = happiness + 20;
        energy = energy - 20;
        hunger = hunger + 15;
    }
    lastAction = "play";
    afterAction();
}

function sleep() {
    if (energy > 80) {
        petMessage.textContent = petName + " isn't sleepy right now.";
    } else {
        petMessage.textContent = petName + " took a nice nap. Zzz...";
        energy = energy + 40;
        hunger = hunger + 10;
    }
    lastAction = "sleep";
    afterAction();
}

// runs after every button click
function afterAction() {
    actionCount = actionCount + 1;

    // keep all stats between 0 and 100
    hunger = limit(hunger);
    energy = limit(energy);
    happiness = limit(happiness);

    updatePage();
}

// ===== Decide the pet's state =====
// This is the main conditional logic. The order matters:
// the most serious problems are checked first.
function getState() {
    if (hunger >= 100 || happiness <= 0) {
        return "gone";
    } else if (hunger >= 70) {
        return "hungry";
    } else if (energy <= 25) {
        return "tired";
    } else if (happiness < 40) {
        return "sad";
    } else {
        return "happy";
    }
}

// ===== Update everything on the page =====
function updatePage() {
    // update the bars and numbers
    document.getElementById("hunger-bar").style.width = hunger + "%";
    document.getElementById("energy-bar").style.width = energy + "%";
    document.getElementById("happy-bar").style.width = happiness + "%";

    document.getElementById("hunger-text").textContent = hunger;
    document.getElementById("energy-text").textContent = energy;
    document.getElementById("happy-text").textContent = happiness;

    // hunger bar turns red when it gets high
    if (hunger >= 70) {
        document.getElementById("hunger-bar").style.backgroundColor = "#e74c3c";
    } else {
        document.getElementById("hunger-bar").style.backgroundColor = "#4caf50";
    }

    actionCountText.textContent = "Actions taken: " + actionCount;

    // change the face and background based on the state
    let state = getState();
    gameScreen.className = "card state-" + state;

    if (state === "happy") {
        petFace.textContent = "😄";
    } else if (state === "hungry") {
        petFace.textContent = "😫";
        petMessage.textContent = petName + " is really hungry! Feed them!";
    } else if (state === "tired") {
        petFace.textContent = "🥱";
        petMessage.textContent = petName + " can barely keep their eyes open.";
    } else if (state === "sad") {
        petFace.textContent = "😢";
        petMessage.textContent = petName + " is feeling lonely. Play with them!";
    } else if (state === "gone") {
        petFace.textContent = "👻";
        petMessage.textContent = petName + " ran away to find a better owner... Click Start Over.";
        // game over, so turn off the buttons
        feedBtn.disabled = true;
        playBtn.disabled = true;
        sleepBtn.disabled = true;
    }

    // special message when the user has looked after the pet for a while
    if (actionCount === 15 && state === "happy") {
        petMessage.textContent = "You're a great owner! " + petName + " loves you ❤️";
    }
}

// ===== Start over =====
function resetGame() {
    hunger = 50;
    energy = 50;
    happiness = 50;
    actionCount = 0;
    lastAction = "";

    feedBtn.disabled = false;
    playBtn.disabled = false;
    sleepBtn.disabled = false;

    localStorage.removeItem("petName");
    nameInput.value = "";
    nameError.textContent = "";

    gameScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
}

// ===== Connect the buttons =====
document.getElementById("start-btn").addEventListener("click", startGame);
feedBtn.addEventListener("click", feed);
playBtn.addEventListener("click", play);
sleepBtn.addEventListener("click", sleep);
document.getElementById("reset-btn").addEventListener("click", resetGame);

// ===== When the page loads =====
// if the user named a pet before, welcome them back
let savedName = localStorage.getItem("petName");
if (savedName !== null) {
    nameInput.value = savedName;
    document.querySelector("#start-screen p").textContent = "Welcome back! Is this still your pet?";
}
