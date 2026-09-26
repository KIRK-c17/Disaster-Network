/* =========================================================
   DISASTERNETWORK
   SENTINELNET — OFFLINE NAVIGATION
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = {

    startingMinutes: 10 * 60,

    routeAnimationTime: 700

};


/* =========================================================
   STATE
   ========================================================= */

const state = {

    simulatedMinutes: 0,

    mode: "safe",

    destination: "shelter",

    routeCalculated: false,

    roadBlocked: false,

    rerouting: false

};


/* =========================================================
   DESTINATIONS
   ========================================================= */

const DESTINATIONS = {

    shelter: {

        name: "SAFE SHELTER",

        distance: "530 m",

        time: "7 min",

        safety: "SAFE",

        instruction:
            "Continue east. Turn right at Block 05 and proceed toward the designated safe shelter.",

        points:
            "280,335 390,290 520,320 650,400 750,500"

    },


    hospital: {

        name: "EMERGENCY HOSPITAL",

        distance: "720 m",

        time: "10 min",

        safety: "SAFE",

        instruction:
            "Proceed north-east along the available road. Hospital access remains open.",

        points:
            "280,335 390,290 520,250 650,210 790,180"

    },


    command: {

        name: "COMMAND CENTER",

        distance: "610 m",

        time: "8 min",

        safety: "SAFE",

        instruction:
            "Proceed north. Continue toward the command center through the connected route.",

        points:
            "280,335 360,290 430,230 500,180"

    },


    evacuation: {

        name: "EVACUATION CENTER",

        distance: "840 m",

        time: "12 min",

        safety: "CAUTION",

        instruction:
            "Proceed west, then follow the marked evacuation route. Avoid the nearby flood zone.",

        points:
            "280,335 220,300 170,250 120,210"

    }

};


/* =========================================================
   ELEMENTS
   ========================================================= */

const simTime =
    document.getElementById(
        "simTime"
    );

const destinationSelect =
    document.getElementById(
        "destinationSelect"
    );

const routeLine =
    document.getElementById(
        "routeLine"
    );

const routeStatus =
    document.getElementById(
        "routeStatus"
    );

const routeDistance =
    document.getElementById(
        "routeDistance"
    );

const routeTime =
    document.getElementById(
        "routeTime"
    );

const routeSafety =
    document.getElementById(
        "routeSafety"
    );

const navigationInstruction =
    document.getElementById(
        "navigationInstruction"
    );

const navigationStatus =
    document.getElementById(
        "navigationStatus"
    );

const safetyBox =
    document.getElementById(
        "safetyBox"
    );

const reroutingStatus =
    document.getElementById(
        "reroutingStatus"
    );

const eventLog =
    document.getElementById(
        "eventLog"
    );

const currentBlock =
    document.getElementById(
        "currentBlock"
    );


/* =========================================================
   TIME
   ========================================================= */

function formatTime() {

    const total =
        CONFIG.startingMinutes +
        state.simulatedMinutes;

    const hours =
        Math.floor(
            total / 60
        );

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
   MODE
   ========================================================= */

function setMode(mode) {

    state.mode = mode;

    document
        .querySelectorAll(".mode-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.mode === mode
            );

        });

    logEvent(
        `[${formatTime()}] NAVIGATION MODE: ${mode.toUpperCase()}`,
        "ai"
    );

}


/* =========================================================
   CALCULATE ROUTE
   ========================================================= */

async function calculateRoute() {

    state.destination =
        destinationSelect.value;

    const destination =
        DESTINATIONS[
            state.destination
        ];

    state.routeCalculated =
        false;

    navigationStatus.textContent =
        "● CALCULATING";

    navigationStatus.className =
        "navigation-status warning";

    routeStatus.textContent =
        "CALCULATING...";

    logEvent(
        `[${formatTime()}] ROUTE CALCULATION STARTED`,
        "ai"
    );


    await wait(350);

    logEvent(
        `[${formatTime()}] GPS POSITION VERIFIED`,
        "good"
    );


    await wait(350);

    logEvent(
        `[${formatTime()}] SCANNING ROUTE FOR HAZARDS`,
        "ai"
    );


    await wait(450);


    let routePoints =
        destination.points;


    if (state.roadBlocked) {

        routePoints =
            reroutedPoints(
                state.destination
            );

        logEvent(
            `[${formatTime()}] BLOCKED ROAD DETECTED`,
            "warning"
        );

    }


    routeLine.setAttribute(
        "points",
        routePoints
    );

    routeLine.classList.remove(
        "blocked"
    );


    routeStatus.textContent =
        state.roadBlocked
            ? "REROUTED"
            : "ROUTE AVAILABLE";


    routeDistance.textContent =
        state.roadBlocked
            ? increaseDistance(
                destination.distance
            )
            : destination.distance;


    routeTime.textContent =
        state.roadBlocked
            ? increaseTime(
                destination.time
            )
            : destination.time;


    routeSafety.textContent =
        destination.safety;


    routeSafety.className =
        destination.safety === "SAFE"
            ? "good"
            : "warning";


    navigationInstruction.textContent =
        state.roadBlocked
            ? "Original route blocked. Follow the alternate route shown on the map."
            : destination.instruction;


    state.routeCalculated =
        true;


    navigationStatus.textContent =
        "● ROUTE ACTIVE";

    navigationStatus.className =
        "navigation-status";


    updateSafetyBox(
        destination
    );


    logEvent(
        `[${formatTime()}] ROUTE TO ${destination.name} READY`,
        "good"
    );

}


/* =========================================================
   REROUTING
   ========================================================= */

async function reroute() {

    if (!state.routeCalculated) {

        await calculateRoute();

        return;

    }


    state.rerouting =
        true;

    reroutingStatus.textContent =
        "ACTIVE";

    reroutingStatus.className =
        "warning";


    navigationStatus.textContent =
        "● REROUTING";

    navigationStatus.className =
        "navigation-status warning";


    logEvent(
        `[${formatTime()}] DYNAMIC REROUTING STARTED`,
        "warning"
    );


    await wait(600);


    const destination =
        DESTINATIONS[
            state.destination
        ];


    routeLine.setAttribute(
        "points",
        reroutedPoints(
            state.destination
        )
    );


    routeStatus.textContent =
        "ALTERNATE ROUTE";


    routeDistance.textContent =
        increaseDistance(
            destination.distance
        );


    routeTime.textContent =
        increaseTime(
            destination.time
        );


    routeSafety.textContent =
        "SAFE";

    routeSafety.className =
        "good";


    navigationInstruction.textContent =
        "Alternate route calculated. Continue using the newly marked safe path.";


    state.rerouting =
        false;


    reroutingStatus.textContent =
        "STANDBY";

    reroutingStatus.className =
        "";


    navigationStatus.textContent =
        "● ROUTE ACTIVE";

    navigationStatus.className =
        "navigation-status";


    logEvent(
        `[${formatTime()}] ALTERNATE ROUTE ACTIVE`,
        "good"
    );

}


/* =========================================================
   ROAD BLOCKAGE
   ========================================================= */

function simulateRoadBlock() {

    state.roadBlocked =
        !state.roadBlocked;


    if (state.roadBlocked) {

        logEvent(
            `[${formatTime()}] ROAD BLOCKAGE DETECTED`,
            "danger"
        );

        navigationStatus.textContent =
            "● OBSTRUCTION";

        navigationStatus.className =
            "navigation-status danger";


        if (state.routeCalculated) {

            routeLine.classList.add(
                "blocked"
            );

            updateSafetyBox(
                DESTINATIONS[
                    state.destination
                ],
                true
            );

            navigationInstruction.textContent =
                "WARNING: Current route contains a blocked road. Recalculate to obtain an alternate route.";

        }

    } else {

        logEvent(
            `[${formatTime()}] ROAD BLOCKAGE CLEARED`,
            "good"
        );

        routeLine.classList.remove(
            "blocked"
        );

        navigationStatus.textContent =
            "● READY";

        navigationStatus.className =
            "navigation-status";

    }

}


/* =========================================================
   SAFETY BOX
   ========================================================= */

function updateSafetyBox(
    destination,
    blocked = false
) {

    safetyBox.className =
        "safety-box";


    if (blocked) {

        safetyBox.classList.add(
            "warning"
        );

        safetyBox.innerHTML = `
            <div class="safety-icon">!</div>
            <strong>ROUTE OBSTRUCTED</strong>
            <p>
                A route hazard has been detected.
                Recalculate to avoid the blocked road.
            </p>
        `;

        return;

    }


    if (
        destination.safety === "CAUTION"
    ) {

        safetyBox.classList.add(
            "warning"
        );

        safetyBox.innerHTML = `
            <div class="safety-icon">!</div>
            <strong>CAUTION ADVISED</strong>
            <p>
                Route remains usable, but
                environmental hazards are nearby.
            </p>
        `;

        return;

    }


    safetyBox.innerHTML = `
        <div class="safety-icon">✓</div>
        <strong>ROUTE CLEAR</strong>
        <p>
            No known major obstruction is present
            on the selected route.
        </p>
    `;

}


/* =========================================================
   ALTERNATE ROUTES
   ========================================================= */

function reroutedPoints(
    destination
) {

    const routes = {

        shelter:
            "280,335 350,390 450,430 570,470 750,500",

        hospital:
            "280,335 330,400 430,450 600,390 790,180",

        command:
            "280,335 300,400 360,430 430,350 500,180",

        evacuation:
            "280,335 240,380 190,410 150,350 120,210"

    };


    return routes[
        destination
    ];

}


/* =========================================================
   FORMATTING
   ========================================================= */

function increaseDistance(
    distance
) {

    const number =
        parseInt(distance);

    return `${number + 120} m`;

}


function increaseTime(
    time
) {

    const number =
        parseInt(time);

    return `${number + 3} min`;

}


/* =========================================================
   EVENT LOG
   ========================================================= */

function logEvent(
    message,
    type = ""
) {

    const event =
        document.createElement(
            "div"
        );

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
    .querySelectorAll(".mode-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                setMode(
                    button.dataset.mode
                );

            }
        );

    });


document
    .getElementById("calculateBtn")
    .addEventListener(
        "click",
        async () => {

            advanceTime();

            await calculateRoute();

        }
    );


document
    .getElementById("blockRoadBtn")
    .addEventListener(
        "click",
        simulateRoadBlock
    );


document
    .getElementById("rerouteBtn")
    .addEventListener(
        "click",
        async () => {

            advanceTime();

            await reroute();

        }
    );


destinationSelect
    .addEventListener(
        "change",
        () => {

            state.routeCalculated =
                false;

            routeStatus.textContent =
                "NO ROUTE CALCULATED";

            routeDistance.textContent =
                "—";

            routeTime.textContent =
                "—";

            routeSafety.textContent =
                "—";

            routeSafety.className =
                "good";

            routeLine.setAttribute(
                "points",
                ""
            );

            navigationInstruction.textContent =
                "Select a destination and calculate a route.";

            updateSafetyBox(
                {
                    safety: "SAFE"
                }
            );

        }
    );


/* =========================================================
   INITIALIZATION
   ========================================================= */

simTime.textContent =
    formatTime();
