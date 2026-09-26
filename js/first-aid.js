const CONFIG = {
    startingMinutes: 10 * 60,
    statusInterval: 3,
    cycleSpeed: 3000,
    maxEvents: 100
};


/* =========================================================
   STATE
========================================================= */

let simulatedMinutes = 0;

const state = {

    condition: "stable",

    procedureIndex: 0,

    packetSent: false,

    vitals: {
        heartRate: 78,
        breathing: "NORMAL",
        responsiveness: "RESPONSIVE"
    }

};


/* =========================================================
   DOM
========================================================= */

const elements = {

    simTime:
        document.getElementById("simTime"),

    heartRate:
        document.getElementById("heartRate"),

    breathing:
        document.getElementById("breathing"),

    responsiveness:
        document.getElementById("responsiveness"),

    conditionState:
        document.getElementById("conditionState"),

    overallState:
        document.getElementById("overallState"),

    emergencyBanner:
        document.getElementById("emergencyBanner"),

    bannerTitle:
        document.getElementById("bannerTitle"),

    bannerText:
        document.getElementById("bannerText"),

    instructionList:
        document.getElementById("instructionList"),

    assessmentCondition:
        document.getElementById(
            "assessmentCondition"
        ),

    assessmentPriority:
        document.getElementById(
            "assessmentPriority"
        ),

    assessmentConfidence:
        document.getElementById(
            "assessmentConfidence"
        ),

    assessmentDescription:
        document.getElementById(
            "assessmentDescription"
        ),

    confidenceMeter:
        document.getElementById(
            "confidenceMeter"
        ),

    procedureNumber:
        document.getElementById(
            "procedureNumber"
        ),

    procedureTitle:
        document.getElementById(
            "procedureTitle"
        ),

    procedureText:
        document.getElementById(
            "procedureText"
        ),

    nextStepBtn:
        document.getElementById(
            "nextStepBtn"
        ),

    packetStatus:
        document.getElementById(
            "packetStatus"
        ),

    packetHeartRate:
        document.getElementById(
            "packetHeartRate"
        ),

    packetCondition:
        document.getElementById(
            "packetCondition"
        ),

    sendPacketBtn:
        document.getElementById(
            "sendPacketBtn"
        ),

    priorityDisplay:
        document.getElementById(
            "priorityDisplay"
        ),

    priorityDescription:
        document.getElementById(
            "priorityDescription"
        ),

    eventLog:
        document.getElementById(
            "eventLog"
        )
};


/* =========================================================
   TIME
========================================================= */

function formatTime() {

    const total =
        CONFIG.startingMinutes +
        simulatedMinutes;

    const hours =
        Math.floor(total / 60) % 24;

    const minutes =
        total % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0")
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
   CONDITION DATABASE
========================================================= */

const CONDITIONS = {

    stable: {

        name: "STABLE",

        priority: "LOW",

        confidence: 96,

        heartRate: 78,

        breathing: "NORMAL",

        responsiveness: "RESPONSIVE",

        description:
            "No immediate medical emergency detected. Continue normal monitoring.",

        bannerTitle:
            "NO ACTIVE EMERGENCY",

        bannerText:
            "SentinelNet is monitoring the subject.",

        procedures: [

            {
                title:
                    "Assess the person",

                text:
                    "Check responsiveness, breathing, and visible injuries."
            },

            {
                title:
                    "Continue monitoring",

                text:
                    "Keep observing the person's condition and vital signs."
            },

            {
                title:
                    "Maintain communication",

                text:
                    "Keep the Sentinel device connected to the DisasterNetwork."
            }

        ]

    },


    bleeding: {

        name: "SEVERE BLEEDING",

        priority: "CRITICAL",

        confidence: 97,

        heartRate: 112,

        breathing: "RAPID",

        responsiveness: "RESPONSIVE",

        description:
            "Severe bleeding requires immediate control of blood loss while emergency assistance is requested.",

        bannerTitle:
            "SEVERE BLEEDING DETECTED",

        bannerText:
            "Immediate first-aid intervention is required.",

        procedures: [

            {
                title:
                    "Apply firm pressure",

                text:
                    "Use clean cloth, gauze, or another suitable barrier and apply firm direct pressure to the bleeding area."
            },

            {
                title:
                    "Do not repeatedly remove the dressing",

                text:
                    "If blood soaks through, add additional material over the existing dressing while maintaining pressure."
            },

            {
                title:
                    "Request emergency assistance",

                text:
                    "Send the person's condition and location through the DisasterNetwork mesh."
            },

            {
                title:
                    "Monitor vital signs",

                text:
                    "Continue monitoring responsiveness, breathing, and heart rate until assistance arrives."
            }

        ]

    },


    burn: {

        name: "SERIOUS BURN",

        priority: "HIGH",

        confidence: 94,

        heartRate: 104,

        breathing: "RAPID",

        responsiveness: "RESPONSIVE",

        description:
            "The AI identifies a serious burn condition and provides immediate protective first-aid guidance.",

        bannerTitle:
            "SERIOUS BURN DETECTED",

        bannerText:
            "Protect the injured area and request medical assistance.",

        procedures: [

            {
                title:
                    "Move away from the heat source",

                text:
                    "Ensure the person is away from the source of heat, flame, or other immediate danger."
            },

            {
                title:
                    "Cool the burn",

                text:
                    "Cool the affected area with clean, cool running water when available."
            },

            {
                title:
                    "Protect the injured area",

                text:
                    "Cover the burn with a clean, non-stick covering and avoid applying substances directly to the injury."
            },

            {
                title:
                    "Request medical assistance",

                text:
                    "Transmit the injury condition and location through the DisasterNetwork."
            }

        ]

    },


    fracture: {

        name: "POSSIBLE FRACTURE",

        priority: "HIGH",

        confidence: 91,

        heartRate: 98,

        breathing: "NORMAL",

        responsiveness: "RESPONSIVE",

        description:
            "The AI identifies signs consistent with a possible fracture and recommends immobilization and medical assessment.",

        bannerTitle:
            "POSSIBLE FRACTURE",

        bannerText:
            "Avoid unnecessary movement of the injured area.",

        procedures: [

            {
                title:
                    "Keep the injured area still",

                text:
                    "Avoid unnecessary movement of the suspected injured limb or body area."
            },

            {
                title:
                    "Support the injury",

                text:
                    "Use available support to help keep the injured area stable without forcing it into position."
            },

            {
                title:
                    "Monitor the person",

                text:
                    "Continue checking responsiveness, breathing, and changes in the person's condition."
            },

            {
                title:
                    "Request medical assistance",

                text:
                    "Send the suspected fracture and location through the DisasterNetwork."
            }

        ]

    },


    unconscious: {

        name: "UNCONSCIOUS",

        priority: "CRITICAL",

        confidence: 98,

        heartRate: 64,

        breathing: "NORMAL",

        responsiveness: "UNRESPONSIVE",

        description:
            "The person is unresponsive. Immediate assessment of breathing and emergency assistance are required.",

        bannerTitle:
            "UNCONSCIOUS PERSON DETECTED",

        bannerText:
            "Immediate emergency assessment required.",

        procedures: [

            {
                title:
                    "Check responsiveness",

                text:
                    "Check whether the person responds to verbal or gentle physical stimulation."
            },

            {
                title:
                    "Check breathing",

                text:
                    "Determine whether the person is breathing normally."
            },

            {
                title:
                    "Request emergency assistance",

                text:
                    "Transmit the person's location and condition immediately through the mesh network."
            },

            {
                title:
                    "Continue monitoring",

                text:
                    "Continue observing breathing and other available vital information until trained help arrives."
            }

        ]

    },


    cardiac: {

        name: "NO NORMAL BREATHING",

        priority: "CRITICAL",

        confidence: 99,

        heartRate: 0,

        breathing: "NOT NORMAL",

        responsiveness: "UNRESPONSIVE",

        description:
            "The person is not breathing normally. This is a life-threatening emergency requiring immediate emergency response.",

        bannerTitle:
            "NO NORMAL BREATHING",

        bannerText:
            "Immediate emergency response is required.",

        procedures: [

            {
                title:
                    "Call for emergency help",

                text:
                    "Send the person's emergency packet and location through the DisasterNetwork immediately."
            },

            {
                title:
                    "Begin emergency response",

                text:
                    "Follow the emergency instructions provided by trained responders or local emergency guidance."
            },

            {
                title:
                    "Provide CPR if trained",

                text:
                    "If the person is not breathing normally and you are trained to provide CPR, begin according to your training."
            },

            {
                title:
                    "Continue until help arrives",

                text:
                    "Continue emergency care according to trained guidance while monitoring the person's condition."
            }

        ]

    }

};


/* =========================================================
   CONDITION SELECTION
========================================================= */

function setCondition(
    condition
) {

    if (!CONDITIONS[condition]) {
        return;
    }

    state.condition =
        condition;

    state.procedureIndex = 0;

    state.packetSent = false;

    const data =
        CONDITIONS[condition];

    state.vitals.heartRate =
        data.heartRate;

    state.vitals.breathing =
        data.breathing;

    state.vitals.responsiveness =
        data.responsiveness;


    if (condition === "stable") {

        logEvent(
            "Subject condition returned to stable monitoring.",
            "success"
        );

    } else {

        logEvent(
            `${data.name} condition identified by First-Aid AI.`,
            "danger"
        );

        logEvent(
            `Medical priority assigned: ${data.priority}.`,
            "warning"
        );

    }

    renderAll();
}


/* =========================================================
   PROCEDURE
========================================================= */

function renderProcedure() {

    const data =
        CONDITIONS[state.condition];

    const procedures =
        data.procedures;

    const current =
        procedures[state.procedureIndex];

    const number =
        String(
            state.procedureIndex + 1
        ).padStart(2, "0");

    elements.procedureNumber.textContent =
        number;

    elements.procedureTitle.textContent =
        current.title;

    elements.procedureText.textContent =
        current.text;


    if (
        state.procedureIndex >=
        procedures.length - 1
    ) {

        elements.nextStepBtn.textContent =
            "PROCEDURE COMPLETE ✓";

    } else {

        elements.nextStepBtn.textContent =
            "NEXT STEP →";
    }


    renderInstructionList(
        procedures
    );
}


function renderInstructionList(
    procedures
) {

    elements.instructionList.innerHTML =
        "";

    procedures.forEach(
        (procedure, index) => {

            const item =
                document.createElement("div");

            item.className =
                "instruction";

            if (
                index ===
                state.procedureIndex
            ) {

                item.classList.add(
                    "active"
                );
            }

            item.innerHTML = `
                <span>
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <div>
                    <strong>
                        ${procedure.title}
                    </strong>

                    <p>
                        ${procedure.text}
                    </p>
                </div>
            `;

            elements.instructionList.appendChild(
                item
            );
        }
    );
}


function nextProcedure() {

    const data =
        CONDITIONS[state.condition];

    if (
        state.procedureIndex <
        data.procedures.length - 1
    ) {

        state.procedureIndex++;

        logEvent(
            `First-aid procedure advanced to step ${state.procedureIndex + 1}.`,
            "success"
        );

        renderProcedure();

        return;
    }


    logEvent(
        "First-aid procedure sequence completed.",
        "success"
    );
}


/* =========================================================
   VITAL MONITORING
========================================================= */

function updateVitals() {

    const data =
        CONDITIONS[state.condition];


    if (
        state.condition === "stable"
    ) {

        state.vitals.heartRate +=
            (Math.random() - 0.5) * 4;

        state.vitals.heartRate =
            Math.max(
                65,
                Math.min(
                    95,
                    state.vitals.heartRate
                )
            );

    } else {

        /*
         * Emergency conditions fluctuate
         * slightly during monitoring.
         */

        state.vitals.heartRate +=
            (Math.random() - 0.5) * 6;

        state.vitals.heartRate =
            Math.max(
                0,
                Math.min(
                    180,
                    state.vitals.heartRate
                )
            );
    }


    elements.heartRate.textContent =
        `${Math.round(
            state.vitals.heartRate
        )} BPM`;

    elements.breathing.textContent =
        state.vitals.breathing;

    elements.responsiveness.textContent =
        state.vitals.responsiveness;

    elements.conditionState.textContent =
        data.name;

    elements.packetHeartRate.textContent =
        `${Math.round(
            state.vitals.heartRate
        )} BPM`;

    elements.packetCondition.textContent =
        data.name;
}


/* =========================================================
   ASSESSMENT
========================================================= */

function renderAssessment() {

    const data =
        CONDITIONS[state.condition];

    elements.assessmentCondition.textContent =
        data.name;

    elements.assessmentPriority.textContent =
        data.priority;

    elements.assessmentConfidence.textContent =
        `${data.confidence}%`;

    elements.assessmentDescription.textContent =
        data.description;

    elements.confidenceMeter.style.width =
        `${data.confidence}%`;


    const critical =
        data.priority === "CRITICAL";

    const high =
        data.priority === "HIGH";


    if (critical) {

        elements.assessmentPriority.style.color =
            "#ff8585";

        elements.priorityDisplay.style.color =
            "#ff8585";

        elements.priorityDisplay.style.borderColor =
            "#633636";

        elements.priorityDisplay.style.background =
            "#211010";

        elements.priorityDescription.textContent =
            "Immediate emergency response required.";

        elements.confidenceMeter.style.background =
            "#ff8585";

    } else if (high) {

        elements.assessmentPriority.style.color =
            "#f0b35a";

        elements.priorityDisplay.style.color =
            "#f0b35a";

        elements.priorityDisplay.style.borderColor =
            "#614b2c";

        elements.priorityDisplay.style.background =
            "#211a0e";

        elements.priorityDescription.textContent =
            "Prompt medical assistance is recommended.";

        elements.confidenceMeter.style.background =
            "#f0b35a";

    } else {

        elements.assessmentPriority.style.color =
            "#62e6a4";

        elements.priorityDisplay.style.color =
            "#62e6a4";

        elements.priorityDisplay.style.borderColor =
            "#28523f";

        elements.priorityDisplay.style.background =
            "#091d18";

        elements.priorityDescription.textContent =
            "Continue normal monitoring.";

        elements.confidenceMeter.style.background =
            "#62e6a4";
    }
}


/* =========================================================
   MAIN EMERGENCY DISPLAY
========================================================= */

function renderEmergencyState() {

    const data =
        CONDITIONS[state.condition];


    elements.bannerTitle.textContent =
        data.bannerTitle;

    elements.bannerText.textContent =
        data.bannerText;


    if (
        state.condition === "stable"
    ) {

        elements.overallState.textContent =
            "SUBJECT STABLE";

        elements.overallState.style.color =
            "#62e6a4";

        elements.overallState.style.borderColor =
            "#28523f";

        elements.overallState.style.background =
            "#091d18";

        elements.emergencyBanner.style.borderColor =
            "#28523f";

        elements.emergencyBanner.style.background =
            "#091c18";

    } else {

        elements.overallState.textContent =
            `${data.priority} PRIORITY`;

        elements.overallState.style.color =
            data.priority === "CRITICAL"
                ? "#ff8585"
                : "#f0b35a";

        elements.overallState.style.borderColor =
            data.priority === "CRITICAL"
                ? "#633636"
                : "#614b2c";

        elements.overallState.style.background =
            data.priority === "CRITICAL"
                ? "#211010"
                : "#211a0e";


        elements.emergencyBanner.style.borderColor =
            data.priority === "CRITICAL"
                ? "#633636"
                : "#614b2c";

        elements.emergencyBanner.style.background =
            data.priority === "CRITICAL"
                ? "#211010"
                : "#211a0e";
    }
}


/* =========================================================
   EMERGENCY PACKET
========================================================= */

function sendEmergencyPacket() {

    const data =
        CONDITIONS[state.condition];


    if (
        state.condition === "stable"
    ) {

        logEvent(
            "No emergency condition is currently active.",
            "warning"
        );

        return;
    }


    state.packetSent = true;

    elements.packetStatus.textContent =
        "TRANSMITTING";

    elements.packetStatus.style.color =
        "#66d7ff";


    logEvent(
        "Emergency packet created.",
        "packet"
    );

    logEvent(
        `Condition: ${data.name}.`,
        "packet"
    );

    logEvent(
        "Location: BLOCK 04.",
        "packet"
    );

    logEvent(
        `Heart rate: ${Math.round(
            state.vitals.heartRate
        )} BPM.`,
        "packet"
    );

    logEvent(
        "Routing packet through SentinelNet mesh.",
        "packet"
    );


    setTimeout(
        () => {

            elements.packetStatus.textContent =
                "DELIVERED TO MESH";

            elements.packetStatus.style.color =
                "#62e6a4";

            logEvent(
                "Emergency packet accepted by nearby Sentinel node.",
                "success"
            );

            logEvent(
                "Packet ready for multi-hop forwarding to command.",
                "success"
            );

        },
        900
    );
}


/* =========================================================
   AUTOMATIC MONITORING
========================================================= */

function monitoringCycle() {

    simulatedMinutes +=
        CONFIG.statusInterval;

    updateVitals();

    if (
        state.condition !== "stable"
    ) {

        logEvent(
            `Vital monitoring cycle — HR ${Math.round(
                state.vitals.heartRate
            )} BPM.`,
            "warning"
        );
    } else {

        logEvent(
            "Routine first-aid monitoring cycle completed.",
            "success"
        );
    }

    elements.simTime.textContent =
        formatTime();
}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    elements.simTime.textContent =
        formatTime();

    updateVitals();

    renderEmergencyState();

    renderAssessment();

    renderProcedure();
}


/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById("stableBtn")
    .addEventListener(
        "click",
        () => setCondition("stable")
    );


document
    .getElementById("bleedingBtn")
    .addEventListener(
        "click",
        () => setCondition("bleeding")
    );


document
    .getElementById("burnBtn")
    .addEventListener(
        "click",
        () => setCondition("burn")
    );


document
    .getElementById("fractureBtn")
    .addEventListener(
        "click",
        () => setCondition("fracture")
    );


document
    .getElementById("unconsciousBtn")
    .addEventListener(
        "click",
        () => setCondition("unconscious")
    );


document
    .getElementById("cardiacBtn")
    .addEventListener(
        "click",
        () => setCondition("cardiac")
    );


elements.nextStepBtn
    .addEventListener(
        "click",
        nextProcedure
    );


elements.sendPacketBtn
    .addEventListener(
        "click",
        sendEmergencyPacket
    );


/* =========================================================
   INITIALIZATION
========================================================= */

logEvent(
    "SentinelNet First-Aid AI initialized.",
    "success"
);

logEvent(
    "Offline emergency guidance database loaded.",
    "success"
);

logEvent(
    "Vital monitoring active.",
    "success"
);

renderAll();


/* =========================================================
   3-MINUTE MONITORING CYCLE
========================================================= */

setInterval(
    monitoringCycle,
    CONFIG.cycleSpeed
);