"use strict";

/* =========================================
   SPA RACE ENGINEER V7
   Fixed new-lap reset + voice queue
========================================= */

const PACE_TIMES = {
    105: "1:45",
    106: "1:46",
    107: "1:47",
    108: "1:48"
};


/* =========================================
   CORNER CALLS
========================================= */

const CORNERS = [
    const CORNERS = [
    [1, 5.0, "Brake straight. Late apex. Early throttle."],
    [2, 8.0, "Tight left. Prepare right."],
    [3, 11.0, "Trail brake. Late apex. Power."],
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

let elapsed = 0;

let startTime = 0;

let animationFrame = null;

let currentCorner = 0;

let voiceQueue = [];

let voiceBusy = false;


/* =========================================
   ELEMENTS
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
    document.querySelectorAll("[data-lap]");


/* =========================================
   FORMAT TIME
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
   DISPLAY
========================================= */

function updateTimer() {

    lap.textContent =
        formatTime(elapsed);

}


/* =========================================
   CLEAR VOICE
========================================= */

function clearVoiceQueue() {

    voiceQueue = [];

    voiceBusy = false;

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }
}


/* =========================================
   SPEAK
========================================= */

function speak(text) {

    voiceQueue.push(text);

    processVoiceQueue();

}


/* =========================================
   PROCESS VOICE QUEUE
========================================= */

function processVoiceQueue() {

    if (voiceBusy) {
        return;
    }

    if (voiceQueue.length === 0) {
        return;
    }

    if (
        !("speechSynthesis" in window)
    ) {
        voiceQueue = [];
        return;
    }

    voiceBusy = true;

    const text =
        voiceQueue.shift();

    const voice =
        new SpeechSynthesisUtterance(
            text
        );

    voice.rate = 1.08;

    voice.pitch = 0.85;

    voice.volume = 1;

    voice.onend = function () {

        voiceBusy = false;

        processVoiceQueue();

    };

    voice.onerror = function () {

        voiceBusy = false;

        processVoiceQueue();

    };

    window.speechSynthesis.speak(
        voice
    );
}


/* =========================================
   NEXT CORNER
========================================= */

function getNextCorner() {

    for (
        let i = 0;
        i < CORNERS.length;
        i++
    ) {

        const number =
            CORNERS[i][0];

        const baseTime =
            CORNERS[i][1];

        const time =
            baseTime *
            (lapLength / 105);

        const text =
            CORNERS[i][2];

        if (time > elapsed) {

            return {
                number,
                time,
                text
            };

        }
    }

    return null;
}


/* =========================================
   ENGINEER CALL
========================================= */

function engineerCall(
    text,
    number
) {

    call.textContent =
        text;

    corner.textContent =
        number;

    speak(text);

}


/* =========================================
   START LAP
========================================= */

function startLap() {

    /*
       IMPORTANT:
       Never start if already running.
    */

    if (running) {
        return;
    }

    /*
       Make absolutely sure the previous
       lap cannot carry over.
    */

    if (
        elapsed >= lapLength
    ) {

        elapsed = 0;

        currentCorner = 0;

    }

    running = true;

    startTime =
        performance.now() -
        elapsed * 1000;

    status.textContent =
        "LIVE";

    next.textContent =
        "Engineer active.";

    /*
       Clear any leftover speech from
       the previous lap.
    */

    clearVoiceQueue();

    speak(
        "Green light. Push."
    );

    animationFrame =
        requestAnimationFrame(
            loop
        );
}


/* =========================================
   STOP
========================================= */

function stopLap() {

    running = false;

    cancelAnimationFrame(
        animationFrame
    );

    animationFrame = null;

    clearVoiceQueue();

    status.textContent =
        "STOPPED";

    next.textContent =
        "Press START when you're ready.";

}


/* =========================================
   RESET
========================================= */

function resetLap() {

    running = false;

    cancelAnimationFrame(
        animationFrame
    );

    animationFrame = null;

    clearVoiceQueue();

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

}


/* =========================================
   FINISH LAP
========================================= */

function finishLap() {

    /*
       Stop the timer FIRST.
    */

    running = false;

    cancelAnimationFrame(
        animationFrame
    );

    animationFrame = null;

    /*
       Save the completed time.
    */

    const completedTime =
        elapsed;

    /*
       Clear anything that was waiting
       to be spoken.
    */

    clearVoiceQueue();

    status.textContent =
        "LAP COMPLETE";

    call.textContent =
        "LAP COMPLETE";

    next.textContent =
        "Press START for a new lap.";

    /*
       Reset the actual lap timer.
    */

    elapsed = 0;

    currentCorner = 0;

    updateTimer();

    count.textContent =
        "--";

    corner.textContent =
        "—";

    /*
       Speak ONLY the completion message.
    */

    speak(
        "Lap complete."
    );

}


/* =========================================
   MAIN LOOP
========================================= */

function loop(timestamp) {

    if (!running) {
        return;
    }

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
           Call 1.5 seconds before
           the corner reference point.
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
       Finish exactly once.
    */

    if (
        elapsed >= lapLength
    ) {

        finishLap();

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
            function () {

                lapLength =
                    Number(
                        button.dataset.lap
                    );

                target.textContent =
                    PACE_TIMES[
                        lapLength
                    ];

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

                /*
                   If changing pace before
                   starting, make sure the
                   timer is clean.
                */

                if (!running) {

                    elapsed = 0;

                    currentCorner = 0;

                    updateTimer();

                }

            }
        );

    }
);


/* =========================================
   START BUTTON
========================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        startLap
    );

}


/* =========================================
   STOP BUTTON
========================================= */

if (stopButton) {

    stopButton.addEventListener(
        "click",
        stopLap
    );

}


/* =========================================
   TEST VOICE
========================================= */

if (testButton) {

    testButton.addEventListener(
        "click",
        function () {

            clearVoiceQueue();

            call.textContent =
                "VOICE CHECK";

            status.textContent =
                "VOICE TEST";

            speak(
                "Engineer voice check. " +
                "Brake straight. " +
                "Late apex. " +
                "Early throttle."
            );

        }
    );

}


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

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

                stopLap();

            } else {

                startLap();

            }

        }

        if (
            event.key.toLowerCase() === "r"
        ) {

            resetLap();

        }

        if (event.key === "1") {

            document
                .querySelector(
                    '[data-lap="105"]'
                )
                ?.click();

        }

        if (event.key === "2") {

            document
                .querySelector(
                    '[data-lap="106"]'
                )
                ?.click();

        }

        if (event.key === "3") {

            document
                .querySelector(
                    '[data-lap="107"]'
                )
                ?.click();

        }

        if (event.key === "4") {

            document
                .querySelector(
                    '[data-lap="108"]'
                )
                ?.click();

        }

    }
);


/* =========================================
   INITIALIZE
========================================= */

lapLength = 105;

elapsed = 0;

currentCorner = 0;

target.textContent =
    "1:45";

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
    "Spa Race Engineer V7 loaded."
);
