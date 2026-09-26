const CONFIG = {
    startingMinutes: 10 * 60,
    statusInterval: 3,
    maxEvents: 120
};


/* =========================
   STATE
========================= */

let simulatedMinutes = 0;

const state = {
    hazard: "flood",
    situation: "immediate",
    procedureIndex: 0,
    packetSent: false
};


/* =========================
   HAZARD DATABASE
========================= */

const hazardData = {

    flood: {

        name: "FLOOD",

        confidence: 95,

        risk: "HIGH",

        state: "CAUTION",

        description:
            "Flood conditions detected. Prioritize moving away from rising water and identify a safer location.",

        recommendationTitle:
            "MOVE TO A SAFER LOCATION",

        recommendation:
            "Avoid rapidly moving water and monitor water levels. Follow local evacuation instructions when available.",

        procedures: {

            immediate: [
                [
                    "MOVE AWAY FROM RISING WATER",
                    "Move toward a safer and higher location if flooding is increasing. Avoid entering rapidly moving water."
                ],
                [
                    "AVOID FLOODED AREAS",
                    "Do not attempt to cross moving floodwater. Watch for hazards that may be hidden by the water."
                ],
                [
                    "MONITOR CONDITIONS",
                    "Continue observing water levels and nearby conditions for signs that the situation is worsening."
                ],
                [
                    "REQUEST ASSISTANCE",
                    "If you cannot safely relocate, send a survival emergency packet through SentinelNet."
                ]
            ],

            shelter: [
                [
                    "IDENTIFY A SAFER LOCATION",
                    "Select a location away from rising water and other visible hazards."
                ],
                [
                    "MOVE CAREFULLY",
                    "Use the safest available route and avoid entering areas where floodwater is moving rapidly."
                ],
                [
                    "REMAIN AWARE",
                    "Continue monitoring changes in water level and nearby hazards."
                ],
                [
                    "REPORT YOUR STATUS",
                    "Send your current status through SentinelNet when communication is available."
                ]
            ],

            evacuation: [
                [
                    "PREPARE TO MOVE",
                    "Keep essential supplies together and follow the safest known evacuation route."
                ],
                [
                    "AVOID FLOODED ROUTES",
                    "Do not use routes covered by dangerous or rapidly moving floodwater."
                ],
                [
                    "FOLLOW OFFICIAL GUIDANCE",
                    "When official evacuation instructions are received, follow them and update your route as conditions change."
                ],
                [
                    "REPORT YOUR LOCATION",
                    "Transmit your current location through the SentinelNet network."
                ]
            ],

            water: [
                [
                    "PROTECT AVAILABLE WATER",
                    "Keep drinking water protected from floodwater and other contamination."
                ],
                [
                    "USE SAFE WATER",
                    "Use a known safe drinking-water source whenever possible."
                ],
                [
                    "CONSERVE SUPPLIES",
                    "Manage available water and food supplies while waiting for assistance."
                ],
                [
                    "REQUEST RESUPPLY",
                    "If supplies are becoming insufficient, send a request through SentinelNet."
                ]
            ],

            communication: [
                [
                    "CHECK NETWORK STATUS",
                    "Confirm whether the SentinelNet mesh is available even when internet service is unavailable."
                ],
                [
                    "SEND STATUS",
                    "Transmit your current location and survival condition."
                ],
                [
                    "MAINTAIN DEVICE POWER",
                    "Conserve device power so the Sentinel can continue sending status information."
                ],
                [
                    "WAIT FOR RELAY",
                    "If direct communication is unavailable, nearby Sentinel devices may relay the packet."
                ]
            ],

            monitoring: [
                [
                    "STAY IN A SAFER LOCATION",
                    "Remain in the safest available area while conditions are monitored."
                ],
                [
                    "MONITOR WATER LEVELS",
                    "Watch for changes that could make the current location unsafe."
                ],
                [
                    "MAINTAIN COMMUNICATION",
                    "Keep the Sentinel device active so status information can continue to be transmitted."
                ],
                [
                    "PREPARE TO RELOCATE",
                    "Be ready to move if the current area becomes unsafe."
                ]
            ]

        }

    },


    earthquake: {

        name: "EARTHQUAKE",

        confidence: 97,

        risk: "CRITICAL",

        state: "HIGH ALERT",

        description:
            "Earthquake conditions detected. Prioritize immediate personal safety, avoid unstable structures, and monitor for aftershocks.",

        recommendationTitle:
            "PRIORITIZE STRUCTURAL SAFETY",

        recommendation:
            "Stay away from damaged structures and falling hazards. Be prepared for aftershocks and follow official instructions.",

        procedures: {

            immediate: [
                [
                    "PROTECT YOURSELF",
                    "Move away from falling objects and other immediate hazards. If shaking is occurring, use appropriate protective positioning."
                ],
                [
                    "CHECK YOUR SURROUNDINGS",
                    "After shaking stops, look for visible structural damage, broken glass, fire, or other hazards."
                ],
                [
                    "AVOID DAMAGED STRUCTURES",
                    "Do not enter visibly damaged buildings or areas that may be unstable."
                ],
                [
                    "REPORT YOUR STATUS",
                    "Send your location and condition through SentinelNet when it is safe to do so."
                ]
            ],

            shelter: [
                [
                    "IDENTIFY A SAFER AREA",
                    "Move to an area away from damaged structures, falling debris, and other visible hazards."
                ],
                [
                    "CHECK FOR NEW DAMAGE",
                    "Monitor the surroundings because aftershocks may create additional hazards."
                ],
                [
                    "KEEP AN EXIT AWARENESS",
                    "Remain aware of safe ways to leave if the area becomes unsafe."
                ],
                [
                    "SEND STATUS",
                    "Transmit your location and condition through the mesh network."
                ]
            ],

            evacuation: [
                [
                    "CHECK THE ROUTE",
                    "Use a route that avoids visibly damaged structures and blocked areas."
                ],
                [
                    "MOVE CAREFULLY",
                    "Watch for debris, broken infrastructure, and other hazards."
                ],
                [
                    "FOLLOW OFFICIAL DIRECTIONS",
                    "Use official evacuation instructions when available."
                ],
                [
                    "REPORT LOCATION",
                    "Send your current position through SentinelNet."
                ]
            ],

            water: [
                [
                    "PROTECT WATER SUPPLIES",
                    "Keep available drinking water protected from contamination."
                ],
                [
                    "CHECK SAFETY",
                    "Use a known safe drinking-water source whenever possible."
                ],
                [
                    "CONSERVE RESOURCES",
                    "Manage available food and water while assistance is being coordinated."
                ],
                [
                    "REQUEST SUPPORT",
                    "Transmit a supply request if resources become insufficient."
                ]
            ],

            communication: [
                [
                    "CHECK MESH CONNECTION",
                    "Determine whether nearby Sentinel devices can communicate."
                ],
                [
                    "SEND STATUS",
                    "Transmit your location and condition."
                ],
                [
                    "CONSERVE POWER",
                    "Reduce unnecessary device activity while keeping emergency communication available."
                ],
                [
                    "USE RELAY NODES",
                    "Nearby Sentinel devices can help relay information when direct communication is unavailable."
                ]
            ],

            monitoring: [
                [
                    "REMAIN AWARE",
                    "Stay aware of aftershocks and changing conditions."
                ],
                [
                    "OBSERVE STRUCTURES",
                    "Do not approach buildings showing signs of serious damage."
                ],
                [
                    "MAINTAIN STATUS",
                    "Continue sending periodic status information."
                ],
                [
                    "PREPARE FOR MOVEMENT",
                    "Be ready to relocate if the current area becomes unsafe."
                ]
            ]

        }

    },


    landslide: {

        name: "LANDSLIDE",

        confidence: 93,

        risk: "CRITICAL",

        state: "HIGH ALERT",

        description:
            "Landslide risk detected. Avoid unstable slopes and areas where soil or debris is actively moving.",

        recommendationTitle:
            "AVOID UNSTABLE TERRAIN",

        recommendation:
            "Move away from active slope hazards when it is safe to do so and avoid returning until the area is considered safe.",

        procedures: {

            immediate: [
                [
                    "MOVE AWAY FROM THE HAZARD",
                    "If ground or debris is actively moving, move away from the affected area using a safer route."
                ],
                [
                    "AVOID THE SLOPE",
                    "Do not approach unstable slopes, loose soil, or areas with active debris."
                ],
                [
                    "WATCH FOR CHANGES",
                    "Monitor for additional movement, falling debris, or changing ground conditions."
                ],
                [
                    "REPORT YOUR LOCATION",
                    "Send your location and condition through SentinelNet."
                ]
            ],

            shelter: [
                [
                    "SELECT STABLE GROUND",
                    "Choose a location away from unstable slopes and visible debris."
                ],
                [
                    "KEEP DISTANCE",
                    "Maintain distance from areas showing signs of movement."
                ],
                [
                    "MONITOR CONDITIONS",
                    "Continue observing the surrounding terrain."
                ],
                [
                    "SEND STATUS",
                    "Report your location to the DisasterNetwork."
                ]
            ],

            evacuation: [
                [
                    "IDENTIFY A SAFER ROUTE",
                    "Use a route that avoids unstable slopes and known debris areas."
                ],
                [
                    "AVOID ACTIVE DEBRIS",
                    "Do not attempt to pass through moving debris."
                ],
                [
                    "FOLLOW EVACUATION GUIDANCE",
                    "Follow official instructions when available."
                ],
                [
                    "REPORT POSITION",
                    "Transmit your current location through SentinelNet."
                ]
            ],

            water: [
                [
                    "PROTECT WATER",
                    "Keep drinking water protected from soil, debris, and contamination."
                ],
                [
                    "USE SAFE SOURCES",
                    "Use a known safe water source whenever possible."
                ],
                [
                    "CONSERVE SUPPLIES",
                    "Manage available food and water while assistance is coordinated."
                ],
                [
                    "REQUEST SUPPORT",
                    "Send a resource request if supplies become insufficient."
                ]
            ],

            communication: [
                [
                    "CHECK MESH",
                    "Confirm whether nearby Sentinel devices are reachable."
                ],
                [
                    "SEND LOCATION",
                    "Transmit your location and current condition."
                ],
                [
                    "CONSERVE POWER",
                    "Keep the Sentinel active for essential emergency communication."
                ],
                [
                    "USE RELAY NODES",
                    "Allow nearby Sentinel devices to relay the packet if necessary."
                ]
            ],

            monitoring: [
                [
                    "OBSERVE TERRAIN",
                    "Continue monitoring the surrounding area for changes."
                ],
                [
                    "KEEP DISTANCE",
                    "Remain away from unstable slopes and debris."
                ],
                [
                    "MAINTAIN COMMUNICATION",
                    "Continue periodic status transmission."
                ],
                [
                    "PREPARE TO RELOCATE",
                    "Be ready to move if conditions worsen."
                ]
            ]

        }

    },


    volcanic: {

        name: "VOLCANIC ERUPTION",

        confidence: 94,

        risk: "CRITICAL",

        state: "HIGH ALERT",

        description:
            "Volcanic hazard detected. Follow official evacuation information and avoid hazardous areas, ash, and volcanic debris.",

        recommendationTitle:
            "FOLLOW VOLCANIC HAZARD GUIDANCE",

        recommendation:
            "Avoid restricted areas and follow official evacuation or hazard-zone instructions.",

        procedures: {

            immediate: [
                [
                    "MOVE AWAY FROM HAZARD AREAS",
                    "Move away from visibly dangerous areas and follow official evacuation instructions."
                ],
                [
                    "PROTECT FROM ASH",
                    "If ash is present, reduce exposure and use appropriate protection for breathing and eyes."
                ],
                [
                    "FOLLOW OFFICIAL ALERTS",
                    "Prioritize official hazard and evacuation information."
                ],
                [
                    "REPORT YOUR STATUS",
                    "Send your location and condition through SentinelNet."
                ]
            ],

            shelter: [
                [
                    "USE A PROTECTED LOCATION",
                    "Remain in a safer location away from restricted or hazardous areas."
                ],
                [
                    "LIMIT ASH EXPOSURE",
                    "Keep openings closed when possible and reduce unnecessary exposure to ash."
                ],
                [
                    "MONITOR ALERTS",
                    "Continue monitoring official hazard information."
                ],
                [
                    "SEND STATUS",
                    "Transmit your location and condition."
                ]
            ],

            evacuation: [
                [
                    "FOLLOW EVACUATION ORDERS",
                    "Use official evacuation instructions as the primary source for movement decisions."
                ],
                [
                    "USE SAFE ROUTES",
                    "Avoid restricted zones and visibly hazardous areas."
                ],
                [
                    "STAY WITH THE ROUTE",
                    "Do not return toward the hazard unless authorities indicate it is safe."
                ],
                [
                    "REPORT LOCATION",
                    "Transmit your current position through SentinelNet."
                ]
            ],

            water: [
                [
                    "PROTECT DRINKING WATER",
                    "Keep drinking water covered and protected from ash and other contamination."
                ],
                [
                    "USE SAFE WATER",
                    "Use a known safe water source whenever possible."
                ],
                [
                    "MANAGE SUPPLIES",
                    "Conserve available food and water resources."
                ],
                [
                    "REQUEST RESOURCES",
                    "Send a resource request through the mesh when supplies become insufficient."
                ]
            ],

            communication: [
                [
                    "CHECK MESH",
                    "Determine whether Sentinel devices in the area remain connected."
                ],
                [
                    "SEND STATUS",
                    "Transmit your location and condition."
                ],
                [
                    "CONSERVE POWER",
                    "Maintain essential communication while conserving battery power."
                ],
                [
                    "USE RELAY",
                    "Nearby Sentinels can relay emergency information through the mesh."
                ]
            ],

            monitoring: [
                [
                    "MONITOR HAZARD INFORMATION",
                    "Continue monitoring official volcanic hazard information."
                ],
                [
                    "REMAIN IN A SAFER AREA",
                    "Avoid restricted zones and changing hazard areas."
                ],
                [
                    "MAINTAIN STATUS",
                    "Continue periodic communication through SentinelNet."
                ],
                [
                    "PREPARE FOR EVACUATION",
                    "Keep essential supplies ready in case movement becomes necessary."
                ]
            ]

        }

    },


    typhoon: {

        name: "TYPHOON",

        confidence: 96,

        risk: "HIGH",

        state: "CAUTION",

        description:
            "Typhoon conditions detected. Prioritize shelter, monitor official warnings, and prepare for changing wind, rain, and flooding conditions.",

        recommendationTitle:
            "REMAIN IN A SAFER SHELTER",

        recommendation:
            "Stay in a secure location, monitor official warnings, and prepare for possible flooding or evacuation.",

        procedures: {

            immediate: [
                [
                    "MOVE TO SAFER SHELTER",
                    "Move to a secure indoor location away from windows and other visible hazards."
                ],
                [
                    "MONITOR CONDITIONS",
                    "Watch for strong winds, heavy rainfall, flooding, and other changing hazards."
                ],
                [
                    "FOLLOW OFFICIAL ALERTS",
                    "Use official weather and emergency instructions when available."
                ],
                [
                    "SEND YOUR STATUS",
                    "Transmit your location and condition through SentinelNet."
                ]
            ],

            shelter: [
                [
                    "SECURE YOUR LOCATION",
                    "Remain in a safer indoor area and stay away from windows or obvious hazards."
                ],
                [
                    "MONITOR WARNINGS",
                    "Continue checking official warnings and changing conditions."
                ],
                [
                    "PREPARE ESSENTIAL ITEMS",
                    "Keep essential supplies and communication devices available."
                ],
                [
                    "MAINTAIN CONTACT",
                    "Continue periodic status transmission through SentinelNet."
                ]
            ],

            evacuation: [
                [
                    "CHECK OFFICIAL INSTRUCTIONS",
                    "Follow official evacuation orders and instructions."
                ],
                [
                    "SELECT A SAFE ROUTE",
                    "Avoid flooded roads and areas affected by severe weather hazards."
                ],
                [
                    "MOVE EARLY WHEN INSTRUCTED",
                    "If evacuation is ordered, follow the designated route as conditions allow."
                ],
                [
                    "REPORT YOUR LOCATION",
                    "Send your position through SentinelNet."
                ]
            ],

            water: [
                [
                    "PROTECT DRINKING WATER",
                    "Keep drinking water stored safely and protected from contamination."
                ],
                [
                    "MANAGE SUPPLIES",
                    "Conserve available water and food resources."
                ],
                [
                    "MONITOR ACCESS",
                    "Be aware that roads and supply routes may become unavailable."
                ],
                [
                    "REQUEST ASSISTANCE",
                    "Send a supply request if available resources become insufficient."
                ]
            ],

            communication: [
                [
                    "CHECK MESH",
                    "Confirm that the SentinelNet mesh remains available."
                ],
                [
                    "SEND STATUS",
                    "Transmit your location and survival condition."
                ],
                [
                    "CONSERVE BATTERY",
                    "Keep the device operational for emergency communication."
                ],
                [
                    "USE RELAY NODES",
                    "Nearby Sentinels can relay information when direct communication is unavailable."
                ]
            ],

            monitoring: [
                [
                    "MONITOR OFFICIAL WARNINGS",
                    "Continue observing official weather and emergency updates."
                ],
                [
                    "WATCH FOR FLOODING",
                    "Monitor nearby water levels and other changing conditions."
                ],
                [
                    "MAINTAIN COMMUNICATION",
                    "Continue periodic Sentinel status transmission."
                ],
                [
                    "PREPARE TO EVACUATE",
                    "Remain ready to move if authorities issue evacuation instructions."
                ]
            ]

        }

    }

};


/* =========================
   DOM REFERENCES
========================= */

const simTime =
    document.getElementById("simTime");

const hazardName =
    document.getElementById("hazardName");

const primaryHazard =
    document.getElementById("primaryHazard");

const immediateRisk =
    document.getElementById("immediateRisk");

const survivalStatus =
    document.getElementById("survivalStatus");

const assessmentSituation =
    document.getElementById("assessmentSituation");

const aiConfidence =
    document.getElementById("aiConfidence");

const survivalState =
    document.getElementById("survivalState");

const confidenceFill =
    document.getElementById("confidenceFill");

const assessmentDescription =
    document.getElementById("assessmentDescription");

const priorityBadge =
    document.getElementById("priorityBadge");

const procedureNumber =
    document.getElementById("procedureNumber");

const procedureTitle =
    document.getElementById("procedureTitle");

const procedureText =
    document.getElementById("procedureText");

const stepCounter =
    document.getElementById("stepCounter");

const recommendationTitle =
    document.getElementById("recommendationTitle");

const recommendationText =
    document.getElementById("recommendationText");

const packetHazard =
    document.getElementById("packetHazard");

const packetSituation =
    document.getElementById("packetSituation");

const packetStatus =
    document.getElementById("packetStatus");

const readinessPercent =
    document.getElementById("readinessPercent");

const eventLog =
    document.getElementById("eventLog");


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

    event.textContent =
        `[${formatTime()}] ${message}`;

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
   HAZARD
========================= */

function setHazard(hazard) {

    if (!hazardData[hazard]) {
        return;
    }

    state.hazard = hazard;
    state.procedureIndex = 0;
    state.packetSent = false;

    const data =
        hazardData[state.hazard];

    hazardName.textContent =
        data.name;

    primaryHazard.textContent =
        data.name;

    immediateRisk.textContent =
        data.risk;

    immediateRisk.className =
        data.risk === "CRITICAL"
            ? "danger"
            : "warning";

    packetHazard.textContent =
        data.name;

    survivalStatus.textContent =
        "● HAZARD PROFILE LOADED";

    logEvent(
        `${data.name} hazard profile loaded from offline database.`,
        "good"
    );

    renderAssessment();
    renderProcedure();
    renderRecommendation();
    updateReadiness();
}


/* =========================
   SITUATION
========================= */

function getSituationName() {

    const option =
        document.querySelector(
            `#situationSelect option[value="${state.situation}"]`
        );

    return option
        ? option.textContent
        : "IMMEDIATE DANGER";
}


function setSituation(value) {

    state.situation = value;
    state.procedureIndex = 0;
    state.packetSent = false;

    assessmentSituation.textContent =
        getSituationName();

    packetSituation.textContent =
        getSituationName();

    logEvent(
        `Situation changed to ${getSituationName()}.`,
        "warning"
    );

    renderAssessment();
    renderProcedure();
    updateReadiness();
}


/* =========================
   ASSESSMENT
========================= */

function renderAssessment() {

    const data =
        hazardData[state.hazard];

    aiConfidence.textContent =
        `${data.confidence}%`;

    confidenceFill.style.width =
        `${data.confidence}%`;

    assessmentSituation.textContent =
        getSituationName();

    assessmentDescription.textContent =
        data.description;

    priorityBadge.textContent =
        data.risk;

    if (data.risk === "CRITICAL") {

        priorityBadge.style.color =
            "#ff7777";

        priorityBadge.style.borderColor =
            "#7b3535";

        priorityBadge.style.background =
            "#291010";

    } else {

        priorityBadge.style.color =
            "#e9bd59";

        priorityBadge.style.borderColor =
            "#765d29";

        priorityBadge.style.background =
            "#211a0c";
    }

    survivalState.textContent =
        data.state;

    survivalState.className =
        data.risk === "CRITICAL"
            ? "danger"
            : "warning";

    survivalStatus.textContent =
        "● READY";
}


/* =========================
   PROCEDURE
========================= */

function renderProcedure() {

    const data =
        hazardData[state.hazard];

    const procedures =
        data.procedures[state.situation];

    if (!procedures || procedures.length === 0) {
        return;
    }

    if (
        state.procedureIndex >=
        procedures.length
    ) {
        state.procedureIndex =
            procedures.length - 1;
    }

    const current =
        procedures[state.procedureIndex];

    const number =
        state.procedureIndex + 1;

    procedureNumber.textContent =
        String(number).padStart(2, "0");

    procedureTitle.textContent =
        current[0];

    procedureText.textContent =
        current[1];

    stepCounter.textContent =
        `STEP ${String(number).padStart(2, "0")} / ${String(procedures.length).padStart(2, "0")}`;

    if (
        state.procedureIndex ===
        procedures.length - 1
    ) {

        document.getElementById(
            "nextStepBtn"
        ).textContent =
            "REVIEW CURRENT STEP ↻";

    } else {

        document.getElementById(
            "nextStepBtn"
        ).textContent =
            "NEXT SURVIVAL STEP →";
    }
}


function nextProcedure() {

    const data =
        hazardData[state.hazard];

    const procedures =
        data.procedures[state.situation];

    if (
        state.procedureIndex <
        procedures.length - 1
    ) {

        state.procedureIndex++;

        logEvent(
            `Survival procedure advanced to step ${state.procedureIndex + 1}.`,
            "good"
        );

        renderProcedure();

    } else {

        logEvent(
            "Current survival procedure reviewed.",
            "warning"
        );

        state.procedureIndex = 0;

        renderProcedure();
    }
}


/* =========================
   RECOMMENDATION
========================= */

function renderRecommendation() {

    const data =
        hazardData[state.hazard];

    recommendationTitle.textContent =
        data.recommendationTitle;

    recommendationText.textContent =
        data.recommendation;
}


/* =========================
   READINESS
========================= */

function updateReadiness() {

    const shelter =
        document.getElementById(
            "shelterCheck"
        );

    const water =
        document.getElementById(
            "waterCheck"
        );

    const communication =
        document.getElementById(
            "communicationCheck"
        );

    const evacuation =
        document.getElementById(
            "evacuationCheck"
        );

    let readiness = 50;

    shelter.classList.add("ready");
    water.classList.add("ready");

    if (
        state.situation ===
        "communication"
    ) {

        communication.classList.add("ready");

        readiness += 20;

    } else {

        communication.classList.remove(
            "ready"
        );
    }

    if (
        state.situation ===
        "evacuation"
    ) {

        evacuation.classList.add("ready");

        readiness += 20;

    } else {

        evacuation.classList.remove(
            "ready"
        );
    }

    if (
        state.situation ===
        "monitoring"
    ) {
        readiness += 10;
    }

    readinessPercent.textContent =
        `${Math.min(readiness, 100)}%`;
}


/* =========================
   SURVIVAL ASSESSMENT BUTTON
========================= */

function assessSurvival() {

    const data =
        hazardData[state.hazard];

    survivalStatus.textContent =
        "● ANALYZING";

    logEvent(
        "Offline survival AI assessment started.",
        "warning"
    );

    setTimeout(() => {

        renderAssessment();
        renderProcedure();
        renderRecommendation();
        updateReadiness();

        survivalStatus.textContent =
            "● PLAN READY";

        logEvent(
            `${data.name} survival plan generated without internet access.`,
            "good"
        );

    }, 450);
}


/* =========================
   EMERGENCY PACKET
========================= */

function sendEmergencyPacket() {

    const data =
        hazardData[state.hazard];

    state.packetSent = true;

    packetStatus.textContent =
        "TRANSMITTING...";

    packetStatus.classList.remove(
        "sent"
    );

    logEvent(
        "Survival emergency packet created.",
        "warning"
    );

    logEvent(
        `Packet contains ${data.name} hazard and ${getSituationName()} situation.`,
        "warning"
    );

    logEvent(
        "Routing survival packet through SentinelNet mesh.",
        "good"
    );

    setTimeout(() => {

        packetStatus.textContent =
            "SENT";

        packetStatus.classList.add(
            "sent"
        );

        logEvent(
            "Nearby Sentinel node accepted survival packet.",
            "good"
        );

        logEvent(
            "Packet ready for multi-hop forwarding to DisasterNetwork command.",
            "good"
        );

    }, 700);
}


/* =========================
   EMERGENCY BUTTON
========================= */

function requestEmergencyAssistance() {

    logEvent(
        "EMERGENCY ASSISTANCE REQUESTED.",
        "danger"
    );

    sendEmergencyPacket();
}


/* =========================
   3-MINUTE CYCLE
========================= */

function statusCycle() {

    simulatedMinutes +=
        CONFIG.statusInterval;

    simTime.textContent =
        formatTime();

    logEvent(
        "3-minute survival status check initiated.",
        "warning"
    );

    logEvent(
        `Sentinel SN-001 reports ${hazardData[state.hazard].name} conditions.`,
        ""
    );

    logEvent(
        "Offline survival AI remains operational without internet.",
        "good"
    );

    renderAssessment();
}


/* =========================
   EVENT LISTENERS
========================= */

document
    .querySelectorAll(".hazard-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".hazard-btn")
                    .forEach(btn => {
                        btn.classList.remove(
                            "active"
                        );
                    });

                button.classList.add(
                    "active"
                );

                setHazard(
                    button.dataset.hazard
                );
            }
        );

    });


document
    .getElementById("situationSelect")
    .addEventListener(
        "change",
        event => {

            setSituation(
                event.target.value
            );

        }
    );


document
    .getElementById("assessBtn")
    .addEventListener(
        "click",
        assessSurvival
    );


document
    .getElementById("nextStepBtn")
    .addEventListener(
        "click",
        nextProcedure
    );


document
    .getElementById("sendPacketBtn")
    .addEventListener(
        "click",
        sendEmergencyPacket
    );


document
    .getElementById("emergencyBtn")
    .addEventListener(
        "click",
        requestEmergencyAssistance
    );


document
    .getElementById("threeMinBtn")
    .addEventListener(
        "click",
        statusCycle
    );


/* =========================
   INITIAL RENDER
========================= */

simTime.textContent =
    formatTime();

setHazard("flood");

setSituation("immediate");

renderAssessment();

renderProcedure();

renderRecommendation();

updateReadiness();