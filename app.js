/* ============================================================
   SENTINELNET
   DECENTRALIZED DISASTER POPULATION ACCOUNTABILITY SIMULATION

   CORE PROTOCOL

   COMMAND
      ↓
   STATUS REQUEST
      ↓
   SENTINEL MESH
      ↓
   SENTINEL
      ↓
   STATUS RESPONSE
      ↓
   SENTINEL MESH
      ↓
   COMMAND

   Every Sentinel can:

   SEND
   RECEIVE
   VERIFY
   RELAY
   OBSERVE
   SEARCH
   REPORT
   MAINTAIN LOCAL AWARENESS

   IMPORTANT:

   NO SIGNAL ≠ DEAD

   The Command Center stores the last available evidence:
   - last location
   - last heartbeat
   - last status
   - last known alive state
   - nearby Sentinels
   - last observation
   ============================================================ */


/* ============================================================
   CONFIGURATION
============================================================ */

const CONFIG = {

    communicationRange: 185,

    proximityRange: 275,

    statusInterval: 3,

    noSignalAfter: 6,

    viewWidth: 1000,

    viewHeight: 700,

    animationDuration: 280,

    maxEventLog: 180

};


/* ============================================================
   DOM
============================================================ */

const svg = document.getElementById("networkSvg");

const linksLayer =
    document.getElementById("linksLayer");

const packetsLayer =
    document.getElementById("packetsLayer");

const nodesLayer =
    document.getElementById("nodesLayer");

const eventLog =
    document.getElementById("eventLog");

const simTime =
    document.getElementById("simTime");

const internetStatus =
    document.getElementById("internetStatus");

const meshStatus =
    document.getElementById("meshStatus");

const totalPeople =
    document.getElementById("totalPeople");

const accountedPeople =
    document.getElementById("accountedPeople");

const emergencyPeople =
    document.getElementById("emergencyPeople");

const missingPeople =
    document.getElementById("missingPeople");

const linkCount =
    document.getElementById("linkCount");

const connectedCount =
    document.getElementById("connectedCount");

const packetCount =
    document.getElementById("packetCount");

const verifiedCount =
    document.getElementById("verifiedCount");

const selectedDevice =
    document.getElementById("selectedDevice");

const packetInspector =
    document.getElementById("packetInspector");

const searchInfo =
    document.getElementById("searchInfo");

const aiStatus =
    document.getElementById("aiStatus");

const aiMessage =
    document.getElementById("aiMessage");

const networkMessage =
    document.getElementById("networkMessage");

const routingDisplay =
    document.getElementById("routingDisplay");

const disasterInfo =
    document.getElementById("disasterInfo");

const hazardStatus =
    document.getElementById("hazardStatus");

const sensorName =
    document.getElementById("sensorName");

const sensorDescription =
    document.getElementById("sensorDescription");

const disasterType =
    document.getElementById("disasterType");

const disasterBlock =
    document.getElementById("disasterBlock");


/* ============================================================
   CONTROL CENTER
============================================================ */

const controlCenter = {

    id: "COMMAND",

    name: "MAIN CONTROL",

    x: 500,

    y: 350,

    type: "command"

};


/* ============================================================
   HAZARD SENSOR
============================================================ */

const hazardSensor = {

    id: "HAZARD-01",

    name: "Multi-Hazard Sensor",

    x: 500,

    y: 635,

    type: "sensor",

    active: false,

    hazard: null,

    block: null

};


/* ============================================================
   PEOPLE
============================================================ */

const people = [

    {
        id: "SN-001",
        name: "Maria",
        x: 155,
        y: 145,
        hr: 78,
        zone: "Block A",
        status: "ACTIVE"
    },

    {
        id: "SN-002",
        name: "Juan",
        x: 285,
        y: 105,
        hr: 82,
        zone: "Block A",
        status: "ACTIVE"
    },

    {
        id: "SN-003",
        name: "Ana",
        x: 435,
        y: 95,
        hr: 76,
        zone: "Block A",
        status: "ACTIVE"
    },

    {
        id: "SN-004",
        name: "Carlo",
        x: 595,
        y: 115,
        hr: 81,
        zone: "Block B",
        status: "ACTIVE"
    },

    {
        id: "SN-005",
        name: "Liza",
        x: 750,
        y: 155,
        hr: 79,
        zone: "Block B",
        status: "ACTIVE"
    },

    {
        id: "SN-006",
        name: "Mark",
        x: 855,
        y: 275,
        hr: 83,
        zone: "Block B",
        status: "ACTIVE"
    },

    {
        id: "SN-007",
        name: "Sofia",
        x: 850,
        y: 440,
        hr: 77,
        zone: "Block C",
        status: "ACTIVE"
    },

    {
        id: "SN-008",
        name: "David",
        x: 745,
        y: 550,
        hr: 80,
        zone: "Block C",
        status: "ACTIVE"
    },

    {
        id: "SN-009",
        name: "Ella",
        x: 595,
        y: 585,
        hr: 75,
        zone: "Block C",
        status: "ACTIVE"
    },

    {
        id: "SN-010",
        name: "Ryan",
        x: 430,
        y: 580,
        hr: 79,
        zone: "Block D",
        status: "ACTIVE"
    },

    {
        id: "SN-011",
        name: "Nina",
        x: 275,
        y: 535,
        hr: 84,
        zone: "Block D",
        status: "ACTIVE"
    },

    {
        id: "SN-012",
        name: "Leo",
        x: 145,
        y: 430,
        hr: 78,
        zone: "Block D",
        status: "ACTIVE"
    },

    {
        id: "SN-013",
        name: "Kate",
        x: 120,
        y: 275,
        hr: 81,
        zone: "Block A",
        status: "ACTIVE"
    },

    {
        id: "SN-014",
        name: "Alex",
        x: 340,
        y: 315,
        hr: 79,
        zone: "Block A",
        status: "ACTIVE"
    },

    {
        id: "SN-015",
        name: "Bea",
        x: 670,
        y: 330,
        hr: 82,
        zone: "Block C",
        status: "ACTIVE"
    }

];


people.forEach(person => {

    person.type = "person";

    person.online = true;

    person.commandIsolated = false;

    person.lastCommandResponse = 0;

    person.lastKnownAlive = true;

    person.lastKnownLocation = {

        zone: person.zone,

        x: person.x,

        y: person.y

    };

    person.lastKnownStatus = "ACTIVE";

    person.nearbyHistory = [];

    person.knownAlive = new Set([person.id]);

});


/* ============================================================
   STATE
============================================================ */

let simulatedMinutes = 0;

let disasterMode = false;

let selectedPerson = null;

let packetSequence = 0;

let packetsCreated = 0;

let verifiedHops = 0;

let searchSequence = 0;

let statusRequestSequence = 0;

let failedLinks = new Set();

let packetHistory = new Map();

let observations = {};

let activeSearch = null;

let dragState = null;

let currentDisaster = null;

let lastStatusRequest = null;


/* ============================================================
   BASIC HELPERS
============================================================ */

function distance(a, b) {

    return Math.sqrt(

        Math.pow(a.x - b.x, 2) +

        Math.pow(a.y - b.y, 2)

    );

}


function formatTime() {

    const totalMinutes =
        10 * 60 + simulatedMinutes;

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

}


function getPerson(id) {

    return people.find(
        p => p.id === id
    );

}


function getNodeById(id) {

    if (id === "COMMAND") {

        return controlCenter;

    }

    if (id === "HAZARD-01") {

        return hazardSensor;

    }

    return getPerson(id);

}


function getAllNodes() {

    return [

        controlCenter,

        ...people,

        hazardSensor

    ];

}


function edgeKey(a, b) {

    return [a, b].sort().join("--");

}


function createSvgElement(
    tag,
    attributes = {}
) {

    const element =
        document.createElementNS(

            "http://www.w3.org/2000/svg",

            tag

        );

    Object.entries(attributes).forEach(
        ([key, value]) => {

            element.setAttribute(
                key,
                value
            );

        }
    );

    return element;

}


function logEvent(
    message,
    type = ""
) {

    const item =
        document.createElement("div");

    item.className =
        `event ${type}`;

    item.innerHTML = `

        <span class="event-time">
            ${formatTime()}
        </span>

        ${message}

    `;

    eventLog.prepend(item);

    while (
        eventLog.children.length >
        CONFIG.maxEventLog
    ) {

        eventLog.removeChild(
            eventLog.lastChild
        );

    }

}


/* ============================================================
   NETWORK
============================================================ */

function canCommunicate(a, b) {

    if (
        a.type === "command" ||
        b.type === "command"
    ) {

        return distance(a, b) <=
            CONFIG.communicationRange;

    }

    return distance(a, b) <=
        CONFIG.communicationRange;

}


function isFailed(a, b) {

    return failedLinks.has(
        edgeKey(a.id, b.id)
    );

}


function buildGraph(
    commandView = false
) {

    const nodes = getAllNodes();

    const graph = new Map();

    nodes.forEach(node => {

        graph.set(
            node.id,
            []
        );

    });


    for (
        let i = 0;
        i < nodes.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < nodes.length;
            j++
        ) {

            const a = nodes[i];

            const b = nodes[j];


            if (
                a.type === "person" &&
                !a.online
            ) {

                continue;

            }


            if (
                b.type === "person" &&
                !b.online
            ) {

                continue;

            }


            /*
                Command-view routing excludes
                command-isolated devices.
            */

            if (
                commandView &&
                a.type === "person" &&
                a.commandIsolated
            ) {

                continue;

            }


            if (
                commandView &&
                b.type === "person" &&
                b.commandIsolated
            ) {

                continue;

            }


            if (
                canCommunicate(a, b) &&
                !isFailed(a, b)
            ) {

                graph
                    .get(a.id)
                    .push(b.id);

                graph
                    .get(b.id)
                    .push(a.id);

            }

        }

    }

    return graph;

}


/* ============================================================
   ROUTING
============================================================ */

function findRoute(
    sourceId,
    targetId,
    commandView = false
) {

    const graph =
        buildGraph(commandView);

    if (
        !graph.has(sourceId) ||
        !graph.has(targetId)
    ) {

        return null;

    }


    const queue = [sourceId];

    const previous = new Map();

    previous.set(
        sourceId,
        null
    );


    while (queue.length) {

        const current =
            queue.shift();


        if (
            current === targetId
        ) {

            const route = [];

            let cursor =
                targetId;


            while (
                cursor !== null
            ) {

                route.unshift(cursor);

                cursor =
                    previous.get(cursor);

            }

            return route;

        }


        for (
            const neighbor of
            graph.get(current) || []
        ) {

            if (
                !previous.has(neighbor)
            ) {

                previous.set(
                    neighbor,
                    current
                );

                queue.push(
                    neighbor
                );

            }

        }

    }


    return null;

}


function getReachableFromCommand() {

    const graph =
        buildGraph(true);

    const visited =
        new Set(["COMMAND"]);

    const queue =
        ["COMMAND"];


    while (queue.length) {

        const current =
            queue.shift();


        for (
            const neighbor of
            graph.get(current) || []
        ) {

            if (
                !visited.has(neighbor)
            ) {

                visited.add(neighbor);

                queue.push(neighbor);

            }

        }

    }


    return visited;

}


/* ============================================================
   RENDER LINKS
============================================================ */

function renderLinks() {

    linksLayer.innerHTML = "";

    const nodes =
        getAllNodes();

    let count = 0;


    for (
        let i = 0;
        i < nodes.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < nodes.length;
            j++
        ) {

            const a = nodes[i];

            const b = nodes[j];


            if (
                !canCommunicate(a, b)
            ) {

                continue;

            }


            const line =
                createSvgElement(
                    "line",
                    {

                        x1: a.x,

                        y1: a.y,

                        x2: b.x,

                        y2: b.y

                    }
                );


            line.classList.add(
                "network-link"
            );


            if (
                isFailed(a, b)
            ) {

                line.classList.add(
                    "failed"
                );

            } else {

                count++;

            }


            /*
                Highlight links involving
                the selected device.
            */

            if (
                selectedPerson &&
                (
                    a.id === selectedPerson.id ||
                    b.id === selectedPerson.id
                )
            ) {

                line.classList.add(
                    "selected-link"
                );

            }


            line.dataset.a =
                a.id;

            line.dataset.b =
                b.id;


            linksLayer.appendChild(
                line
            );

        }

    }


    linkCount.textContent =
        count;

}


/* ============================================================
   NODE RENDERING
============================================================ */

function renderNodes() {

    nodesLayer.innerHTML = "";

    renderNode(
        controlCenter
    );

    renderNode(
        hazardSensor
    );

    people.forEach(
        renderNode
    );

    updateConnectedCount();

}


function renderNode(node) {

    const group =
        createSvgElement("g");


    group.classList.add(
        "node"
    );


    if (
        node.type === "command"
    ) {

        group.classList.add(
            "command"
        );

    }


    if (
        node.type === "sensor"
    ) {

        group.classList.add(
            "sensor"
        );

    }


    if (
        node.type === "person"
    ) {

        if (
            node.status ===
            "EMERGENCY"
        ) {

            group.classList.add(
                "emergency"
            );

        } else if (
            node.commandIsolated
        ) {

            group.classList.add(
                "isolated"
            );

        } else {

            group.classList.add(
                "active"
            );

        }

    }


    if (
        selectedPerson &&
        node.id === selectedPerson.id
    ) {

        group.classList.add(
            "selected"
        );

    }


    const ring =
        createSvgElement(
            "circle",
            {

                cx: node.x,

                cy: node.y,

                r:
                    node.type === "command"
                        ? 37
                        : 25

            }
        );


    ring.classList.add(
        "node-ring"
    );


    group.appendChild(
        ring
    );


    const radius =

        node.type === "command"
            ? 28
            : node.type === "sensor"
                ? 20
                : 16;


    const circle =
        createSvgElement(
            "circle",
            {

                cx: node.x,

                cy: node.y,

                r: radius

            }
        );


    circle.classList.add(
        "node-circle"
    );


    if (
        node.type === "command"
    ) {

        circle.setAttribute(
            "fill",
            "#123e58"
        );

    }

    else if (
        node.type === "sensor"
    ) {

        circle.setAttribute(
            "fill",
            node.active
                ? "#49286d"
                : "#20203d"
        );

    }

    else if (
        node.status === "EMERGENCY"
    ) {

        circle.setAttribute(
            "fill",
            "#551d25"
        );

    }

    else if (
        node.commandIsolated
    ) {

        circle.setAttribute(
            "fill",
            "#49351d"
        );

    }

    else {

        circle.setAttribute(
            "fill",
            "#12382f"
        );

    }


    group.appendChild(
        circle
    );


    const symbol =
        createSvgElement(
            "text",
            {

                x: node.x,

                y: node.y + 4,

                "text-anchor":
                    "middle",

                fill:
                    "#ffffff",

                "font-size":
                    node.type === "command"
                        ? "17"
                        : "11",

                "font-weight":
                    "bold"

            }
        );


    symbol.textContent =

        node.type === "command"
            ? "C"
            : node.type === "sensor"
                ? "H"
                : "S";


    group.appendChild(
        symbol
    );


    const label =
        createSvgElement(
            "text",
            {

                x: node.x,

                y:
                    node.y +
                    radius +
                    15

            }
        );


    label.classList.add(
        "node-label"
    );


    label.textContent =

        node.type === "command"
            ? "MAIN CONTROL"
            : node.type === "sensor"
                ? "HAZARD-01"
                : node.id;


    group.appendChild(
        label
    );


    if (
        node.type === "person"
    ) {

        const status =
            createSvgElement(
                "text",
                {

                    x: node.x,

                    y:
                        node.y +
                        radius +
                        26

                }
            );


        status.classList.add(
            "node-status"
        );


        status.textContent =

            node.status ===
            "EMERGENCY"

                ? "EMERGENCY"

                : node.commandIsolated

                    ? "COMMAND CUT"

                    : "ACTIVE";


        group.appendChild(
            status
        );


        /*
            Location label
        */

        const location =
            createSvgElement(
                "text",
                {

                    x: node.x,

                    y:
                        node.y +
                        radius +
                        37

                }
            );


        location.classList.add(
            "node-location"
        );


        location.textContent =
            node.zone;


        group.appendChild(
            location
        );

    }


    /* ========================================================
       CLICK
    ======================================================== */

    group.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (
                node.type === "person"
            ) {

                selectPerson(
                    node
                );

            }

        }
    );


    /* ========================================================
       DRAG
    ======================================================== */

    group.addEventListener(
        "pointerdown",
        event => {

            event.stopPropagation();


            if (
                node.type !== "person"
            ) {

                return;

            }


            dragState = {

                node,

                pointerId:
                    event.pointerId

            };


            group.setPointerCapture(
                event.pointerId
            );

        }
    );


    group.addEventListener(
        "pointermove",
        event => {

            if (
                !dragState ||
                dragState.node !== node
            ) {

                return;

            }


            const point =
                svgPoint(event);


            node.x =
                Math.max(
                    30,
                    Math.min(
                        CONFIG.viewWidth - 30,
                        point.x
                    )
                );


            node.y =
                Math.max(
                    30,
                    Math.min(
                        CONFIG.viewHeight - 45,
                        point.y
                    )
                );


            updatePersonLocation(
                node
            );


            renderAll();

        }
    );


    group.addEventListener(
        "pointerup",
        event => {

            if (
                dragState &&
                dragState.node === node
            ) {

                dragState = null;


                updatePersonLocation(
                    node
                );


                logEvent(
                    `${node.id} moved to ${node.zone}. Network topology recalculated.`,
                    "packet"
                );


                checkNetworkChanges();

                runAI();

            }

        }
    );


    nodesLayer.appendChild(
        group
    );

}


/* ============================================================
   LOCATION
============================================================ */

function updatePersonLocation(
    person
) {

    person.lastKnownLocation = {

        zone: person.zone,

        x: Math.round(
            person.x
        ),

        y: Math.round(
            person.y
        )

    };


    const nearby =
        people
            .filter(
                p =>
                    p.id !== person.id &&
                    distance(
                        p,
                        person
                    ) <=
                    CONFIG.proximityRange
            )
            .sort(
                (a, b) =>
                    distance(a, person) -
                    distance(b, person)
            )
            .slice(0, 4)
            .map(
                p => ({
                    id: p.id,
                    distance:
                        Math.round(
                            distance(
                                p,
                                person
                            )
                        )
                })
            );


    person.nearbyHistory.push({

        time:
            formatTime(),

        nearby

    });


    if (
        person.nearbyHistory.length >
        10
    ) {

        person.nearbyHistory.shift();

    }

}


function maybeMovePeople() {

    /*
        Small simulated movement.

        Not everyone moves every cycle.
    */

    people.forEach(
        person => {

            if (
                !person.online
            ) {

                return;

            }


            if (
                Math.random() >
                0.35
            ) {

                return;

            }


            const movement =
                12 + Math.random() * 22;


            const angle =
                Math.random() *
                Math.PI *
                2;


            person.x =
                Math.max(
                    35,
                    Math.min(
                        CONFIG.viewWidth - 35,
                        person.x +
                        Math.cos(angle) *
                        movement
                    )
                );


            person.y =
                Math.max(
                    35,
                    Math.min(
                        CONFIG.viewHeight - 50,
                        person.y +
                        Math.sin(angle) *
                        movement
                    )
                );


            updatePersonLocation(
                person
            );

        }
    );

}


/* ============================================================
   SVG POSITION
============================================================ */

function svgPoint(event) {

    const rect =
        svg.getBoundingClientRect();


    return {

        x:
            (
                event.clientX -
                rect.left
            ) /
            rect.width *
            CONFIG.viewWidth,

        y:
            (
                event.clientY -
                rect.top
            ) /
            rect.height *
            CONFIG.viewHeight

    };

}


/* ============================================================
   SELECTION
============================================================ */

function selectPerson(
    person
) {

    selectedPerson =
        person;

    renderNodes();

    updateSelectedPanel();

    runAI();


    logEvent(
        `Selected ${person.id} (${person.name}).`,
        "packet"
    );

}


function updateSelectedPanel() {

    if (
        !selectedPerson
    ) {

        selectedDevice.innerHTML = `

            <p class="muted">
                Click a wearable on the network.
            </p>

        `;

        return;

    }


    const graph =
        buildGraph(false);


    const neighbors =
        graph.get(
            selectedPerson.id
        ) || [];


    const nearby =
        people

            .filter(
                p =>
                    p.id !==
                    selectedPerson.id &&
                    distance(
                        p,
                        selectedPerson
                    ) <=
                    CONFIG.proximityRange
            )

            .sort(
                (a, b) =>
                    distance(
                        a,
                        selectedPerson
                    ) -
                    distance(
                        b,
                        selectedPerson
                    )
            );


    const lastLocation =
        selectedPerson.lastKnownLocation;


    const aliveList =
        [...selectedPerson.knownAlive]
            .filter(
                id =>
                    id !==
                    selectedPerson.id
            );


    selectedDevice.innerHTML = `

        <div class="info-row">
            <span>ID</span>
            <strong>${selectedPerson.id}</strong>
        </div>

        <div class="info-row">
            <span>Name</span>
            <strong>${selectedPerson.name}</strong>
        </div>

        <div class="info-row">
            <span>Heartbeat</span>
            <strong>${selectedPerson.hr} BPM</strong>
        </div>

        <div class="info-row">
            <span>Current location</span>
            <strong>${selectedPerson.zone}</strong>
        </div>

        <div class="info-row">
            <span>Coordinates</span>
            <strong>
                ${Math.round(selectedPerson.x)},
                ${Math.round(selectedPerson.y)}
            </strong>
        </div>

        <div class="info-row">
            <span>Status</span>
            <strong>${selectedPerson.status}</strong>
        </div>

        <div class="info-row">
            <span>Command connection</span>
            <strong>
                ${
                    selectedPerson.commandIsolated
                        ? "CUT"
                        : "AVAILABLE"
                }
            </strong>
        </div>

        <div class="info-row">
            <span>Last Command response</span>
            <strong>
                ${
                    selectedPerson.lastCommandResponse
                        ? `${selectedPerson.lastCommandResponse} min`
                        : "NONE"
                }
            </strong>
        </div>

        <br>

        <div>
            <span class="tag good">
                ${neighbors.length} COMM LINKS
            </span>
        </div>

        <p class="muted">
            Connected:
            ${
                neighbors.length
                    ? neighbors.join(", ")
                    : "None"
            }
        </p>

        <p class="muted">
            Nearby:
            ${
                nearby.length
                    ? nearby
                        .map(
                            p =>
                                `${p.id} (~${Math.round(
                                    distance(
                                        p,
                                        selectedPerson
                                    )
                                )}m)`
                        )
                        .join(", ")
                    : "None"
            }
        </p>

        <p class="muted">
            Last known location:
            ${lastLocation.zone}
            (${lastLocation.x},
            ${lastLocation.y})
        </p>

        <p class="muted">
            Known alive:
            ${
                aliveList.length
                    ? aliveList.join(", ")
                    : "Only self"
            }
        </p>

    `;

}


/* ============================================================
   PACKETS
============================================================ */

function createPacket(
    type,
    source,
    data = {}
) {

    packetSequence++;

    packetsCreated++;


    const packet = {

        id:
            `PKT-${String(
                packetSequence
            ).padStart(4, "0")}`,

        type,

        source,

        origin: source,

        timestamp:
            formatTime(),

        createdAt:
            simulatedMinutes,

        hops: [],

        verifiedBy: [],

        ...data

    };


    packetHistory.set(
        packet.id,
        packet
    );


    packetCount.textContent =
        packetsCreated;


    return packet;

}


/* ============================================================
   VERIFICATION
============================================================ */

function verifyPacket(
    packet,
    nodeId
) {

    const validId =
        Boolean(packet.id);


    const validSource =

        packet.source ===
        "COMMAND" ||

        packet.source ===
        "HAZARD-01" ||

        people.some(
            p =>
                p.id ===
                packet.source
        );


    const validTimestamp =
        Boolean(
            packet.timestamp
        );


    const valid =
        validId &&
        validSource &&
        validTimestamp;


    if (!valid) {

        logEvent(
            `${nodeId} rejected invalid packet ${packet.id}.`,
            "danger"
        );

        return false;

    }


    if (
        !packet.verifiedBy.includes(
            nodeId
        )
    ) {

        packet.verifiedBy.push(
            nodeId
        );

        verifiedHops++;

        verifiedCount.textContent =
            verifiedHops;

    }


    logEvent(
        `${nodeId} verified ${packet.id} from ${packet.source}.`,
        "good"
    );


    return true;

}


/* ============================================================
   PACKET INSPECTOR
============================================================ */

function inspectPacket(
    packet
) {

    packetInspector.innerHTML = `

        <div class="info-row">
            <span>Packet</span>
            <strong>${packet.id}</strong>
        </div>

        <div class="info-row">
            <span>Type</span>
            <strong>${packet.type}</strong>
        </div>

        <div class="info-row">
            <span>Source</span>
            <strong>${packet.source}</strong>
        </div>

        <div class="info-row">
            <span>Timestamp</span>
            <strong>${packet.timestamp}</strong>
        </div>

        <div class="info-row">
            <span>Hops</span>
            <strong>${packet.hops.length}</strong>
        </div>

        <p class="muted">
            Verification history:
        </p>

        <p>
            ${
                packet.verifiedBy.length
                    ? packet.verifiedBy.join(
                        " → "
                    )
                    : "Not verified"
            }
        </p>

    `;

}


/* ============================================================
   PACKET ROUTING
============================================================ */

async function routePacket(
    packet,
    route
) {

    if (
        !route ||
        route.length < 1
    ) {

        logEvent(
            `${packet.id} has no available route.`,
            "danger"
        );

        return false;

    }


    packet.hops = [];


    for (
        let i = 0;
        i < route.length;
        i++
    ) {

        const nodeId =
            route[i];


        packet.hops.push(
            nodeId
        );


        if (
            i === 0
        ) {

            verifyPacket(
                packet,
                nodeId
            );

        }

        else {

            const previous =
                route[i - 1];


            logEvent(
                `${previous} → ${nodeId}: ${packet.id} received.`,
                "packet"
            );


            if (
                !verifyPacket(
                    packet,
                    nodeId
                )
            ) {

                return false;

            }

        }


        if (
            i <
            route.length - 1
        ) {

            await animatePacketHop(

                packet,

                route[i],

                route[i + 1]

            );

        }

    }


    logEvent(
        `${packet.id} reached ${route[route.length - 1]} via ${route.join(" → ")}.`,
        "good"
    );


    inspectPacket(
        packet
    );


    return true;

}


/* ============================================================
   PACKET ANIMATION
============================================================ */

function animatePacketHop(
    packet,
    fromId,
    toId
) {

    return new Promise(
        resolve => {

            const from =
                getNodeById(
                    fromId
                );

            const to =
                getNodeById(
                    toId
                );


            if (
                !from ||
                !to
            ) {

                resolve();

                return;

            }


            const group =
                createSvgElement(
                    "g"
                );


            group.classList.add(
                "packet"
            );


            const glow =
                createSvgElement(
                    "circle",
                    {

                        cx: from.x,

                        cy: from.y,

                        r: 8

                    }
                );


            glow.classList.add(
                "packet-glow"
            );


            const core =
                createSvgElement(
                    "circle",
                    {

                        cx: from.x,

                        cy: from.y,

                        r: 3

                    }
                );


            core.classList.add(
                "packet-core"
            );


            group.appendChild(
                glow
            );

            group.appendChild(
                core
            );


            packetsLayer.appendChild(
                group
            );


            const start =
                performance.now();


            function frame(now) {

                const progress =
                    Math.min(
                        1,
                        (
                            now -
                            start
                        ) /
                        CONFIG.animationDuration
                    );


                const x =
                    from.x +
                    (
                        to.x -
                        from.x
                    ) *
                    progress;


                const y =
                    from.y +
                    (
                        to.y -
                        from.y
                    ) *
                    progress;


                glow.setAttribute(
                    "cx",
                    x
                );

                glow.setAttribute(
                    "cy",
                    y
                );

                core.setAttribute(
                    "cx",
                    x
                );

                core.setAttribute(
                    "cy",
                    y
                );


                if (
                    progress <
                    1
                ) {

                    requestAnimationFrame(
                        frame
                    );

                }

                else {

                    group.remove();

                    resolve();

                }

            }


            requestAnimationFrame(
                frame
            );

        }
    );

}


/* ============================================================
   STATUS RESPONSE
============================================================ */

async function sendStatusResponse(
    person,
    requestId
) {

    if (
        !person.online
    ) {

        return false;

    }


    const packet =
        createPacket(

            "STATUS_RESPONSE",

            person.id,

            {

                requestId,

                heartbeat:
                    person.hr,

                location: {

                    zone:
                        person.zone,

                    x:
                        Math.round(
                            person.x
                        ),

                    y:
                        Math.round(
                            person.y
                        )

                },

                status:
                    person.status

            }

        );


    logEvent(
        `${person.id} created ${packet.id} — STATUS RESPONSE.`,
        "packet"
    );


    /*
        A command-isolated Sentinel can still
        communicate locally, but cannot return
        information to Command.
    */

    const route =
        findRoute(
            person.id,
            "COMMAND",
            true
        );


    if (!route) {

        logEvent(
            `${person.id}: STATUS RESPONSE cannot reach Command. Local evidence remains.`,
            "warning"
        );

        person.lastKnownAlive =
            true;

        person.lastKnownStatus =
            person.status;

        person.lastKnownLocation = {

            zone:
                person.zone,

            x:
                Math.round(
                    person.x
                ),

            y:
                Math.round(
                    person.y
                )

        };


        return false;

    }


    const delivered =
        await routePacket(
            packet,
            route
        );


    if (
        delivered
    ) {

        person.lastCommandResponse =
            simulatedMinutes;

        person.lastKnownAlive =
            true;

        person.lastKnownStatus =
            person.status;

        person.lastKnownLocation = {

            zone:
                person.zone,

            x:
                Math.round(
                    person.x
                ),

            y:
                Math.round(
                    person.y
                )

        };


        logEvent(
            `${person.id} is ACCOUNTED at MAIN CONTROL.`,
            "good"
        );

    }


    return delivered;

}


/* ============================================================
   COMMAND STATUS REQUEST
============================================================ */

async function broadcastStatusRequest() {

    statusRequestSequence++;


    const requestId =
        `SR-${String(
            statusRequestSequence
        ).padStart(3, "0")}`;


    lastStatusRequest =
        requestId;


    const packet =
        createPacket(
            "STATUS_REQUEST",
            "COMMAND",
            {

                requestId,

                target:
                    "ALL REACHABLE SENTINELS"

            }
        );


    logEvent(
        `MAIN CONTROL created STATUS REQUEST ${requestId}.`,
        "packet"
    );


    /*
        Command sends the request
        through the actual mesh.

        Each reachable Sentinel receives it.
    */

    const reachable =
        getReachableFromCommand();


    reachable.delete(
        "COMMAND"
    );


    const received =
        new Set();


    for (
        const nodeId of reachable
    ) {

        const route =
            findRoute(
                "COMMAND",
                nodeId,
                true
            );


        if (
            !route
        ) {

            continue;

        }


        await routePacket(
            packet,
            route
        );


        received.add(
            nodeId
        );


        logEvent(
            `${nodeId} received STATUS REQUEST ${requestId}.`,
            "packet"
        );

    }


    /*
        Only after receiving the request
        do Sentinels create their responses.
    */

    const reachablePeople =
        people.filter(
            person =>
                received.has(
                    person.id
                )
        );


    networkMessage.textContent =
        `Command status request ${requestId}: ${reachablePeople.length}/${people.length} Sentinels reached.`;


    for (
        const person of reachablePeople
    ) {

        await sendStatusResponse(
            person,
            requestId
        );

    }


    /*
        Store last-known data for people
        that did not respond.
    */

    people.forEach(
        person => {

            if (
                !received.has(
                    person.id
                )
            ) {

                logEvent(
                    `${person.id}: NO RESPONSE — Command cannot currently reach this device.`,
                    "warning"
                );

            }

        }
    );


    updatePopulation();

    renderAll();

    runAI();

}


/* ============================================================
   +3 MINUTES
============================================================ */

async function statusCycle() {

    simulatedMinutes +=
        CONFIG.statusInterval;


    simTime.textContent =
        formatTime();


    logEvent(
        `━━━ ${formatTime()} — 3-MINUTE COMMAND STATUS CHECK ━━━`,
        "packet"
    );


    /*
        Simulate normal movement.

        Some people move.
        Some remain where they are.
    */

    maybeMovePeople();


    /*
        Command actively asks for
        everyone again.
    */

    if (
        disasterMode
    ) {

        await broadcastStatusRequest();

    }

    else {

        logEvent(
            "No disaster mode: Command is simulating a routine status poll.",
            "packet"
        );

        await broadcastStatusRequest();

    }


    updatePopulation();

    renderAll();

    runAI();

}


/* ============================================================
   ALIVE BEACON
============================================================ */

async function sendAlive(
    person = selectedPerson
) {

    if (
        !person
    ) {

        alert(
            "Select a wearable first."
        );

        return;

    }


    if (
        !person.online
    ) {

        logEvent(
            `${person.id} cannot send ALIVE — device is offline.`,
            "danger"
        );

        return;

    }


    const packet =
        createPacket(
            "ALIVE",
            person.id,
            {

                location: {

                    zone:
                        person.zone,

                    x:
                        Math.round(
                            person.x
                        ),

                    y:
                        Math.round(
                            person.y
                        )

                }

            }
        );


    logEvent(
        `${person.id} broadcast ALIVE.`,
        "good"
    );


    /*
        ALIVE is primarily a local awareness
        mechanism.

        Nearby Sentinels learn:

        "I am alive."

        AND

        "SN-XXX is alive."
    */

    const nearby =
        people.filter(
            other =>

                other.id !==
                person.id &&

                other.online &&

                distance(
                    person,
                    other
                ) <=
                CONFIG.communicationRange

        );


    for (
        const neighbor of nearby
    ) {

        const localRoute =
            findRoute(
                person.id,
                neighbor.id,
                false
            );


        if (
            !localRoute
        ) {

            continue;

        }


        await routePacket(
            packet,
            localRoute
        );


        neighbor.knownAlive.add(
            person.id
        );

        neighbor.knownAlive.add(
            neighbor.id
        );


        logEvent(
            `${neighbor.id}: SELF ALIVE / ${person.id} ALIVE.`,
            "good"
        );

    }


    /*
        The sender itself always knows it is alive.
    */

    person.knownAlive.add(
        person.id
    );


    /*
        If Command happens to be reachable,
        the ALIVE signal can also be relayed.
    */

    const commandRoute =
        findRoute(
            person.id,
            "COMMAND",
            true
        );


    if (
        commandRoute
    ) {

        await routePacket(
            packet,
            commandRoute
        );


        person.lastCommandResponse =
            simulatedMinutes;

        person.lastKnownAlive =
            true;

        person.lastKnownStatus =
            person.status;

        logEvent(
            `${person.id} ALIVE state also reached MAIN CONTROL.`,
            "good"
        );

    }


    updateSelectedPanel();

    updatePopulation();

    runAI();

}


/* ============================================================
   EMERGENCY
============================================================ */

async function triggerEmergency(
    person = selectedPerson
) {

    if (
        !person
    ) {

        alert(
            "Select a wearable first."
        );

        return;

    }


    person.status =
        "EMERGENCY";


    person.hr =
        Math.max(
            105,
            person.hr +
            Math.floor(
                Math.random() *
                25
            )
        );


    const packet =
        createPacket(
            "EMERGENCY",
            person.id,
            {

                heartbeat:
                    person.hr,

                location: {

                    zone:
                        person.zone,

                    x:
                        Math.round(
                            person.x
                        ),

                    y:
                        Math.round(
                            person.y
                        )

                },

                status:
                    "EMERGENCY"

            }
        );


    logEvent(
        `🚨 ${person.id} created EMERGENCY packet ${packet.id}.`,
        "danger"
    );


    const route =
        findRoute(
            person.id,
            "COMMAND",
            true
        );


    if (
        !route
    ) {

        logEvent(
            `🚨 ${person.id}: emergency cannot currently reach Command.`,
            "danger"
        );

        updatePopulation();

        renderAll();

        runAI();

        return;

    }


    await routePacket(
        packet,
        route
    );


    logEvent(
        `🚨 MAIN CONTROL received emergency from ${person.id}.`,
        "danger"
    );


    person.lastCommandResponse =
        simulatedMinutes;


    person.lastKnownAlive =
        true;


    person.lastKnownStatus =
        "EMERGENCY";


    person.lastKnownLocation = {

        zone:
            person.zone,

        x:
            Math.round(
                person.x
            ),

        y:
            Math.round(
                person.y
            )

    };


    updatePopulation();

    renderAll();

    runAI();

}


/* ============================================================
   BLOCK EMERGENCY
============================================================ */

async function simulateBlockEmergency() {

    const block =
        disasterBlock.value;


    const type =
        disasterType.value;


    currentDisaster = {

        type,

        block,

        active: true

    };


    disasterMode =
        true;


    setInfrastructureOffline();


    disasterInfo.innerHTML = `

        <strong>
            ${type}
        </strong>

        <br>

        Affected area:
        <strong>
            ${block}
        </strong>

    `;


    logEvent(
        `⚠ ${type} EVENT: ${block} suddenly reports multiple emergencies.`,
        "danger"
    );


    const victims =
        people.filter(
            person =>
                person.zone === block
        );


    /*
        Trigger several people in the
        affected block.

        This simulates a localized event.
    */

    for (
        const person of victims
    ) {

        person.status =
            "EMERGENCY";


        person.hr =
            105 +
            Math.floor(
                Math.random() * 30
            );


        logEvent(
            `🚨 ${person.id} in ${block}: emergency condition detected.`,
            "danger"
        );

    }


    hazardSensor.active =
        true;

    hazardSensor.hazard =
        type;

    hazardSensor.block =
        block;


    await broadcastHazard();


    /*
        Command now asks everyone for status.
    */

    await broadcastStatusRequest();


    updatePopulation();

    renderAll();

    runAI();

}


/* ============================================================
   DISASTER MODE
============================================================ */

function setInfrastructureOffline() {

    internetStatus.textContent =
        "● CELLULAR / INTERNET OFFLINE";


    internetStatus.classList.remove(
        "online"
    );


    internetStatus.classList.add(
        "offline"
    );


    document.getElementById(
        "disasterBtn"
    ).textContent =
        "DISASTER MODE ACTIVE";


    meshStatus.textContent =
        "● SENTINEL MESH ACTIVE";


    networkMessage.textContent =
        "Infrastructure unavailable — Sentinel mesh operating independently.";

}


async function activateDisasterMode() {

    if (
        disasterMode
    ) {

        disasterMode =
            false;

        currentDisaster =
            null;

        hazardSensor.active =
            false;

        hazardSensor.hazard =
            null;


        internetStatus.textContent =
            "● CELLULAR / INTERNET ONLINE";


        internetStatus.classList.remove(
            "offline"
        );


        internetStatus.classList.add(
            "online"
        );


        document.getElementById(
            "disasterBtn"
        ).textContent =
            "ACTIVATE DISASTER MODE";


        disasterInfo.textContent =
            "No disaster currently simulated.";


        hazardStatus.textContent =
            "NORMAL";


        hazardStatus.classList.remove(
            "danger"
        );


        logEvent(
            "Disaster simulation ended. Infrastructure restored.",
            "good"
        );


        runAI();

        renderAll();

        return;

    }


    disasterMode =
        true;


    setInfrastructureOffline();


    const type =
        disasterType.value;


    const block =
        disasterBlock.value;


    currentDisaster = {

        type,

        block,

        active: true

    };


    disasterInfo.innerHTML = `

        <strong>
            ${type}
        </strong>

        <br>

        Affected area:
        <strong>
            ${block}
        </strong>

    `;


    logEvent(
        `⚠ DISASTER MODE ACTIVATED — ${type} / ${block}.`,
        "danger"
    );


    logEvent(
        "Cellular and internet infrastructure unavailable.",
        "danger"
    );


    logEvent(
        "Sentinel mesh remains operational.",
        "good"
    );


    /*
        CRITICAL PROTOCOL:

        Command asks first.

        People do not autonomously transmit
        their status before receiving the request.
    */

    await broadcastStatusRequest();


    runAI();

}


/* ============================================================
   HAZARD PACKET
============================================================ */

async function broadcastHazard() {

    if (
        !hazardSensor.active
    ) {

        return;

    }


    const type =
        hazardSensor.hazard;


    const block =
        hazardSensor.block;


    sensorName.textContent =
        "HAZARD-01";


    sensorDescription.textContent =
        type;


    hazardStatus.textContent =
        type;


    hazardStatus.classList.add(
        "danger"
    );


    const guidance =
        getHazardGuidance(
            type
        );


    const packet =
        createPacket(
            "HAZARD",
            "HAZARD-01",
            {

                hazard:
                    type,

                affectedBlock:
                    block,

                guidance

            }
        );


    logEvent(
        `HAZARD-01 detected ${type} conditions in ${block}.`,
        "danger"
    );


    const nearby =
        people.filter(
            person =>
                person.online &&
                distance(
                    person,
                    hazardSensor
                ) <=
                CONFIG.communicationRange
        );


    for (
        const person of nearby
    ) {

        logEvent(
            `HAZARD-01 → ${person.id}: ${type} hazard information.`,
            "danger"
        );

    }


    const route =
        findRoute(
            "HAZARD-01",
            "COMMAND"
        );


    if (
        route
    ) {

        await routePacket(
            packet,
            route
        );


        logEvent(
            `MAIN CONTROL received ${type} hazard report.`,
            "danger"
        );

    }


    runAI();

}


function getHazardGuidance(
    type
) {

    switch (
        type
    ) {

        case "FLOOD":

            return "Dangerous water detected. Avoid flooded routes and move toward safer elevated areas if possible.";

        case "EARTHQUAKE":

            return "Earthquake detected. Avoid damaged structures and hazardous areas. Follow established emergency procedures.";

        case "LANDSLIDE":

            return "Possible landslide conditions detected. Avoid unstable slopes and affected roads.";

        case "VOLCANIC ERUPTION":

            return "Volcanic hazard detected. Avoid the affected zone and follow official evacuation guidance.";

        case "TYPHOON":

            return "Severe storm conditions detected. Avoid exposed areas and follow established emergency procedures.";

        default:

            return "Hazard detected. Follow stored emergency guidance.";

    }

}


/* ============================================================
   HAZARD BUTTON
============================================================ */

async function activateHazard() {

    const type =
        disasterType.value;


    const block =
        disasterBlock.value;


    hazardSensor.active =
        !hazardSensor.active;


    if (
        hazardSensor.active
    ) {

        hazardSensor.hazard =
            type;

        hazardSensor.block =
            block;


        await broadcastHazard();

    }

    else {

        hazardSensor.hazard =
            null;


        hazardSensor.block =
            null;


        hazardStatus.textContent =
            "NORMAL";


        hazardStatus.classList.remove(
            "danger"
        );


        logEvent(
            "HAZARD-01 returned to normal.",
            "good"
        );


        runAI();

    }


    renderAll();

}


/* ============================================================
   SEARCH
============================================================ */

async function searchSelectedNode() {

    if (
        !selectedPerson
    ) {

        alert(
            "Select a wearable first."
        );

        return;

    }


    const target =
        selectedPerson;


    searchSequence++;


    activeSearch = {

        id:
            `SEARCH-${String(
                searchSequence
            ).padStart(3, "0")}`,

        target:
            target.id,

        contacted:
            new Set(),

        observations:
            []

    };


    logEvent(
        `SEARCH REQUEST ${activeSearch.id} initiated for ${target.id}.`,
        "search"
    );


    const reachable =
        getReachableFromCommand();


    reachable.delete(
        "COMMAND"
    );


    /*
        Command broadcasts search request
        through reachable Sentinels.
    */

    for (
        const nodeId of reachable
    ) {

        activeSearch.contacted.add(
            nodeId
        );


        const route =
            findRoute(
                "COMMAND",
                nodeId,
                true
            );


        if (
            !route
        ) {

            continue;

        }


        const packet =
            createPacket(
                "SEARCH_REQUEST",
                "COMMAND",
                {

                    target:
                        target.id,

                    searchId:
                        activeSearch.id

                }
            );


        await routePacket(
            packet,
            route
        );

    }


    /*
        Reachable observers now check
        the target.
    */

    for (
        const observer of people
    ) {

        if (
            !observer.online
        ) {

            continue;

        }


        if (
            !reachable.has(
                observer.id
            )
        ) {

            continue;

        }


        if (
            observer.id ===
            target.id
        ) {

            continue;

        }


        const d =
            distance(
                observer,
                target
            );


        if (
            d <=
            CONFIG.proximityRange
        ) {

            await createObservation(
                observer,
                target,
                d
            );

        }

    }


    updateSearchPanel();

    runAI();

}


/* ============================================================
   OBSERVATION
============================================================ */

async function createObservation(
    observer,
    target,
    distanceValue
) {

    if (
        !observations[
            target.id
        ]
    ) {

        observations[
            target.id
        ] = [];

    }


    const observation = {

        observer:
            observer.id,

        target:
            target.id,

        distance:
            Math.round(
                distanceValue
            ),

        timestamp:
            formatTime(),

        source:
            "PROXIMITY"

    };


    observations[
        target.id
    ].push(
        observation
    );


    const packet =
        createPacket(
            "OBSERVATION",
            observer.id,
            {

                target:
                    target.id,

                approximateDistance:
                    Math.round(
                        distanceValue
                    ),

                observationTime:
                    formatTime()

            }
        );


    observer.knownAlive.add(
        target.id
    );


    logEvent(
        `${observer.id} detected ${target.id} approximately ${Math.round(distanceValue)}m away.`,
        "search"
    );


    const route =
        findRoute(
            observer.id,
            "COMMAND",
            true
        );


    if (
        route
    ) {

        await routePacket(
            packet,
            route
        );


        logEvent(
            `MAIN CONTROL received observation of ${target.id} from ${observer.id}.`,
            "search"
        );

    }

    else {

        logEvent(
            `${observer.id} has information about ${target.id}, but cannot currently report to Command.`,
            "warning"
        );

    }


    updateSearchPanel();

}


/* ============================================================
   SEARCH PANEL
============================================================ */

function updateSearchPanel() {

    if (
        !activeSearch
    ) {

        searchInfo.innerHTML = `

            <p class="muted">
                No active search.
            </p>

        `;

        return;

    }


    const target =
        activeSearch.target;


    const targetPerson =
        getPerson(target);


    const list =
        observations[target] ||
        [];


    let confidence =
        "UNKNOWN";


    if (
        list.length === 1
    ) {

        confidence =
            "SINGLE OBSERVATION";

    }

    else if (
        list.length >= 2
    ) {

        confidence =
            "MULTIPLE OBSERVATIONS";

    }


    searchInfo.innerHTML = `

        <div class="info-row">
            <span>Request</span>
            <strong>${activeSearch.id}</strong>
        </div>

        <div class="info-row">
            <span>Target</span>
            <strong>${target}</strong>
        </div>

        <div class="info-row">
            <span>Current status</span>
            <strong>${targetPerson.status}</strong>
        </div>

        <div class="info-row">
            <span>Last location</span>
            <strong>${targetPerson.lastKnownLocation.zone}</strong>
        </div>

        <div class="info-row">
            <span>Observers</span>
            <strong>${list.length}</strong>
        </div>

        <div class="info-row">
            <span>Verification</span>
            <strong>${confidence}</strong>
        </div>

        <p class="muted">
            Observations:
        </p>

        ${
            list.length

                ? list
                    .map(
                        o => `

                            <div class="info-row">

                                <span>
                                    ${o.observer}
                                </span>

                                <strong>
                                    ~${o.distance}m
                                </strong>

                            </div>

                        `
                    )
                    .join("")

                : `
                    <p class="muted">
                        No observations received.
                    </p>
                `
        }

        <p class="muted">
            Prototype verification only —
            observations are simulated.
        </p>

    `;

}


/* ============================================================
   BREAK SELECTED COMMAND CONNECTION
============================================================ */

function breakSelectedConnection() {

    if (
        !selectedPerson
    ) {

        alert(
            "Select a wearable first."
        );

        return;

    }


    selectedPerson.commandIsolated =
        true;


    logEvent(
        `COMMAND LINK CUT: ${selectedPerson.id}.`,
        "danger"
    );


    logEvent(
        `${selectedPerson.id} remains locally connected to nearby Sentinels.`,
        "warning"
    );


    selectedPerson.lastKnownAlive =
        true;


    selectedPerson.lastKnownStatus =
        selectedPerson.status;


    selectedPerson.lastKnownLocation = {

        zone:
            selectedPerson.zone,

        x:
            Math.round(
                selectedPerson.x
            ),

        y:
            Math.round(
                selectedPerson.y
            )

    };


    routingDisplay.textContent =
        "Routing: COMMAND PATH RECALCULATED";


    renderAll();

    runAI();

}


/* ============================================================
   RESTORE
============================================================ */

function restoreConnections() {

    failedLinks.clear();


    people.forEach(
        person => {

            person.commandIsolated =
                false;

        }
    );


    logEvent(
        "All simulated Command connections and link failures restored.",
        "good"
    );


    routingDisplay.textContent =
        "Routing: READY";


    renderAll();

    runAI();

}


/* ============================================================
   AI ANALYSIS
============================================================ */

function runAI() {

    const reachable =
        getReachableFromCommand();


    const emergencies =
        people.filter(
            p =>
                p.status ===
                "EMERGENCY"
        );


    const noSignal =
        people.filter(
            p =>
                !reachable.has(
                    p.id
                )
        );


    const isolated =
        people.filter(
            p =>
                p.commandIsolated
        );


    /*
        PRIORITY 1:
        ACTIVE DISASTER
    */

    if (
        currentDisaster &&
        currentDisaster.active
    ) {

        analyzeDisaster(
            reachable,
            emergencies,
            noSignal
        );

        return;

    }


    /*
        PRIORITY 2:
        EMERGENCIES
    */

    if (
        emergencies.length
    ) {

        aiStatus.textContent =
            "⚠ EMERGENCY CLUSTER ANALYSIS";


        const grouped =
            groupEmergenciesByBlock(
                emergencies
            );


        const descriptions =
            Object.entries(
                grouped
            )
                .map(
                    ([block, list]) =>
                        `${block}: ${list.length} emergency signal${list.length > 1 ? "s" : ""}`
                )
                .join(" | ");


        aiMessage.textContent =
            `Emergency reports detected. ${descriptions}. The network is correlating locations, nearby Sentinels, heartbeat data and communication paths.`;


        aiMessage.classList.remove(
            "warning"
        );

        aiMessage.classList.add(
            "danger"
        );


        return;

    }


    /*
        PRIORITY 3:
        INFORMATION GAP
    */

    if (
        noSignal.length
    ) {

        analyzeInformationGap(
            noSignal,
            isolated
        );

        return;

    }


    /*
        NORMAL
    */

    aiStatus.textContent =
        "✓ NETWORK ACCOUNTED";


    aiMessage.textContent =
        `All ${people.length} Sentinel devices are currently reachable through the mesh. The Command Center has recent status information for the population.`;


    aiMessage.classList.remove(
        "warning",
        "danger"
    );

}


function analyzeDisaster(
    reachable,
    emergencies,
    noSignal
) {

    const type =
        currentDisaster.type;


    const block =
        currentDisaster.block;


    aiStatus.textContent =
        `⚠ ${type} — AI ANALYSIS`;


    const affected =
        people.filter(
            p =>
                p.zone === block
        );


    const affectedEmergency =
        affected.filter(
            p =>
                p.status ===
                "EMERGENCY"
        );


    let text =

        `${type} reported in ${block}. `;


    text +=

        `${affected.length} Sentinel devices are located in the affected block. `;


    if (
        affectedEmergency.length
    ) {

        text +=

            `${affectedEmergency.length} have reported emergency conditions. `;

    }


    if (
        noSignal.length
    ) {

        text +=

            `${noSignal.length} device(s) are currently outside the Command communication path. `;

    }


    /*
        Look for nearby evidence.
    */

    const important =
        noSignal.filter(
            p =>
                p.zone ===
                block
        );


    if (
        important.length
    ) {

        const p =
            important[0];


        const nearby =
            getNearbyPeople(
                p
            );


        text +=

            `${p.id} was last known in ${p.lastKnownLocation.zone}. `;


        if (
            nearby.length
        ) {

            text +=

                `Nearby evidence includes ${nearby.map(x => x.id).join(", ")}. `;

        }


        text +=

            `The available evidence is incomplete; loss of Command communication does not establish that the person is deceased.`;

    }


    aiMessage.textContent =
        text;


    aiMessage.classList.add(
        "warning"
    );


    aiMessage.classList.remove(
        "danger"
    );

}


function analyzeInformationGap(
    noSignal,
    isolated
) {

    aiStatus.textContent =
        "◌ INFORMATION GAP DETECTED";


    const target =
        noSignal[0];


    const nearby =
        getNearbyPeople(
            target
        );


    let text =

        `${target.id} cannot currently be reached by Main Control. `;


    text +=

        `Last known location: ${target.lastKnownLocation.zone}. `;


    text +=

        `Last known status: ${target.lastKnownStatus}. `;


    text +=

        `Last known alive state: ${target.lastKnownAlive ? "YES" : "UNKNOWN"}. `;


    if (
        nearby.length
    ) {

        text +=

            `Known nearby Sentinels: ${nearby.map(p => `${p.id} (~${Math.round(distance(p, target))}m)`).join(", ")}. `;

    }


    /*
        Special case:
        two or more disconnected Sentinels
        that are still connected to each other.
    */

    const isolatedCluster =
        getIsolatedLocalCluster(
            target
        );


    if (
        isolatedCluster.length >= 2
    ) {

        text +=

            `Local cluster detected: ${isolatedCluster.map(p => p.id).join(" ↔ ")}. `;


        text +=

            `These devices remain connected to one another but are not connected to Main Control.`;

    }


    text +=

        ` Assessment: CURRENT CONDITION UNKNOWN — additional information is required.`;


    aiMessage.textContent =
        text;


    aiMessage.classList.remove(
        "danger"
    );


    aiMessage.classList.add(
        "warning"
    );

}


function groupEmergenciesByBlock(
    emergencies
) {

    const groups = {};


    emergencies.forEach(
        p => {

            if (
                !groups[p.zone]
            ) {

                groups[p.zone] = [];

            }


            groups[p.zone].push(
                p
            );

        }
    );


    return groups;

}


function getNearbyPeople(
    person
) {

    return people

        .filter(
            p =>
                p.id !== person.id &&
                distance(
                    p,
                    person
                ) <=
                CONFIG.proximityRange
        )

        .sort(
            (a, b) =>
                distance(
                    a,
                    person
                ) -
                distance(
                    b,
                    person
                )
        )

        .slice(0, 5);

}


function getIsolatedLocalCluster(
    target
) {

    const graph =
        buildGraph(false);


    const visited =
        new Set();


    const queue =
        [target.id];


    while (
        queue.length
    ) {

        const current =
            queue.shift();


        if (
            visited.has(
                current
            )
        ) {

            continue;

        }


        visited.add(
            current
        );


        for (
            const neighbor of
            graph.get(current) || []
        ) {

            if (
                neighbor !==
                "COMMAND" &&
                !visited.has(
                    neighbor
                )
            ) {

                queue.push(
                    neighbor
                );

            }

        }

    }


    const cluster =
        [...visited]
            .map(
                id =>
                    getPerson(id)
            )
            .filter(Boolean);


    const commandReachable =
        getReachableFromCommand();


    /*
        Return only the local cluster
        if none of its people can reach Command.
    */

    if (
        cluster.every(
            p =>
                !commandReachable.has(
                    p.id
                )
        )
    ) {

        return cluster;

    }


    return [];

}


/* ============================================================
   POPULATION ACCOUNTABILITY
============================================================ */

function updatePopulation() {

    totalPeople.textContent =
        people.length;


    const reachable =
        getReachableFromCommand();


    const accounted =
        people.filter(
            person =>
                reachable.has(
                    person.id
                ) &&
                person.lastCommandResponse ===
                    simulatedMinutes
        ).length;


    const emergency =
        people.filter(
            person =>
                person.status ===
                "EMERGENCY"
        ).length;


    const missing =
        people.filter(
            person =>
                !reachable.has(
                    person.id
                )
        ).length;


    accountedPeople.textContent =
        accounted;


    emergencyPeople.textContent =
        emergency;


    missingPeople.textContent =
        missing;

}


/* ============================================================
   CONNECTED COUNT
============================================================ */

function updateConnectedCount() {

    const reachable =
        getReachableFromCommand();


    connectedCount.textContent =
        Math.max(
            0,
            reachable.size - 1
        );

}


/* ============================================================
   NETWORK CHANGES
============================================================ */

function checkNetworkChanges() {

    const reachable =
        getReachableFromCommand();


    people.forEach(
        person => {

            if (
                !reachable.has(
                    person.id
                )
            ) {

                logEvent(
                    `${person.id} is outside the Command communication path. Last known information retained.`,
                    "warning"
                );

            }

        }
    );


    updateConnectedCount();

}


/* ============================================================
   RENDER ALL
============================================================ */

function renderAll() {

    renderLinks();

    renderNodes();

    updateSelectedPanel();

    updatePopulation();

    updateConnectedCount();

}


/* ============================================================
   BUTTON EVENTS
============================================================ */

document
    .getElementById(
        "disasterBtn"
    )
    .addEventListener(
        "click",
        activateDisasterMode
    );


document
    .getElementById(
        "threeMinBtn"
    )
    .addEventListener(
        "click",
        statusCycle
    );


document
    .getElementById(
        "emergencyBtn"
    )
    .addEventListener(
        "click",
        () =>
            triggerEmergency()
    );


document
    .getElementById(
        "blockEmergencyBtn"
    )
    .addEventListener(
        "click",
        simulateBlockEmergency
    );


document
    .getElementById(
        "searchBtn"
    )
    .addEventListener(
        "click",
        searchSelectedNode
    );


document
    .getElementById(
        "aliveBtn"
    )
    .addEventListener(
        "click",
        () =>
            sendAlive()
    );


document
    .getElementById(
        "breakBtn"
    )
    .addEventListener(
        "click",
        breakSelectedConnection
    );


document
    .getElementById(
        "restoreBtn"
    )
    .addEventListener(
        "click",
        restoreConnections
    );


document
    .getElementById(
        "hazardBtn"
    )
    .addEventListener(
        "click",
        activateHazard
    );


/* ============================================================
   BACKGROUND CLICK
============================================================ */

svg.addEventListener(
    "click",
    () => {

        selectedPerson =
            null;

        renderAll();

        runAI();

    }
);


/* ============================================================
   INITIALIZATION
============================================================ */

people.forEach(
    person => {

        updatePersonLocation(
            person
        );

    }
);


logEvent(
    "SentinelNet simulation initialized.",
    "good"
);


logEvent(
    "15 wearable nodes registered.",
    "packet"
);


logEvent(
    "Every wearable can send, receive, verify, relay and observe.",
    "packet"
);


logEvent(
    "Main Control does not directly connect to every wearable.",
    "packet"
);


logEvent(
    "Multi-hop routing engine ready.",
    "good"
);


logEvent(
    "Status protocol: COMMAND → STATUS REQUEST → SENTINELS → STATUS RESPONSE → COMMAND.",
    "packet"
);


logEvent(
    "NO SIGNAL does not automatically mean DEAD.",
    "packet"
);


logEvent(
    "AI stores last known location, status, alive state and nearby Sentinel evidence.",
    "packet"
);


simTime.textContent =
    formatTime();


document
    .getElementById(
        "rangeDisplay"
    )
    .textContent =
    `${CONFIG.communicationRange} m`;


renderAll();

runAI();


setTimeout(
    () => {

        checkNetworkChanges();

    },
    500
);