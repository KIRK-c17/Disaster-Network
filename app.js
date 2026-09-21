const svg =
    document.getElementById("network");

const connectionsGroup =
    document.getElementById("connections");

const hazardsGroup =
    document.getElementById("hazards");

const packetsGroup =
    document.getElementById("packets");

const nodesGroup =
    document.getElementById("nodes");

const controlCenterGroup =
    document.getElementById("controlCenter");


const deviceInfo =
    document.getElementById("deviceInfo");

const aiInfo =
    document.getElementById("aiInfo");

const eventLog =
    document.getElementById("eventLog");

const simulationTime =
    document.getElementById("simulationTime");


/* =========================================
   PEOPLE
========================================= */

const people = [

    {
        id: "SN-001",
        name: "Maria",
        x: 600,
        y: 80,
        hr: 78,
        zone: "Zone A",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-002",
        name: "Juan",
        x: 420,
        y: 105,
        hr: 81,
        zone: "Zone A",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-003",
        name: "Carlo",
        x: 780,
        y: 105,
        hr: 112,
        zone: "Zone B",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-004",
        name: "Ana",
        x: 260,
        y: 205,
        hr: 76,
        zone: "Zone A",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-005",
        name: "Miguel",
        x: 450,
        y: 210,
        hr: 83,
        zone: "Zone A",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-006",
        name: "Sofia",
        x: 750,
        y: 210,
        hr: 79,
        zone: "Zone B",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-007",
        name: "Daniel",
        x: 940,
        y: 205,
        hr: 82,
        zone: "Zone B",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-008",
        name: "Lea",
        x: 160,
        y: 350,
        hr: 80,
        zone: "Zone A",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-009",
        name: "Mark",
        x: 390,
        y: 340,
        hr: 75,
        zone: "Zone A",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-010",
        name: "Grace",
        x: 810,
        y: 340,
        hr: 84,
        zone: "Zone B",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-011",
        name: "Paolo",
        x: 1040,
        y: 350,
        hr: 77,
        zone: "Zone B",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-012",
        name: "Nina",
        x: 250,
        y: 500,
        hr: 80,
        zone: "Zone C",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-013",
        name: "Ethan",
        x: 450,
        y: 525,
        hr: 82,
        zone: "Zone C",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-014",
        name: "Kate",
        x: 750,
        y: 525,
        hr: 79,
        zone: "Zone C",
        status: "ACTIVE",
        lastSignal: 0
    },

    {
        id: "SN-015",
        name: "Luis",
        x: 950,
        y: 500,
        hr: 81,
        zone: "Zone C",
        status: "ACTIVE",
        lastSignal: 0
    }

];


/* =========================================
   CONTROL CENTER
========================================= */

const controlCenter = {

    id: "COMMAND",

    x: 600,

    y: 350

};


/* =========================================
   HAZARD SENSOR
========================================= */

const floodSensor = {

    id: "FLOOD-01",

    x: 600,

    y: 600,

    active: false,

    waterLevel: "NORMAL"

};


/* =========================================
   STATE
========================================= */

let disasterMode = false;

let selectedPerson = null;

let simulatedMinutes = 0;

let draggingPerson = null;

let failedLinks = new Set();


/* =========================================
   CONNECTIONS
========================================= */

function getConnections() {

    const links = [];

    /*
        Connect nearby people.
        This creates the spider-web structure.
    */

    for (
        let i = 0;
        i < people.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < people.length;
            j++
        ) {

            const a = people[i];

            const b = people[j];

            const dx =
                a.x - b.x;

            const dy =
                a.y - b.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            /*
                This value controls
                how dense the web is.
            */

            if (distance < 360) {

                links.push({
                    a,
                    b
                });

            }

        }

    }


    /*
        Control Center connections.
    */

    people.forEach(person => {

        links.push({

            a: person,

            b: controlCenter

        });

    });


    return links;

}


/* =========================================
   DRAW CONNECTIONS
========================================= */

function drawConnections() {

    connectionsGroup.innerHTML = "";

    const links =
        getConnections();


    links.forEach(link => {

        const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );


        line.setAttribute(
            "x1",
            link.a.x
        );

        line.setAttribute(
            "y1",
            link.a.y
        );

        line.setAttribute(
            "x2",
            link.b.x
        );

        line.setAttribute(
            "y2",
            link.b.y
        );


        line.classList.add(
            "connection"
        );


        /*
            Unique link ID.
        */

        const id =
            getLinkId(
                link.a,
                link.b
            );


        line.dataset.link =
            id;


        if (
            failedLinks.has(id)
        ) {

            line.classList.add(
                "failed"
            );

        }


        /*
            Clicking a string
            breaks that connection.
        */

        line.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleLink(id);

            }
        );


        connectionsGroup.appendChild(
            line
        );

    });

}


/* =========================================
   LINK ID
========================================= */

function getLinkId(a, b) {

    return [
        a.id,
        b.id
    ]
        .sort()
        .join("--");

}


/* =========================================
   BREAK LINK
========================================= */

function toggleLink(id) {

    if (
        failedLinks.has(id)
    ) {

        failedLinks.delete(id);

        addEvent(
            `Connection restored: ${id}`
        );

    } else {

        failedLinks.add(id);

        addEvent(
            `Connection failure simulated: ${id}`
        );

    }

    drawConnections();

}


/* =========================================
   DRAW PEOPLE
========================================= */

function drawPeople() {

    nodesGroup.innerHTML = "";


    people.forEach(person => {

        const group =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "g"
            );


        group.classList.add(
            "person-node"
        );


        if (
            person.status ===
            "EMERGENCY"
        ) {

            group.classList.add(
                "emergency"
            );

        }


        if (
            person.status ===
            "NO SIGNAL"
        ) {

            group.classList.add(
                "no-signal"
            );

        }


        group.setAttribute(
            "transform",
            `translate(${person.x},${person.y})`
        );


        const circle =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        circle.setAttribute(
            "r",
            22
        );

        circle.classList.add(
            "person-circle"
        );


        group.appendChild(
            circle
        );


        const heart =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );

        heart.setAttribute(
            "y",
            4
        );

        heart.classList.add(
            "heartbeat"
        );

        heart.textContent =
            `♥ ${person.hr}`;


        group.appendChild(
            heart
        );


        const label =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );

        label.setAttribute(
            "y",
            40
        );

        label.classList.add(
            "person-label"
        );

        label.textContent =
            person.id;


        group.appendChild(
            label
        );


        group.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                selectPerson(person);

            }
        );


        group.addEventListener(
            "mousedown",
            event => {

                draggingPerson =
                    person;

                event.stopPropagation();

            }
        );


        nodesGroup.appendChild(
            group
        );

    });

}


/* =========================================
   CONTROL CENTER
========================================= */

function drawControlCenter() {

    controlCenterGroup.innerHTML = "";


    const ring =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );


    ring.setAttribute(
        "cx",
        controlCenter.x
    );

    ring.setAttribute(
        "cy",
        controlCenter.y
    );

    ring.setAttribute(
        "r",
        62
    );

    ring.classList.add(
        "control-ring"
    );


    controlCenterGroup.appendChild(
        ring
    );


    const circle =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );


    circle.setAttribute(
        "cx",
        controlCenter.x
    );

    circle.setAttribute(
        "cy",
        controlCenter.y
    );

    circle.setAttribute(
        "r",
        43
    );

    circle.classList.add(
        "control-center"
    );


    controlCenterGroup.appendChild(
        circle
    );


    const text =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );


    text.setAttribute(
        "x",
        controlCenter.x
    );

    text.setAttribute(
        "y",
        controlCenter.y + 4
    );

    text.classList.add(
        "control-text"
    );

    text.textContent =
        "COMMAND";


    controlCenterGroup.appendChild(
        text
    );


    const text2 =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );


    text2.setAttribute(
        "x",
        controlCenter.x
    );

    text2.setAttribute(
        "y",
        controlCenter.y + 19
    );

    text2.classList.add(
        "control-text"
    );

    text2.style.fontSize =
        "9px";

    text2.textContent =
        "CENTER";


    controlCenterGroup.appendChild(
        text2
    );

}


/* =========================================
   DRAW FLOOD SENSOR
========================================= */

function drawHazard() {

    hazardsGroup.innerHTML = "";


    if (
        !floodSensor.active
    ) {

        return;

    }


    const group =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );


    const circle =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );


    circle.setAttribute(
        "cx",
        floodSensor.x
    );

    circle.setAttribute(
        "cy",
        floodSensor.y
    );

    circle.setAttribute(
        "r",
        25
    );

    circle.classList.add(
        "hazard-circle"
    );


    group.appendChild(
        circle
    );


    const text =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );


    text.setAttribute(
        "x",
        floodSensor.x
    );

    text.setAttribute(
        "y",
        floodSensor.y + 4
    );

    text.classList.add(
        "hazard-text"
    );

    text.textContent =
        "⚠";


    group.appendChild(
        text
    );


    const label =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );


    label.setAttribute(
        "x",
        floodSensor.x
    );

    label.setAttribute(
        "y",
        floodSensor.y + 45
    );

    label.classList.add(
        "hazard-text"
    );

    label.textContent =
        "FLOOD SENSOR";


    group.appendChild(
        label
    );


    hazardsGroup.appendChild(
        group
    );

}


/* =========================================
   SELECT PERSON
========================================= */

function selectPerson(person) {

    selectedPerson =
        person;


    let statusClass =
        person.status ===
        "EMERGENCY"
            ? "emergency-text"
            : "active-text";


    deviceInfo.innerHTML = `

        <div class="device-name">
            ${person.name}
        </div>

        Device ID:
        <strong>${person.id}</strong><br>

        Heartbeat:
        ♥ ${person.hr} BPM<br>

        Location:
        📍 ${person.zone}<br>

        Status:
        <span class="${statusClass}">
            ${person.status}
        </span><br>

        Last signal:
        ${formatSimulationTime()}

    `;

}


/* =========================================
   DISASTER MODE
========================================= */

document
    .getElementById("disasterBtn")
    .addEventListener(
        "click",
        () => {

            disasterMode =
                !disasterMode;


            const button =
                document.getElementById(
                    "disasterBtn"
                );


            button.classList.toggle(
                "active",
                disasterMode
            );


            const status =
                document.getElementById(
                    "networkStatus"
                );


            if (
                disasterMode
            ) {

                status.textContent =
                    "CELLULAR OFFLINE • SENTINEL MESH ACTIVE";


                addEvent(
                    "Disaster Mode activated."
                );

                addEvent(
                    "Cellular/internet unavailable."
                );

            } else {

                status.textContent =
                    "MESH NETWORK ONLINE";


                addEvent(
                    "Disaster Mode deactivated."
                );

            }

        }
    );


/* =========================================
   FLOOD SENSOR
========================================= */

document
    .getElementById("hazardBtn")
    .addEventListener(
        "click",
        () => {

            floodSensor.active =
                true;

            floodSensor.waterLevel =
                "HIGH";


            drawHazard();


            aiInfo.innerHTML = `

                <div class="ai-warning">
                    ⚠ HAZARD DETECTED
                </div>

                <div class="ai-message">
                    Dangerous water detected
                    in ${selectedPerson
                        ? selectedPerson.zone
                        : "Zone B"}.
                </div>

                <div class="ai-action">
                    AI GUIDANCE:
                    Avoid this route.
                </div>

            `;


            addEvent(
                "Flood sensor detected HIGH water."
            );


            addEvent(
                "Hazard information injected into mesh."
            );


            sendHazardPacket();

        }
    );


/* =========================================
   EMERGENCY
========================================= */

document
    .getElementById("emergencyBtn")
    .addEventListener(
        "click",
        () => {

            if (
                !selectedPerson
            ) {

                selectedPerson =
                    people[2];

            }


            selectedPerson.status =
                "EMERGENCY";


            selectPerson(
                selectedPerson
            );


            addEvent(
                `${selectedPerson.id} emergency activated.`
            );


            sendEmergencyPacket(
                selectedPerson
            );


            updatePopulation();

            render();

        }
    );


/* =========================================
   ALIVE
========================================= */

document
    .getElementById("aliveBtn")
    .addEventListener(
        "click",
        () => {

            if (
                !selectedPerson
            ) {

                selectedPerson =
                    people[0];

            }


            selectedPerson.status =
                "ACTIVE";


            selectedPerson.lastSignal =
                simulatedMinutes;


            addEvent(
                `${selectedPerson.id} sent ALIVE beacon.`
            );


            sendPacketToCenter(
                selectedPerson,
                "alive"
            );


            updatePopulation();

            render();

        }
    );


/* =========================================
   +3 MINUTES
========================================= */

document
    .getElementById("timeBtn")
    .addEventListener(
        "click",
        () => {

            simulatedMinutes += 3;


            people.forEach(
                person => {

                    /*
                        Simulated heartbeat
                        variation.
                    */

                    const change =
                        Math.floor(
                            Math.random() * 7
                        ) - 3;


                    person.hr =
                        Math.max(
                            55,
                            Math.min(
                                150,
                                person.hr + change
                            )
                        );


                    /*
                        Emergency devices
                        continue reporting.
                    */

                    if (
                        person.status ===
                        "EMERGENCY"
                    ) {

                        person.lastSignal =
                            simulatedMinutes;

                    }

                }
            );


            simulationTime.textContent =
                formatSimulationTime();


            if (
                selectedPerson
            ) {

                selectPerson(
                    selectedPerson
                );

            }


            addEvent(
                "Simulation advanced +3 minutes."
            );


            updatePopulation();

            render();

        }
    );


/* =========================================
   BREAK LINK BUTTON
========================================= */

document
    .getElementById("breakBtn")
    .addEventListener(
        "click",
        () => {

            const links =
                getConnections();


            if (
                links.length === 0
            ) {

                return;

            }


            const random =
                links[
                    Math.floor(
                        Math.random() *
                        links.length
                    )
                ];


            const id =
                getLinkId(
                    random.a,
                    random.b
                );


            toggleLink(id);

        }
    );


/* =========================================
   EMERGENCY PACKET
========================================= */

function sendEmergencyPacket(
    person
) {

    addEvent(
        `Emergency packet created: ${person.id}`
    );


    sendPacketToCenter(
        person,
        "emergency"
    );

}


/* =========================================
   HAZARD PACKET
========================================= */

function sendHazardPacket() {

    const packet =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );


    packet.setAttribute(
        "r",
        6
    );

    packet.classList.add(
        "packet",
        "hazard"
    );


    packetsGroup.appendChild(
        packet
    );


    /*
        Demonstration path from
        flood sensor to control center.
    */

    animatePacket(
        packet,
        floodSensor.x,
        floodSensor.y,
        controlCenter.x,
        controlCenter.y,
        () => {

            addEvent(
                "Control Center received flood hazard."
            );

        }
    );

}


/* =========================================
   PACKET TO CENTER
========================================= */

function sendPacketToCenter(
    person,
    type
) {

    const packet =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );


    packet.setAttribute(
        "r",
        6
    );


    packet.classList.add(
        "packet"
    );


    if (
        type === "alive"
    ) {

        packet.classList.add(
            "alive"
        );

    }


    packetsGroup.appendChild(
        packet
    );


    animatePacket(
        packet,
        person.x,
        person.y,
        controlCenter.x,
        controlCenter.y,
        () => {

            if (
                type === "emergency"
            ) {

                addEvent(
                    `${person.id} emergency packet received by Command Center.`
                );

            } else {

                addEvent(
                    `${person.id} ALIVE beacon received.`
                );

            }

        }
    );

}


/* =========================================
   PACKET ANIMATION
========================================= */

function animatePacket(
    packet,
    startX,
    startY,
    endX,
    endY,
    onComplete
) {

    let progress = 0;


    function animate() {

        progress += 0.012;


        if (
            progress >= 1
        ) {

            packet.remove();

            onComplete();

            return;

        }


        const x =
            startX +
            (endX - startX) *
            progress;


        const y =
            startY +
            (endY - startY) *
            progress;


        packet.setAttribute(
            "cx",
            x
        );

        packet.setAttribute(
            "cy",
            y
        );


        requestAnimationFrame(
            animate
        );

    }


    animate();

}


/* =========================================
   POPULATION
========================================= */

function updatePopulation() {

    const total =
        people.length;


    const emergency =
        people.filter(
            p =>
                p.status ===
                "EMERGENCY"
        ).length;


    const missing =
        people.filter(
            p =>
                p.status ===
                "NO SIGNAL"
        ).length;


    const accounted =
        total - missing;


    document.getElementById(
        "totalCount"
    ).textContent =
        total;


    document.getElementById(
        "accountedCount"
    ).textContent =
        accounted;


    document.getElementById(
        "emergencyCount"
    ).textContent =
        emergency;


    document.getElementById(
        "missingCount"
    ).textContent =
        missing;

}


/* =========================================
   EVENT LOG
========================================= */

function addEvent(message) {

    const entry =
        document.createElement(
            "div"
        );


    entry.classList.add(
        "event"
    );


    entry.textContent =
        `${formatSimulationTime()} — ${message}`;


    eventLog.prepend(
        entry
    );

}


/* =========================================
   SIMULATION CLOCK
========================================= */

function formatSimulationTime() {

    const totalMinutes =
        10 * 60 +
        simulatedMinutes;


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

}


/* =========================================
   DRAGGING
========================================= */

svg.addEventListener(
    "mousemove",
    event => {

        if (
            !draggingPerson
        ) {

            return;

        }


        const rect =
            svg.getBoundingClientRect();


        const x =
            (
                event.clientX -
                rect.left
            ) *
            (1200 / rect.width);


        const y =
            (
                event.clientY -
                rect.top
            ) *
            (720 / rect.height);


        draggingPerson.x =
            Math.max(
                40,
                Math.min(
                    1160,
                    x
                )
            );


        draggingPerson.y =
            Math.max(
                40,
                Math.min(
                    680,
                    y
                )
            );


        render();

    }
);


window.addEventListener(
    "mouseup",
    () => {

        draggingPerson =
            null;

    }
);


/* =========================================
   RENDER
========================================= */

function render() {

    drawConnections();

    drawPeople();

    drawHazard();

    drawControlCenter();

}


/* =========================================
   START
========================================= */

render();

updatePopulation();

simulationTime.textContent =
    formatSimulationTime();


addEvent(
    "SentinelNet simulation initialized."
);

addEvent(
    "15 wearable devices detected."
);

addEvent(
    "Main Control Center connected."
);