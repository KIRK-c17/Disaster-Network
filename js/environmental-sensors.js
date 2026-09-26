const CONFIG = {
    startingMinutes: 10 * 60,
    statusInterval: 3,
    cycleSpeed: 3000,
    maxEvents: 100
};

let simulatedMinutes = 0;

const state = {
    scenario: "normal",
    cycle: 0,

    sensors: {
        temperature: 29.4,
        humidity: 71,
        air: 42,
        water: 18,
        ground: 0.8,
        pressure: 1008
    },

    history: []
};


/* =========================================================
   DOM
========================================================= */

const elements = {
    simTime: document.getElementById("simTime"),

    temperatureValue: document.getElementById("temperatureValue"),
    humidityValue: document.getElementById("humidityValue"),
    airValue: document.getElementById("airValue"),
    waterValue: document.getElementById("waterValue"),
    groundValue: document.getElementById("groundValue"),
    pressureValue: document.getElementById("pressureValue"),

    temperatureMeter: document.getElementById("temperatureMeter"),
    humidityMeter: document.getElementById("humidityMeter"),
    airMeter: document.getElementById("airMeter"),
    waterMeter: document.getElementById("waterMeter"),
    groundMeter: document.getElementById("groundMeter"),
    pressureMeter: document.getElementById("pressureMeter"),

    temperatureStatus: document.getElementById("temperatureStatus"),
    humidityStatus: document.getElementById("humidityStatus"),
    airStatus: document.getElementById("airStatus"),
    waterStatus: document.getElementById("waterStatus"),
    groundStatus: document.getElementById("groundStatus"),
    pressureStatus: document.getElementById("pressureStatus"),

    tempState: document.getElementById("tempState"),
    humidityState: document.getElementById("humidityState"),
    airState: document.getElementById("airState"),
    waterState: document.getElementById("waterState"),
    groundState: document.getElementById("groundState"),
    pressureState: document.getElementById("pressureState"),

    overallState: document.getElementById("overallState"),

    analysisState: document.getElementById("analysisState"),
    analysisText: document.getElementById("analysisText"),
    confidenceValue: document.getElementById("confidenceValue"),
    confidenceMeter: document.getElementById("confidenceMeter"),
    patternValue: document.getElementById("patternValue"),

    waterZone: document.getElementById("waterZone"),
    hazardZone: document.getElementById("hazardZone"),
    hazardLabel: document.getElementById("hazardLabel"),

    floodIndicator: document.getElementById("floodIndicator"),
    quakeIndicator: document.getElementById("quakeIndicator"),
    volcanoIndicator: document.getElementById("volcanoIndicator"),
    stormIndicator: document.getElementById("stormIndicator"),

    eventLog: document.getElementById("eventLog")
};


/* =========================================================
   TIME
========================================================= */

function formatTime() {

    const totalMinutes =
        CONFIG.startingMinutes + simulatedMinutes;

    const hours =
        Math.floor(totalMinutes / 60) % 24;

    const minutes =
        totalMinutes % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0")
    );
}


/* =========================================================
   EVENT LOG
========================================================= */

function logEvent(message, type = "") {

    const event = document.createElement("div");

    event.className = `event ${type}`;

    event.textContent =
        `[${formatTime()}] ${message}`;

    elements.eventLog.prepend(event);

    while (
        elements.eventLog.children.length >
        CONFIG.maxEvents
    ) {
        elements.eventLog.removeChild(
            elements.eventLog.lastChild
        );
    }
}


/* =========================================================
   SENSOR STATUS
========================================================= */

function getSensorStatus(sensor, value) {

    switch (sensor) {

        case "temperature":

            if (value >= 42) return "DANGER";
            if (value >= 36) return "WARNING";
            return "NORMAL";


        case "humidity":

            if (value >= 92) return "DANGER";
            if (value >= 82) return "WARNING";
            return "NORMAL";


        case "air":

            if (value >= 180) return "DANGER";
            if (value >= 100) return "WARNING";
            return "NORMAL";


        case "water":

            if (value >= 90) return "DANGER";
            if (value >= 55) return "WARNING";
            return "NORMAL";


        case "ground":

            if (value >= 6) return "DANGER";
            if (value >= 2) return "WARNING";
            return "NORMAL";


        case "pressure":

            if (value <= 975) return "DANGER";
            if (value <= 990) return "WARNING";
            return "NORMAL";


        default:
            return "NORMAL";
    }
}


/* =========================================================
   SENSOR RENDERING
========================================================= */

function updateSensor(
    sensor,
    value,
    meterPercentage,
    status
) {

    const valueElement =
        elements[`${sensor}Value`];

    const meterElement =
        elements[`${sensor}Meter`];

    const statusElement =
        elements[`${sensor}Status`];

    let sidebarKey = `${sensor}State`;

    if (sensor === "temperature") {
        sidebarKey = "tempState";
    }

    const sidebarElement =
        elements[sidebarKey];

    valueElement.textContent = value;

    meterElement.style.width =
        `${Math.max(
            0,
            Math.min(100, meterPercentage)
        )}%`;

    statusElement.textContent = status;
    sidebarElement.textContent = status;

    const sensorItem =
        document.querySelector(
            `.sensor-item[data-sensor="${sensor}"]`
        );

    if (!sensorItem) return;

    const dot =
        sensorItem.querySelector(".sensor-dot");


    if (status === "DANGER") {

        statusElement.style.color =
            "#ff8585";

        sidebarElement.style.color =
            "#ff8585";

        meterElement.style.background =
            "#ff8585";

        dot.style.background =
            "#ff8585";

        dot.style.boxShadow =
            "0 0 10px rgba(255,133,133,.7)";

    } else if (status === "WARNING") {

        statusElement.style.color =
            "#f0b35a";

        sidebarElement.style.color =
            "#f0b35a";

        meterElement.style.background =
            "#f0b35a";

        dot.style.background =
            "#f0b35a";

        dot.style.boxShadow =
            "0 0 10px rgba(240,179,90,.7)";

    } else {

        statusElement.style.color =
            "#62e6a4";

        sidebarElement.style.color =
            "#62e6a4";

        meterElement.style.background =
            "#62e6a4";

        dot.style.background =
            "#62e6a4";

        dot.style.boxShadow =
            "0 0 10px rgba(98,230,164,.45)";
    }
}


function renderSensors() {

    const s = state.sensors;

    updateSensor(
        "temperature",
        s.temperature.toFixed(1),
        (s.temperature / 50) * 100,
        getSensorStatus(
            "temperature",
            s.temperature
        )
    );

    updateSensor(
        "humidity",
        Math.round(s.humidity),
        s.humidity,
        getSensorStatus(
            "humidity",
            s.humidity
        )
    );

    updateSensor(
        "air",
        Math.round(s.air),
        (s.air / 200) * 100,
        getSensorStatus(
            "air",
            s.air
        )
    );

    updateSensor(
        "water",
        Math.round(s.water),
        s.water,
        getSensorStatus(
            "water",
            s.water
        )
    );

    updateSensor(
        "ground",
        s.ground.toFixed(1),
        (s.ground / 10) * 100,
        getSensorStatus(
            "ground",
            s.ground
        )
    );


    /*
     * Pressure is inverted.
     * Lower pressure = greater meter value.
     */

    const pressureSeverity =
        Math.max(
            0,
            1020 - s.pressure
        );

    updateSensor(
        "pressure",
        Math.round(s.pressure),
        (pressureSeverity / 50) * 100,
        getSensorStatus(
            "pressure",
            s.pressure
        )
    );
}


/* =========================================================
   AI HAZARD ANALYSIS
========================================================= */

function analyzeEnvironment() {

    const s = state.sensors;

    /*
     * Flood detection
     *
     * Uses more than one environmental signal.
     */

    if (
        s.water >= 90 &&
        s.humidity >= 90
    ) {

        return {
            type: "FLOOD",
            confidence: 98,
            state: "FLOODING DETECTED",
            text:
                "Water level is critically high while humidity is also elevated. The AI identifies a strong flooding pattern and recommends movement toward higher ground."
        };
    }


    if (
        s.water >= 55 &&
        s.humidity >= 82
    ) {

        return {
            type: "FLOOD",
            confidence: 94,
            state: "POSSIBLE FLOODING",
            text:
                "Water level is rising together with high humidity. The AI identifies a possible flooding pattern and continues monitoring for escalation."
        };
    }


    /*
     * Earthquake detection
     */

    if (s.ground >= 6) {

        return {
            type: "EARTHQUAKE",
            confidence: 98,
            state: "STRONG SEISMIC ACTIVITY",
            text:
                "Ground vibration has reached a dangerous level. The AI identifies a strong seismic event and can initiate emergency guidance."
        };
    }


    if (s.ground >= 2) {

        return {
            type: "EARTHQUAKE",
            confidence: 88,
            state: "SEISMIC ANOMALY",
            text:
                "Ground vibration has exceeded the normal baseline. SentinelNet is monitoring for sustained seismic activity."
        };
    }


    /*
     * Volcanic / ash / gas event
     */

    if (
        s.air >= 180 &&
        s.ground >= 2
    ) {

        return {
            type: "VOLCANIC",
            confidence: 98,
            state: "VOLCANIC ENVIRONMENTAL ANOMALY",
            text:
                "Air quality has deteriorated severely while ground vibration is elevated. The AI identifies a possible volcanic, ash, or hazardous-gas event."
        };
    }


    if (s.air >= 180) {

        return {
            type: "VOLCANIC",
            confidence: 93,
            state: "AIR QUALITY DANGER",
            text:
                "The air-quality sensor reports a severe deterioration. The AI identifies possible smoke, ash, or hazardous gas and recommends avoiding contaminated air."
        };
    }


    /*
     * Storm detection
     */

    if (
        s.pressure <= 975 &&
        s.humidity >= 85
    ) {

        return {
            type: "STORM",
            confidence: 97,
            state: "SEVERE WEATHER PATTERN",
            text:
                "Atmospheric pressure has fallen sharply while humidity remains high. The AI identifies a severe-weather pattern."
        };
    }


    if (
        s.pressure <= 990 &&
        s.humidity >= 82
    ) {

        return {
            type: "STORM",
            confidence: 89,
            state: "WEATHER ANOMALY",
            text:
                "Falling atmospheric pressure combined with high humidity suggests a developing severe-weather pattern."
        };
    }


    return {
        type: "NORMAL",
        confidence: 96,
        state: "ENVIRONMENT STABLE",
        text:
            "Environmental readings are within expected operating ranges. No significant multi-sensor hazard pattern has been detected."
    };
}


/* =========================================================
   ANALYSIS UI
========================================================= */

function renderAnalysis() {

    const analysis =
        analyzeEnvironment();

    elements.analysisState.textContent =
        analysis.state;

    elements.analysisText.textContent =
        analysis.text;

    elements.confidenceValue.textContent =
        `${analysis.confidence}%`;

    elements.confidenceMeter.style.width =
        `${analysis.confidence}%`;

    elements.patternValue.textContent =
        analysis.type;


    if (analysis.type === "NORMAL") {

        elements.overallState.textContent =
            "ENVIRONMENT STABLE";

        elements.overallState.style.color =
            "#62e6a4";

        elements.overallState.style.borderColor =
            "#28523f";

        elements.analysisState.style.color =
            "#62e6a4";

        elements.confidenceMeter.style.background =
            "#62e6a4";

    } else {

        elements.overallState.textContent =
            `${analysis.type} PATTERN DETECTED`;

        elements.overallState.style.color =
            analysis.confidence >= 95
                ? "#ff8585"
                : "#f0b35a";

        elements.overallState.style.borderColor =
            analysis.confidence >= 95
                ? "#633636"
                : "#614b2c";

        elements.analysisState.style.color =
            analysis.confidence >= 95
                ? "#ff8585"
                : "#f0b35a";

        elements.confidenceMeter.style.background =
            analysis.confidence >= 95
                ? "#ff8585"
                : "#f0b35a";
    }
}


/* =========================================================
   HAZARD INDICATORS
========================================================= */

function setIndicator(
    element,
    active
) {

    element.textContent =
        active
            ? "DETECTED"
            : "CLEAR";

    element.style.color =
        active
            ? "#ff8585"
            : "#62e6a4";
}


function renderHazardIndicators() {

    const analysis =
        analyzeEnvironment();

    setIndicator(
        elements.floodIndicator,
        analysis.type === "FLOOD"
    );

    setIndicator(
        elements.quakeIndicator,
        analysis.type === "EARTHQUAKE"
    );

    setIndicator(
        elements.volcanoIndicator,
        analysis.type === "VOLCANIC"
    );

    setIndicator(
        elements.stormIndicator,
        analysis.type === "STORM"
    );
}


/* =========================================================
   MAP HAZARD DISPLAY
========================================================= */

function renderHazardMap() {

    const analysis =
        analyzeEnvironment();

    elements.hazardZone.classList.remove(
        "active"
    );

    elements.waterZone.style.width =
        "0";

    elements.waterZone.style.height =
        "0";


    if (analysis.type === "FLOOD") {

        elements.waterZone.style.width =
            `${Math.min(
                100,
                Math.max(
                    20,
                    state.sensors.water
                )
            )}%`;

        elements.waterZone.style.height =
            "45%";

        elements.hazardZone.classList.add(
            "active"
        );

        elements.hazardZone.style.borderColor =
            "#5db8ef";

        elements.hazardZone.style.color =
            "#5db8ef";

        elements.hazardLabel.textContent =
            "FLOODING DETECTED";

        return;
    }


    if (analysis.type === "EARTHQUAKE") {

        elements.hazardZone.classList.add(
            "active"
        );

        elements.hazardZone.style.borderColor =
            "#ff8585";

        elements.hazardZone.style.color =
            "#ff8585";

        elements.hazardLabel.textContent =
            "SEISMIC ACTIVITY";

        return;
    }


    if (analysis.type === "VOLCANIC") {

        elements.hazardZone.classList.add(
            "active"
        );

        elements.hazardZone.style.borderColor =
            "#f0b35a";

        elements.hazardZone.style.color =
            "#f0b35a";

        elements.hazardLabel.textContent =
            "AIR QUALITY HAZARD";

        return;
    }


    if (analysis.type === "STORM") {

        elements.hazardZone.classList.add(
            "active"
        );

        elements.hazardZone.style.borderColor =
            "#f0b35a";

        elements.hazardZone.style.color =
            "#f0b35a";

        elements.hazardLabel.textContent =
            "SEVERE WEATHER";

        return;
    }
}


/* =========================================================
   COMPLETE RENDER
========================================================= */

function renderAll() {

    elements.simTime.textContent =
        formatTime();

    renderSensors();
    renderAnalysis();
    renderHazardIndicators();
    renderHazardMap();
}


/* =========================================================
   HISTORY
========================================================= */

function recordHistory() {

    state.history.push({
        time: formatTime(),

        temperature:
            state.sensors.temperature,

        humidity:
            state.sensors.humidity,

        air:
            state.sensors.air,

        water:
            state.sensors.water,

        ground:
            state.sensors.ground,

        pressure:
            state.sensors.pressure
    });


    if (state.history.length > 30) {
        state.history.shift();
    }
}


/* =========================================================
   NORMAL ENVIRONMENT
========================================================= */

function setNormalEnvironment() {

    state.scenario = "normal";

    state.sensors.temperature = 29.4;
    state.sensors.humidity = 71;
    state.sensors.air = 42;
    state.sensors.water = 18;
    state.sensors.ground = 0.8;
    state.sensors.pressure = 1008;

    logEvent(
        "Environmental conditions returned to baseline.",
        "success"
    );

    renderAll();
}


/* =========================================================
   FLOOD SIMULATION
========================================================= */

function setFloodScenario() {

    state.scenario = "flood";

    state.sensors.temperature = 30.2;
    state.sensors.humidity = 94;
    state.sensors.air = 55;
    state.sensors.water = 86;
    state.sensors.ground = 1.0;
    state.sensors.pressure = 994;

    logEvent(
        "Water-level sensor detects rapid increase.",
        "warning"
    );

    logEvent(
        "Humidity sensor confirms saturated conditions.",
        "warning"
    );

    logEvent(
        "AI correlation: water level + humidity.",
        "warning"
    );

    logEvent(
        "POSSIBLE FLOODING PATTERN DETECTED.",
        "danger"
    );

    renderAll();
}


/* =========================================================
   EARTHQUAKE SIMULATION
========================================================= */

function setEarthquakeScenario() {

    state.scenario = "earthquake";

    state.sensors.temperature = 29.7;
    state.sensors.humidity = 72;
    state.sensors.air = 44;
    state.sensors.water = 20;
    state.sensors.ground = 7.8;
    state.sensors.pressure = 1007;

    logEvent(
        "Ground vibration exceeds normal baseline.",
        "warning"
    );

    logEvent(
        "Seismic sensor reports sustained abnormal movement.",
        "warning"
    );

    logEvent(
        "STRONG SEISMIC ACTIVITY DETECTED.",
        "danger"
    );

    renderAll();
}


/* =========================================================
   VOLCANIC SIMULATION
========================================================= */

function setVolcanicScenario() {

    state.scenario = "volcanic";

    state.sensors.temperature = 35.1;
    state.sensors.humidity = 81;
    state.sensors.air = 188;
    state.sensors.water = 21;
    state.sensors.ground = 3.8;
    state.sensors.pressure = 982;

    logEvent(
        "Air-quality sensor detects severe deterioration.",
        "warning"
    );

    logEvent(
        "Ground sensor reports abnormal vibration.",
        "warning"
    );

    logEvent(
        "AI correlation: air-quality + seismic anomaly.",
        "warning"
    );

    logEvent(
        "POSSIBLE VOLCANIC / ASH EVENT DETECTED.",
        "danger"
    );

    renderAll();
}


/* =========================================================
   STORM SIMULATION
========================================================= */

function setStormScenario() {

    state.scenario = "storm";

    state.sensors.temperature = 27.8;
    state.sensors.humidity = 93;
    state.sensors.air = 48;
    state.sensors.water = 39;
    state.sensors.ground = 0.9;
    state.sensors.pressure = 968;

    logEvent(
        "Atmospheric pressure falling rapidly.",
        "warning"
    );

    logEvent(
        "Humidity sensor reports highly saturated air.",
        "warning"
    );

    logEvent(
        "AI correlation: pressure drop + high humidity.",
        "warning"
    );

    logEvent(
        "SEVERE WEATHER PATTERN DETECTED.",
        "danger"
    );

    renderAll();
}


/* =========================================================
   AUTOMATIC SENSOR EVOLUTION
========================================================= */

function updateScenarioReadings() {

    const s = state.sensors;

    state.cycle++;


    /*
     * NORMAL
     */

    if (state.scenario === "normal") {

        s.temperature +=
            (Math.random() - 0.5) * 0.4;

        s.humidity +=
            (Math.random() - 0.5) * 2;

        s.air +=
            (Math.random() - 0.5) * 4;

        s.water +=
            (Math.random() - 0.5) * 2;

        s.ground +=
            (Math.random() - 0.5) * 0.1;

        s.pressure +=
            (Math.random() - 0.5) * 2;
    }


    /*
     * FLOOD
     *
     * Water gradually rises.
     */

    if (state.scenario === "flood") {

        s.temperature +=
            (Math.random() - 0.5) * 0.2;

        s.humidity +=
            0.4 + Math.random() * 0.7;

        s.air +=
            (Math.random() - 0.5) * 2;

        s.water +=
            1.5 + Math.random() * 3;

        s.ground +=
            (Math.random() - 0.5) * 0.1;

        s.pressure -=
            0.5 + Math.random() * 0.8;
    }


    /*
     * EARTHQUAKE
     *
     * Vibration changes sharply.
     */

    if (state.scenario === "earthquake") {

        s.ground =
            5.5 +
            Math.random() * 3.5;

        s.temperature +=
            (Math.random() - 0.5) * 0.3;

        s.humidity +=
            (Math.random() - 0.5) * 1;

        s.air +=
            (Math.random() - 0.5) * 4;

        s.water +=
            (Math.random() - 0.5) * 2;

        s.pressure +=
            (Math.random() - 0.5) * 2;
    }


    /*
     * VOLCANIC
     */

    if (state.scenario === "volcanic") {

        s.temperature +=
            0.2 + Math.random() * 0.4;

        s.air +=
            2 + Math.random() * 5;

        s.ground =
            2.5 +
            Math.random() * 4;

        s.pressure -=
            0.3 + Math.random() * 0.6;

        s.humidity +=
            (Math.random() - 0.5) * 1;
    }


    /*
     * STORM
     */

    if (state.scenario === "storm") {

        s.temperature +=
            (Math.random() - 0.5) * 0.4;

        s.humidity +=
            0.2 + Math.random() * 0.7;

        s.pressure -=
            1 + Math.random() * 2;

        s.water +=
            0.5 + Math.random() * 1.5;

        s.air +=
            (Math.random() - 0.5) * 3;
    }


    clampSensors();
}


/* =========================================================
   LIMIT SENSOR VALUES
========================================================= */

function clampSensors() {

    const s = state.sensors;

    s.temperature =
        Math.max(
            15,
            Math.min(50, s.temperature)
        );

    s.humidity =
        Math.max(
            20,
            Math.min(100, s.humidity)
        );

    s.air =
        Math.max(
            0,
            Math.min(250, s.air)
        );

    s.water =
        Math.max(
            0,
            Math.min(120, s.water)
        );

    s.ground =
        Math.max(
            0,
            Math.min(10, s.ground)
        );

    s.pressure =
        Math.max(
            940,
            Math.min(1030, s.pressure)
        );
}


/* =========================================================
   3-MINUTE SENSOR CYCLE
========================================================= */

function sensorCycle() {

    simulatedMinutes +=
        CONFIG.statusInterval;

    updateScenarioReadings();

    recordHistory();

    logEvent(
        "3-MINUTE ENVIRONMENTAL SENSOR SCAN",
        "success"
    );

    renderAll();
}


/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById("normalBtn")
    .addEventListener(
        "click",
        setNormalEnvironment
    );


document
    .getElementById("floodBtn")
    .addEventListener(
        "click",
        setFloodScenario
    );


document
    .getElementById("earthquakeBtn")
    .addEventListener(
        "click",
        setEarthquakeScenario
    );


document
    .getElementById("volcanoBtn")
    .addEventListener(
        "click",
        setVolcanicScenario
    );


document
    .getElementById("stormBtn")
    .addEventListener(
        "click",
        setStormScenario
    );


/* =========================================================
   INITIALIZATION
========================================================= */

logEvent(
    "SentinelNet environmental sensor core initialized.",
    "success"
);

logEvent(
    "Offline environmental monitoring active.",
    "success"
);

logEvent(
    "Six environmental sensors reporting.",
    "success"
);

recordHistory();

renderAll();


/* =========================================================
   AUTOMATIC 3-MINUTE SIMULATION
========================================================= */

setInterval(
    sensorCycle,
    CONFIG.cycleSpeed
);