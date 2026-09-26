const CONFIG = {
    startingMinutes: 10 * 60,
    statusInterval: 3,

    normalDrain: 0.7,
    disasterDrain: 0.55,
    reserveDrain: 0.38,
    lowPowerDrain: 0.24,
    criticalDrain: 0.12,

    startingBattery: 87,
    maxEvents: 120
};


let simulatedMinutes = 0;


const state = {

    battery: CONFIG.startingBattery,

    mode: "normal",

    automatic: true,

    systems: {
        radio: true,
        ai: true,
        heart: true,
        gps: true,
        environment: true,
        display: true
    }

};


/* =========================
   DOM
========================= */

const simTime =
    document.getElementById("simTime");

const batteryPercent =
    document.getElementById("batteryPercent");

const batteryFill =
    document.getElementById("batteryFill");

const remainingTime =
    document.getElementById("remainingTime");

const powerMode =
    document.getElementById("powerMode");

const modeDescription =
    document.getElementById("modeDescription");

const powerState =
    document.getElementById("powerState");

const largeBatteryPercent =
    document.getElementById("largeBatteryPercent");

const largeBatteryFill =
    document.getElementById("largeBatteryFill");

const energyMessage =
    document.getElementById("energyMessage");

const totalLoad =
    document.getElementById("totalLoad");

const sideBattery =
    document.getElementById("sideBattery");

const powerDraw =
    document.getElementById("powerDraw");

const reserveLevel =
    document.getElementById("reserveLevel");

const sideRuntime =
    document.getElementById("sideRuntime");

const aiPowerDecision =
    document.getElementById("aiPowerDecision");

const powerExplanation =
    document.getElementById("powerExplanation");

const eventLog =
    document.getElementById("eventLog");


/* =========================
   ALLOCATION DOM
========================= */

const allocations = {

    radio: {
        bar: document.getElementById("radioPowerBar"),
        value: document.getElementById("radioPowerValue")
    },

    ai: {
        bar: document.getElementById("aiPowerBar"),
        value: document.getElementById("aiPowerValue")
    },

    heart: {
        bar: document.getElementById("heartPowerBar"),
        value: document.getElementById("heartPowerValue")
    },

    gps: {
        bar: document.getElementById("gpsPowerBar"),
        value: document.getElementById("gpsPowerValue")
    },

    environment: {
        bar: document.getElementById("environmentPowerBar"),
        value: document.getElementById("environmentPowerValue")
    },

    display: {
        bar: document.getElementById("displayPowerBar"),
        value: document.getElementById("displayPowerValue")
    }

};


/* =========================
   SYSTEM DOM
========================= */

const radioState =
    document.getElementById("radioState");

const aiState =
    document.getElementById("aiState");

const heartState =
    document.getElementById("heartState");

const gpsState =
    document.getElementById("gpsState");

const environmentState =
    document.getElementById("environmentState");

const displayState =
    document.getElementById("displayState");

const displayAutoDot =
    document.getElementById("displayAutoDot");

const gpsAutoDot =
    document.getElementById("gpsAutoDot");


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
   MODE DESCRIPTION
========================= */

function getModeDescription() {

    switch (state.mode) {

        case "normal":

            return "Full device functionality is available.";

        case "disaster":

            return "Emergency systems are prioritized while unnecessary energy consumption is reduced.";

        case "reserve":

            return "The AI has entered energy-reserve management and is preserving battery for future emergency communication.";

        case "low":

            return "Nonessential systems are reduced. Critical monitoring, AI and communication remain prioritized.";

        case "critical":

            return "Critical power preservation is active. Only essential emergency functions receive maximum priority.";

        default:

            return "Power management active.";

    }

}


/* =========================
   SET MODE
========================= */

function setMode(
    mode,
    announce = true
) {

    state.mode = mode;


    if (announce) {

        const names = {

            normal: "NORMAL POWER MODE",
            disaster: "DISASTER POWER MODE",
            reserve: "ENERGY RESERVE MODE",
            low: "LOW-POWER MODE",
            critical: "CRITICAL POWER MODE"

        };

        const types = {

            normal: "success",
            disaster: "ai",
            reserve: "warning",
            low: "warning",
            critical: "alert"

        };

        logEvent(
            `${names[mode]} activated.`,
            types[mode]
        );

    }


    updateAll();
}


/* =========================
   BATTERY COLOR
========================= */

function updateBatteryVisual() {

    batteryFill.className =
        "battery-fill";

    largeBatteryFill.className =
        "large-battery-fill";


    if (state.battery <= 20) {

        batteryFill.classList.add("danger");
        largeBatteryFill.classList.add("danger");

    }

    else if (state.battery <= 40) {

        batteryFill.classList.add("warning");
        largeBatteryFill.classList.add("warning");

    }

}


/* =========================
   CALCULATE POWER LOAD
========================= */

function getPowerAllocation() {

    let allocation;


    switch (state.mode) {

        case "normal":

            allocation = {
                radio: 28,
                ai: 22,
                heart: 18,
                gps: 15,
                environment: 10,
                display: 7
            };

            break;


        case "disaster":

            allocation = {
                radio: 34,
                ai: 24,
                heart: 19,
                gps: 12,
                environment: 7,
                display: 4
            };

            break;


        case "reserve":

            allocation = {
                radio: 38,
                ai: 26,
                heart: 20,
                gps: 8,
                environment: 5,
                display: 3
            };

            break;


        case "low":

            allocation = {
                radio: 43,
                ai: 29,
                heart: 22,
                gps: 4,
                environment: 1,
                display: 1
            };

            break;


        case "critical":

            allocation = {
                radio: 50,
                ai: 32,
                heart: 16,
                gps: 1,
                environment: 1,
                display: 0
            };

            break;

    }


    return allocation;
}


/* =========================
   RUNTIME
========================= */

function calculateRuntime() {

    let drain;


    switch (state.mode) {

        case "normal":
            drain = CONFIG.normalDrain;
            break;

        case "disaster":
            drain = CONFIG.disasterDrain;
            break;

        case "reserve":
            drain = CONFIG.reserveDrain;
            break;

        case "low":
            drain = CONFIG.lowPowerDrain;
            break;

        case "critical":
            drain = CONFIG.criticalDrain;
            break;

        default:
            drain = CONFIG.normalDrain;
    }


    const hours =
        state.battery / drain;


    return Math.max(
        0,
        hours
    );
}


/* =========================
   FORMAT RUNTIME
========================= */

function formatRuntime(hours) {

    if (hours >= 10) {

        return `${hours.toFixed(1)} H`;

    }

    if (hours >= 1) {

        return `${hours.toFixed(1)} H`;

    }

    const minutes =
        Math.round(hours * 60);

    return `${minutes} MIN`;
}


/* =========================
   BATTERY STATE
========================= */

function getBatteryState() {

    if (state.battery > 60) {

        return "NORMAL";
    }

    if (state.battery > 40) {

        return "RESERVE";
    }

    if (state.battery > 20) {

        return "LOW";
    }

    return "CRITICAL";
}


/* =========================
   AUTOMATIC POWER MANAGEMENT
========================= */

function automaticPowerManagement() {

    if (!state.automatic) {
        return;
    }


    const battery =
        state.battery;


    if (
        battery <= 20 &&
        state.mode !== "critical"
    ) {

        setMode(
            "critical",
            false
        );

        logEvent(
            "Battery reached critical reserve. AI automatically activated critical power preservation.",
            "alert"
        );

        return;
    }


    if (
        battery <= 40 &&
        state.mode !== "low"
    ) {

        setMode(
            "low",
            false
        );

        logEvent(
            "Battery dropped below reserve threshold. AI reduced nonessential power consumption.",
            "warning"
        );

        return;
    }


    if (
        battery <= 60 &&
        state.mode === "normal"
    ) {

        setMode(
            "reserve",
            false
        );

        logEvent(
            "Battery entered reserve range. AI began conserving energy.",
            "warning"
        );

    }

}


/* =========================
   DRAIN BATTERY
========================= */

function drainBattery() {

    let drain;


    switch (state.mode) {

        case "normal":
            drain = CONFIG.normalDrain;
            break;

        case "disaster":
            drain = CONFIG.disasterDrain;
            break;

        case "reserve":
            drain = CONFIG.reserveDrain;
            break;

        case "low":
            drain = CONFIG.lowPowerDrain;
            break;

        case "critical":
            drain = CONFIG.criticalDrain;
            break;

    }


    state.battery =
        Math.max(
            0,
            state.battery - drain
        );

}


/* =========================
   UPDATE BATTERY
========================= */

function updateBattery() {

    const battery =
        Math.round(
            state.battery
        );


    batteryPercent.textContent =
        battery;

    largeBatteryPercent.textContent =
        `${battery}%`;

    sideBattery.textContent =
        `${battery}%`;


    batteryFill.style.width =
        `${battery}%`;

    largeBatteryFill.style.width =
        `${battery}%`;


    updateBatteryVisual();


    const runtime =
        calculateRuntime();


    const runtimeText =
        formatRuntime(runtime);


    remainingTime.textContent =
        runtimeText;

    sideRuntime.textContent =
        runtimeText;


    const batteryState =
        getBatteryState();


    reserveLevel.textContent =
        batteryState;


    powerDraw.textContent =
        `${Math.round(
            getPowerDraw()
        )}%`;

}


/* =========================
   POWER DRAW
========================= */

function getPowerDraw() {

    switch (state.mode) {

        case "normal":
            return 100;

        case "disaster":
            return 82;

        case "reserve":
            return 65;

        case "low":
            return 43;

        case "critical":
            return 25;

        default:
            return 100;

    }

}


/* =========================
   UPDATE ALLOCATION
========================= */

function updateAllocation() {

    const allocation =
        getPowerAllocation();


    Object.keys(
        allocation
    ).forEach(key => {

        const value =
            allocation[key];

        allocations[key].bar.style.width =
            `${value}%`;

        allocations[key].value.textContent =
            `${value}%`;

    });


    totalLoad.textContent =
        `${getPowerDraw()}%`;

}


/* =========================
   UPDATE SYSTEM STATES
========================= */

function updateSystemStates() {

    switch (state.mode) {

        case "normal":

            radioState.textContent =
                "MAXIMUM PRIORITY";

            aiState.textContent =
                "ACTIVE";

            heartState.textContent =
                "ACTIVE";

            gpsState.textContent =
                "ACTIVE";

            environmentState.textContent =
                "ACTIVE";

            displayState.textContent =
                "NORMAL";

            break;


        case "disaster":

            radioState.textContent =
                "MAXIMUM PRIORITY";

            aiState.textContent =
                "HIGH PRIORITY";

            heartState.textContent =
                "HIGH PRIORITY";

            gpsState.textContent =
                "OPTIMIZED";

            environmentState.textContent =
                "OPTIMIZED";

            displayState.textContent =
                "REDUCED";

            break;


        case "reserve":

            radioState.textContent =
                "MAXIMUM PRIORITY";

            aiState.textContent =
                "HIGH PRIORITY";

            heartState.textContent =
                "HIGH PRIORITY";

            gpsState.textContent =
                "REDUCED";

            environmentState.textContent =
                "REDUCED";

            displayState.textContent =
                "MINIMUM";

            break;


        case "low":

            radioState.textContent =
                "ESSENTIAL";

            aiState.textContent =
                "ESSENTIAL";

            heartState.textContent =
                "ESSENTIAL";

            gpsState.textContent =
                "INTERMITTENT";

            environmentState.textContent =
                "INTERMITTENT";

            displayState.textContent =
                "MINIMUM";

            break;


        case "critical":

            radioState.textContent =
                "CRITICAL";

            aiState.textContent =
                "CRITICAL";

            heartState.textContent =
                "CRITICAL";

            gpsState.textContent =
                "MINIMUM";

            environmentState.textContent =
                "MINIMUM";

            displayState.textContent =
                "OFF / MINIMUM";

            break;

    }


    updateSystemClass(
        radioState,
        state.mode
    );

    updateSystemClass(
        aiState,
        state.mode
    );

    updateSystemClass(
        heartState,
        state.mode
    );

    updateSystemClass(
        gpsState,
        state.mode
    );

    updateSystemClass(
        environmentState,
        state.mode
    );

    updateSystemClass(
        displayState,
        state.mode
    );


    displayAutoDot.className =
        state.mode === "normal"
            ? "auto-dot"
            : "auto-dot active";


    gpsAutoDot.className =
        (
            state.mode === "reserve" ||
            state.mode === "low" ||
            state.mode === "critical"
        )
            ? "auto-dot active"
            : "auto-dot";

}


function updateSystemClass(
    element,
    mode
) {

    element.className =
        "system-state";


    if (
        mode === "low" ||
        mode === "reserve"
    ) {

        element.classList.add(
            "warning"
        );

    }


    if (mode === "critical") {

        element.classList.add(
            "danger"
        );

    }

}


/* =========================
   UPDATE STRATEGY
========================= */

function updateStrategy() {

    const nodes = [

        document.getElementById(
            "strategyNormal"
        ),

        document.getElementById(
            "strategyReserve"
        ),

        document.getElementById(
            "strategyLow"
        ),

        document.getElementById(
            "strategyCritical"
        )

    ];


    nodes.forEach(node => {

        node.classList.remove(
            "active"
        );

    });


    let index = 0;


    switch (state.mode) {

        case "normal":
            index = 0;
            break;

        case "disaster":
            index = 0;
            break;

        case "reserve":
            index = 1;
            break;

        case "low":
            index = 2;
            break;

        case "critical":
            index = 3;
            break;

    }


    nodes[index].classList.add(
        "active"
    );

}


/* =========================
   UPDATE MAIN STATE
========================= */

function updateState() {

    const batteryState =
        getBatteryState();


    powerState.className =
        "core-state";


    if (
        batteryState === "NORMAL"
    ) {

        powerState.textContent =
            "POWER RESERVE NORMAL";

    }

    else if (
        batteryState === "RESERVE"
    ) {

        powerState.textContent =
            "ENERGY RESERVE ACTIVE";

        powerState.classList.add(
            "warning"
        );

    }

    else if (
        batteryState === "LOW"
    ) {

        powerState.textContent =
            "LOW POWER PRESERVATION";

        powerState.classList.add(
            "warning"
        );

    }

    else {

        powerState.textContent =
            "CRITICAL POWER RESERVE";

        powerState.classList.add(
            "danger"
        );

    }


    powerMode.textContent =
        state.mode === "normal"
            ? "NORMAL"
            : state.mode.toUpperCase();


    powerMode.className =
        "mode-value";


    if (
        state.mode === "reserve" ||
        state.mode === "disaster"
    ) {

        powerMode.classList.add(
            "warning"
        );

    }


    if (
        state.mode === "low" ||
        state.mode === "critical"
    ) {

        powerMode.classList.add(
            "danger"
        );

    }


    modeDescription.textContent =
        getModeDescription();


    energyMessage.textContent =
        getEnergyMessage();


    powerExplanation.textContent =
        getPowerExplanation();


    aiPowerDecision.textContent =
        getAIDecision();

}


/* =========================
   ENERGY MESSAGE
========================= */

function getEnergyMessage() {

    if (state.battery > 60) {

        return "Energy reserve is sufficient for normal operation.";

    }


    if (state.battery > 40) {

        return "Battery has entered the reserve range. Nonessential consumption is being reduced.";

    }


    if (state.battery > 20) {

        return "Battery is low. The system is prioritizing communication, AI and vital monitoring.";

    }


    return "Critical reserve reached. Emergency functions are being preserved while nonessential functions are minimized.";

}


/* =========================
   AI DECISION
========================= */

function getAIDecision() {

    if (state.mode === "normal") {

        return "Battery reserve is sufficient. No power restrictions are currently required.";

    }


    if (state.mode === "disaster") {

        return "Disaster mode is active. The AI is prioritizing emergency communication and essential monitoring while reducing unnecessary consumption.";

    }


    if (state.mode === "reserve") {

        return "Energy reserve mode is active. The AI has reduced GPS, environmental sensing and display consumption to preserve battery capacity.";

    }


    if (state.mode === "low") {

        return "Low-power mode is active. Communication, local AI and vital monitoring remain prioritized while nonessential functions operate intermittently.";

    }


    return "Critical power mode is active. The system is preserving emergency communication, local AI and vital monitoring for as long as possible.";

}


/* =========================
   POWER EXPLANATION
========================= */

function getPowerExplanation() {

    if (state.mode === "normal") {

        return "The Sentinel continuously monitors battery capacity. While energy is sufficient, all major systems remain available.";

    }


    if (state.mode === "disaster") {

        return "During disaster operation, the power manager shifts energy toward communication, local AI and vital monitoring. Lower-priority functions are reduced without disabling essential capabilities.";

    }


    if (state.mode === "reserve") {

        return "When the battery enters the reserve range, the AI begins reducing unnecessary energy consumption. Emergency communication and vital monitoring remain protected.";

    }


    if (state.mode === "low") {

        return "At low battery capacity, the Sentinel reduces nonessential operations and preserves the systems required to sense, reason and communicate during an emergency.";

    }


    return "At critical battery levels, the Sentinel enters maximum conservation. The system attempts to preserve emergency communication, local intelligence and vital monitoring instead of maintaining nonessential functions.";

}


/* =========================
   +3 MIN POWER CHECK
========================= */

function powerCycle() {

    simulatedMinutes +=
        CONFIG.statusInterval;


    simTime.textContent =
        formatTime();


    drainBattery();


    automaticPowerManagement();


    logEvent(
        `━━━ ${formatTime()} — POWER MANAGEMENT CHECK ━━━`,
        "ai"
    );


    logEvent(
        `Battery remaining: ${Math.round(
            state.battery
        )}%.`,
        state.battery <= 20
            ? "alert"
            : state.battery <= 40
                ? "warning"
                : "success"
    );


    if (
        state.mode !== "normal"
    ) {

        logEvent(
            `AI allocation strategy: ${state.mode.toUpperCase()} POWER MODE.`,
            "ai"
        );

    }


    updateAll();
}


/* =========================
   RESTORE
========================= */

function restoreFullPower() {

    state.battery =
        CONFIG.startingBattery;

    state.mode =
        "normal";

    state.automatic =
        true;


    logEvent(
        "Power management reset.",
        "success"
    );

    logEvent(
        "Battery restored to 87% and all power restrictions removed.",
        "success"
    );


    updateAll();
}


/* =========================
   MANUAL LOW POWER
========================= */

function forceLowPower() {

    state.mode =
        "low";

    state.automatic =
        false;


    logEvent(
        "LOW-POWER MODE manually activated.",
        "warning"
    );

    logEvent(
        "Automatic mode transitions temporarily disabled.",
        "warning"
    );


    updateAll();
}


/* =========================
   DISASTER MODE
========================= */

function activateDisasterMode() {

    state.mode =
        "disaster";

    state.automatic =
        true;


    logEvent(
        "DISASTER POWER MODE activated.",
        "ai"
    );

    logEvent(
        "Energy allocation shifted toward emergency communication and critical monitoring.",
        "ai"
    );


    updateAll();
}


/* =========================
   CRITICAL MODE
========================= */

function simulateCritical() {

    state.battery =
        18;

    state.mode =
        "critical";

    state.automatic =
        true;


    logEvent(
        "SIMULATION: Battery forced to critical reserve.",
        "alert"
    );

    logEvent(
        "AI activated emergency power preservation.",
        "alert"
    );


    updateAll();
}


/* =========================
   NORMAL MODE
========================= */

function normalMode() {

    state.mode =
        "normal";

    state.automatic =
        true;


    logEvent(
        "Normal power operation restored.",
        "success"
    );


    updateAll();
}


/* =========================
   UPDATE ALL
========================= */

function updateAll() {

    updateBattery();

    updateAllocation();

    updateSystemStates();

    updateStrategy();

    updateState();

}


/* =========================
   BUTTONS
========================= */

document
    .getElementById("normalModeBtn")
    .addEventListener(
        "click",
        normalMode
    );


document
    .getElementById("disasterModeBtn")
    .addEventListener(
        "click",
        activateDisasterMode
    );


document
    .getElementById("lowPowerBtn")
    .addEventListener(
        "click",
        forceLowPower
    );


document
    .getElementById("criticalBtn")
    .addEventListener(
        "click",
        simulateCritical
    );


document
    .getElementById("restoreBtn")
    .addEventListener(
        "click",
        restoreFullPower
    );


document
    .getElementById("threeMinBtn")
    .addEventListener(
        "click",
        powerCycle
    );


/* =========================
   INITIALIZATION
========================= */

simTime.textContent =
    formatTime();


logEvent(
    "Sentinel-W1 power management core initialized.",
    "success"
);

logEvent(
    "Battery level: 87%.",
    "success"
);

logEvent(
    "Autonomous energy allocation active.",
    "ai"
);

logEvent(
    "Emergency communication assigned highest power priority.",
    "ai"
);


updateAll();