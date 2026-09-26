const CONFIG = {
    startingMinutes: 10 * 60,
    statusInterval: 3,
    maxEvents: 120
};


let simulatedMinutes = 0;


const state = {

    gps: true,
    radio: true,
    heart: true,

    processor: true,
    environment: true,
    storage: true,

    sensorTest: false

};


/* =========================
   DOM
========================= */

const simTime =
    document.getElementById("simTime");

const hardwareState =
    document.getElementById("hardwareState");

const busStatus =
    document.getElementById("busStatus");

const hardwareExplanation =
    document.getElementById("hardwareExplanation");

const aiInterpretation =
    document.getElementById("aiInterpretation");

const eventLog =
    document.getElementById("eventLog");


/* =========================
   COMPONENT STATUS
========================= */

const processorCondition =
    document.getElementById("processorCondition");

const gpsCondition =
    document.getElementById("gpsCondition");

const radioCondition =
    document.getElementById("radioCondition");

const heartCondition =
    document.getElementById("heartCondition");

const environmentCondition =
    document.getElementById("environmentCondition");

const storageCondition =
    document.getElementById("storageCondition");


/* =========================
   CARDS
========================= */

const componentGPS =
    document.getElementById("componentGPS");

const componentRadio =
    document.getElementById("componentRadio");

const componentHeart =
    document.getElementById("componentHeart");

const processorCard =
    document.getElementById("processorCard");


/* =========================
   CARD STATUS
========================= */

const gpsCardStatus =
    document.getElementById("gpsCardStatus");

const radioCardStatus =
    document.getElementById("radioCardStatus");

const heartCardStatus =
    document.getElementById("heartCardStatus");


/* =========================
   MONITORS
========================= */

const monitorAI =
    document.getElementById("monitorAI");

const monitorGPS =
    document.getElementById("monitorGPS");

const monitorRadio =
    document.getElementById("monitorRadio");

const monitorHeart =
    document.getElementById("monitorHeart");

const monitorEnvironment =
    document.getElementById("monitorEnvironment");

const monitorStorage =
    document.getElementById("monitorStorage");


const radioBusNode =
    document.getElementById("radioBusNode");


/* =========================
   READINGS
========================= */

const heartRate =
    document.getElementById("heartRate");

const temperature =
    document.getElementById("temperature");

const pressure =
    document.getElementById("pressure");

const gpsAccuracy =
    document.getElementById("gpsAccuracy");

const heartRateBar =
    document.getElementById("heartRateBar");

const temperatureBar =
    document.getElementById("temperatureBar");

const pressureBar =
    document.getElementById("pressureBar");

const gpsAccuracyBar =
    document.getElementById("gpsAccuracyBar");


/* =========================
   TIME
========================= */

function formatTime() {

    const totalMinutes =
        CONFIG.startingMinutes +
        simulatedMinutes;

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}


/* =========================
   EVENT LOG
========================= */

function logEvent(
    message,
    type = ""
) {

    const event =
        document.createElement("div");

    event.className =
        `event ${type}`;

    event.innerHTML =
        `<span class="event-time">
            ${formatTime()}
        </span>
        ${message}`;

    eventLog.prepend(event);

    while (
        eventLog.children.length >
        CONFIG.maxEvents
    ) {

        eventLog.removeChild(
            eventLog.lastChild
        );

    }

}


/* =========================
   SIMULATE GPS FAILURE
========================= */

function simulateGPSFailure() {

    if (!state.gps) {

        logEvent(
            "GPS module is already unavailable.",
            "warning"
        );

        return;
    }

    state.gps = false;

    logEvent(
        "GPS module failure detected.",
        "alert"
    );

    logEvent(
        "Local system retaining last known position.",
        "ai"
    );

    updateAll();
}


/* =========================
   RADIO FAILURE
========================= */

function simulateRadioFailure() {

    if (!state.radio) {

        logEvent(
            "Mesh radio is already unavailable.",
            "warning"
        );

        return;
    }

    state.radio = false;

    logEvent(
        "Mesh radio failure detected.",
        "alert"
    );

    logEvent(
        "Communication subsystem unavailable.",
        "warning"
    );

    updateAll();
}


/* =========================
   HEART SENSOR FAILURE
========================= */

function simulateHeartFailure() {

    if (!state.heart) {

        logEvent(
            "Heart-rate sensor is already unavailable.",
            "warning"
        );

        return;
    }

    state.heart = false;

    logEvent(
        "Heart-rate sensor failure detected.",
        "alert"
    );

    logEvent(
        "AI will mark current vital reading as unavailable.",
        "ai"
    );

    updateAll();
}


/* =========================
   SENSOR TEST
========================= */

function runSensorTest() {

    state.sensorTest = true;

    logEvent(
        "Hardware self-test initiated.",
        "sensor"
    );

    logEvent(
        "Checking heart-rate sensor...",
        "sensor"
    );

    logEvent(
        "Checking environmental sensor array...",
        "sensor"
    );

    logEvent(
        "Checking GPS module...",
        "sensor"
    );

    logEvent(
        "Checking mesh radio...",
        "sensor"
    );

    logEvent(
        "Checking local storage...",
        "sensor"
    );

    setTimeout(() => {

        if (
            state.gps &&
            state.radio &&
            state.heart &&
            state.environment &&
            state.storage &&
            state.processor
        ) {

            logEvent(
                "HARDWARE SELF-TEST PASSED — ALL SYSTEMS OPERATIONAL.",
                "success"
            );

        } else {

            logEvent(
                "HARDWARE SELF-TEST COMPLETED — FAULTS DETECTED.",
                "warning"
            );

        }

        state.sensorTest = false;

        updateAll();

    }, 500);

}


/* =========================
   RESTORE
========================= */

function restoreHardware() {

    state.gps = true;
    state.radio = true;
    state.heart = true;
    state.processor = true;
    state.environment = true;
    state.storage = true;

    logEvent(
        "Hardware systems restored.",
        "success"
    );

    logEvent(
        "All Sentinel-W1 components responding normally.",
        "success"
    );

    updateAll();
}


/* =========================
   DETERMINE STATE
========================= */

function determineHardwareState() {

    const allNormal =
        state.gps &&
        state.radio &&
        state.heart &&
        state.processor &&
        state.environment &&
        state.storage;


    if (allNormal) {
        return "NORMAL";
    }


    const communicationFailure =
        !state.radio;

    const criticalFailure =
        !state.processor ||
        !state.storage;


    if (criticalFailure) {
        return "CRITICAL";
    }


    if (communicationFailure) {
        return "DEGRADED";
    }


    return "PARTIAL FAULT";
}


/* =========================
   UPDATE STATUS
========================= */

function updateState() {

    const current =
        determineHardwareState();


    hardwareState.className =
        "core-state";


    if (current === "NORMAL") {

        hardwareState.textContent =
            "ALL SYSTEMS NORMAL";

    }

    else if (current === "DEGRADED") {

        hardwareState.textContent =
            "COMMUNICATION DEGRADED";

        hardwareState.classList.add(
            "warning"
        );

    }

    else if (current === "CRITICAL") {

        hardwareState.textContent =
            "CRITICAL HARDWARE FAULT";

        hardwareState.classList.add(
            "bad"
        );

    }

    else {

        hardwareState.textContent =
            "PARTIAL HARDWARE FAULT";

        hardwareState.classList.add(
            "warning"
        );
    }


    busStatus.textContent =
        state.radio
            ? "HARDWARE BUS ACTIVE"
            : "COMMUNICATION BUS DEGRADED";


    updateConditions();

    updateCards();

    updateMonitors();

    updateReadings();

    updateExplanation();

}


/* =========================
   CONDITIONS
========================= */

function updateConditions() {

    setCondition(
        processorCondition,
        state.processor,
        "NORMAL",
        "FAILED"
    );

    setCondition(
        gpsCondition,
        state.gps,
        "LOCKED",
        "NO SIGNAL"
    );

    setCondition(
        radioCondition,
        state.radio,
        "ACTIVE",
        "FAILED"
    );

    setCondition(
        heartCondition,
        state.heart,
        "ACTIVE",
        "FAILED"
    );

    setCondition(
        environmentCondition,
        state.environment,
        "ACTIVE",
        "FAILED"
    );

    setCondition(
        storageCondition,
        state.storage,
        "AVAILABLE",
        "FAILED"
    );

}


function setCondition(
    element,
    good,
    goodText,
    badText
) {

    element.textContent =
        good
            ? goodText
            : badText;

    element.className =
        good
            ? ""
            : "bad";
}


/* =========================
   COMPONENT CARDS
========================= */

function updateCards() {

    componentGPS.classList.toggle(
        "failed",
        !state.gps
    );

    componentRadio.classList.toggle(
        "failed",
        !state.radio
    );

    componentHeart.classList.toggle(
        "failed",
        !state.heart
    );

    processorCard.classList.toggle(
        "failed",
        !state.processor
    );


    gpsCardStatus.textContent =
        state.gps
            ? "LOCKED"
            : "NO SIGNAL";

    radioCardStatus.textContent =
        state.radio
            ? "ACTIVE"
            : "FAILED";

    heartCardStatus.textContent =
        state.heart
            ? "ACTIVE"
            : "FAILED";

}


/* =========================
   MONITORS
========================= */

function updateMonitors() {

    setMonitor(
        monitorAI,
        state.processor,
        "ONLINE",
        "FAILED"
    );

    setMonitor(
        monitorGPS,
        state.gps,
        "LOCKED",
        "NO SIGNAL"
    );

    setMonitor(
        monitorRadio,
        state.radio,
        "ACTIVE",
        "FAILED"
    );

    setMonitor(
        monitorHeart,
        state.heart,
        "ACTIVE",
        "FAILED"
    );

    setMonitor(
        monitorEnvironment,
        state.environment,
        "ACTIVE",
        "FAILED"
    );

    setMonitor(
        monitorStorage,
        state.storage,
        "READY",
        "FAILED"
    );


    radioBusNode.className =
        state.radio
            ? "bus-node active"
            : "bus-node failed";
}


function setMonitor(
    element,
    good,
    goodText,
    badText
) {

    element.textContent =
        good
            ? goodText
            : badText;

    element.className =
        good
            ? ""
            : "bad";
}


/* =========================
   LIVE READINGS
========================= */

function updateReadings() {

    if (state.heart) {

        const bpm =
            76 +
            Math.floor(
                Math.random() * 7
            );

        heartRate.textContent =
            bpm;

        heartRateBar.style.width =
            `${Math.min(
                90,
                Math.max(
                    25,
                    bpm
                )
            )}%`;

    } else {

        heartRate.textContent =
            "--";

        heartRateBar.style.width =
            "0%";
    }


    const temp =
        (
            30.8 +
            Math.random() * 1.5
        ).toFixed(1);

    temperature.textContent =
        temp;

    temperatureBar.style.width =
        "63%";


    const pressureValue =
        Math.round(
            1005 +
            Math.random() * 7
        );

    pressure.textContent =
        pressureValue;

    pressureBar.style.width =
        "70%";


    if (state.gps) {

        const accuracy =
            (
                3.0 +
                Math.random() * 2
            ).toFixed(1);

        gpsAccuracy.textContent =
            accuracy;

        gpsAccuracyBar.style.width =
            "82%";

    } else {

        gpsAccuracy.textContent =
            "--";

        gpsAccuracyBar.style.width =
            "0%";
    }

}


/* =========================
   EXPLANATION
========================= */

function updateExplanation() {

    if (!state.processor) {

        hardwareExplanation.textContent =
            "The local AI processor is unavailable. Sensor hardware may continue collecting raw information, but local intelligent processing and automated decision support are impaired.";

        aiInterpretation.textContent =
            "PROCESSOR FAILURE: Local AI analysis is unavailable. Raw sensor operation may continue, but intelligent interpretation cannot be performed.";

        return;
    }


    if (!state.radio) {

        hardwareExplanation.textContent =
            "The mesh radio is unavailable. The wearable can continue sensing, processing and storing information locally, but it cannot currently transmit information through SentinelNet.";

        aiInterpretation.textContent =
            "RADIO FAILURE: Local sensing and AI processing remain operational. Information must be retained locally until communication is restored.";

        return;
    }


    if (!state.gps) {

        hardwareExplanation.textContent =
            "The GPS module cannot currently obtain a position. The system retains the last known location while other hardware continues operating.";

        aiInterpretation.textContent =
            "GPS SIGNAL LOST: Continue sensor monitoring and retain the last known position. Other hardware remains operational.";

        return;
    }


    if (!state.heart) {

        hardwareExplanation.textContent =
            "The heart-rate sensor is unavailable. Environmental sensing, local AI processing, storage and mesh communication remain operational.";

        aiInterpretation.textContent =
            "HEART SENSOR FAILURE: Vital monitoring is unavailable, but the remaining hardware systems continue operating.";

        return;
    }


    hardwareExplanation.textContent =
        "The Sentinel wearable continuously collects information from its sensors. The system controller passes the data to the local AI processor, which can analyze the information without requiring internet connectivity.";

    aiInterpretation.textContent =
        "All required hardware systems are operational. Sentinel-W1 is ready for continuous monitoring.";
}


/* =========================
   +3 MIN CHECK
========================= */

function hardwareCheck() {

    simulatedMinutes +=
        CONFIG.statusInterval;

    simTime.textContent =
        formatTime();


    logEvent(
        `━━━ ${formatTime()} — HARDWARE STATUS CHECK ━━━`,
        "sensor"
    );


    updateReadings();


    const current =
        determineHardwareState();


    if (current === "NORMAL") {

        logEvent(
            "All hardware components responding normally.",
            "success"
        );

        logEvent(
            "Sensor data successfully available to local AI.",
            "ai"
        );

    }

    else {

        logEvent(
            `Hardware state: ${current}.`,
            "warning"
        );

    }


    updateAll();
}


/* =========================
   UPDATE ALL
========================= */

function updateAll() {

    updateState();
}


/* =========================
   BUTTONS
========================= */

document
    .getElementById("sensorTestBtn")
    .addEventListener(
        "click",
        runSensorTest
    );


document
    .getElementById("gpsBtn")
    .addEventListener(
        "click",
        simulateGPSFailure
    );


document
    .getElementById("radioBtn")
    .addEventListener(
        "click",
        simulateRadioFailure
    );


document
    .getElementById("heartBtn")
    .addEventListener(
        "click",
        simulateHeartFailure
    );


document
    .getElementById("restoreBtn")
    .addEventListener(
        "click",
        restoreHardware
    );


document
    .getElementById("threeMinBtn")
    .addEventListener(
        "click",
        hardwareCheck
    );


/* =========================
   INITIALIZATION
========================= */

simTime.textContent =
    formatTime();


logEvent(
    "Sentinel-W1 hardware core initialized.",
    "success"
);

logEvent(
    "Local AI processor online.",
    "ai"
);

logEvent(
    "Sensor bus connected.",
    "sensor"
);

logEvent(
    "GPS, mesh radio and local storage verified.",
    "success"
);


updateAll();