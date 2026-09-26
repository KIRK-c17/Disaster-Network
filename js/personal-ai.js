/* =========================================================
   DISASTERNETWORK
   SENTINELNET — PERSONAL AI SIMULATION
   ========================================================= */

const CONFIG = {
    statusInterval: 3,
    startingTime: 10 * 60,
    startingBattery: 78,
    startingHeartRate: 82,
    normalConfidence: 94
};


/* =========================================================
   STATE
   ========================================================= */

const state = {

    simulatedMinutes: 0,

    heartRate: CONFIG.startingHeartRate,

    battery: CONFIG.startingBattery,

    location: "BLOCK 04",

    networkConnected: true,

    emergency: false,

    stress: false,

    aiConfidence: CONFIG.normalConfidence,

    lastAssessment: "NORMAL"

};


/* =========================================================
   ELEMENTS
   ========================================================= */

const simTime =
    document.getElementById("simTime");

const heartRate =
    document.getElementById("heartRate");

const heartState =
    document.getElementById("heartState");

const bodyStatus =
    document.getElementById("bodyStatus");

const motionStatus =
    document.getElementById("motionStatus");

const aiMessage =
    document.getElementById("aiMessage");

const confidenceValue =
    document.getElementById("confidenceValue");

const confidenceBar =
    document.getElementById("confidenceBar");

const batteryLevel =
    document.getElementById("batteryLevel");

const batteryValue =
    document.getElementById("batteryValue");

const batteryState =
    document.getElementById("batteryState");

const emergencyStatus =
    document.getElementById("emergencyStatus");

const networkValue =
    document.getElementById("networkValue");

const radioStatus =
    document.getElementById("radioStatus");

const lastAssessment =
    document.getElementById("lastAssessment");

const eventLog =
    document.getElementById("eventLog");

const aiCoreStatus =
    document.getElementById("aiCoreStatus");


/* =========================================================
   TIME
   ========================================================= */

function formatTime() {

    const totalMinutes =
        CONFIG.startingTime +
        state.simulatedMinutes;

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}


function advanceTime() {

    state.simulatedMinutes +=
        CONFIG.statusInterval;

    simTime.textContent =
        formatTime();

    logEvent(
        `[${formatTime()}] PERSONAL AI STATUS CYCLE`,
        "ai"
    );

    consumeBattery(1);

    generateNormalBiometrics();

    runAI();

}


/* =========================================================
   BATTERY
   ========================================================= */

function consumeBattery(amount) {

    state.battery =
        Math.max(
            0,
            state.battery - amount
        );

    updateBattery();

}


function updateBattery() {

    batteryLevel.style.width =
        `${state.battery}%`;

    batteryValue.textContent =
        `${state.battery}%`;

    if (state.battery > 40) {

        batteryState.textContent =
            "NORMAL POWER";

        batteryState.style.color =
            "#5be39a";

    } else if (state.battery > 15) {

        batteryState.textContent =
            "POWER CONSERVATION ADVISED";

        batteryState.style.color =
            "#ffd36a";

    } else {

        batteryState.textContent =
            "CRITICAL BATTERY";

        batteryState.style.color =
            "#ff6868";
    }

}


/* =========================================================
   BIOMETRIC SIMULATION
   ========================================================= */

function generateNormalBiometrics() {

    if (state.emergency) {
        return;
    }

    if (state.stress) {

        state.heartRate =
            randomNumber(105, 125);

        bodyStatus.textContent =
            "STRESSED";

        motionStatus.textContent =
            "IRREGULAR";

        return;
    }

    state.heartRate =
        randomNumber(76, 88);

    bodyStatus.textContent =
        "STABLE";

    motionStatus.textContent =
        "ACTIVE";

    updateBiometrics();

}


function updateBiometrics() {

    heartRate.textContent =
        state.heartRate;

    if (
        state.heartRate >= 60 &&
        state.heartRate <= 100
    ) {

        heartState.textContent =
            "NORMAL";

        heartState.className =
            "metric-state good";

    } else if (
        state.heartRate <= 120
    ) {

        heartState.textContent =
            "ELEVATED";

        heartState.className =
            "metric-state warning";

    } else {

        heartState.textContent =
            "HIGH";

        heartState.className =
            "metric-state danger";
    }

}


/* =========================================================
   AI CORE
   ========================================================= */

async function runAI() {

    activateDecisionStep("detectCard");

    await wait(350);

    activateDecisionStep("analyzeCard");

    await wait(350);

    activateDecisionStep("decideCard");

    await wait(350);

    activateDecisionStep("actCard");

    await wait(300);

    clearDecisionSteps();

    evaluateSituation();

}


function activateDecisionStep(id) {

    document
        .getElementById(id)
        .classList.add("active");

}


function clearDecisionSteps() {

    document
        .querySelectorAll(".decision-card")
        .forEach(card => {
            card.classList.remove("active");
        });

}


/* =========================================================
   AI EVALUATION
   ========================================================= */

function evaluateSituation() {

    if (state.emergency) {

        setAIState(
            "danger",
            "EMERGENCY CONDITIONS DETECTED. Personal AI has prioritized immediate safety guidance and emergency communication. Prepare an emergency packet containing identity, location, and biometric status."
        );

        state.aiConfidence = 98;

        state.lastAssessment =
            "EMERGENCY";

        return;
    }


    if (state.stress) {

        setAIState(
            "warning",
            "Elevated heart rate detected. Personal AI identifies a possible stress response. Remain calm, minimize unnecessary movement, and monitor your surroundings."
        );

        state.aiConfidence = 91;

        state.lastAssessment =
            "ELEVATED STRESS";

        return;
    }


    if (!state.networkConnected) {

        setAIState(
            "warning",
            "Command connectivity is unavailable. Personal AI remains operational using its local offline model. Emergency information can be retained for mesh transmission when another Sentinel becomes available."
        );

        state.aiConfidence = 88;

        state.lastAssessment =
            "NETWORK DISCONNECTED";

        return;
    }


    setAIState(
        "normal",
        "Sentinel operating normally. Personal AI is continuously monitoring biometric status, location, network availability, and local conditions."
    );

    state.aiConfidence =
        CONFIG.normalConfidence;

    state.lastAssessment =
        "NORMAL";

}


/* =========================================================
   AI STATE
   ========================================================= */

function setAIState(type, message) {

    aiMessage.className =
        "ai-message";

    if (type === "warning") {
        aiMessage.classList.add("warning");
    }

    if (type === "danger") {
        aiMessage.classList.add("danger");
    }

    aiMessage.textContent =
        message;

    confidenceValue.textContent =
        `${state.aiConfidence}%`;

    confidenceBar.style.width =
        `${state.aiConfidence}%`;

    lastAssessment.textContent =
        state.lastAssessment;

}


/* =========================================================
   STRESS SIMULATION
   ========================================================= */

function simulateStress() {

    state.stress =
        !state.stress;

    if (state.stress) {

        logEvent(
            `[${formatTime()}] ELEVATED BIOMETRIC ACTIVITY DETECTED`,
            "warning"
        );

        state.heartRate =
            randomNumber(105, 125);

        bodyStatus.textContent =
            "STRESSED";

        motionStatus.textContent =
            "IRREGULAR";

        updateBiometrics();

        runAI();

    } else {

        logEvent(
            `[${formatTime()}] BIOMETRIC STATUS RETURNING TO NORMAL`,
            "good"
        );

        generateNormalBiometrics();

        runAI();
    }

}


/* =========================================================
   EMERGENCY
   ========================================================= */

function triggerEmergency() {

    state.emergency =
        true;

    state.stress =
        true;

    state.heartRate =
        randomNumber(115, 135);

    emergencyStatus.textContent =
        "ACTIVE";

    emergencyStatus.className =
        "danger-text";

    aiCoreStatus.textContent =
        "● EMERGENCY";

    aiCoreStatus.style.color =
        "#ff6868";

    logEvent(
        `[${formatTime()}] PERSONAL EMERGENCY ACTIVATED`,
        "danger"
    );

    logEvent(
        `[${formatTime()}] LOCATION: ${state.location}`,
        "danger"
    );

    logEvent(
        `[${formatTime()}] HEART RATE: ${state.heartRate} BPM`,
        "danger"
    );

    logEvent(
        `[${formatTime()}] AI PREPARING EMERGENCY RESPONSE`,
        "ai"
    );

    updateBiometrics();

    runAI();

}


/* =========================================================
   RESET
   ========================================================= */

function resetSentinel() {

    state.heartRate =
        CONFIG.startingHeartRate;

    state.battery =
        CONFIG.startingBattery;

    state.networkConnected =
        true;

    state.emergency =
        false;

    state.stress =
        false;

    state.aiConfidence =
        CONFIG.normalConfidence;

    state.lastAssessment =
        "NORMAL";

    emergencyStatus.textContent =
        "STANDBY";

    emergencyStatus.className =
        "good-text";

    aiCoreStatus.textContent =
        "● ACTIVE";

    aiCoreStatus.style.color =
        "#5be39a";

    networkValue.textContent =
        "CONNECTED";

    networkValue.className =
        "good-text";

    radioStatus.textContent =
        "CONNECTED";

    radioStatus.className =
        "good-text";

    bodyStatus.textContent =
        "STABLE";

    motionStatus.textContent =
        "ACTIVE";

    updateBiometrics();

    updateBattery();

    setAIState(
        "normal",
        "Sentinel operating normally. Personal AI is continuously monitoring biometric status, location, network availability, and local conditions."
    );

    logEvent(
        `[${formatTime()}] SENTINEL SYSTEM RESET`,
        "good"
    );

}


/* =========================================================
   PERSONAL AI QUESTIONS
   ========================================================= */

function answerQuestion(question) {

    let response = "";

    if (question === "status") {

        response =
            `Your current heart rate is ${state.heartRate} BPM. Battery is ${state.battery}%. Location is ${state.location}. Network status is ${state.networkConnected ? "connected" : "disconnected"}.`;

    }

    if (question === "safe") {

        if (state.emergency) {

            response =
                "I have detected an emergency condition. Move toward the safest available area, follow emergency guidance, and maintain communication with nearby Sentinels.";

        } else if (state.stress) {

            response =
                "I do not detect a confirmed external hazard from the current information. Your heart rate is elevated, so remain calm and monitor your surroundings.";

        } else {

            response =
                "Current biometric and system information appears normal. I cannot guarantee physical safety, so continue monitoring your surroundings.";
        }

    }

    if (question === "network") {

        if (state.networkConnected) {

            response =
                "Mesh communication is currently available. Emergency information can be transmitted through the network.";

        } else {

            response =
                "Direct network connectivity is unavailable. My offline intelligence remains operational and emergency information can be stored until another communication path becomes available.";
        }

    }

    if (question === "battery") {

        response =
            `Battery level is ${state.battery}%. ${getBatteryAdvice()}`;
    }


    addChatMessage(
        "USER",
        getQuestionText(question),
        "user"
    );

    setTimeout(() => {

        addChatMessage(
            "PERSONAL AI",
            response,
            "ai"
        );

        logEvent(
            `[${formatTime()}] AI ASSISTANT RESPONSE GENERATED`,
            "ai"
        );

    }, 250);

}


function getQuestionText(question) {

    const questions = {

        status:
            "CHECK MY STATUS",

        safe:
            "AM I SAFE?",

        network:
            "CHECK NETWORK",

        battery:
            "CHECK BATTERY"

    };

    return questions[question] || "QUESTION";

}


function getBatteryAdvice() {

    if (state.battery > 40) {
        return "Power level is sufficient for normal operation.";
    }

    if (state.battery > 15) {
        return "Power conservation is recommended.";
    }

    return "Critical battery level. Activate power-saving behavior.";
}


/* =========================================================
   SELF ASSESSMENT
   ========================================================= */

async function selfAssessment() {

    logEvent(
        `[${formatTime()}] AI SELF-ASSESSMENT STARTED`,
        "ai"
    );

    aiMessage.textContent =
        "Running local self-assessment. Checking biometric state, memory availability, network status, location, and battery...";

    activateDecisionStep("detectCard");

    await wait(500);

    activateDecisionStep("analyzeCard");

    await wait(500);

    activateDecisionStep("decideCard");

    await wait(500);

    activateDecisionStep("actCard");

    await wait(400);

    clearDecisionSteps();

    evaluateSituation();

    logEvent(
        `[${formatTime()}] AI SELF-ASSESSMENT COMPLETE`,
        "good"
    );

}


/* =========================================================
   LOGGING
   ========================================================= */

function logEvent(message, type = "") {

    const event =
        document.createElement("div");

    event.className =
        `event ${type}`;

    event.textContent =
        message;

    eventLog.prepend(event);

    while (
        eventLog.children.length > 60
    ) {

        eventLog.removeChild(
            eventLog.lastChild
        );

    }

}


/* =========================================================
   CHAT
   ========================================================= */

function addChatMessage(
    sender,
    message,
    type
) {

    const chat =
        document.createElement("div");

    chat.className =
        `chat ${type}`;

    const strong =
        document.createElement("strong");

    strong.textContent =
        sender;

    const p =
        document.createElement("p");

    p.textContent =
        message;

    chat.appendChild(strong);
    chat.appendChild(p);

    chatBox.appendChild(chat);

    chatBox.scrollTop =
        chatBox.scrollHeight;

}


/* =========================================================
   HELPERS
   ========================================================= */

function randomNumber(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;

}


function wait(ms) {

    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

document
    .getElementById("selfCheckBtn")
    .addEventListener(
        "click",
        selfAssessment
    );


document
    .getElementById("askAiBtn")
    .addEventListener(
        "click",
        () => {

            addChatMessage(
                "PERSONAL AI",
                "I am operating locally. You can ask me about your status, safety, network, or battery.",
                "ai"
            );

            logEvent(
                `[${formatTime()}] USER REQUESTED AI ASSISTANCE`,
                "ai"
            );

        }
    );


document
    .getElementById("simulateStressBtn")
    .addEventListener(
        "click",
        simulateStress
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
        resetSentinel
    );


document
    .querySelectorAll(
        ".question-controls button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                answerQuestion(
                    button.dataset.question
                );

            }
        );

    });


/* =========================================================
   SIMULATION CLOCK
   ========================================================= */

/*
   This is intentionally a SIMULATION clock.

   Every 3 minutes of simulated time,
   the user can advance the system by calling
   advanceTime().

   This keeps the Personal AI simulation
   consistent with the Mesh Network's
   +3 MIN concept.
*/

function advanceSimulation() {

    advanceTime();

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

simTime.textContent =
    formatTime();

updateBiometrics();

updateBattery();

setAIState(
    "normal",
    "Sentinel operating normally. Personal AI is continuously monitoring biometric status, location, network availability, and local conditions."
);
