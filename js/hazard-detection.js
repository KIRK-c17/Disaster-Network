/* =========================================================
   DISASTERNETWORK
   SENTINELNET — HAZARD DETECTION
   ========================================================= */


const CONFIG = {

    startingMinutes: 10 * 60,

    scanDuration: 450,

    normalConfidence: 99

};


/* =========================================================
   STATE
   ========================================================= */

const state = {

    simulatedMinutes: 0,

    selectedHazard: "normal",

    detectedHazard: "normal",

    severity: "normal",

    confidence: 99,

    emergency: false,

    verified: false

};


/* =========================================================
   HAZARD DATA
   ========================================================= */

const HAZARDS = {

    normal: {

        name: "NO HAZARD",

        severity: "normal",

        confidence: 99,

        message:
            "Environmental conditions are currently within normal parameters.",

        response:
            "Continue monitoring environmental conditions. No immediate hazard response is required.",

        sensors: {

            seismic: 0.02,

            water: 12,

            soil: 18,

            air: 22,

            gas: 18,

            pressure: 1012

        },

        statuses: {

            seismic: "NORMAL",

            water: "NORMAL",

            soil: "STABLE",

            air: "NORMAL",

            gas: "NORMAL",

            pressure: "NORMAL"

        },

        primary: "NONE",

        supporting: "NONE",

        pattern: "NONE"

    },


    earthquake: {

        name: "EARTHQUAKE",

        severity: "danger",

        confidence: 96,

        message:
            "Strong seismic activity has been detected. The sensor pattern is consistent with an earthquake event.",

        response:
            "Move away from unstable structures, protect yourself from falling objects, and prepare for aftershocks. Emergency communication should be activated.",

        sensors: {

            seismic: 0.74,

            water: 14,

            soil: 21,

            air: 24,

            gas: 22,

            pressure: 1010

        },

        statuses: {

            seismic: "HIGH",

            water: "NORMAL",

            soil: "DISTURBED",

            air: "NORMAL",

            gas: "NORMAL",

            pressure: "NORMAL"

        },

        primary: "SEISMIC",

        supporting: "SOIL",

        pattern: "SEISMIC ACTIVITY"

    },


    flood: {

        name: "FLOOD",

        severity: "danger",

        confidence: 94,

        message:
            "Rapid water-level increase has been detected. Environmental readings indicate a possible flood condition.",

        response:
            "Move toward higher ground and avoid moving water. Do not enter flooded electrical or structurally unstable areas.",

        sensors: {

            seismic: 0.03,

            water: 86,

            soil: 73,

            air: 27,

            gas: 19,

            pressure: 1006

        },

        statuses: {

            seismic: "NORMAL",

            water: "CRITICAL",

            soil: "SATURATED",

            air: "ELEVATED",

            gas: "NORMAL",

            pressure: "LOW"

        },

        primary: "WATER LEVEL",

        supporting: "SOIL + PRESSURE",

        pattern: "RISING WATER"

    },


    landslide: {

        name: "LANDSLIDE",

        severity: "danger",

        confidence: 92,

        message:
            "Abnormal soil movement and saturation have been detected. The combined pattern indicates possible landslide activity.",

        response:
            "Move away from slopes, retaining walls, and areas showing ground movement. Seek stable higher ground and maintain communication.",

        sensors: {

            seismic: 0.18,

            water: 48,

            soil: 91,

            air: 24,

            gas: 17,

            pressure: 1008

        },

        statuses: {

            seismic: "DISTURBED",

            water: "ELEVATED",

            soil: "CRITICAL",

            air: "NORMAL",

            gas: "NORMAL",

            pressure: "LOW"

        },

        primary: "SOIL MOVEMENT",

        supporting: "SEISMIC + WATER",

        pattern: "GROUND INSTABILITY"

    },


    volcanic: {

        name: "VOLCANIC ERUPTION",

        severity: "danger",

        confidence: 95,

        message:
            "Elevated gas concentration and ground activity have been detected. The pattern is consistent with volcanic activity.",

        response:
            "Follow official evacuation guidance, avoid restricted volcanic zones, protect your airway from ash, and prepare for evacuation.",

        sensors: {

            seismic: 0.46,

            water: 16,

            soil: 49,

            air: 31,

            gas: 184,

            pressure: 1004

        },

        statuses: {

            seismic: "ELEVATED",

            water: "NORMAL",

            soil: "HOT / ACTIVE",

            air: "ASH DETECTED",

            gas: "CRITICAL",

            pressure: "LOW"

        },

        primary: "GAS",

        supporting: "SEISMIC + AIR",

        pattern: "VOLCANIC ACTIVITY"

    },


    typhoon: {

        name: "TYPHOON",

        severity: "warning",

        confidence: 93,

        message:
            "Strong wind and pressure changes have been detected. Environmental conditions are consistent with a severe storm system.",

        response:
            "Remain indoors or move to a designated safe shelter. Avoid floodwater, exposed structures, and unnecessary travel.",

        sensors: {

            seismic: 0.02,

            water: 39,

            soil: 66,

            air: 58,

            gas: 18,

            pressure: 958

        },

        statuses: {

            seismic: "NORMAL",

            water: "RISING",

            soil: "SATURATED",

            air: "EXTREME",

            gas: "NORMAL",

            pressure: "CRITICAL"

        },

        primary: "WIND / PRESSURE",

        supporting: "WATER + SOIL",

        pattern: "SEVERE STORM"

    }

};


/* =========================================================
   ELEMENTS
   ========================================================= */

const simTime =
    document.getElementById("simTime");

const hazardName =
    document.getElementById("hazardName");

const severity =
    document.getElementById("severity");

const confidence =
    document.getElementById("confidence");

const confidenceBar =
    document.getElementById("confidenceBar");

const classificationMessage =
    document.getElementById(
        "classificationMessage"
    );

const detectionState =
    document.getElementById(
        "detectionState"
    );

const radarCenter =
    document.getElementById(
        "radarCenter"
    );

const classificationStatus =
    document.getElementById(
        "classificationStatus"
    );

const verificationStatus =
    document.getElementById(
        "verificationStatus"
    );

const emergencyStatus =
    document.getElementById(
        "emergencyStatus"
    );

const responseBox =
    document.getElementById(
        "responseBox"
    );

const hazardProfile =
    document.getElementById(
        "hazardProfile"
    );

const primaryEvidence =
    document.getElementById(
        "primaryEvidence"
    );

const supportingEvidence =
    document.getElementById(
        "supportingEvidence"
    );

const patternEvidence =
    document.getElementById(
        "patternEvidence"
    );

const evidenceConfidence =
    document.getElementById(
        "evidenceConfidence"
    );

const eventLog =
    document.getElementById(
        "eventLog"
    );


/* =========================================================
   TIME
   ========================================================= */

function formatTime() {

    const total =
        CONFIG.startingMinutes +
        state.simulatedMinutes;

    const hours =
        Math.floor(total / 60);

    const minutes =
        total % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

}


function advanceTime() {

    state.simulatedMinutes += 3;

    simTime.textContent =
        formatTime();

}


/* =========================================================
   SENSOR DISPLAY
   ========================================================= */

function updateSensors(hazard) {

    const data =
        HAZARDS[hazard];

    setSensor(
        "seismic",
        data.sensors.seismic,
        data.statuses.seismic
    );

    setSensor(
        "water",
        data.sensors.water,
        data.statuses.water
    );

    setSensor(
        "soil",
        data.sensors.soil,
        data.statuses.soil
    );

    setSensor(
        "air",
        data.sensors.air,
        data.statuses.air
    );

    setSensor(
        "gas",
        data.sensors.gas,
        data.statuses.gas
    );

    setSensor(
        "pressure",
        data.sensors.pressure,
        data.statuses.pressure
    );

}


function setSensor(
    sensor,
    value,
    status
) {

    const valueElement =
        document.getElementById(
            `${sensor}Value`
        );

    const statusElement =
        document.getElementById(
            `${sensor}Status`
        );

    valueElement.textContent =
        value;

    statusElement.textContent =
        status;

    statusElement.className =
        "sensor-status";

    if (
        status === "NORMAL" ||
        status === "STABLE"
    ) {

        statusElement.classList.add(
            "good"
        );

    } else if (
        status.includes("CRITICAL") ||
        status.includes("EXTREME") ||
        status.includes("HIGH")
    ) {

        statusElement.classList.add(
            "danger"
        );

    } else {

        statusElement.classList.add(
            "warning"
        );

    }

}


/* =========================================================
   HAZARD SELECTION
   ========================================================= */

function selectHazard(hazard) {

    state.selectedHazard =
        hazard;

    document
        .querySelectorAll(".hazard-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.hazard === hazard
            );

        });

    loadHazardPreview(hazard);

    logEvent(
        `[${formatTime()}] SIMULATION PROFILE: ${HAZARDS[hazard].name}`,
        "ai"
    );

}


function loadHazardPreview(hazard) {

    const data =
        HAZARDS[hazard];

    state.detectedHazard =
        hazard;

    state.severity =
        data.severity;

    state.confidence =
        data.confidence;

    hazardName.textContent =
        data.name;

    severity.textContent =
        getSeverityText(
            data.severity
        );

    severity.className =
        `severity ${data.severity}`;

    confidence.textContent =
        `${data.confidence}%`;

    confidenceBar.style.width =
        `${data.confidence}%`;

    classificationMessage.textContent =
        data.message;

    classificationMessage.className =
        "classification-message";

    if (
        data.severity === "warning"
    ) {

        classificationMessage.classList.add(
            "warning"
        );

    }

    if (
        data.severity === "danger"
    ) {

        classificationMessage.classList.add(
            "danger"
        );

    }

    updateSensors(hazard);

    updateEvidence(data);

    updateProfile(data);

    updateVisualState(data);

}


function getSeverityText(severityValue) {

    if (severityValue === "danger") {
        return "HIGH SEVERITY";
    }

    if (severityValue === "warning") {
        return "ELEVATED";
    }

    return "NORMAL";

}


/* =========================================================
   VISUAL STATE
   ========================================================= */

function updateVisualState(data) {

    radarCenter.className =
        "radar-center";

    detectionState.className =
        "detection-state";

    if (data.severity === "warning") {

        radarCenter.classList.add(
            "warning"
        );

        detectionState.classList.add(
            "warning"
        );

        detectionState.textContent =
            "● ELEVATED";

    } else if (
        data.severity === "danger"
    ) {

        radarCenter.classList.add(
            "danger"
        );

        detectionState.classList.add(
            "danger"
        );

        detectionState.textContent =
            "● HAZARD DETECTED";

    } else {

        detectionState.textContent =
            "● MONITORING";

    }

}


/* =========================================================
   EVIDENCE
   ========================================================= */

function updateEvidence(data) {

    primaryEvidence.textContent =
        data.primary;

    supportingEvidence.textContent =
        data.supporting;

    patternEvidence.textContent =
        data.pattern;

    evidenceConfidence.textContent =
        `${data.confidence}%`;

}


function updateProfile(data) {

    hazardProfile.innerHTML = `
        <span>CURRENT CONDITION</span>
        <strong>${data.name}</strong>
        <p>${data.message}</p>
    `;

}


/* =========================================================
   SENSOR SCAN
   ========================================================= */

async function runScan() {

    state.emergency =
        false;

    state.verified =
        false;

    verificationStatus.textContent =
        "PROCESSING";

    verificationStatus.className =
        "warning-text";

    emergencyStatus.textContent =
        "STANDBY";

    emergencyStatus.className =
        "";

    classificationStatus.textContent =
        "ANALYZING";

    responseBox.className =
        "response-box";

    responseBox.innerHTML = `
        <strong>SYSTEM STATUS: ANALYZING</strong>
        <p>
            Sensor readings are being analyzed
            by the local hazard-detection model.
        </p>
    `;

    logEvent(
        `[${formatTime()}] SENSOR SCAN STARTED`,
        "ai"
    );


    await activatePipeline(
        "pipelineObserve"
    );

    logEvent(
        `[${formatTime()}] SENSOR DATA COLLECTED`,
        "good"
    );


    await activatePipeline(
        "pipelineCompare"
    );

    logEvent(
        `[${formatTime()}] ENVIRONMENTAL PATTERN ANALYZED`,
        "ai"
    );


    await activatePipeline(
        "pipelineClassify"
    );

    loadHazardPreview(
        state.selectedHazard
    );

    logEvent(
        `[${formatTime()}] HAZARD CLASSIFIED: ${HAZARDS[state.selectedHazard].name}`,
        state.selectedHazard === "normal"
            ? "good"
            : "warning"
    );


    await activatePipeline(
        "pipelineVerify"
    );

    state.verified =
        true;

    verificationStatus.textContent =
        "VERIFIED";

    verificationStatus.className =
        "good-text";

    logEvent(
        `[${formatTime()}] MULTI-SENSOR PATTERN VERIFIED`,
        "good"
    );


    await activatePipeline(
        "pipelineRespond"
    );


    classificationStatus.textContent =
        "CLASSIFIED";


    if (
        state.selectedHazard === "normal"
    ) {

        responseBox.innerHTML = `
            <strong>SYSTEM STATUS: NORMAL</strong>
            <p>
                ${HAZARDS.normal.response}
            </p>
        `;

        responseBox.className =
            "response-box";

    } else {

        responseBox.innerHTML = `
            <strong>HAZARD RESPONSE RECOMMENDATION</strong>
            <p>
                ${HAZARDS[state.selectedHazard].response}
            </p>
        `;

        responseBox.className =
            `response-box ${HAZARDS[state.selectedHazard].severity}`;

        logEvent(
            `[${formatTime()}] AI RESPONSE RECOMMENDATION GENERATED`,
            "ai"
        );

    }

}


async function activatePipeline(id) {

    const node =
        document.getElementById(id);

    node.classList.remove(
        "active",
        "warning",
        "danger"
    );

    await wait(
        CONFIG.scanDuration
    );

    node.classList.add(
        "active"
    );

}


/* =========================================================
   MULTI-SENSOR CONFIRMATION
   ========================================================= */

async function confirmDetection() {

    logEvent(
        `[${formatTime()}] REQUESTING MULTI-SENSOR CONFIRMATION`,
        "ai"
    );

    verificationStatus.textContent =
        "CROSS-CHECKING";

    verificationStatus.className =
        "warning-text";

    await wait(800);

    state.verified =
        true;

    verificationStatus.textContent =
        "CONFIRMED";

    verificationStatus.className =
        "good-text";

    logEvent(
        `[${formatTime()}] MULTI-SENSOR CONFIRMATION COMPLETE`,
        "good"
    );

}


/* =========================================================
   EMERGENCY
   ========================================================= */

function triggerEmergency() {

    state.emergency =
        true;

    emergencyStatus.textContent =
        "ACTIVE";

    emergencyStatus.className =
        "danger-text";

    detectionState.textContent =
        "● EMERGENCY";

    detectionState.className =
        "detection-state danger";

    radarCenter.classList.add(
        "danger"
    );

    logEvent(
        `[${formatTime()}] HAZARD EMERGENCY RESPONSE ACTIVATED`,
        "danger"
    );

    logEvent(
        `[${formatTime()}] CLASSIFICATION: ${HAZARDS[state.selectedHazard].name}`,
        "danger"
    );

    responseBox.className =
        "response-box danger";

    responseBox.innerHTML = `
        <strong>EMERGENCY RESPONSE ACTIVATED</strong>
        <p>
            ${HAZARDS[state.selectedHazard].response}
            Emergency information should now be
            transmitted to the DisasterNetwork.
        </p>
    `;

}


/* =========================================================
   RESET
   ========================================================= */

function resetDetection() {

    state.selectedHazard =
        "normal";

    state.detectedHazard =
        "normal";

    state.severity =
        "normal";

    state.confidence =
        99;

    state.emergency =
        false;

    state.verified =
        false;


    document
        .querySelectorAll(".hazard-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.hazard === "normal"
            );

        });


    document
        .querySelectorAll(".pipeline-node")
        .forEach(node => {

            node.classList.remove(
                "active",
                "warning",
                "danger"
            );

        });


    classificationStatus.textContent =
        "READY";

    verificationStatus.textContent =
        "STANDBY";

    verificationStatus.className =
        "";

    emergencyStatus.textContent =
        "STANDBY";

    emergencyStatus.className =
        "";


    loadHazardPreview(
        "normal"
    );


    responseBox.className =
        "response-box";

    responseBox.innerHTML = `
        <strong>SYSTEM STATUS: NORMAL</strong>
        <p>
            Continue monitoring environmental
            conditions. No immediate hazard
            response is required.
        </p>
    `;


    logEvent(
        `[${formatTime()}] HAZARD DETECTION RESET`,
        "good"
    );

}


/* =========================================================
   EVENT LOG
   ========================================================= */

function logEvent(
    message,
    type = ""
) {

    const event =
        document.createElement("div");

    event.className =
        `event ${type}`;

    event.textContent =
        message;

    eventLog.prepend(
        event
    );

    while (
        eventLog.children.length > 60
    ) {

        eventLog.removeChild(
            eventLog.lastChild
        );

    }

}


/* =========================================================
   HELPERS
   ========================================================= */

function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

document
    .querySelectorAll(".hazard-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                selectHazard(
                    button.dataset.hazard
                );

            }
        );

    });


document
    .getElementById("scanBtn")
    .addEventListener(
        "click",
        async () => {

            advanceTime();

            await runScan();

        }
    );


document
    .getElementById("confirmBtn")
    .addEventListener(
        "click",
        confirmDetection
    );


document
    .getElementById("emergencyBtn")
    .addEventListener(
        "click",
        triggerEmergency
    );


document
    .getElementById("resetBtn")
    .addEventListener(
        "click",
        resetDetection
    );


/* =========================================================
   INITIALIZATION
   ========================================================= */

simTime.textContent =
    formatTime();

loadHazardPreview(
    "normal"
);