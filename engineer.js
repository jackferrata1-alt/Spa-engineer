"use strict";

/* =========================================
   SPA RACE ENGINEER
   Built specifically for your current HTML
========================================= */

const TARGET_LAPS = {
    105: "1:45",
    106: "1:46",
    107: "1:47",
    108: "1:48"
};


/* =========================================
   SPA CORNER CALLS
========================================= */

const CORNERS = [
    [1, 18.0, "Brake straight. Late apex. Early throttle."],
    [2, 22.2, "Tight left. Prepare right."],
    [3, 25.0, "Trail brake. Late apex. Power."],
    [4, 28.2, "Smooth left. Late apex."],
    [5, 31.2, "Carry speed. Early throttle."],
    [6, 34.8, "Light brake. Late apex."],
    [7, 38.0, "Stay tight. Early power."],
    [8, 42.0, "Brake straight. Late apex."],
    [9, 45.0, "Sacrifice entry. Maximize exit."],
    [10, 50.0, "Hard brake. Rotate. Power."],
    [11, 53.0, "Short brake. Carry speed."],
    [12, 56.5, "Don't over-slow. Early power."],
    [13, 60.0, "Late apex. Build throttle."],
    [14, 64.0, "Light brake. Patient rotation."],
    [15, 68.0, "Late apex. Get straight."],
    [16, 73.0, "Brake straight. Rotate. Exit."],
    [17, 76.5, "Carry speed. Stay smooth."],
    [18, 82.0, "Commit. Controlled throttle."],
    [19, 86.0, "Late apex. Full throttle."]
];


/* =========================================
   STATE
========================================= */

let lapLength = 105;

let running = false;

let startTime = 0;

let elapsed = 0;

let animationFrame = null;

let currentCorner = 0;

let voiceBusy = false;

let voiceQueue = [];


/* =========================================
   HTML ELEMENTS
========================================= */

const status =
    document.getElementById("status");

const target =
    document.getElementById("target");

const call =
    document.getElementById("call");

const next =
    document.getElementById("next");

const lap =
    document.getElementById("lap");

const count =
    document.getElementById("count");

const corner =
    document.getElementById("corner");

const startButton =
    document.getElementById("start");

const stopButton =
    document.getElementById("stop");

const testButton =
    document.getElementById("test");

const paceButtons =
    document.querySelectorAll(
        "[data-lap]"
    );


/* =========================================
   DISPLAY TIME
========================================= */

function formatTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    const tenths =
        Math.floor(
            (seconds % 1) * 10
        );

    return (
        minutes +
        ":" +
        String(secs).padStart(2, "0") +
        "." +
        tenths
    );
}


/* =========================================
   UPDATE TIMER
========================================= */

function updateTimer() {

    lap.textContent =
        formatTime(elapsed);

}


/* =========================================
   FIND NEXT CORNER
========================================= */

function getNextCorner() {

    for (
        let i = 0;
        i < CORNERS.length;
        i++
    ) {

        const cornerTime =
            CORNERS[i][1] *
            (lapLength / 105);

        if (
            cornerTime > elapsed
        ) {

            return {
                index: i,
                number: CORNERS[i][0],
                time: cornerTime,
                text: CORNERS[i][2]
            };

        }
    }

    return null;
}


/* =========================================
   VOICE QUEUE
   PREVENTS OVERLAPPING VOICES
========================================= */

function speak(text) {

    voiceQueue.push(text);

    processVoiceQueue();
}


function processVoiceQueue() {

    if (voiceBusy) return;

    if (
        voiceQueue.length === 0
    ) return;

    if (
        !("speechSynthesis" in window)
    ) return;

    voiceBusy = true;

    const text =
        voiceQueue.shift();

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );

    utterance.rate = 1.08;

    utterance.pitch = 0.85;

    utterance.volume = 1;

    utterance.onend = function () {

        voiceBusy = false;

        processVoiceQueue();

    };

    utterance.onerror = function () {

        voiceBusy = false;

        processVoiceQueue();

    };

    window.speechSynthesis.speak(
        utterance
    );
}


/* =========================================
   ENGINEER CALL
========================================= */

function engineerCall(
    text,
    cornerNumber
) {

    call.textContent =
        text;

    corner.textContent =
        cornerNumber;

    speak(text);

}


/* =========================================
   START LAP
========================================= */

function startLap() {

    if (running) return;

    running = true;

    startTime =
        performance.now() -
        elapsed * 1000;

    status.textContent =
        "LIVE";

    next.textContent =
        "Engineer active.";

    speak(
        "Green light. Push."
    );

    animationFrame =
        requestAnimationFrame(
            loop
        );
}


/* =========================================
   STOP LAP
========================================= */

function stopLap() {

    running = false;

    cancelAnimationFrame(
        animationFrame
    );

    animationFrame = null;

    status.textContent =
        "STOPPED";

    next.textContent =
        "Press START when you're ready.";

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }

    voiceQueue = [];

    voiceBusy = false;

}


/* =========================================
   RESET LAP
========================================= */

function resetLap() {

    running = false;

    cancelAnimationFrame(
        animationFrame
    );

    animationFrame = null;

    elapsed = 0;

    currentCorner = 0;

    updateTimer();

    status.textContent =
        "READY";

    call.textContent =
        "READY";

    next.textContent =
        "Press START when you're ready.";

    count.textContent =
        "--";

    corner.textContent =
        "—";

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }

    voiceQueue = [];

    voiceBusy = false;

}


/* =========================================
   MAIN LOOP
========================================= */

function loop(timestamp) {

    if (!running) return;

    elapsed =
        (
            timestamp -
            startTime
        ) / 1000;

    updateTimer();

    const upcoming =
        getNextCorner();

    if (upcoming) {

        count.textContent =
            upcoming.number;

        next.textContent =
            upcoming.text;

        /*
           Trigger call slightly before
           the reference point.
        */

        const triggerTime =
            upcoming.time - 1.5;

        if (
            elapsed >= triggerTime &&
            currentCorner <
                upcoming.number
        ) {

            currentCorner =
                upcoming.number;

            engineerCall(
                upcoming.text,
                upcoming.number
            );

        }

    }

    /*
       Lap finished
    */

    if (
        elapsed >= lapLength
    ) {

        running = false;

        status.textContent =
            "LAP COMPLETE";

        speak(
            "Lap complete."
        );

        cancelAnimationFrame(
            animationFrame
        );

        return;
    }

    animationFrame =
        requestAnimationFrame(
            loop
        );

}


/* =========================================
   PACE BUTTONS
========================================= */

paceButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                lapLength =
                    Number(
                        button.dataset.lap
                    );

                target.textContent =
                    TARGET_LAPS[
                        lapLength
                    ];

                /*
                   Highlight selected pace
                */

                paceButtons.forEach(
                    b => {
                        b.classList.remove(
                            "selected"
                        );
                    }
                );

                button.classList.add(
                    "selected"
                );

            }
        );

    }
);


/* =========================================
   START BUTTON
========================================= */

startButton.addEventListener(
    "click",
    startLap
);


/* =========================================
   STOP BUTTON
========================================= */

stopButton.addEventListener(
    "click",
    stopLap
);


/* =========================================
   TEST VOICE
========================================= */

testButton.addEventListener(
    "click",
    () => {

        speak(
            "Engineer voice check. " +
            "Brake straight. " +
            "Late apex. " +
            "Early throttle."
        );

        call.textContent =
            "VOICE CHECK";

        status.textContent =
            "VOICE TEST";

    }
);


/* =========================================
   KEYBOARD CONTROLS
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            if (running) {

                stopLap();

            } else {

                startLap();

            }

        }

        if (
            event.key === "1"
        ) {

            document
                .querySelector(
                    '[data-lap="105"]'
                )
                ?.click();

        }

        if (
            event.key === "2"
        ) {

            document
                .querySelector(
                    '[data-lap="106"]'
                )
                ?.click();

        }

        if (
            event.key === "3"
        ) {

            document
                .querySelector(
                    '[data-lap="107"]'
                )
                ?.click();

        }

        if (
            event.key === "4"
        ) {

            document
                .querySelector(
                    '[data-lap="108"]'
                )
                ?.click();

        }

        if (
            event.key.toLowerCase() === "r"
        ) {

            resetLap();

        }

    }
);


/* =========================================
   INITIALIZE
========================================= */

target.textContent =
    TARGET_LAPS[lapLength];

lap.textContent =
    "0:00.0";

count.textContent =
    "--";

corner.textContent =
    "—";

status.textContent =
    "READY";

call.textContent =
    "READY";

next.textContent =
    "Press START when you're ready.";

console.log(
    "Spa Race Engineer loaded successfully."
);
