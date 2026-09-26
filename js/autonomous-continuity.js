const CONFIG = {
    startingMinutes: 10 * 60,
    statusInterval: 3,
    maxEvents: 120,
    maxPackets: 20
};


let simulatedMinutes = 0;


const state = {

    internet: true,
    tower: true,
    command: true,
    power: true,

    autonomous: false,
    relay: false,

    packetQueue: [],

    continuityMode: "NORMAL"

};


/* =========================
   DOM
========================= */

const simTime =
    document.getElementById("simTime");

const internetStatus =
    document.getElementById("internetStatus");

const towerStatus =
    document.getElementById("towerStatus");

const commandStatus =
    document.getElementById("commandStatus");

const powerStatus =
    document.getElementById("powerStatus");

const continuityState =
    document.getElementById("continuityState");

const stateDescription =
    document.getElementById("stateDescription");

const coreState =
    document.getElementById("coreState");

const networkStatus =
    document.getElementById("networkStatus");

const relayIndicator =
    document.getElementById("relayIndicator");

const relayPath =
    document.getElementById("relayPath");

const analysisMode =
    document.getElementById("analysisMode");

const analysisInfrastructure =
    document.getElementById("analysisInfrastructure");

const analysisLocal =
    document.getElementById("analysisLocal");

const analysisCommunication =
    document.getElementById("analysisCommunication");

const aiDecision =
    document.getElementById("aiDecision");

const eventLog =
    document.getElementById("eventLog");

const packetList =
    document.getElementById("packetList");

const packetCount =
    document.getElementById("packetCount");

const relayDot =
    document.getElementById("relayDot");

const queueDot =
    document.getElementById("queueDot");


/* =========================
   HEALTH ELEMENTS
========================= */

const health = {

    ai: {
        value: document.getElementById("aiHealth"),
        bar: document.getElementById("aiBar")
    },

    storage: {
        value: document.getElementById("storageHealth"),
        bar: document.getElementById("storageBar")
    },

    gps: {
        value: document.getElementById("gpsHealth"),
        bar: document.getElementById("gpsBar")
    },

    radio: {
        value: document.getElementById("radioHealth"),
        bar: document.getElementById("radioBar")
    },

    sensor: {
        value: document.getElementById("sensorHealth"),
        bar: document.getElementById("sensorBar")
    },

    operation: {
        value: document.getElementById("operationHealth"),
        bar: document.getElementById("operationBar")
    }

};


/* =========================
   FLOW ELEMENTS
========================= */

const flowInfrastructure =
    document.getElementById("flowInfrastructure");

const flowDetection =
    document.getElementById("flowDetection");

const flowAI =
    document.getElementById("flowAI");

const flowMesh =
    document.getElementById("flowMesh");


/* =========================
   COMMAND LINES
========================= */

const commandLines = [
    document.getElementById("lineCommand1"),
    document.getElementById("lineCommand2"),
    document.getElementById("lineCommand3")
];


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

function logEvent(message, type = "") {

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
   INFRASTRUCTURE STATE
========================= */

function setInfrastructure(
    type,
    value
) {

    state[type] = value;

    updateContinuity();

}


/* =========================
   FAILURE SIMULATIONS
========================= */

function simulateInternetFailure() {

    if (!state.internet) {
        logEvent(
            "Internet connection already unavailable.",
            "warning"
        );

        return;
    }

    state.internet = false;

    logEvent(
        "Internet connection lost.",
        "alert"
    );

    logEvent(
        "Continuity AI detected external network failure.",
        "ai"
    );

    updateContinuity();
}


function simulateTowerFailure() {

    if (!state.tower) {
        logEvent(
            "Cellular tower already unavailable.",
            "warning"
        );

        return;
    }

    state.tower = false;

    logEvent(
        "Cellular tower connection lost.",
        "alert"
    );

    logEvent(
        "SentinelNet preparing local communication fallback.",
        "ai"
    );

    updateContinuity();
}


function disconnectCommand() {

    if (!state.command) {
        logEvent(
            "Command center link already disconnected.",
            "warning"
        );

        return;
    }

    state.command = false;

    logEvent(
        "Command center link disconnected.",
        "alert"
    );

    logEvent(
        "SN-001 remains operational without command connectivity.",
        "success"
    );

    updateContinuity();
}


function degradePower() {

    if (!state.power) {
        logEvent(
            "Local power is already degraded.",
            "warning"
        );

        return;
    }

    state.power = false;

    logEvent(
        "Local power availability degraded.",
        "warning"
    );

    logEvent(
        "Continuity engine preserving essential operations.",
        "ai"
    );

    updateContinuity();
}


/* =========================
   AUTONOMOUS MODE
========================= */

function activateAutonomousMode() {

    if (state.autonomous) {

        logEvent(
            "Autonomous mode is already active.",
            "warning"
        );

        return;
    }

    state.autonomous = true;

    logEvent(
        "AUTONOMOUS CONTINUITY MODE ACTIVATED.",
        "success"
    );

    logEvent(
        "Local AI has assumed operational decision support.",
        "ai"
    );

    logEvent(
        "Offline knowledge and local processing remain available.",
        "success"
    );

    updateContinuity();
}


/* =========================
   RESTORE
========================= */

function restoreInfrastructure() {

    state.internet = true;
    state.tower = true;
    state.command = true;
    state.power = true;

    state.autonomous = false;
    state.relay = false;

    state.packetQueue = [];

    logEvent(
        "External infrastructure restored.",
        "success"
    );

    logEvent(
        "Command connectivity re-established.",
        "success"
    );

    logEvent(
        "Queued information cleared after synchronization.",
        "packet"
    );

    updateContinuity();
}


/* =========================
   DETERMINE MODE
========================= */

function determineMode() {

    const infrastructureAvailable =
        state.internet &&
        state.tower &&
        state.command &&
        state.power;

    if (infrastructureAvailable &&
        !state.autonomous) {

        return "NORMAL";
    }

    if (
        state.autonomous &&
        !state.command &&
        state.relay
    ) {

        return "MESH RELAY";
    }

    if (
        state.autonomous ||
        !state.internet ||
        !state.tower
    ) {

        return "AUTONOMOUS";
    }

    return "DEGRADED";
}


/* =========================
   UPDATE CONTINUITY
========================= */

function updateContinuity() {

    const mode =
        determineMode();

    state.continuityMode =
        mode;


    /* =====================
       RELAY LOGIC
    ===================== */

    state.relay =
        state.autonomous &&
        !state.command &&
        (
            !state.internet ||
            !state.tower
        );


    if (state.relay) {
        state.continuityMode =
            "MESH RELAY";
    }


    /* =====================
       STATUS TEXT
    ===================== */

    continuityState.textContent =
        state.continuityMode;

    continuityState.className =
        "state-box";


    if (
        state.continuityMode ===
        "AUTONOMOUS"
    ) {

        continuityState.classList.add(
            "autonomous"
        );

        stateDescription.textContent =
            "External infrastructure is unavailable. Local Sentinel AI continues operating using stored knowledge, sensors, GPS and local processing.";
    }

    else if (
        state.continuityMode ===
        "MESH RELAY"
    ) {

        continuityState.classList.add(
            "relay"
        );

        stateDescription.textContent =
            "Command connectivity is unavailable. SentinelNet is maintaining operational continuity through nearby Sentinel devices and relay paths.";
    }

    else if (
        state.continuityMode ===
        "DEGRADED"
    ) {

        continuityState.classList.add(
            "degraded"
        );

        stateDescription.textContent =
            "One or more external services are degraded. The continuity engine is monitoring the failure and preparing fallback operation.";
    }

    else {

        continuityState.classList.add(
            "normal"
        );

        stateDescription.textContent =
            "External infrastructure is available. SentinelNet is operating normally.";
    }


    updateCore();

    updateInfrastructureDisplay();

    updateNetwork();

    updateHealth();

    updateAnalysis();

    updateFunctions();

    updatePackets();

    updateFlow();

}


/* =========================
   CORE
========================= */

function updateCore() {

    if (
        state.continuityMode ===
        "MESH RELAY"
    ) {

        coreState.textContent =
            "MESH RELAY OPERATION";

        return;
    }

    if (
        state.continuityMode ===
        "AUTONOMOUS"
    ) {

        coreState.textContent =
            "AUTONOMOUS OPERATION";

        return;
    }

    if (
        state.continuityMode ===
        "DEGRADED"
    ) {

        coreState.textContent =
            "DEGRADED OPERATION";

        return;
    }

    coreState.textContent =
        "NORMAL OPERATION";
}


/* =========================
   INFRASTRUCTURE DISPLAY
========================= */

function updateInfrastructureDisplay() {

    setStatus(
        internetStatus,
        state.internet,
        "AVAILABLE",
        "UNAVAILABLE"
    );

    setStatus(
        towerStatus,
        state.tower,
        "AVAILABLE",
        "FAILED"
    );

    setStatus(
        commandStatus,
        state.command,
        "CONNECTED",
        "DISCONNECTED"
    );

    setStatus(
        powerStatus,
        state.power,
        "NORMAL",
        "DEGRADED"
    );

}


function setStatus(
    element,
    good,
    goodText,
    badText
) {

    element.textContent =
        good ? goodText : badText;

    element.className =
        good
            ? "good"
            : "bad";
}


/* =========================
   NETWORK
========================= */

function updateNetwork() {

    const infrastructureAvailable =
        state.internet &&
        state.tower;

    commandLines.forEach(line => {

        if (
            state.command &&
            infrastructureAvailable
        ) {

            line.classList.remove(
                "disabled"
            );

        } else {

            line.classList.add(
                "disabled"
            );
        }

    });


    relayPath.classList.toggle(
        "active",
        state.relay
    );


    relayIndicator.classList.toggle(
        "active",
        state.relay
    );


    if (state.relay) {

        relayIndicator.textContent =
            "ACTIVE RELAY PATH — SN-001 → SN-004 → SN-006";

        networkStatus.textContent =
            "LOCAL MESH RELAY ACTIVE";

        networkStatus.className =
            "network-status autonomous";

    }

    else if (!state.command) {

        relayIndicator.textContent =
            "RELAY STANDBY";

        networkStatus.textContent =
            "COMMAND LINK OFFLINE";

        networkStatus.className =
            "network-status offline";

    }

    else if (
        !state.internet ||
        !state.tower
    ) {

        relayIndicator.textContent =
            "LOCAL CONTINUITY AVAILABLE";

        networkStatus.textContent =
            "EXTERNAL INFRASTRUCTURE DEGRADED";

        networkStatus.className =
            "network-status offline";

    }

    else {

        relayIndicator.textContent =
            "RELAY INACTIVE";

        networkStatus.textContent =
            "EXTERNAL LINK ACTIVE";

        networkStatus.className =
            "network-status";
    }

}


/* =========================
   HEALTH
========================= */

function updateHealth() {

    let ai = 100;
    let storage = 100;
    let gps = 100;
    let radio = 100;
    let sensor = 100;
    let operation = 100;


    if (!state.power) {

        ai = 85;
        storage = 100;
        gps = 90;
        radio = 85;
        sensor = 90;
        operation = 85;
    }


    if (!state.internet) {
        storage = 100;
    }


    if (!state.tower) {
        radio = Math.min(
            radio,
            92
        );
    }


    if (!state.command) {
        operation = Math.min(
            operation,
            88
        );
    }


    setHealth(
        health.ai,
        ai,
        ai >= 90
            ? "ONLINE"
            : "DEGRADED"
    );

    setHealth(
        health.storage,
        storage,
        "AVAILABLE"
    );

    setHealth(
        health.gps,
        gps,
        gps >= 90
            ? "LOCKED"
            : "LIMITED"
    );

    setHealth(
        health.radio,
        radio,
        radio >= 90
            ? "ACTIVE"
            : "DEGRADED"
    );

    setHealth(
        health.sensor,
        sensor,
        sensor >= 90
            ? "ACTIVE"
            : "DEGRADED"
    );

    setHealth(
        health.operation,
        operation,
        operation >= 90
            ? "CONTINUOUS"
            : "DEGRADED"
    );

}


function setHealth(
    item,
    percentage,
    text
) {

    item.bar.style.width =
        `${percentage}%`;

    item.value.textContent =
        text;

    item.value.className =
        "health-value";

    if (percentage < 90) {
        item.value.classList.add(
            "warning"
        );
    }

    if (percentage < 70) {
        item.value.classList.remove(
            "warning"
        );

        item.value.classList.add(
            "bad"
        );
    }
}


/* =========================
   ANALYSIS
========================= */

function updateAnalysis() {

    analysisMode.textContent =
        state.continuityMode;


    const infrastructureFailures = [];

    if (!state.internet)
        infrastructureFailures.push(
            "INTERNET"
        );

    if (!state.tower)
        infrastructureFailures.push(
            "CELLULAR"
        );

    if (!state.command)
        infrastructureFailures.push(
            "COMMAND"
        );

    if (!state.power)
        infrastructureFailures.push(
            "POWER"
        );


    analysisInfrastructure.textContent =
        infrastructureFailures.length
            ? infrastructureFailures.join(" / ")
            : "AVAILABLE";


    analysisLocal.textContent =
        state.autonomous ||
        state.continuityMode !== "NORMAL"
            ? "AUTONOMOUS"
            : "FULL";


    if (state.relay) {

        analysisCommunication.textContent =
            "MESH RELAY";

    } else if (!state.command) {

        analysisCommunication.textContent =
            "LOCAL ONLY";

    } else if (
        !state.internet ||
        !state.tower
    ) {

        analysisCommunication.textContent =
            "DEGRADED";

    } else {

        analysisCommunication.textContent =
            "COMMAND LINK";
    }


    /* AI decision */

    if (state.relay) {

        aiDecision.textContent =
            "Command connectivity is unavailable. Local AI remains active and has selected a nearby Sentinel relay path to preserve communication continuity.";

    }

    else if (state.autonomous) {

        aiDecision.textContent =
            "External infrastructure failure detected. Continue local processing, retain information offline, monitor sensors and prepare queued information for future transmission.";

    }

    else if (
        !state.internet ||
        !state.tower
    ) {

        aiDecision.textContent =
            "Infrastructure degradation detected. Monitor external services while maintaining local operational readiness.";

    }

    else if (!state.power) {

        aiDecision.textContent =
            "Local power is degraded. Preserve essential continuity functions while monitoring system availability.";

    }

    else {

        aiDecision.textContent =
            "External infrastructure is functioning. Continue normal operation.";
    }

}


/* =========================
   FUNCTIONS
========================= */

function updateFunctions() {

    relayDot.className =
        "function-dot";

    queueDot.className =
        "function-dot";


    if (state.relay) {

        relayDot.classList.add(
            "relay"
        );
    }

    if (state.packetQueue.length > 0) {

        queueDot.classList.add(
            "warning"
        );
    }

}


/* =========================
   FLOW
========================= */

function updateFlow() {

    [
        flowInfrastructure,
        flowDetection,
        flowAI,
        flowMesh
    ].forEach(node => {

        node.classList.remove(
            "active",
            "autonomous"
        );

    });


    flowDetection.classList.add(
        "active"
    );


    if (
        state.internet &&
        state.tower &&
        state.command
    ) {

        flowInfrastructure.classList.add(
            "active"
        );

        flowAI.classList.add(
            "active"
        );

        flowMesh.classList.add(
            "active"
        );

        return;
    }


    flowInfrastructure.classList.add(
        "active"
    );

    flowAI.classList.add(
        "autonomous"
    );

    flowMesh.classList.add(
        "autonomous"
    );

}


/* =========================
   PACKET QUEUE
========================= */

function createPacket() {

    const packet = {

        id:
            `AC-${String(
                state.packetQueue.length + 1
            ).padStart(3, "0")}`,

        time:
            formatTime(),

        data:
            state.relay
                ? "STATUS + VITALS + RELAY DATA"
                : "STATUS + VITALS + LOCAL AI DATA"

    };


    state.packetQueue.unshift(
        packet
    );


    if (
        state.packetQueue.length >
        CONFIG.maxPackets
    ) {

        state.packetQueue.pop();

    }

}


function updatePackets() {

    packetCount.textContent =
        `${state.packetQueue.length} PACKET${state.packetQueue.length === 1 ? "" : "S"}`;


    if (
        state.packetQueue.length === 0
    ) {

        packetList.innerHTML =
            `<div class="empty-packet">
                No queued information.
            </div>`;

        return;
    }


    packetList.innerHTML =
        state.packetQueue
            .map(packet => {

                return `
                    <div class="packet-item">

                        <div class="packet-id">
                            ${packet.id}
                        </div>

                        <div class="packet-data">
                            ${packet.data}
                        </div>

                        <div class="packet-state">
                            ${state.command
                                ? "READY"
                                : "QUEUED"}
                        </div>

                    </div>
                `;

            })
            .join("");

}


/* =========================
   CONTINUITY CHECK
========================= */

function continuityCheck() {

    simulatedMinutes +=
        CONFIG.statusInterval;

    simTime.textContent =
        formatTime();


    logEvent(
        `━━━ ${formatTime()} — CONTINUITY CHECK ━━━`,
        "packet"
    );


    if (
        !state.internet ||
        !state.tower ||
        !state.command
    ) {

        createPacket();

        logEvent(
            "SN-001 generated local status information.",
            "packet"
        );

    }


    if (
        !state.internet ||
        !state.tower
    ) {

        if (!state.autonomous) {

            state.autonomous = true;

            logEvent(
                "Continuity AI automatically entered autonomous operation.",
                "ai"
            );

        }

    }


    if (
        !state.command &&
        state.autonomous
    ) {

        state.relay = true;

        logEvent(
            "Nearby Sentinel relay path confirmed.",
            "success"
        );

        logEvent(
            "Information remains queued until command connectivity is restored.",
            "packet"
        );

    }


    updateContinuity();
}


/* =========================
   BUTTONS
========================= */

document
    .getElementById("internetBtn")
    .addEventListener(
        "click",
        simulateInternetFailure
    );


document
    .getElementById("towerBtn")
    .addEventListener(
        "click",
        simulateTowerFailure
    );


document
    .getElementById("commandBtn")
    .addEventListener(
        "click",
        disconnectCommand
    );


document
    .getElementById("powerBtn")
    .addEventListener(
        "click",
        degradePower
    );


document
    .getElementById("autonomousBtn")
    .addEventListener(
        "click",
        activateAutonomousMode
    );


document
    .getElementById("restoreBtn")
    .addEventListener(
        "click",
        restoreInfrastructure
    );


document
    .getElementById("threeMinBtn")
    .addEventListener(
        "click",
        continuityCheck
    );


/* =========================
   INITIALIZATION
========================= */

simTime.textContent =
    formatTime();


logEvent(
    "SentinelNet Autonomous Continuity Core initialized.",
    "success"
);

logEvent(
    "SN-001 local AI and offline operational systems ready.",
    "ai"
);

logEvent(
    "External infrastructure connection verified.",
    "success"
);


updateContinuity();