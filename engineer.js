"use strict";

/* =========================================================
   SPA ENGINEER V6
   Short calls + no overlapping audio + robust buttons
   ========================================================= */

const CONFIG = {
    defaultPace: "1:47",
    audioFolder: "audio/",
    speechFallback: true
};


/* =========================================================
   PACE
   ========================================================= */

const PACE_PROFILES = {
    "1:45": {
        seconds: 105,
        multiplier: 1
    },

    "1:46": {
        seconds: 106,
        multiplier: 106 / 105
    },

    "1:47": {
        seconds: 107,
        multiplier: 107 / 105
    },

    "1:48": {
        seconds: 108,
        multiplier: 108 / 105
    }
};


/* =========================================================
   ENGINEER CALLS
   ========================================================= */

const CORNERS = [

    [1, 18.0, "turn-1.mp3",
        "Brake straight. Late apex. Early throttle."],

    [2, 22.2, "turn-2.mp3",
        "Tight left. Prepare right."],

    [3, 25.0, "turn-3.mp3",
        "Trail brake. Late apex. Power."],

    [4, 28.2, "turn-4.mp3",
        "Smooth left. Late apex."],

    [5, 31.2, "turn-5.mp3",
        "Carry speed. Early throttle."],

    [6, 34.8, "turn-6.mp3",
        "Light brake. Late apex."],

    [7, 38.0, "turn-7.mp3",
        "Stay tight. Early power."],

    [8, 42.0, "turn-8.mp3",
        "Brake straight. Late apex."],

    [9, 45.0, "turn-9.mp3",
        "Sacrifice entry. Maximize exit."],

    [10, 50.0, "turn-10.mp3",
        "Hard brake. Rotate. Power."],

    [11, 53.0, "turn-11.mp3",
        "Short brake. Carry speed."],

    [12, 56.5, "turn-12.mp3",
        "Don't over-slow. Early power."],

    [13, 60.0, "turn-13.mp3",
        "Late apex. Build throttle."],

    [14, 64.0, "turn-14.mp3",
        "Light brake. Patient rotation."],

    [15, 68.0, "turn-15.mp3",
        "Late apex. Get straight."],

    [16, 73.0, "turn-16.mp3",
        "Brake straight. Rotate. Exit."],

    [17, 76.5, "turn-17.mp3",
        "Carry speed. Stay smooth."],

    [18, 82.0, "turn-18.mp3",
        "Commit. Controlled throttle."],

    [19, 86.0, "turn-19.mp3",
        "Late apex. Full throttle."]
];


/* =========================================================
   STATE
   ========================================================= */

let running = false;
let elapsed = 0;
let startTime = 0;
let currentLap = 1;
let selectedPace = CONFIG.defaultPace;
let animationFrame = null;

let triggeredCorners = new Set();

let audioQueue = [];
let audioPlaying = false;
let currentAudio = null;


/* =========================================================
   FIND ELEMENT
   ========================================================= */

function findElement(...selectors) {

    for (const selector of selectors) {

        const element =
            document.querySelector(selector);

        if (element) return element;
    }

    return null;
}


/* =========================================================
   FIND BUTTON BY TEXT
   ========================================================= */

function findButtonByText(words) {

    const buttons =
        document.querySelectorAll(
            "button, input[type='button'], input[type='submit']"
        );

    for (const button of buttons) {

        const text =
            (
                button.textContent ||
                button.value ||
                ""
            )
            .trim()
            .toLowerCase();

        for (const word of words) {

            if (text.includes(word)) {
                return button;
            }
        }
    }

    return null;
}


/* =========================================================
   UI ELEMENTS
   ========================================================= */

const timerDisplay = findElement(
    "#timer",
    "#lapTimer",
    "#time",
    ".timer"
);

const lapDisplay = findElement(
    "#lap",
    "#lapNumber",
    ".lap"
);

const paceDisplay = findElement(
    "#pace",
    "#lapPace",
    ".pace"
);

const cornerDisplay = findElement(
    "#corner",
    "#currentCorner",
    ".corner"
);

const callDisplay = findElement(
    "#call",
    "#engineerCall",
    ".call"
);

const statusDisplay = findElement(
    "#status",
    ".status"
);

const startButton =
    findElement(
        "#start",
        "#startBtn",
        "#startButton",
        "[data-action='start']"
    ) ||
    findButtonByText([
        "start",
        "begin",
        "go"
    ]);

const stopButton =
    findElement(
        "#stop",
        "#stopBtn",
        "#stopButton",
        "[data-action='stop']"
    ) ||
    findButtonByText([
        "stop",
        "pause"
    ]);

const resetButton =
    findElement(
        "#reset",
        "#resetBtn",
        "#resetButton",
        "[data-action='reset']"
    ) ||
    findButtonByText([
        "reset"
    ]);

const paceSelect = findElement(
    "#paceSelect",
    "#paceSelector",
    "#lapSelect",
    "select[name='pace']"
);


/* =========================================================
   DISPLAY
   ========================================================= */

function formatTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    const hundredths =
        Math.floor(
            (seconds % 1) * 100
        );

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0") +
        "." +
        String(hundredths).padStart(2, "0")
    );
}


function updateDisplay() {

    if (timerDisplay) {
        timerDisplay.textContent =
            formatTime(elapsed);
    }

    if (lapDisplay) {
        lapDisplay.textContent =
            `LAP ${currentLap}`;
    }

    if (paceDisplay) {
        paceDisplay.textContent =
            selectedPace;
    }
}


function updateCall(text) {

    if (!callDisplay) return;

    callDisplay.textContent = text;

    callDisplay.classList.remove("active");

    void callDisplay.offsetWidth;

    callDisplay.classList.add("active");
}


function updateStatus(text) {

    if (statusDisplay) {
        statusDisplay.textContent = text;
    }
}


function updateCorner(number) {

    if (!cornerDisplay) return;

    if (!number) {

        cornerDisplay.textContent = "—";

        return;
    }

    cornerDisplay.textContent =
        `TURN ${number}`;
}


/* =========================================================
   AUDIO QUEUE
   ========================================================= */

function queueCall(text, audioFile = null) {

    audioQueue.push({
        text,
        audioFile
    });

    processQueue();
}


async function processQueue() {

    if (audioPlaying) return;

    if (audioQueue.length === 0) return;

    audioPlaying = true;

    const call =
        audioQueue.shift();

    updateCall(call.text);

    let played = false;

    if (call.audioFile) {

        played =
            await playAudio(
                call.audioFile
            );
    }

    if (!played) {

        await speak(
            call.text
        );
    }

    audioPlaying = false;

    currentAudio = null;

    processQueue();
}


/* =========================================================
   AUDIO FILE
   ========================================================= */

function playAudio(filename) {

    return new Promise(resolve => {

        const audio =
            new Audio(
                CONFIG.audioFolder +
                filename
            );

        currentAudio = audio;

        let finished = false;

        function finish(success) {

            if (finished) return;

            finished = true;

            audio.onended = null;
            audio.onerror = null;

            resolve(success);
        }

        audio.onended = () => {
            finish(true);
        };

        audio.onerror = () => {
            finish(false);
        };

        audio.volume = 1;

        audio.play()
            .catch(() => {
                finish(false);
            });
    });
}


/* =========================================================
   BROWSER VOICE
   ========================================================= */

function speak(text) {

    return new Promise(resolve => {

        if (
            !CONFIG.speechFallback ||
            !("speechSynthesis" in window)
        ) {

            resolve();

            return;
        }

        window.speechSynthesis.cancel();

        const voice =
            new SpeechSynthesisUtterance(
                text
            );

        voice.rate = 1.08;
        voice.pitch = 0.85;
        voice.volume = 1;

        voice.onend = resolve;
        voice.onerror = resolve;

        window.speechSynthesis.speak(
            voice
        );
    });
}


/* =========================================================
   CORNER TIMING
   ========================================================= */

function cornerTime(baseTime) {

    return (
        baseTime *
        PACE_PROFILES[selectedPace]
            .multiplier
    );
}


function checkCorners() {

    for (const corner of CORNERS) {

        const number = corner[0];
        const time = corner[1];
        const audio = corner[2];
        const text = corner[3];

        if (
            elapsed >= cornerTime(time) &&
            !triggeredCorners.has(number)
        ) {

            triggeredCorners.add(number);

            updateCorner(number);

            queueCall(
                text,
                audio
            );
        }
    }
}


/* =========================================================
   START
   ========================================================= */

function startEngineer() {

    if (running) return;

    running = true;

    startTime =
        performance.now() -
        elapsed * 1000;

    updateStatus(
        `ENGINEER ACTIVE — ${selectedPace}`
    );

    if (elapsed < 0.5) {

        queueCall(
            "Green light. Push.",
            "start.mp3"
        );
    }

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   STOP
   ========================================================= */

function stopEngineer() {

    running = false;

    cancelAnimationFrame(
        animationFrame
    );

    animationFrame = null;

    audioQueue = [];

    if (currentAudio) {

        currentAudio.pause();

        currentAudio.currentTime = 0;

        currentAudio = null;
    }

    audioPlaying = false;

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();
    }

    updateStatus("PAUSED");
}


/* =========================================================
   RESET
   ========================================================= */

function resetEngineer() {

    running = false;

    cancelAnimationFrame(
        animationFrame
    );

    animationFrame = null;

    audioQueue = [];

    if (currentAudio) {

        currentAudio.pause();

        currentAudio.currentTime = 0;

        currentAudio = null;
    }

    audioPlaying = false;

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();
    }

    elapsed = 0;

    currentLap = 1;

    triggeredCorners.clear();

    updateDisplay();

    updateCorner(null);

    updateCall(
        "ENGINEER READY"
    );

    updateStatus(
        `READY — ${selectedPace}`
    );
}


/* =========================================================
   LAP FINISH
   ========================================================= */

function checkLapFinish() {

    const target =
        PACE_PROFILES[selectedPace]
            .seconds;

    if (elapsed >= target) {

        running = false;

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;

        queueCall(
            "Lap complete.",
            "finish.mp3"
        );

        updateStatus(
            `LAP ${currentLap} COMPLETE`
        );

        currentLap++;

        elapsed = 0;

        triggeredCorners.clear();
    }
}


/* =========================================================
   MAIN LOOP
   ========================================================= */

function gameLoop(timestamp) {

    if (!running) return;

    elapsed =
        (
            timestamp -
            startTime
        ) / 1000;

    updateDisplay();

    checkCorners();

    checkLapFinish();

    if (running) {

        animationFrame =
            requestAnimationFrame(
                gameLoop
            );
    }
}


/* =========================================================
   PACE
   ========================================================= */

function setPace(pace) {

    if (!PACE_PROFILES[pace]) {
        return;
    }

    selectedPace = pace;

    updateDisplay();

    updateStatus(
        running
            ? `ENGINEER ACTIVE — ${pace}`
            : `READY — ${pace}`
    );
}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        startEngineer
    );
}

if (stopButton) {

    stopButton.addEventListener(
        "click",
        stopEngineer
    );
}

if (resetButton) {

    resetButton.addEventListener(
        "click",
        resetEngineer
    );
}

if (paceSelect) {

    paceSelect.addEventListener(
        "change",
        event => {

            setPace(
                event.target.value
            );
        }
    );
}


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "SELECT" ||
            event.target.tagName === "TEXTAREA"
        ) {
            return;
        }

        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            if (running) {

                stopEngineer();

            } else {

                startEngineer();
            }
        }

        if (
            event.key.toLowerCase() === "r"
        ) {

            resetEngineer();
        }

        if (event.key === "1") {
            setPace("1:45");
        }

        if (event.key === "2") {
            setPace("1:46");
        }

        if (event.key === "3") {
            setPace("1:47");
        }

        if (event.key === "4") {
            setPace("1:48");
        }
    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initialize() {

    updateDisplay();

    updateCorner(null);

    updateCall(
        "ENGINEER READY"
    );

    updateStatus(
        `READY — ${selectedPace}`
    );

    console.log(
        "Spa Engineer V6 loaded successfully."
    );

    console.log(
        "Start button:",
        startButton
    );

    console.log(
        "Stop button:",
        stopButton
    );

    console.log(
        "Reset button:",
        resetButton
    );
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );

} else {

    initialize();
}
