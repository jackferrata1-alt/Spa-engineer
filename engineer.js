"use strict";

/* =========================================================
   SPA ENGINEER V5
   Short race-engineer calls + anti-overlap audio queue
   Pace targets: 1:45 / 1:46 / 1:47 / 1:48
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = {
    defaultPace: "1:47",

    audioFolder: "audio/",

    // Browser voice is only used if the MP3 doesn't exist.
    speechFallback: true,

    // Start a call slightly before its reference point.
    callLead: 0,

    // Prevent accidental duplicate calls.
    duplicateCooldown: 0.5
};


/* =========================================================
   PACE PROFILES
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
   SPA ENGINEER CALLS
   =========================================================
   
   SHORT ON PURPOSE.

   Each call is designed to be roughly 1–3 seconds.
========================================================= */

const CORNERS = [

    {
        number: 1,
        name: "TURN 1",
        time: 18.0,
        audio: "turn-1.mp3",
        call: "Brake straight. Late apex. Early throttle."
    },

    {
        number: 2,
        name: "TURN 2",
        time: 22.2,
        audio: "turn-2.mp3",
        call: "Tight left. Prepare right."
    },

    {
        number: 3,
        name: "TURN 3",
        time: 25.0,
        audio: "turn-3.mp3",
        call: "Trail brake. Late apex. Power."
    },

    {
        number: 4,
        name: "TURN 4",
        time: 28.2,
        audio: "turn-4.mp3",
        call: "Smooth left. Late apex."
    },

    {
        number: 5,
        name: "TURN 5",
        time: 31.2,
        audio: "turn-5.mp3",
        call: "Carry speed. Early throttle."
    },

    {
        number: 6,
        name: "TURN 6",
        time: 34.8,
        audio: "turn-6.mp3",
        call: "Light brake. Late apex."
    },

    {
        number: 7,
        name: "TURN 7",
        time: 38.0,
        audio: "turn-7.mp3",
        call: "Stay tight. Early power."
    },

    {
        number: 8,
        name: "TURN 8",
        time: 42.0,
        audio: "turn-8.mp3",
        call: "Brake straight. Late apex."
    },

    {
        number: 9,
        name: "TURN 9",
        time: 45.0,
        audio: "turn-9.mp3",
        call: "Sacrifice entry. Maximize exit."
    },

    {
        number: 10,
        name: "TURN 10",
        time: 50.0,
        audio: "turn-10.mp3",
        call: "Hard brake. Rotate. Power."
    },

    {
        number: 11,
        name: "TURN 11",
        time: 53.0,
        audio: "turn-11.mp3",
        call: "Short brake. Carry speed."
    },

    {
        number: 12,
        name: "TURN 12",
        time: 56.5,
        audio: "turn-12.mp3",
        call: "Don't over-slow. Early power."
    },

    {
        number: 13,
        name: "TURN 13",
        time: 60.0,
        audio: "turn-13.mp3",
        call: "Late apex. Build throttle."
    },

    {
        number: 14,
        name: "TURN 14",
        time: 64.0,
        audio: "turn-14.mp3",
        call: "Light brake. Patient rotation."
    },

    {
        number: 15,
        name: "TURN 15",
        time: 68.0,
        audio: "turn-15.mp3",
        call: "Late apex. Get straight."
    },

    {
        number: 16,
        name: "TURN 16",
        time: 73.0,
        audio: "turn-16.mp3",
        call: "Brake straight. Rotate. Exit."
    },

    {
        number: 17,
        name: "TURN 17",
        time: 76.5,
        audio: "turn-17.mp3",
        call: "Carry speed. Stay smooth."
    },

    {
        number: 18,
        name: "TURN 18",
        time: 82.0,
        audio: "turn-18.mp3",
        call: "Commit. Controlled throttle."
    },

    {
        number: 19,
        name: "TURN 19",
        time: 86.0,
        audio: "turn-19.mp3",
        call: "Late apex. Full throttle."
    }

];


/* =========================================================
   SPECIAL
