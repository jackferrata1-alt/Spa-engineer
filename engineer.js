/* =========================================================
   SPA ENGINEER V4
   Detailed race-engineer calls
   Pace targets: 1:45 / 1:46 / 1:47 / 1:48
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   CONFIGURATION
--------------------------------------------------------- */

const CONFIG = {
    defaultPace: "1:47",

    // MP3 files go inside an "audio" folder.
    audioFolder: "audio/",

    // Use browser voice only if an MP3 is unavailable.
    speechFallback: true,

    // Prevent duplicate calls.
    callCooldown: 0.75,

    // Small timing adjustment if you want calls slightly earlier.
    callLead: 0
};


/* ---------------------------------------------------------
   PACE PROFILES
--------------------------------------------------------- */

const PACE_PROFILES = {
    "1:45": {
        seconds: 105,
        multiplier: 105 / 105
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


/* ---------------------------------------------------------
   SPA ENGINEER NOTES
--------------------------------------------------------- */

const CORNERS = [

    {
        number: 1,
        name: "TURN 1",
        time: 18.0,
        audio: "turn-1.mp3",
        call:
            "Brake straight, hard braking. " +
            "Late apex. Rotate the car, then early throttle."
    },

    {
        number: 2,
        name: "TURN 2",
        time: 22.2,
        audio: "turn-2.mp3",
        call:
            "Keep it tight left. Minimal steering. " +
            "Prepare the car for the right."
    },

    {
        number: 3,
        name: "TURN 3",
        time: 25.0,
        audio: "turn-3.mp3",
        call:
            "Right-hander. Trail the brake, late apex. " +
            "Early throttle on exit."
    },

    {
        number: 4,
        name: "TURN 4",
        time: 28.2,
        audio: "turn-4.mp3",
        call:
            "Left. Smooth turn-in, late apex. " +
            "Don't run wide on exit."
    },

    {
        number: 5,
        name: "TURN 5",
        time: 31.2,
        audio: "turn-5.mp3",
        call:
            "Right. Carry speed, progressive throttle. " +
            "Prioritize the exit."
    },

    {
        number: 6,
        name: "TURN 6",
        time: 34.8,
        audio: "turn-6.mp3",
        call:
            "Left. Light brake, settle the car. " +
            "Late apex, then power."
    },

    {
        number: 7,
        name: "TURN 7",
        time: 38.0,
        audio: "turn-7.mp3",
        call:
            "Right. Stay tight. " +
            "Smooth steering, early throttle."
    },

    {
        number: 8,
        name: "TURN 8",
        time: 42.0,
        audio: "turn-8.mp3",
        call:
            "Brake straight. Late apex. " +
            "Release the brake smoothly, then power."
    },

    {
        number: 9,
        name: "TURN 9",
        time: 45.0,
        audio: "turn-9.mp3",
        call:
            "Right. Sacrifice the entry. " +
            "Get the car straight and maximize the exit."
    },

    {
        number: 10,
        name: "TURN 10",
        time: 50.0,
        audio: "turn-10.mp3",
        call:
            "Hard brake, straight line. " +
            "Late apex, rotate the car, then throttle."
    },

    {
        number: 11,
        name: "TURN 11",
        time: 53.0,
        audio: "turn-11.mp3",
        call:
            "Right. Short brake. " +
            "Carry momentum, prepare for the left."
    },

    {
        number: 12,
        name: "TURN 12",
        time: 56.5,
        audio: "turn-12.mp3",
        call:
            "Left. Don't over-slow. " +
            "Smooth entry, early throttle."
    },

    {
        number: 13,
        name: "TURN 13",
        time: 60.0,
        audio: "turn-13.mp3",
        call:
            "Right. Late apex. " +
            "Use the exit, build throttle progressively."
    },

    {
        number: 14,
        name: "TURN 14",
        time: 64.0,
        audio: "turn-14.mp3",
        call:
            "Left. Light brake. " +
            "Patient rotation, then early power."
    },

    {
        number: 15,
        name: "TURN 15",
        time: 68.0,
        audio: "turn-15.mp3",
        call:
            "Right. Tight entry, late apex. " +
            "Get straight and accelerate."
    },

    {
        number: 16,
        name: "TURN 16",
        time: 73.0,
        audio: "turn-16.mp3",
        call:
            "Brake straight. Late apex, rotate the car. " +
            "Clean exit."
    },

    {
        number: 17,
        name: "TURN 17",
        time: 76.5,
        audio: "turn-17.mp3",
        call:
            "Left. Carry speed. " +
            "Smooth steering, keep the car balanced."
    },

    {
        number: 18,
        name: "TURN 18",
        time: 82.0,
        audio: "turn-18.mp3",
        call:
            "Right. Commit early. " +
            "Controlled throttle, stay smooth."
    },

    {
        number: 19,
        name: "TURN 19",
        time: 86.0,
        audio: "turn-19.mp3",
        call:
            "Final right. Late apex. " +
            "Straighten the wheel, full throttle."
    }

];


/* ---------------------------------------------------------
   SPECIAL ENGINEER MESSAGES
--------------------------------------------------------- */

const SPECIAL_CALLS = {

    start:
        "Green light. Push this lap.",

    finalSector:
        "Final sector. Keep it clean.",

    finish:
        "Lap complete. Reset and prepare for the next lap."

};


/* ---------------------------------------------------------
   APPLICATION STATE
--------------------------------------------------------- */

let running = false;

let startTime = 0;

let elapsed = 0;

let currentLap = 1;

let selectedPace = CONFIG.defaultPace;

let animationFrame = null;

let triggeredCorners = new Set();

let specialCallsTriggered = new Set();

let lastCallTimestamp = 0;


/* ---------------------------------------------------------
   DOM ELEMENT FINDER
--------------------------------------------------------- */

function findElement(...selectors) {

    for (const selector of selectors) {

        const element =
            document.querySelector(selector);

        if (element) {
            return element;
        }

    }

    return null;
}


/* ---------------------------------------------------------
   UI ELEMENTS
--------------------------------------------------------- */

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

const startButton = findElement(
    "#start",
    "#startBtn",
    "#startButton"
);

const stopButton = findElement(
    "#stop",
    "#stopBtn",
    "#stopButton"
);

const resetButton = findElement(
    "#reset",
    "#resetBtn",
    "#resetButton"
);

const paceSelect = findElement(
    "#paceSelect",
    "#paceSelector",
    "#lapSelect",
    "select[name='pace']"
);


/* ---------------------------------------------------------
   TIME FORMATTING
--------------------------------------------------------- */

function formatTime(
    seconds,
    milliseconds = true
) {

    if (!Number.isFinite(seconds)) {
        seconds = 0;
    }

    const minutes =
        Math.floor(seconds / 60);

    const wholeSeconds =
        Math.floor(seconds % 60);

    if (!milliseconds) {

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(wholeSeconds).padStart(2, "0")
        );

    }

    const hundredths =
        Math.floor(
            (seconds % 1) * 100
        );

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(wholeSeconds).padStart(2, "0") +
        "." +
        String(hundredths).padStart(2, "0")
    );
}


/* ---------------------------------------------------------
   PACE
--------------------------------------------------------- */

function getPace() {

    return (
        PACE_PROFILES[selectedPace] ||
        PACE_PROFILES[CONFIG.defaultPace]
    );

}


function getCornerTime(baseTime) {

    const pace =
        getPace();

    return (
        baseTime *
        pace.multiplier
    );

}


/* ---------------------------------------------------------
   DISPLAY FUNCTIONS
--------------------------------------------------------- */

function updateTimer() {

    if (timerDisplay) {

        timerDisplay.textContent =
            formatTime(elapsed);

    }

}


function updateLap() {

    if (lapDisplay) {

        lapDisplay.textContent =
            `LAP ${currentLap}`;

    }

}


function updatePaceDisplay() {

    if (paceDisplay) {

        paceDisplay.textContent =
            selectedPace;

    }

}


function updateStatus(text) {

    if (statusDisplay) {

        statusDisplay.textContent =
            text;

    }

}


function updateCorner(corner) {

    if (!cornerDisplay) {
        return;
    }

    if (!corner) {

        cornerDisplay.textContent =
            "—";

        return;
    }

    cornerDisplay.textContent =
        `${corner.number} — ${corner.name}`;

}


function updateCall(text) {

    if (!callDisplay) {
        return;
    }

    callDisplay.textContent =
        text;

    // Restart CSS animation.
    callDisplay.classList.remove(
        "active"
    );

    void callDisplay.offsetWidth;

    callDisplay.classList.add(
        "active"
    );

}


/* ---------------------------------------------------------
   AUDIO
--------------------------------------------------------- */

function playAudioFile(filename) {

    return new Promise(
        (resolve) => {

            const audio =
                new Audio(
                    CONFIG.audioFolder +
                    filename
                );

            let finished = false;

            function finish(success) {

                if (finished) {
                    return;
                }

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
                .then(() => {})
                .catch(() => {
                    finish(false);
                });

        }
    );

}


/* ---------------------------------------------------------
   NATURAL VOICE FALLBACK
--------------------------------------------------------- */

function speak(text) {

    if (!CONFIG.speechFallback) {
        return;
    }

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }

    window.speechSynthesis.cancel();

    const voice =
        new SpeechSynthesisUtterance(
            text
        );

    voice.rate = 1.05;

    voice.pitch = 0.85;

    voice.volume = 1.0;

    window.speechSynthesis.speak(
        voice
    );

}


/* ---------------------------------------------------------
   ENGINEER CALL
--------------------------------------------------------- */

async function engineerCall(
    text,
    audioFile = null
) {

    const now =
        performance.now() / 1000;

    if (
        now - lastCallTimestamp <
        CONFIG.callCooldown
    ) {
        return;
    }

    lastCallTimestamp = now;

    updateCall(text);

    if (audioFile) {

        const played =
            await playAudioFile(
                audioFile
            );

        if (played) {
            return;
        }

    }

    speak(text);

}


/* ---------------------------------------------------------
   CORNER TRIGGERS
--------------------------------------------------------- */

function checkCornerCalls() {

    for (
        const corner of CORNERS
    ) {

        const targetTime =
            getCornerTime(
                corner.time
            );

        const triggerTime =
            targetTime -
            CONFIG.callLead;

        if (
            elapsed >= triggerTime &&
            !triggeredCorners.has(
                corner.number
            )
        ) {

            triggeredCorners.add(
                corner.number
            );

            updateCorner(
                corner
            );

            engineerCall(
                corner.call,
                corner.audio
            );

            break;
        }

    }

}


/* ---------------------------------------------------------
   CURRENT CORNER
--------------------------------------------------------- */

function updateCurrentCorner() {

    let currentCorner = null;

    for (
        const corner of CORNERS
    ) {

        const targetTime =
            getCornerTime(
                corner.time
            );

        if (
            elapsed >= targetTime
        ) {

            currentCorner =
                corner;

        }

    }

    if (currentCorner) {

        updateCorner(
            currentCorner
        );

    }

}


/* ---------------------------------------------------------
   SPECIAL CALLS
--------------------------------------------------------- */

function checkSpecialCalls() {

    /*
       Final sector call.
       Approximately 70% into the lap.
    */

    const finalSectorTime =
        getPace().seconds * 0.70;

    if (
        elapsed >= finalSectorTime &&
        !specialCallsTriggered.has(
            "final-sector"
        )
    ) {

        specialCallsTriggered.add(
            "final-sector"
        );

        engineerCall(
            SPECIAL_CALLS.finalSector,
            "final-sector.mp3"
        );

    }

}


/* ---------------------------------------------------------
   LAP FINISH
--------------------------------------------------------- */

function checkLapFinish() {

    if (
        elapsed >=
        getPace().seconds
    ) {

        finishLap();

    }

}


function finishLap() {

    running = false;

    cancelAnimationFrame(
        animationFrame
    );

    animationFrame = null;

    const completedTime =
        elapsed;

    updateTimer();

    updateCall(
        SPECIAL_CALLS.finish
    );

    updateStatus(
        `LAP ${currentLap} COMPLETE — ` +
        `${formatTime(
            completedTime,
            false
        )}`
    );

    /*
       Reset timing data for the
       next lap while keeping the
       lap counter.
    */

    currentLap++;

    elapsed = 0;

    triggeredCorners.clear();

    specialCallsTriggered.clear();

    lastCallTimestamp = 0;

    setTimeout(
        () => {

            if (!running) {

                updateStatus(
                    `READY — LAP ${currentLap}`
                );

                updateCall(
                    "ENGINEER READY"
                );

            }

        },
        1200
    );

}


/* ---------------------------------------------------------
   MAIN LOOP
--------------------------------------------------------- */

function gameLoop(timestamp) {

    if (!running) {
        return;
    }

    elapsed =
        (
            timestamp -
            startTime
        ) / 1000;

    updateTimer();

    updateLap();

    updatePaceDisplay();

    checkCornerCalls();

    updateCurrentCorner();

    checkSpecialCalls();

    checkLapFinish();

    if (running) {

        animationFrame =
            requestAnimationFrame(
                gameLoop
            );

    }

}


/* ---------------------------------------------------------
   START
--------------------------------------------------------- */

function startEngineer() {

    if (running) {
        return;
    }

    running = true;

    /*
       Resume from current timer position.
    */

    startTime =
        performance.now() -
        elapsed * 1000;

    updateStatus(
        `ENGINEER ACTIVE — ${selectedPace}`
    );

    /*
       Only play the green-light message
       once per lap.
    */

    if (
        !specialCallsTriggered.has(
            "start"
        )
    ) {

        specialCallsTriggered.add(
            "start"
        );

        engineerCall(
            SPECIAL_CALLS.start,
            "start.mp3"
        );

    }

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


/* ---------------------------------------------------------
   STOP
--------------------------------------------------------- */

function stopEngineer() {

    running = false;

    cancelAnimationFrame(
        animationFrame
    );

    animationFrame = null;

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }

    updateStatus(
        "PAUSED"
    );

}


/* ---------------------------------------------------------
   RESET
--------------------------------------------------------- */

function resetEngineer() {

    running = false;

    cancelAnimationFrame(
        animationFrame
    );

    animationFrame = null;

    elapsed = 0;

    currentLap = 1;

    triggeredCorners.clear();

    specialCallsTriggered.clear();

    lastCallTimestamp = 0;

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }

    updateTimer();

    updateLap();

    updatePaceDisplay();

    updateCorner(null);

    updateCall(
        "ENGINEER READY"
    );

    updateStatus(
        `READY — ${selectedPace}`
    );

}


/* ---------------------------------------------------------
   CHANGE PACE
--------------------------------------------------------- */

function setPace(pace) {

    if (
        !PACE_PROFILES[pace]
    ) {
        return;
    }

    selectedPace =
        pace;

    updatePaceDisplay();

    updateStatus(
        running
            ? `ENGINEER ACTIVE — ${pace}`
            : `READY — ${pace}`
    );

}


/* ---------------------------------------------------------
   BUTTON EVENTS
--------------------------------------------------------- */

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
        (event) => {

            setPace(
                event.target.value
            );

        }
    );

}


/* ---------------------------------------------------------
   KEYBOARD CONTROLS

   SPACE = Start / Pause
   R     = Reset
   1     = 1:45
   2     = 1:46
   3     = 1:47
   4     = 1:48
--------------------------------------------------------- */

document.addEventListener(
    "keydown",
    (event) => {

        const tag =
            event.target.tagName;

        if (
            tag === "INPUT" ||
            tag === "SELECT" ||
            tag === "TEXTAREA"
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


/* ---------------------------------------------------------
   INITIALIZATION
--------------------------------------------------------- */

function initialize() {

    selectedPace =
        CONFIG.defaultPace;

    if (paceSelect) {

        paceSelect.value =
            selectedPace;

    }

    updateTimer();

    updateLap();

    updatePaceDisplay();

    updateCorner(null);

    updateCall(
        "ENGINEER READY"
    );

    updateStatus(
        `READY — ${selectedPace}`
    );

    console.log(
        "Spa Engineer V4 loaded."
    );

    console.log(
        "Pace profiles:",
        Object.keys(
            PACE_PROFILES
        )
    );

    console.log(
        "Engineer calls:",
        CORNERS.length
    );

}


/* ---------------------------------------------------------
   START APPLICATION
--------------------------------------------------------- */

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
