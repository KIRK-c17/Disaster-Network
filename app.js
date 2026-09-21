javascript
/* ============================================================
   SENTINELNET
   Decentralized Disaster Population Accountability Simulation

   Prototype architecture:

   PERSON → PERSON → PERSON → COMMAND

   NOT:

   PERSON → COMMAND

   Every wearable can:
   - send
   - receive
   - verify
   - relay
   - observe
   - participate in search
   ============================================================ */


/* ============================================================
   CONFIGURATION
============================================================ */

const CONFIG = {

    communicationRange: 185,

    proximityRange: 275,

    statusInterval: 3,

    noSignalAfter: 3,

    viewWidth: 1000,

    viewHeight: 700,

    animationDuration: 550,

    maxEventLog: 150

};


/* ============================================================
   DOM
============================================================ */

const svg = document.getElementById("networkSvg");
const linksLayer = document.getElementById("linksLayer");
const packetsLayer = document.getElementById("packetsLayer");
const nodesLayer = document.getElementById("nodesLayer");

const eventLog = document.getElementById("eventLog");

const simTime = document.getElementById("simTime");
const internetStatus = document.getElementById("internetStatus");
const meshStatus = document.getElementById("meshStatus");

const totalPeople = document.getElementById("totalPeople");
const accountedPeople = document.getElementById("accountedPeople");
const emergencyPeople = document.getElementById("emergencyPeople");
const missingPeople = document.getElementById("missingPeople");

const linkCount = document.getElementById("linkCount");
const connectedCount = document.getElementById("connectedCount");
const packetCount = document.getElementById("packetCount");
const verifiedCount = document.getElementById("verifiedCount");

const selectedDevice = document.getElementById("selectedDevice");
const packetInspector = document.getElementById("packetInspector");
const searchInfo = document.getElementById("searchInfo");

const aiStatus = document.getElementById("aiStatus");
const aiMessage = document.getElementById("aiMessage");

const networkMessage = document.getElementById("networkMessage");
const routingDisplay = document.getElementById("routingDisplay");

const floodStatus = document.getElementById("floodStatus");


/* ============================================================
   STATE
============================================================ */

const controlCenter = {
    id: "COMMAND",
    name: "MAIN CONTROL",
    x: 500,
    y: 350,
    type: "command"
};


const floodSensor = {
    id: "FLOOD-01",
    name: "Flood Sensor",
    x: 500,
    y: 635,
    type: "sensor",
    active: false
};


/*
   15 people.

   They are deliberately positioned so the command center
   does NOT directly reach everybody.

   The network therefore needs relays.
*/

const people = [
    { id: "SN-001", name: "Maria", x: 155, y: 145, hr: 78, zone: "North A", status: "ACTIVE", lastSignal: 0, online: true },
    { id: "SN-002", name: "Juan", x: 285, y: 105, hr: 82, zone: "North B", status: "ACTIVE", lastSignal: 0, online: true },
    { id: "SN-003", name: "Ana", x: 435, y: 95, hr: 76, zone: "North C", status: "ACTIVE", lastSignal: 0, online: true },

    { id: "SN-004", name: "Carlo", x: 595, y: 115, hr: 81, zone: "East A", status: "ACTIVE", lastSignal: 0, online: true },
    { id: "SN-005", name: "Liza", x: 750, y: 155, hr: 79, zone: "East B", status: "ACTIVE", lastSignal: 0, online: true },

    { id: "SN-006", name: "Mark", x: 855, y: 275, hr: 83, zone: "East C", status: "ACTIVE", lastSignal: 0, online: true },
    { id: "SN-007", name: "Sofia", x: 850, y: 440, hr: 77, zone: "South East", status: "ACTIVE", lastSignal: 0, online: true },

    { id: "SN-008", name: "David", x: 745, y: 550, hr: 80, zone: "South B", status: "ACTIVE", lastSignal: 0, online: true },
    { id: "SN-009", name: "Ella", x: 595, y: 585, hr: 75, zone: "South C", status: "ACTIVE", lastSignal: 0, online: true },

    { id: "SN-010", name: "Ryan", x: 430, y: 580, hr: 79, zone: "South D", status: "ACTIVE", lastSignal: 0, online: true },
    { id: "SN-011", name: "Nina", x: 275, y: 535, hr: 84, zone: "West D", status: "ACTIVE", lastSignal: 0, online: true },

    { id: "SN-012", name: "Leo", x: 145, y: 430, hr: 78, zone: "West C", status: "ACTIVE", lastSignal: 0, online: true },
    { id: "SN-013", name: "Kate", x: 120, y: 275, hr: 81, zone: "West B", status: "ACTIVE", lastSignal: 0, online: true },

    { id: "SN-014", name: "Alex", x: 340, y: 315, hr: 79, zone: "Central A", status: "ACTIVE", lastSignal: 0, online: true },
    { id: "SN-015", name: "Bea", x: 670, y: 330, hr: 82, zone: "Central B", status: "ACTIVE", lastSignal: 0, online: true }
];


let simulatedMinutes = 0;

let disasterMode = false;

let selectedPerson = null;

let packetSequence = 0;

let packetsCreated = 0;

let verifiedHops = 0;

let searchSequence = 0;

let failedLinks = new Set();

let activePackets = new Set();

let seenPackets = new Map();

let packetHistory = new Map();

let observations = {};

let activeSearch = null;

let dragState = null;


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

    const totalMinutes = 10 * 60 + simulatedMinutes;

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

}


function getPerson(id) {

    return people.find(p => p.id === id);

}


function createSvgElement(tag, attributes = {}) {

    const element = document.createElementNS(
        "http://www.w3.org/2000/svg",
        tag
    );

    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });

    return element;

}


function edgeKey(a, b) {

    return [a, b].sort().join("--");

}


function logEvent(message, type = "") {

    const item = document.createElement("div");

    item.className = `event ${type}`;

    item.innerHTML = `
        <span class="event-time">${formatTime()}</span>
        ${message}
    `;

    eventLog.prepend(item);

    while (eventLog.children.length > CONFIG.maxEventLog) {
        eventLog.removeChild(eventLog.lastChild);
    }

}


/* ============================================================
   NETWORK GRAPH
============================================================ */

function getAllNodes() {

    return [
        controlCenter,
        ...people,
        floodSensor
    ];

}


function canCommunicate(a, b) {

    if (a.type === "sensor" || b.type === "sensor") {

        return distance(a, b) <= CONFIG.communicationRange;

    }

    if (a.type === "command" || b.type === "command") {

        return distance(a, b) <= CONFIG.commandRange;

    }

    return distance(a, b) <= CONFIG.communicationRange;

}


function isFailed(a, b) {

    return failedLinks.has(edgeKey(a.id, b.id));

}


function buildGraph() {

    const nodes = getAllNodes();

    const graph = new Map();

    nodes.forEach(node => {
        graph.set(node.id, []);
    });

    for (let i = 0; i < nodes.length; i++) {

        for (let j = i + 1; j < nodes.length; j++) {

            const a = nodes[i];
            const b = nodes[j];

            /*
                Offline nodes do not participate in normal
                packet communication.
            */

            if (a.type === "person" && !a.online) continue;
            if (b.type === "person" && !b.online) continue;

            if (canCommunicate(a, b) && !isFailed(a, b)) {

                graph.get(a.id).push(b.id);
                graph.get(b.id).push(a.id);

            }

        }

    }

    return graph;

}


/* ============================================================
   ROUTING
============================================================ */

/*
   Breadth-first search.

   This is the actual multi-hop routing engine.
*/

function findRoute(sourceId, targetId) {

    const graph = buildGraph();

    if (!graph.has(sourceId) || !graph.has(targetId)) {
        return null;
    }

    const queue = [sourceId];

    const previous = new Map();

    previous.set(sourceId, null);

    while (queue.length) {

        const current = queue.shift();

        if (current === targetId) {

            const route = [];

            let cursor = targetId;

            while (cursor !== null) {

                route.unshift(cursor);

                cursor = previous.get(cursor);

            }

            return route;

        }

        const neighbors = graph.get(current) || [];

        for (const neighbor of neighbors) {

            if (!previous.has(neighbor)) {

                previous.set(neighbor, current);

                queue.push(neighbor);

            }

        }

    }

    return null;

}


/*
   Find every node reachable from Command.
*/

function getReachableFromCommand() {

    const graph = buildGraph();

    const visited = new Set(["COMMAND"]);

    const queue = ["COMMAND"];

    while (queue.length) {

        const current = queue.shift();

        for (const neighbor of graph.get(current) || []) {

            if (!visited.has(neighbor)) {

                visited.add(neighbor);

                queue.push(neighbor);

            }

        }

    }

    return visited;

}


/* ============================================================
   DYNAMIC LINKS
============================================================ */

function renderLinks() {

    linksLayer.innerHTML = "";

    const nodes = getAllNodes();

    let count = 0;

    for (let i = 0; i < nodes.length; i++) {

        for (let j = i + 1; j < nodes.length; j++) {

            const a = nodes[i];
            const b = nodes[j];

            if (!canCommunicate(a, b)) continue;

            const line = createSvgElement("line", {
                x1: a.x,
                y1: a.y,
                x2: b.x,
                y2: b.y
            });

            const failed = isFailed(a, b);

            line.classList.add("network-link");

            if (failed) {

                line.classList.add("failed");

            } else {

                count++;

            }

            line.dataset.a = a.id;
            line.dataset.b = b.id;

            linksLayer.appendChild(line);

        }

    }

    linkCount.textContent = count;

}


/* ============================================================
   NODE RENDERING
============================================================ */

function renderNodes() {

    nodesLayer.innerHTML = "";

    /*
        Command Center
    */

    renderNode(controlCenter);

    /*
        Flood sensor
    */

    renderNode(floodSensor);

    /*
        People
    */

    people.forEach(renderNode);

    updateConnectedCount();

}


function renderNode(node) {

    const group = createSvgElement("g");

    group.classList.add("node");

    if (node.type === "command") {
        group.classList.add("command");
    }

    if (node.type === "sensor") {
        group.classList.add("sensor");
    }

    if (node.type === "person") {

        group.classList.add(
            node.status === "EMERGENCY"
                ? "emergency"
                : node.online
                    ? "active"
                    : "missing"
        );

    }

    if (selectedPerson && node.id === selectedPerson.id) {

        group.classList.add("selected");

    }


    /*
        Selection ring
    */

    const ring = createSvgElement("circle", {
        cx: node.x,
        cy: node.y,
        r: node.type === "command" ? 37 : 25
    });

    ring.classList.add("node-ring");

    group.appendChild(ring);


    /*
        Main circle
    */

    const radius =
        node.type === "command"
            ? 28
            : node.type === "sensor"
                ? 20
                : 16;


    const circle = createSvgElement("circle", {
        cx: node.x,
        cy: node.y,
        r: radius
    });

    circle.classList.add("node-circle");


    /*
        Color
    */

    if (node.type === "command") {

        circle.setAttribute("fill", "#123e58");

    } else if (node.type === "sensor") {

        circle.setAttribute(
            "fill",
            node.active ? "#49286d" : "#20203d"
        );

    } else if (node.status === "EMERGENCY") {

        circle.setAttribute("fill", "#551d25");

    } else if (!node.online) {

        circle.setAttribute("fill", "#49351d");

    } else {

        circle.setAttribute("fill", "#12382f");

    }


    group.appendChild(circle);


    /*
        Center symbol
    */

    const symbol = createSvgElement("text", {
        x: node.x,
        y: node.y + 4,
        "text-anchor": "middle",
        fill: "#ffffff",
        "font-size": node.type === "command" ? "17" : "11",
        "font-weight": "bold"
    });

    symbol.textContent =
        node.type === "command"
            ? "C"
            : node.type === "sensor"
                ? "F"
                : "S";

    group.appendChild(symbol);


    /*
        Name / ID
    */

    const label = createSvgElement("text", {
        x: node.x,
        y: node.y + radius + 15
    });

    label.classList.add("node-label");

    label.textContent =
        node.type === "command"
            ? "MAIN CONTROL"
            : node.type === "sensor"
                ? "FLOOD-01"
                : node.id;

    group.appendChild(label);


    /*
        Status
    */

    if (node.type === "person") {

        const status = createSvgElement("text", {
            x: node.x,
            y: node.y + radius + 26
        });

        status.classList.add("node-status");

        status.textContent =
            node.status === "EMERGENCY"
                ? "EMERGENCY"
                : node.online
                    ? "ACTIVE"
                    : "NO SIGNAL";

        group.appendChild(status);

    }


    /*
        Click
    */

    group.addEventListener("click", event => {

        event.stopPropagation();

        if (node.type === "person") {

            selectPerson(node);

        }

    });


    /*
        Dragging
    */

    group.addEventListener("pointerdown", event => {

        event.stopPropagation();

        if (node.type === "command" || node.type === "sensor") {
            return;
        }

        dragState = {
            node,
            pointerId: event.pointerId
        };

        group.setPointerCapture(event.pointerId);

    });


    group.addEventListener("pointermove", event => {

        if (!dragState || dragState.node !== node) {
            return;
        }

        const point = svgPoint(event);

        node.x = Math.max(
            30,
            Math.min(CONFIG.viewWidth - 30, point.x)
        );

        node.y = Math.max(
            30,
            Math.min(CONFIG.viewHeight - 30, point.y)
        );

        renderAll();

    });


    group.addEventListener("pointerup", event => {

        if (dragState && dragState.node === node) {

            dragState = null;

            logEvent(
                `${node.id} moved — communication topology recalculated.`,
                "packet"
            );

            checkNetworkChanges();

        }

    });


    nodesLayer.appendChild(group);

}


/* ============================================================
   SVG POINTER POSITION
============================================================ */

function svgPoint(event) {

    const rect = svg.getBoundingClientRect();

    return {

        x:
            (event.clientX - rect.left)
            / rect.width
            * CONFIG.viewWidth,

        y:
            (event.clientY - rect.top)
            / rect.height
            * CONFIG.viewHeight

    };

}


/* ============================================================
   SELECTION
============================================================ */

function selectPerson(person) {

    selectedPerson = person;

    renderNodes();

    updateSelectedPanel();

    logEvent(
        `Selected ${person.id} (${person.name}).`,
        "packet"
    );

}


function updateSelectedPanel() {

    if (!selectedPerson) {

        selectedDevice.innerHTML = `
            <p class="muted">
                Click a wearable on the network.
            </p>
        `;

        return;

    }

    const graph = buildGraph();

    const neighbors = graph.get(selectedPerson.id) || [];

    const nearby = people
        .filter(p =>
            p.id !== selectedPerson.id &&
            distance(p, selectedPerson) <= CONFIG.proximityRange
        )
        .sort((a, b) =>
            distance(a, selectedPerson) -
            distance(b, selectedPerson)
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
            <span>Zone</span>
            <strong>${selectedPerson.zone}</strong>
        </div>

        <div class="info-row">
            <span>Status</span>
            <strong>${selectedPerson.status}</strong>
        </div>

        <div class="info-row">
            <span>Network</span>
            <strong>
                ${selectedPerson.online
                    ? "CONNECTED"
                    : "DISCONNECTED"}
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
            ${neighbors.length
                ? neighbors.join(", ")
                : "None"}
        </p>

        <p class="muted">
            Nearby within detection range:
            ${nearby.length
                ? nearby.map(p => `${p.id} (${Math.round(distance(p, selectedPerson))}m)`).join(", ")
                : "None"}
        </p>

    `;

}


/* ============================================================
   PACKET CREATION
============================================================ */

function createPacket(type, source, data = {}) {

    packetSequence++;

    packetsCreated++;

    const packet = {

        id: `PKT-${String(packetSequence).padStart(4, "0")}`,

        type,

        source,

        origin: source,

        timestamp: formatTime(),

        createdAt: simulatedMinutes,

        hops: [],

        verifiedBy: [],

        ...data

    };

    packetHistory.set(packet.id, packet);

    packetCount.textContent = packetsCreated;

    return packet;

}


/* ============================================================
   PACKET VERIFICATION
============================================================ */

function verifyPacket(packet, nodeId) {

    /*
        Prototype verification.

        In a real implementation this would involve
        cryptographic authentication, device credentials,
        signatures, timestamps, etc.

        Here we demonstrate the logic only.
    */

    const validId = Boolean(packet.id);

    const validSource =
        packet.source === "FLOOD-01" ||
        packet.source === "COMMAND" ||
        people.some(p => p.id === packet.source);

    const validTimestamp = Boolean(packet.timestamp);

    const valid = validId && validSource && validTimestamp;

    if (valid) {

        if (!packet.verifiedBy.includes(nodeId)) {

            packet.verifiedBy.push(nodeId);

            verifiedHops++;

            verifiedCount.textContent = verifiedHops;

        }

        logEvent(
            `${nodeId} verified ${packet.id} from ${packet.source}.`,
            "good"
        );

    } else {

        logEvent(
            `${nodeId} rejected invalid packet ${packet.id}.`,
            "danger"
        );

    }

    return valid;

}


/* ============================================================
   PACKET INSPECTOR
============================================================ */

function inspectPacket(packet) {

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
                    ? packet.verifiedBy.join(" → ")
                    : "Not verified"
            }
        </p>

    `;

}


/* ============================================================
   ROUTE PACKET
============================================================ */

async function routePacket(packet, route) {

    if (!route || route.length < 1) {

        logEvent(
            `${packet.id} has no available route.`,
            "danger"
        );

        return false;

    }


    packet.hops = [];

    for (let i = 0; i < route.length; i++) {

        const nodeId = route[i];

        packet.hops.push(nodeId);

        /*
            Receiving node verifies packet.
        */

        if (i > 0) {

            const previous = route[i - 1];

            logEvent(
                `${previous} → ${nodeId}: ${packet.id} received.`,
                "packet"
            );

            const valid = verifyPacket(packet, nodeId);

            if (!valid) {
                return false;
            }

        } else {

            /*
                Source verifies/creates packet.
            */

            verifyPacket(packet, nodeId);

        }


        /*
            Animate actual edge.
        */

        if (i < route.length - 1) {

            const next = route[i + 1];

            await animatePacketHop(
                packet,
                nodeId,
                next
            );

        }

    }


    logEvent(
        `${packet.id} reached ${route[route.length - 1]} via ${route.join(" → ")}.`,
        "good"
    );

    inspectPacket(packet);

    return true;

}


/* ============================================================
   PACKET ANIMATION
============================================================ */

function animatePacketHop(packet, fromId, toId) {

    return new Promise(resolve => {

        const from = getNodeById(fromId);

        const to = getNodeById(toId);

        if (!from || !to) {

            resolve();

            return;

        }


        const group = createSvgElement("g");

        group.classList.add("packet");

        const glow = createSvgElement("circle", {
            cx: from.x,
            cy: from.y,
            r: 8
        });

        glow.classList.add("packet-glow");


        const core = createSvgElement("circle", {
            cx: from.x,
            cy: from.y,
            r: 3
        });

        core.classList.add("packet-core");

        group.appendChild(glow);

        group.appendChild(core);

        packetsLayer.appendChild(group);

        activePackets.add(packet.id);


        const start = performance.now();

        const duration = CONFIG.animationDuration;

        function frame(now) {

            const progress =
                Math.min(
                    1,
                    (now - start) / duration
                );

            const x =
                from.x +
                (to.x - from.x) * progress;

            const y =
                from.y +
                (to.y - from.y) * progress;

            glow.setAttribute("cx", x);
            glow.setAttribute("cy", y);

            core.setAttribute("cx", x);
            core.setAttribute("cy", y);

            if (progress < 1) {

                requestAnimationFrame(frame);

            } else {

                group.remove();

                activePackets.delete(packet.id);

                resolve();

            }

        }

        requestAnimationFrame(frame);

    });

}


/* ============================================================
   NODE LOOKUP
============================================================ */

function getNodeById(id) {

    if (id === "COMMAND") return controlCenter;

    if (id === "FLOOD-01") return floodSensor;

    return getPerson(id);

}


/* ============================================================
   STATUS PACKET
============================================================ */

async function sendStatus(person) {

    if (!person.online) {

        logEvent(
            `${person.id} cannot send status — device is offline/disconnected.`,
            "warning"
        );

        return false;

    }


    const packet = createPacket(
        "STATUS",
        person.id,
        {

            heartbeat: person.hr,

            location: {
                zone: person.zone,
                x: Math.round(person.x),
                y: Math.round(person.y)
            },

            status: person.status,

            timestamp: formatTime()

        }
    );


    logEvent(
        `${person.id} created ${packet.id} — heartbeat ${person.hr} BPM.`,
        "packet"
    );


    /*
        Status begins at the wearable and must find
        a multi-hop route to Command.
    */

    const route = findRoute(
        person.id,
        "COMMAND"
    );


    if (!route) {

        logEvent(
            `${person.id}: no route to MAIN CONTROL. Status remains local.`,
            "danger"
        );

        person.lastSignal = simulatedMinutes;

        return false;

    }


    const delivered = await routePacket(
        packet,
        route
    );


    if (delivered) {

        person.lastSignal = simulatedMinutes;

        logEvent(
            `${person.id} status accounted at MAIN CONTROL.`,
            "good"
        );

    }


    return delivered;

}


/* ============================================================
   +3 MIN STATUS CYCLE
============================================================ */

async function statusCycle() {

    simulatedMinutes += CONFIG.statusInterval;

    simTime.textContent = formatTime();

    logEvent(
        `━━━ ${formatTime()} — 3-MINUTE STATUS CYCLE ━━━`,
        "packet"
    );


    /*
        Every online person sends a status.
    */

    const activePeople = people.filter(
        p => p.online
    );


    networkMessage.textContent =
        `Status cycle ${formatTime()} — ${activePeople.length}/${people.length} devices attempting transmission.`;


    /*
        Send sequentially so the event log and packet
        animation are readable during demonstration.
    */

    for (const person of activePeople) {

        await sendStatus(person);

    }


    /*
        Check people that missed the cycle.
    */

    people.forEach(person => {

        if (
            simulatedMinutes -
            person.lastSignal >=
            CONFIG.noSignalAfter
        ) {

            if (person.online) {

                person.online = false;

                person.status = "NO SIGNAL";

                logEvent(
                    `${person.id} has no recent status signal.`,
                    "warning"
                );

            }

        }

    });


    updatePopulation();

    renderAll();

    runAI();

}


/* ============================================================
   ALIVE BEACON
============================================================ */

async function sendAlive(person = selectedPerson) {

    if (!person) {

        alert("Select a wearable first.");

        return;

    }


    if (!person.online) {

        logEvent(
            `${person.id} cannot send ALIVE beacon — device offline.`,
            "danger"
        );

        return;

    }


    const packet = createPacket(
        "ALIVE",
        person.id,
        {

            location: {
                zone: person.zone,
                x: Math.round(person.x),
                y: Math.round(person.y)
            }

        }
    );


    const route = findRoute(
        person.id,
        "COMMAND"
    );


    if (!route) {

        logEvent(
            `${packet.id}: no mesh route to Command.`,
            "danger"
        );

        return;

    }


    await routePacket(
        packet,
        route
    );


    person.lastSignal = simulatedMinutes;

    logEvent(
        `${person.id} ALIVE beacon registered.`,
        "good"
    );

    updatePopulation();

}


/* ============================================================
   EMERGENCY PACKET
============================================================ */

async function triggerEmergency() {

    const person = selectedPerson ||
        people.find(p => p.online);


    if (!person) {

        alert("Select a wearable first.");

        return;

    }


    if (!person.online) {

        alert("This wearable is currently offline.");

        return;

    }


    person.status = "EMERGENCY";


    const packet = createPacket(
        "EMERGENCY",
        person.id,
        {

            heartbeat: person.hr,

            location: {
                zone: person.zone,
                x: Math.round(person.x),
                y: Math.round(person.y)
            },

            status: "EMERGENCY"

        }
    );


    logEvent(
        `🚨 ${person.id} created EMERGENCY packet ${packet.id}.`,
        "danger"
    );


    const route = findRoute(
        person.id,
        "COMMAND"
    );


    if (!route) {

        logEvent(
            `🚨 ${person.id}: emergency packet has NO ROUTE to Command.`,
            "danger"
        );

        updatePopulation();

        renderAll();

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


    updatePopulation();

    renderAll();

    runAI();

}


/* ============================================================
   SEARCH MISSING NODE
============================================================ */

async function searchSelectedNode() {

    if (!selectedPerson) {

        alert("Select a wearable first.");

        return;

    }


    const target = selectedPerson;


    searchSequence++;


    activeSearch = {

        id: `SEARCH-${String(searchSequence).padStart(3, "0")}`,

        target: target.id,

        contacted: new Set(),

        observations: []

    };


    logEvent(
        `SEARCH REQUEST ${activeSearch.id} initiated for ${target.id}.`,
        "search"
    );


    /*
        Search request is broadcast through every reachable
        mesh node.

        It is NOT sent directly to the target.
    */

    const reachable = getReachableFromCommand();


    reachable.delete("COMMAND");


    searchInfo.innerHTML = `
        <div class="info-row">
            <span>Request</span>
            <strong>${activeSearch.id}</strong>
        </div>

        <div class="info-row">
            <span>Target</span>
            <strong>${target.id}</strong>
        </div>

        <div class="info-row">
            <span>Nodes contacted</span>
            <strong>${reachable.size}</strong>
        </div>

        <p class="muted">
            Search request propagated through reachable mesh.
        </p>
    `;


    /*
        Animate search packets from Command to each
        reachable node using actual routes.
    */

    for (const nodeId of reachable) {

        activeSearch.contacted.add(nodeId);

        const route = findRoute(
            "COMMAND",
            nodeId
        );

        if (route) {

            const packet = createPacket(
                "SEARCH",
                "COMMAND",
                {
                    target: target.id
                }
            );

            await routePacket(
                packet,
                route
            );

        }

    }


    /*
        Nodes now check whether they can detect the target.
    */

    for (const observer of people) {

        if (!observer.online) continue;

        if (!reachable.has(observer.id)) continue;

        if (observer.id === target.id) continue;


        const d = distance(
            observer,
            target
        );


        /*
            Proximity detection can work farther than
            normal communication.
        */

        if (d <= CONFIG.proximityRange) {

            await createObservation(
                observer,
                target,
                d
            );

        }

    }


    updateSearchPanel();

}


/* ============================================================
   PROXIMITY OBSERVATION
============================================================ */

async function createObservation(
    observer,
    target,
    distanceValue
) {

    if (!observations[target.id]) {

        observations[target.id] = [];

    }


    const observation = {

        observer: observer.id,

        target: target.id,

        distance: Math.round(distanceValue),

        timestamp: formatTime(),

        source: "PROXIMITY"

    };


    observations[target.id].push(
        observation
    );


    /*
        Observation itself becomes a packet.
    */

    const packet = createPacket(
        "OBSERVATION",
        observer.id,
        {

            target: target.id,

            approximateDistance:
                Math.round(distanceValue),

            observationTime:
                formatTime()

        }
    );


    logEvent(
        `${observer.id} detected ${target.id} approximately ${Math.round(distanceValue)}m away.`,
        "search"
    );


    /*
        Observer sends observation through the mesh
        back to Command.
    */

    const route = findRoute(
        observer.id,
        "COMMAND"
    );


    if (route) {

        await routePacket(
            packet,
            route
        );


        logEvent(
            `MAIN CONTROL received observation of ${target.id} from ${observer.id}.`,
            "search"
        );

    } else {

        logEvent(
            `${observer.id} detected ${target.id}, but could not report to Command.`,
            "warning"
        );

    }


    updateSearchPanel();

}


/* ============================================================
   SEARCH PANEL
============================================================ */

function updateSearchPanel() {

    if (!activeSearch) {

        searchInfo.innerHTML = `
            <p class="muted">
                No active search.
            </p>
        `;

        return;

    }


    const target = activeSearch.target;

    const targetPerson = getPerson(target);

    const list =
        observations[target] || [];


    let confidence = "UNKNOWN";

    if (list.length === 1) {

        confidence = "SINGLE REPORT";

    } else if (list.length >= 2) {

        confidence = "MULTIPLE OBSERVATIONS";

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
            <span>Target status</span>
            <strong>${targetPerson.status}</strong>
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
                ? list.map(o => `
                    <div class="info-row">
                        <span>${o.observer}</span>
                        <strong>
                            ~${o.distance}m
                        </strong>
                    </div>
                `).join("")
                : `<p class="muted">No observations received.</p>`
        }

        <p class="muted">
            Prototype verification only — not a real identity guarantee.
        </p>
    `;

}


/* ============================================================
   BREAK RANDOM LINK
============================================================ */

function breakRandomLink() {

    const nodes = getAllNodes();

    const possible = [];


    for (let i = 0; i < nodes.length; i++) {

        for (let j = i + 1; j < nodes.length; j++) {

            const a = nodes[i];
            const b = nodes[j];

            if (
                canCommunicate(a, b) &&
                !isFailed(a, b)
            ) {

                possible.push(
                    [a, b]
                );

            }

        }

    }


    if (!possible.length) {

        logEvent(
            "No active links available to break.",
            "warning"
        );

        return;

    }


    const [
        a,
        b
    ] =
        possible[
            Math.floor(
                Math.random() *
                possible.length
            )
        ];


    failedLinks.add(
        edgeKey(a.id, b.id)
    );


    logEvent(
        `LINK FAILURE: ${a.id} ↔ ${b.id}`,
        "danger"
    );


    routingDisplay.textContent =
        "Routing: RECALCULATING";

    renderAll();


    /*
        Test whether Command still has access
        to the network.
    */

    setTimeout(() => {

        const reachable =
            getReachableFromCommand();

        routingDisplay.textContent =
            `Routing: ${reachable.size}/${people.length + 1} reachable`;

        logEvent(
            `Mesh routing recalculated — alternate paths available where possible.`,
            "packet"
        );

    }, 300);

}


/* ============================================================
   RESTORE LINKS
============================================================ */

function restoreLinks() {

    failedLinks.clear();

    logEvent(
        "All simulated link failures restored.",
        "good"
    );

    routingDisplay.textContent =
        "Routing: READY";

    renderAll();

}


/* ============================================================
   DISASTER MODE
============================================================ */

function activateDisasterMode() {

    disasterMode = !disasterMode;


    if (disasterMode) {

        internetStatus.textContent =
            "● CELLULAR / INTERNET OFFLINE";

        internetStatus.classList.remove("online");

        internetStatus.classList.add("offline");

        document.getElementById("disasterBtn").textContent =
            "DISASTER MODE ACTIVE";

        networkMessage.textContent =
            "Infrastructure failure detected — Sentinel mesh operating independently.";

        logEvent(
            "⚠ DISASTER MODE: cellular/internet infrastructure unavailable.",
            "danger"
        );

        logEvent(
            "SentinelNet mesh remains active using wearable-to-wearable communication.",
            "good"
        );

        aiStatus.textContent =
            "Offline AI active.";

        aiMessage.textContent =
            "Infrastructure is unavailable. SentinelNet is using local mesh communication and stored emergency guidance.";

    } else {

        internetStatus.textContent =
            "● CELLULAR / INTERNET ONLINE";

        internetStatus.classList.remove("offline");

        internetStatus.classList.add("online");

        document.getElementById("disasterBtn").textContent =
            "ACTIVATE DISASTER MODE";

        networkMessage.textContent =
            "Infrastructure restored.";

        logEvent(
            "Cellular/internet connectivity restored.",
            "good"
        );

    }

}


/* ============================================================
   FLOOD SENSOR
============================================================ */

async function activateFloodSensor() {

    floodSensor.active =
        !floodSensor.active;


    if (floodSensor.active) {

        floodStatus.textContent =
            "HIGH WATER";

        floodStatus.classList.add("danger");

        logEvent(
            "FLOOD-01 detected dangerous water level.",
            "danger"
        );


        const packet = createPacket(
            "HAZARD",
            "FLOOD-01",
            {

                hazard: "FLOOD",

                level: "HIGH",

                location: "South Sector",

                guidance:
                    "Dangerous water detected ahead. Avoid this route."

            }
        );


        /*
            Hazard packet routes from the sensor
            through nearby wearable nodes.
        */

        const nearby = people
            .filter(
                p =>
                    p.online &&
                    distance(
                        floodSensor,
                        p
                    ) <=
                    CONFIG.communicationRange
            );


        for (const person of nearby) {

            logEvent(
                `FLOOD-01 → ${person.id}: hazard detected.`,
                "danger"
            );

        }


        /*
            Route to Command.
        */

        const route =
            findRoute(
                "FLOOD-01",
                "COMMAND"
            );


        if (route) {

            await routePacket(
                packet,
                route
            );

            logEvent(
                "MAIN CONTROL received flood hazard report.",
                "danger"
            );

        } else {

            logEvent(
                "Flood sensor cannot currently reach Command.",
                "warning"
            );

        }


        runAI();


    } else {

        floodStatus.textContent =
            "NORMAL";

        floodStatus.classList.remove("danger");

        logEvent(
            "FLOOD-01 returned to normal.",
            "good"
        );

        runAI();

    }


    renderAll();

}


/* ============================================================
   OFFLINE AI
============================================================ */

function runAI() {

    if (floodSensor.active) {

        aiStatus.textContent =
            "⚠ HAZARD DETECTED";

        aiMessage.textContent =
            "Dangerous water detected ahead. Avoid this route. Move toward higher ground if safe.";

        aiMessage.classList.add("warning");

        return;

    }


    const emergency =
        people.find(
            p => p.status === "EMERGENCY"
        );


    if (emergency) {

        aiStatus.textContent =
            "⚠ EMERGENCY GUIDANCE";

        aiMessage.textContent =
            `${emergency.id} has reported an emergency. Maintain communication through the mesh and move toward the nearest safe area if possible.`;

        aiMessage.classList.add("danger");

        return;

    }


    aiStatus.textContent =
        "Monitoring network...";

    aiMessage.textContent =
        "No active hazard detected.";

    aiMessage.classList.remove(
        "warning",
        "danger"
    );

}


/* ============================================================
   POPULATION ACCOUNTABILITY
============================================================ */

function updatePopulation() {

    totalPeople.textContent =
        people.length;


    const accounted =
        people.filter(
            p =>
                p.online &&
                p.lastSignal === simulatedMinutes
        ).length;


    const emergency =
        people.filter(
            p =>
                p.status === "EMERGENCY"
        ).length;


    const missing =
        people.filter(
            p =>
                !p.online
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

    const graph =
        buildGraph();


    const reachable =
        getReachableFromCommand();


    connectedCount.textContent =
        Math.max(
            0,
            reachable.size - 1
        );

}


/* ============================================================
   NETWORK CHANGE CHECK
============================================================ */

function checkNetworkChanges() {

    const reachable =
        getReachableFromCommand();


    people.forEach(person => {

        if (
            person.online &&
            !reachable.has(person.id)
        ) {

            logEvent(
                `${person.id} is physically disconnected from the Command mesh.`,
                "warning"
            );

        }

    });


    updateConnectedCount();

}


/* ============================================================
   RENDER EVERYTHING
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
    .getElementById("disasterBtn")
    .addEventListener(
        "click",
        activateDisasterMode
    );


document
    .getElementById("threeMinBtn")
    .addEventListener(
        "click",
        statusCycle
    );


document
    .getElementById("emergencyBtn")
    .addEventListener(
        "click",
        triggerEmergency
    );


document
    .getElementById("searchBtn")
    .addEventListener(
        "click",
        searchSelectedNode
    );


document
    .getElementById("aliveBtn")
    .addEventListener(
        "click",
        () => sendAlive()
    );


document
    .getElementById("breakBtn")
    .addEventListener(
        "click",
        breakRandomLink
    );


document
    .getElementById("restoreBtn")
    .addEventListener(
        "click",
        restoreLinks
    );


document
    .getElementById("floodBtn")
    .addEventListener(
        "click",
        activateFloodSensor
    );


/* ============================================================
   BACKGROUND CLICK
============================================================ */

svg.addEventListener(
    "click",
    () => {

        selectedPerson = null;

        renderAll();

    }
);


/* ============================================================
   INITIALIZATION
============================================================ */

people.forEach(person => {

    person.type = "person";

    /*
        Give everyone a starting signal so the population
        is initially accounted for.
    */

    person.lastSignal = 0;

});


logEvent(
    "SentinelNet simulation initialized.",
    "good"
);

logEvent(
    "15 wearable nodes registered.",
    "packet"
);

logEvent(
    "Each wearable can act as sender, receiver, verifier and relay.",
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
    "Drag a wearable to change communication topology.",
    "packet"
);

logEvent(
    "Press +3 MIN to initiate the network-wide status cycle.",
    "packet"
);


simTime.textContent =
    formatTime();


document.getElementById("rangeDisplay").textContent =
    `${CONFIG.communicationRange} m`;


renderAll();

runAI();


/* ============================================================
   DEMONSTRATION HELPER
============================================================ */

/*
   The following makes the initial network easier to understand.
   It does not create direct Command → every-person links.

   The user can drag nodes and observe topology changes.
*/


setTimeout(() => {

    checkNetworkChanges();

}, 500);
