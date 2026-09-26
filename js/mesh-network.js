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
const assistancePeople = document.getElementById("assistancePeople");
const emergencyPeople = document.getElementById("emergencyPeople");
const unresolvedPeople = document.getElementById("unresolvedPeople");
const statusGapCount = document.getElementById("statusGapCount");
const priorityGapCount = document.getElementById("priorityGapCount");
const gapPriority = document.getElementById("gapPriority");
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
const disasterInfo = document.getElementById("disasterInfo");
const hazardStatus = document.getElementById("hazardStatus");
const sensorName = document.getElementById("sensorName");
const sensorDescription = document.getElementById("sensorDescription");
const disasterType = document.getElementById("disasterType");
const disasterBlock = document.getElementById("disasterBlock");

const controlCenter = {
    id: "COMMAND",
    name: "MAIN CONTROL",
    x: 500,
    y: 350,
    type: "command"
};

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

const people = [
    { id: "SN-001", name: "Maria", x: 155, y: 145, hr: 78, zone: "Block A", status: "ACCOUNTED" },
    { id: "SN-002", name: "Juan", x: 285, y: 105, hr: 82, zone: "Block A", status: "ACCOUNTED" },
    { id: "SN-003", name: "Ana", x: 435, y: 95, hr: 76, zone: "Block A", status: "ACCOUNTED" },
    { id: "SN-004", name: "Carlo", x: 595, y: 115, hr: 81, zone: "Block B", status: "ACCOUNTED" },
    { id: "SN-005", name: "Liza", x: 750, y: 155, hr: 79, zone: "Block B", status: "ACCOUNTED" },
    { id: "SN-006", name: "Mark", x: 855, y: 275, hr: 83, zone: "Block B", status: "ACCOUNTED" },
    { id: "SN-007", name: "Sofia", x: 850, y: 440, hr: 77, zone: "Block C", status: "ACCOUNTED" },
    { id: "SN-008", name: "David", x: 745, y: 550, hr: 80, zone: "Block C", status: "ACCOUNTED" },
    { id: "SN-009", name: "Ella", x: 595, y: 585, hr: 75, zone: "Block C", status: "ACCOUNTED" },
    { id: "SN-010", name: "Ryan", x: 430, y: 580, hr: 79, zone: "Block D", status: "ACCOUNTED" },
    { id: "SN-011", name: "Nina", x: 275, y: 535, hr: 84, zone: "Block D", status: "ACCOUNTED" },
    { id: "SN-012", name: "Leo", x: 145, y: 430, hr: 78, zone: "Block D", status: "ACCOUNTED" },
    { id: "SN-013", name: "Kate", x: 120, y: 275, hr: 81, zone: "Block A", status: "ACCOUNTED" },
    { id: "SN-014", name: "Alex", x: 340, y: 315, hr: 79, zone: "Block A", status: "ACCOUNTED" },
    { id: "SN-015", name: "Bea", x: 670, y: 330, hr: 82, zone: "Block C", status: "ACCOUNTED" }
];

people.forEach(person => {
    person.type = "person";
    person.online = true;
    person.commandIsolated = false;
    person.lastCommandResponse = 0;
    person.lastKnownAlive = true;
    person.signalState = "ACTIVE";
    person.lastKnownLocation = {
        zone: person.zone,
        x: person.x,
        y: person.y
    };
    person.lastKnownStatus = "ACCOUNTED";
    person.nearbyHistory = [];
    person.knownAlive = new Set([person.id]);

    person.evidence = {
        lastBeacon: 0,
        lastDetection: null,
        lastDetectionBy: null,
        lastLocation: {
            zone: person.zone,
            x: person.x,
            y: person.y
        },
        emergencyReport: false,
        hazardExposure: "LOW",
        movement: "NORMAL",
        heartRate: person.hr,
        shelterCheckIn: false,
        verificationCount: 0,
        confidence: 100
    };
});

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

function logEvent(message, type = "") {
    const item = document.createElement("div");

    item.className = `event ${type}`;

    item.innerHTML = `
        <span class="event-time">
            ${formatTime()}
        </span>
        ${message}
    `;

    eventLog.prepend(item);

    while (eventLog.children.length > CONFIG.maxEventLog) {
        eventLog.removeChild(eventLog.lastChild);
    }
}

function canCommunicate(a, b) {
    return distance(a, b) <= CONFIG.communicationRange;
}

function isFailed(a, b) {
    return failedLinks.has(edgeKey(a.id, b.id));
}

function buildGraph(commandView = false) {
    const nodes = getAllNodes();
    const graph = new Map();

    nodes.forEach(node => {
        graph.set(node.id, []);
    });

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];

            if (a.type === "person" && !a.online) {
                continue;
            }

            if (b.type === "person" && !b.online) {
                continue;
            }

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
                graph.get(a.id).push(b.id);
                graph.get(b.id).push(a.id);
            }
        }
    }

    return graph;
}

function findRoute(sourceId, targetId, commandView = false) {
    const graph = buildGraph(commandView);

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

        for (const neighbor of graph.get(current) || []) {
            if (!previous.has(neighbor)) {
                previous.set(neighbor, current);
                queue.push(neighbor);
            }
        }
    }

    return null;
}

function getReachableFromCommand() {
    const graph = buildGraph(true);
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

function renderLinks() {
    linksLayer.innerHTML = "";

    const nodes = getAllNodes();
    let count = 0;

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];

            if (!canCommunicate(a, b)) {
                continue;
            }

            const line = createSvgElement("line", {
                x1: a.x,
                y1: a.y,
                x2: b.x,
                y2: b.y
            });

            line.classList.add("network-link");

            if (isFailed(a, b)) {
                line.classList.add("failed");
            } else {
                count++;
            }

            if (
                selectedPerson &&
                (
                    a.id === selectedPerson.id ||
                    b.id === selectedPerson.id
                )
            ) {
                line.classList.add("selected-link");
            }

            line.dataset.a = a.id;
            line.dataset.b = b.id;

            linksLayer.appendChild(line);
        }
    }

    linkCount.textContent = count;
}

function getNodeVisualStatus(person) {
    if (person.status === "EMERGENCY") {
        return "emergency";
    }

    if (person.status === "ASSISTANCE_REQUESTED") {
        return "assistance";
    }

    if (person.status === "UNRESOLVED") {
        return "unresolved";
    }

    return "active";
}

function renderNodes() {
    nodesLayer.innerHTML = "";

    if (!controlCenter) {
        return;
    }

    renderNode(controlCenter);

    if (hazardSensor) {
        renderNode(hazardSensor);
    }

    people.forEach(person => {
        if (person) {
            renderNode(person);
        }
    });

    updateConnectedCount();
}

function renderNode(node) {
    if (!node || !nodesLayer) {
        return;
    }

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
            getNodeVisualStatus(node)
        );

        if (node.commandIsolated) {
            group.classList.add("isolated");
        }

        if (
            selectedPerson &&
            node.id === selectedPerson.id
        ) {
            group.classList.add("selected");
        }
    }

    if (
        node.type === "command" &&
        selectedPerson === null
    ) {
        group.classList.add("command");
    }

    const ringRadius =
        node.type === "command"
            ? 37
            : node.type === "sensor"
                ? 27
                : 25;

    const ring = createSvgElement(
        "circle",
        {
            cx: node.x,
            cy: node.y,
            r: ringRadius
        }
    );

    ring.classList.add("node-ring");

    group.appendChild(ring);

    const radius =
        node.type === "command"
            ? 28
            : node.type === "sensor"
                ? 20
                : 16;

    const circle = createSvgElement(
        "circle",
        {
            cx: node.x,
            cy: node.y,
            r: radius
        }
    );

    circle.classList.add("node-circle");

    if (node.type === "command") {
        circle.setAttribute(
            "fill",
            "#123e58"
        );
    } else if (node.type === "sensor") {
        circle.setAttribute(
            "fill",
            node.active
                ? "#49286d"
                : "#20203d"
        );
    } else if (
        node.status === "EMERGENCY"
    ) {
        circle.setAttribute(
            "fill",
            "#551d25"
        );
    } else if (
        node.status === "ASSISTANCE_REQUESTED"
    ) {
        circle.setAttribute(
            "fill",
            "#4b3a1d"
        );
    } else if (
        node.status === "UNRESOLVED"
    ) {
        circle.setAttribute(
            "fill",
            "#49351d"
        );
    } else {
        circle.setAttribute(
            "fill",
            "#12382f"
        );
    }

    group.appendChild(circle);

    const symbol = createSvgElement(
        "text",
        {
            x: node.x,
            y: node.y + 5,
            "text-anchor": "middle",
            fill: "#ffffff",
            "font-size":
                node.type === "command"
                    ? "17"
                    : node.type === "sensor"
                        ? "11"
                        : "11",
            "font-weight": "bold",
            "pointer-events": "none"
        }
    );

    symbol.textContent =
        node.type === "command"
            ? "C"
            : node.type === "sensor"
                ? "H"
                : "S";

    group.appendChild(symbol);

    const label = createSvgElement(
        "text",
        {
            x: node.x,
            y: node.y + radius + 15
        }
    );

    label.classList.add("node-label");

    label.textContent =
        node.type === "command"
            ? "MAIN CONTROL"
            : node.type === "sensor"
                ? "HAZARD-01"
                : node.id;

    group.appendChild(label);

    if (node.type === "person") {
        const status = createSvgElement(
            "text",
            {
                x: node.x,
                y: node.y + radius + 26
            }
        );

        status.classList.add(
            "node-status"
        );

        if (
            node.status === "EMERGENCY"
        ) {
            status.textContent =
                "EMERGENCY";
        } else if (
            node.status ===
            "ASSISTANCE_REQUESTED"
        ) {
            status.textContent =
                "ASSISTANCE";
        } else if (
            node.status === "UNRESOLVED"
        ) {
            status.textContent =
                "UNRESOLVED";
        } else if (
            node.commandIsolated
        ) {
            status.textContent =
                "COMMAND CUT";
        } else {
            status.textContent =
                "ACCOUNTED";
        }

        group.appendChild(status);

        const location =
            createSvgElement(
                "text",
                {
                    x: node.x,
                    y: node.y + radius + 37
                }
            );

        location.classList.add(
            "node-location"
        );

        location.textContent =
            node.zone;

        group.appendChild(location);
    }

    if (node.type === "person") {
        group.addEventListener(
            "click",
            event => {
                event.stopPropagation();
                selectPerson(node);
            }
        );

        group.addEventListener(
            "pointerdown",
            event => {
                event.stopPropagation();

                dragState = {
                    node,
                    pointerId:
                        event.pointerId
                };

                if (
                    typeof group.setPointerCapture ===
                    "function"
                ) {
                    group.setPointerCapture(
                        event.pointerId
                    );
                }
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

                node.x = Math.max(
                    30,
                    Math.min(
                        CONFIG.viewWidth - 30,
                        point.x
                    )
                );

                node.y = Math.max(
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

        group.addEventListener(
            "pointercancel",
            () => {
                if (
                    dragState &&
                    dragState.node === node
                ) {
                    dragState = null;
                }
            }
        );
    }

    nodesLayer.appendChild(group);
}
function renderAll() {
    if (!svg || !nodesLayer || !linksLayer) {
        return;
    }

    renderLinks();
    renderNodes();
    updateSelectedPanel();
    updatePopulation();
    updateConnectedCount();
}
function updatePersonLocation(person) {
    person.lastKnownLocation = {
        zone: person.zone,
        x: Math.round(person.x),
        y: Math.round(person.y)
    };

    person.evidence.lastLocation = {
        zone: person.zone,
        x: Math.round(person.x),
        y: Math.round(person.y)
    };

    const nearby = people
        .filter(
            p =>
                p.id !== person.id &&
                distance(p, person) <= CONFIG.proximityRange
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
                distance: Math.round(
                    distance(p, person)
                )
            })
        );

    person.nearbyHistory.push({
        time: formatTime(),
        nearby
    });

    if (person.nearbyHistory.length > 10) {
        person.nearbyHistory.shift();
    }
}

function maybeMovePeople() {
    people.forEach(person => {
        if (!person.online) {
            return;
        }

        if (Math.random() > 0.35) {
            person.evidence.movement = "STATIONARY";
            return;
        }

        const movement =
            12 + Math.random() * 22;

        const angle =
            Math.random() *
            Math.PI *
            2;

        person.x = Math.max(
            35,
            Math.min(
                CONFIG.viewWidth - 35,
                person.x +
                Math.cos(angle) *
                movement
            )
        );

        person.y = Math.max(
            35,
            Math.min(
                CONFIG.viewHeight - 50,
                person.y +
                Math.sin(angle) *
                movement
            )
        );

        person.evidence.movement = "MOVING";

        updatePersonLocation(person);
    });
}

function svgPoint(event) {
    const rect = svg.getBoundingClientRect();

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

function selectPerson(person) {
    selectedPerson = person;

    renderNodes();
    updateSelectedPanel();
    updateSearchPanel();
    runAI();

    logEvent(
        `Selected ${person.id} (${person.name}).`,
        "packet"
    );
}

function getStatusTag(status) {
    if (status === "EMERGENCY") {
        return `<span class="tag danger">EMERGENCY</span>`;
    }

    if (status === "ASSISTANCE_REQUESTED") {
        return `<span class="tag warning">ASSISTANCE REQUESTED</span>`;
    }

    if (status === "UNRESOLVED") {
        return `<span class="tag unresolved">UNRESOLVED</span>`;
    }

    return `<span class="tag good">ACCOUNTED</span>`;
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

    const graph = buildGraph(false);

    const neighbors =
        graph.get(selectedPerson.id) || [];

    const nearby = people
        .filter(
            p =>
                p.id !== selectedPerson.id &&
                distance(
                    p,
                    selectedPerson
                ) <= CONFIG.proximityRange
        )
        .sort(
            (a, b) =>
                distance(a, selectedPerson) -
                distance(b, selectedPerson)
        );

    const lastLocation =
        selectedPerson.lastKnownLocation;

    const aliveList =
        [...selectedPerson.knownAlive]
            .filter(
                id =>
                    id !== selectedPerson.id
            );

    const evidence =
        selectedPerson.evidence;

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
            <span>Signal</span>
            <strong>${selectedPerson.signalState}</strong>
        </div>

        <div class="info-row">
            <span>Status</span>
            <strong>${getStatusTag(selectedPerson.status)}</strong>
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

        <div class="info-row">
            <span>Last detection</span>
            <strong>
                ${
                    evidence.lastDetectionBy
                        ? evidence.lastDetectionBy
                        : "NONE"
                }
            </strong>
        </div>

        <div class="info-row">
            <span>Movement</span>
            <strong>${evidence.movement}</strong>
        </div>

        <div class="info-row">
            <span>Hazard exposure</span>
            <strong>${evidence.hazardExposure}</strong>
        </div>

        <div class="info-row">
            <span>Evidence confidence</span>
            <strong>${evidence.confidence}%</strong>
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

function createPacket(type, source, data = {}) {
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

function verifyPacket(packet, nodeId) {
    const validId =
        Boolean(packet.id);

    const validSource =
        packet.source === "COMMAND" ||
        packet.source === "HAZARD-01" ||
        people.some(
            p =>
                p.id ===
                packet.source
        );

    const validTimestamp =
        Boolean(packet.timestamp);

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
        packet.verifiedBy.push(nodeId);
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

        if (i === 0) {
            verifyPacket(
                packet,
                nodeId
            );
        } else {
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

    inspectPacket(packet);

    return true;
}

function animatePacketHop(packet, fromId, toId) {
    return new Promise(resolve => {
        const from =
            getNodeById(fromId);

        const to =
            getNodeById(toId);

        if (!from || !to) {
            resolve();
            return;
        }

        const group =
            createSvgElement("g");

        group.classList.add("packet");

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

        group.appendChild(glow);
        group.appendChild(core);

        packetsLayer.appendChild(group);

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
            } else {
                group.remove();
                resolve();
            }
        }

        requestAnimationFrame(
            frame
        );
    });
}

function updateEvidenceFromStatus(person) {
    person.evidence.heartRate =
        person.hr;

    person.evidence.lastLocation = {
        zone: person.zone,
        x: Math.round(person.x),
        y: Math.round(person.y)
    };

    person.evidence.lastBeacon =
        simulatedMinutes;

    person.signalState =
        "ACTIVE";

    person.lastKnownAlive =
        true;

    person.lastKnownStatus =
        person.status;

    person.lastKnownLocation = {
        zone: person.zone,
        x: Math.round(person.x),
        y: Math.round(person.y)
    };
}

async function sendStatusResponse(person, requestId) {
    if (!person.online) {
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

    const route =
        findRoute(
            person.id,
            "COMMAND",
            true
        );

    if (!route) {
        person.signalState =
            "NO_SIGNAL";

        logEvent(
            `${person.id}: STATUS RESPONSE cannot reach Command. Current status becomes an unresolved information gap.`,
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

    if (delivered) {
        person.lastCommandResponse =
            simulatedMinutes;

        updateEvidenceFromStatus(
            person
        );

        if (
            person.status ===
            "UNRESOLVED"
        ) {
            person.status =
                "ACCOUNTED";
        }

        person.evidence.verificationCount++;

        person.evidence.confidence =
            calculateEvidenceConfidence(
                person
            );

        logEvent(
            `${person.id} is ACCOUNTED at MAIN CONTROL with current evidence.`,
            "good"
        );
    }

    return delivered;
}

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

        if (!route) {
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

    people.forEach(person => {
        if (
            !received.has(
                person.id
            )
        ) {
            person.signalState =
                "NO_SIGNAL";

            if (
                person.status !==
                "EMERGENCY"
            ) {
                person.status =
                    "UNRESOLVED";
            }

            person.evidence.confidence =
                calculateEvidenceConfidence(
                    person
                );

            logEvent(
                `${person.id}: NO RESPONSE — status gap recorded. Existing evidence retained; condition remains unresolved.`,
                "warning"
            );
        }
    });

    updatePopulation();
    renderAll();
    runAI();
}

async function statusCycle() {
    simulatedMinutes +=
        CONFIG.statusInterval;

    simTime.textContent =
        formatTime();

    logEvent(
        `━━━ ${formatTime()} — 3-MINUTE COMMAND STATUS CHECK ━━━`,
        "packet"
    );

    maybeMovePeople();

    await broadcastStatusRequest();

    updatePopulation();
    renderAll();
    runAI();
}

async function sendAlive(person = selectedPerson) {
    if (!person) {
        alert(
            "Select a wearable first."
        );

        return;
    }

    if (!person.online) {
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

    person.evidence.lastBeacon =
        simulatedMinutes;

    person.signalState =
        "ACTIVE";

    person.lastKnownAlive =
        true;

    logEvent(
        `${person.id} broadcast ALIVE presence beacon.`,
        "good"
    );

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

        if (!localRoute) {
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

        neighbor.evidence.lastDetection =
            formatTime();

        neighbor.evidence.lastDetectionBy =
            person.id;

        neighbor.evidence.verificationCount++;

        logEvent(
            `${neighbor.id}: presence evidence received for ${person.id}.`,
            "good"
        );
    }

    person.knownAlive.add(
        person.id
    );

    const commandRoute =
        findRoute(
            person.id,
            "COMMAND",
            true
        );

    if (commandRoute) {
        await routePacket(
            packet,
            commandRoute
        );

        person.lastCommandResponse =
            simulatedMinutes;

        person.lastKnownAlive =
            true;

        person.signalState =
            "ACTIVE";

        if (
            person.status ===
            "UNRESOLVED"
        ) {
            person.status =
                "ACCOUNTED";
        }

        person.lastKnownStatus =
            person.status;

        person.evidence.verificationCount++;

        person.evidence.confidence =
            calculateEvidenceConfidence(
                person
            );

        logEvent(
            `${person.id} presence evidence reached MAIN CONTROL. Status updated from available evidence.`,
            "good"
        );
    } else {
        logEvent(
            `${person.id} remains outside the Command path. Nearby nodes retain presence evidence locally.`,
            "warning"
        );
    }

    updateSelectedPanel();
    updatePopulation();
    renderAll();
    runAI();
}

async function triggerEmergency(person = selectedPerson) {
    if (!person) {
        alert(
            "Select a wearable first."
        );

        return;
    }

    person.status =
        "EMERGENCY";

    person.evidence.emergencyReport =
        true;

    person.evidence.heartRate =
        Math.max(
            105,
            person.hr +
            Math.floor(
                Math.random() *
                25
            )
        );

    person.hr =
        person.evidence.heartRate;

    person.evidence.hazardExposure =
        currentDisaster &&
        currentDisaster.block ===
            person.zone
            ? "HIGH"
            : person.evidence.hazardExposure;

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

    if (!route) {
        person.signalState =
            "NO_SIGNAL";

        logEvent(
            `🚨 ${person.id}: emergency cannot currently reach Command. Emergency evidence remains local.`,
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
        `🚨 MAIN CONTROL received emergency evidence from ${person.id}.`,
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

    person.signalState =
        "ACTIVE";

    person.evidence.verificationCount++;

    person.evidence.confidence =
        calculateEvidenceConfidence(
            person
        );

    updatePopulation();
    renderAll();
    runAI();
}

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
        <strong>${type}</strong>
        <br>
        Affected area:
        <strong>${block}</strong>
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

    for (
        const person of victims
    ) {
        person.status =
            "EMERGENCY";

        person.evidence.emergencyReport =
            true;

        person.evidence.hazardExposure =
            "HIGH";

        person.hr =
            105 +
            Math.floor(
                Math.random() *
                30
            );

        person.evidence.heartRate =
            person.hr;

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
    await broadcastStatusRequest();

    updatePopulation();
    renderAll();
    runAI();
}

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
    if (disasterMode) {
        disasterMode =
            false;

        currentDisaster =
            null;

        hazardSensor.active =
            false;

        hazardSensor.hazard =
            null;

        hazardSensor.block =
            null;

        people.forEach(person => {
            if (
                person.status !==
                "EMERGENCY"
            ) {
                person.status =
                    "ACCOUNTED";
            }

            person.signalState =
                "ACTIVE";

            person.evidence.hazardExposure =
                "LOW";
        });

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

        renderAll();
        runAI();

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
        <strong>${type}</strong>
        <br>
        Affected area:
        <strong>${block}</strong>
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

    await broadcastStatusRequest();

    runAI();
}

async function broadcastHazard() {
    if (!hazardSensor.active) {
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

    people.forEach(person => {
        if (
            person.zone === block
        ) {
            person.evidence.hazardExposure =
                "HIGH";
        }
    });

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

    if (route) {
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

function getHazardGuidance(type) {
    switch (type) {
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
    } else {
        hazardSensor.hazard =
            null;

        hazardSensor.block =
            null;

        hazardStatus.textContent =
            "NORMAL";

        hazardStatus.classList.remove(
            "danger"
        );

        people.forEach(person => {
            person.evidence.hazardExposure =
                "LOW";
        });

        logEvent(
            "HAZARD-01 returned to normal.",
            "good"
        );

        runAI();
    }

    renderAll();
}

function calculateEvidenceConfidence(person) {
    let score = 0;

    if (
        person.signalState ===
        "ACTIVE"
    ) {
        score += 25;
    }

    if (
        person.evidence.lastBeacon ===
        simulatedMinutes
    ) {
        score += 20;
    }

    if (
        person.evidence.lastDetection
    ) {
        score += 15;
    }

    if (
        person.evidence.lastLocation
    ) {
        score += 10;
    }

    if (
        person.evidence.heartRate
    ) {
        score += 10;
    }

    if (
        person.evidence.movement ===
        "MOVING"
    ) {
        score += 5;
    }

    if (
        person.evidence.verificationCount >
        0
    ) {
        score += 10;
    }

    if (
        person.evidence.shelterCheckIn
    ) {
        score += 5;
    }

    if (
        person.evidence.emergencyReport
    ) {
        score = Math.min(
            100,
            score + 10
        );
    }

    return Math.min(
        100,
        score
    );
}

function calculateRecoveryAssessment(person) {
    const evidence =
        person.evidence;

    const observationList =
        observations[person.id] ||
        [];

    let score = 0;

    if (
        evidence.lastBeacon !==
        null &&
        evidence.lastBeacon >=
        simulatedMinutes - CONFIG.noSignalAfter
    ) {
        score += 25;
    }

    if (
        evidence.lastDetection
    ) {
        score += 20;
    }

    if (
        observationList.length
    ) {
        score += Math.min(
            20,
            observationList.length * 10
        );
    }

    if (
        evidence.heartRate
    ) {
        score += 10;
    }

    if (
        evidence.movement ===
        "MOVING"
    ) {
        score += 10;
    }

    if (
        evidence.hazardExposure ===
        "LOW"
    ) {
        score += 10;
    }

    if (
        evidence.hazardExposure ===
        "HIGH"
    ) {
        score -= 10;
    }

    if (
        evidence.emergencyReport
    ) {
        score -= 20;
    }

    score =
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        );

    return Math.round(score);
}

function determineRecoveryPriority(person) {
    let priority = 0;

    if (
        person.status ===
        "EMERGENCY"
    ) {
        priority += 100;
    }

    if (
        person.status ===
        "UNRESOLVED"
    ) {
        priority += 40;
    }

    if (
        person.evidence.hazardExposure ===
        "HIGH"
    ) {
        priority += 30;
    }

    if (
        person.evidence.lastDetection ===
        null
    ) {
        priority += 15;
    }

    if (
        person.evidence.lastBeacon ===
        null ||
        simulatedMinutes -
        person.evidence.lastBeacon >=
        CONFIG.noSignalAfter
    ) {
        priority += 15;
    }

    return priority;
}

async function searchSelectedNode() {
    if (!selectedPerson) {
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
            `REC-${String(
                searchSequence
            ).padStart(3, "0")}`,

        target:
            target.id,

        contacted:
            new Set(),

        observations:
            [],

        startedAt:
            formatTime(),

        status:
            target.status
    };

    const recoveryPacket =
        createPacket(
            "STATUS_RECOVERY_REQUEST",
            "COMMAND",
            {
                target:
                    target.id,

                recoveryId:
                    activeSearch.id,

                lastKnownLocation:
                    target.lastKnownLocation,

                reason:
                    "UNRESOLVED STATUS GAP"
            }
        );

    logEvent(
        `STATUS RECOVERY REQUEST ${activeSearch.id} initiated for ${target.id}.`,
        "search"
    );

    const reachable =
        getReachableFromCommand();

    reachable.delete(
        "COMMAND"
    );

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

        if (!route) {
            continue;
        }

        await routePacket(
            recoveryPacket,
            route
        );
    }

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

    const targetCommandRoute =
        findRoute(
            target.id,
            "COMMAND",
            true
        );

    if (
        targetCommandRoute &&
        target.online
    ) {
        const directEvidencePacket =
            createPacket(
                "STATUS_RECOVERY_RESPONSE",
                target.id,
                {
                    recoveryId:
                        activeSearch.id,

                    heartbeat:
                        target.hr,

                    location: {
                        zone:
                            target.zone,

                        x:
                            Math.round(
                                target.x
                            ),

                        y:
                            Math.round(
                                target.y
                            )
                    },

                    status:
                        target.status,

                    evidence:
                        "DIRECT_NODE_RESPONSE"
                }
            );

        await routePacket(
            directEvidencePacket,
            targetCommandRoute
        );

        target.lastCommandResponse =
            simulatedMinutes;

        target.signalState =
            "ACTIVE";

        target.lastKnownAlive =
            true;

        target.lastKnownStatus =
            target.status;

        target.evidence.lastBeacon =
            simulatedMinutes;

        target.evidence.verificationCount++;

        target.evidence.confidence =
            calculateEvidenceConfidence(
                target
            );

        if (
            target.status ===
            "UNRESOLVED"
        ) {
            target.status =
                "ACCOUNTED";
        }

        logEvent(
            `${target.id}: direct recovery response received. Status updated to ACCOUNTED.`,
            "good"
        );
    }

    const targetObservations =
        observations[target.id] ||
        [];

    if (
        targetObservations.length
    ) {
        target.evidence.lastDetection =
            formatTime();

        target.evidence.lastDetectionBy =
            targetObservations[
                targetObservations.length - 1
            ].observer;

        target.evidence.verificationCount +=
            targetObservations.length;

        if (
            target.status ===
            "UNRESOLVED"
        ) {
            target.status =
                "ACCOUNTED";

            logEvent(
                `${target.id}: status gap recovered through surviving-node observations.`,
                "good"
            );
        }
    }

    target.evidence.confidence =
        calculateRecoveryAssessment(
            target
        );

    if (
        target.status ===
        "EMERGENCY"
    ) {
        activeSearch.status =
            "EMERGENCY EVIDENCE";
    } else if (
        target.status ===
        "ACCOUNTED"
    ) {
        activeSearch.status =
            "STATUS RECOVERED";
    } else {
        activeSearch.status =
            "UNRESOLVED";
    }

    updateSearchPanel();
    updatePopulation();
    renderAll();
    runAI();

    return true;
}

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
                    formatTime(),

                sourceType:
                    "PROXIMITY"
            }
        );

    observer.knownAlive.add(
        target.id
    );

    observer.evidence.lastDetection =
        formatTime();

    observer.evidence.lastDetectionBy =
        target.id;

    target.evidence.lastDetection =
        formatTime();

    target.evidence.lastDetectionBy =
        observer.id;

    target.evidence.verificationCount++;

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
            `${observer.id} has evidence about ${target.id}, but cannot currently report to Command.`,
            "warning"
        );
    }

    updateSearchPanel();
}

function updateSearchPanel() {
    if (!activeSearch) {
        searchInfo.innerHTML = `
            <p class="muted">
                No active recovery request.
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

    const confidence =
        calculateRecoveryAssessment(
            targetPerson
        );

    const priority =
        determineRecoveryPriority(
            targetPerson
        );

    const assessment =
        targetPerson.status ===
        "ACCOUNTED"
            ? "STATUS RECOVERED"
            : targetPerson.status ===
                "EMERGENCY"
                ? "EMERGENCY EVIDENCE"
                : "ADDITIONAL INFORMATION REQUIRED";

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
            <span>Status</span>
            <strong>${getStatusTag(targetPerson.status)}</strong>
        </div>

        <div class="info-row">
            <span>Signal</span>
            <strong>${targetPerson.signalState}</strong>
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
            <span>Evidence confidence</span>
            <strong class="confidence">${confidence}%</strong>
        </div>

        <div class="info-row">
            <span>Recovery priority</span>
            <strong>${priority}</strong>
        </div>

        <div class="recovery-box ${priority >= 70 ? "high" : ""}">
            <strong>Assessment</strong>
            <br>
            ${assessment}
        </div>

        <p class="muted">
            Evidence:
        </p>

        <p class="muted">
            Beacon:
            ${
                targetPerson.evidence.lastBeacon !==
                null
                    ? "Recorded"
                    : "None"
            }
        </p>

        <p class="muted">
            Heartbeat:
            ${
                targetPerson.evidence.heartRate
                    ? `${targetPerson.evidence.heartRate} BPM`
                    : "None"
            }
        </p>

        <p class="muted">
            Movement:
            ${targetPerson.evidence.movement}
        </p>

        <p class="muted">
            Hazard exposure:
            ${targetPerson.evidence.hazardExposure}
        </p>

        <p class="muted">
            Last detection:
            ${
                targetPerson.evidence.lastDetectionBy
                    ? `${targetPerson.evidence.lastDetectionBy} at ${targetPerson.evidence.lastDetection}`
                    : "None"
            }
        </p>

        <p class="muted">
            Observations:
        </p>

        ${
            list.length
                ? list
                    .map(
                        o => `
                            <div class="info-row">
                                <span>${o.observer}</span>
                                <strong>~${o.distance}m</strong>
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
            Prototype recovery assessment only —
            evidence and confidence are simulated.
        </p>
    `;
}

function breakSelectedConnection() {
    if (!selectedPerson) {
        alert(
            "Select a wearable first."
        );

        return;
    }

    selectedPerson.commandIsolated =
        true;

    selectedPerson.signalState =
        "NO_SIGNAL";

    if (
        selectedPerson.status !==
        "EMERGENCY"
    ) {
        selectedPerson.status =
            "UNRESOLVED";
    }

    selectedPerson.evidence.confidence =
        calculateEvidenceConfidence(
            selectedPerson
        );

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

    updatePopulation();
    renderAll();
    runAI();
}

function restoreConnections() {
    failedLinks.clear();

    people.forEach(person => {
        person.commandIsolated =
            false;

        person.signalState =
            "ACTIVE";

        if (
            person.status ===
            "UNRESOLVED"
        ) {
            person.status =
                "ACCOUNTED";
        }
    });

    logEvent(
        "All simulated Command connections and link failures restored.",
        "good"
    );

    routingDisplay.textContent =
        "Routing: READY";

    renderAll();
    runAI();
}

function runAI() {
    const reachable =
        getReachableFromCommand();

    const emergencies =
        people.filter(
            p =>
                p.status ===
                "EMERGENCY"
        );

    const unresolved =
        people.filter(
            p =>
                p.status ===
                "UNRESOLVED"
        );

    const assistance =
        people.filter(
            p =>
                p.status ===
                "ASSISTANCE_REQUESTED"
        );

    if (
        currentDisaster &&
        currentDisaster.active
    ) {
        analyzeDisaster(
            reachable,
            emergencies,
            unresolved,
            assistance
        );

        return;
    }

    if (
        emergencies.length
    ) {
        analyzeEmergencies(
            emergencies
        );

        return;
    }

    if (
        unresolved.length
    ) {
        analyzeInformationGap(
            unresolved
        );

        return;
    }

    if (
        assistance.length
    ) {
        aiStatus.textContent =
            "◌ ASSISTANCE REQUESTS DETECTED";

        aiMessage.textContent =
            `${assistance.length} Sentinel device(s) have requested assistance. The system is retaining their location and available evidence for responder review.`;

        aiMessage.classList.remove(
            "danger"
        );

        aiMessage.classList.add(
            "warning"
        );

        return;
    }

    aiStatus.textContent =
        "✓ POPULATION STATUS ACCOUNTED";

    aiMessage.textContent =
        `All ${people.length} Sentinel devices currently have recent status evidence available to Main Control. The network continues monitoring for new status gaps.`;

    aiMessage.classList.remove(
        "warning",
        "danger"
    );
}

function analyzeEmergencies(emergencies) {
    aiStatus.textContent =
        "⚠ EMERGENCY EVIDENCE DETECTED";

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
        `Emergency evidence detected. ${descriptions}. The network is correlating location, heartbeat, hazard exposure, nearby Sentinels and communication paths.`;

    aiMessage.classList.remove(
        "warning"
    );

    aiMessage.classList.add(
        "danger"
    );
}

function analyzeDisaster(
    reachable,
    emergencies,
    unresolved,
    assistance
) {
    const type =
        currentDisaster.type;

    const block =
        currentDisaster.block;

    aiStatus.textContent =
        `⚠ ${type} — STATUS GAP ANALYSIS`;

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

    const affectedUnresolved =
        affected.filter(
            p =>
                p.status ===
                "UNRESOLVED"
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
        affectedUnresolved.length
    ) {
        text +=
            `${affectedUnresolved.length} have unresolved status gaps requiring recovery. `;
    }

    if (
        assistance.length
    ) {
        text +=
            `${assistance.length} assistance request(s) are active. `;
    }

    const important =
        unresolved.filter(
            p =>
                p.zone === block
        );

    if (
        important.length
    ) {
        const p =
            important
                .sort(
                    (a, b) =>
                        determineRecoveryPriority(b) -
                        determineRecoveryPriority(a)
                )[0];

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
                `Nearby potential evidence includes ${nearby.map(x => x.id).join(", ")}. `;
        }

        text +=
            `A status recovery request can be initiated to gather additional evidence. `;
    }

    text +=
        `An unresolved status represents insufficient current information and does not establish the person's actual condition.`;

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
    unresolved
) {
    aiStatus.textContent =
        "◌ POPULATION STATUS GAP DETECTED";

    const priorityTarget =
        unresolved
            .sort(
                (a, b) =>
                    determineRecoveryPriority(b) -
                    determineRecoveryPriority(a)
            )[0];

    const nearby =
        getNearbyPeople(
            priorityTarget
        );

    let text =
        `${priorityTarget.id} has an unresolved population-status gap. `;

    text +=
        `Last known location: ${priorityTarget.lastKnownLocation.zone}. `;

    text +=
        `Last known status: ${priorityTarget.lastKnownStatus}. `;

    text +=
        `Current signal: ${priorityTarget.signalState}. `;

    if (
        priorityTarget.evidence.lastDetectionBy
    ) {
        text +=
            `Recent local evidence was reported by ${priorityTarget.evidence.lastDetectionBy}. `;
    }

    if (
        nearby.length
    ) {
        text +=
            `Nearby Sentinels include ${nearby.map(p => `${p.id} (~${Math.round(distance(p, priorityTarget))}m)`).join(", ")}. `;
    }

    const isolatedCluster =
        getIsolatedLocalCluster(
            priorityTarget
        );

    if (
        isolatedCluster.length >= 2
    ) {
        text +=
            `A local cluster remains connected even though it is disconnected from Main Control. `;
    }

    text +=
        `Recommended prototype action: initiate status recovery and gather surviving-node evidence.`;

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
                p.id !==
                person.id &&
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

function updatePopulation() {
    totalPeople.textContent =
        people.length;

    const accounted =
        people.filter(
            person =>
                person.status ===
                "ACCOUNTED"
        ).length;

    const assistance =
        people.filter(
            person =>
                person.status ===
                "ASSISTANCE_REQUESTED"
        ).length;

    const emergency =
        people.filter(
            person =>
                person.status ===
                "EMERGENCY"
        ).length;

    const unresolved =
        people.filter(
            person =>
                person.status ===
                "UNRESOLVED"
        ).length;

    const priority =
        people.filter(
            person =>
                person.status ===
                    "UNRESOLVED" &&
                determineRecoveryPriority(
                    person
                ) >= 70
        ).length;

    accountedPeople.textContent =
        accounted;

    assistancePeople.textContent =
        assistance;

    emergencyPeople.textContent =
        emergency;

    unresolvedPeople.textContent =
        unresolved;

    statusGapCount.textContent =
        unresolved;

    priorityGapCount.textContent =
        priority;

    if (!unresolved) {
        gapPriority.textContent =
            "No unresolved status gaps.";

        gapPriority.classList.remove(
            "high"
        );

        gapPriority.classList.add(
            "good"
        );

        return;
    }

    const highest =
        people
            .filter(
                p =>
                    p.status ===
                    "UNRESOLVED"
            )
            .sort(
                (a, b) =>
                    determineRecoveryPriority(b) -
                    determineRecoveryPriority(a)
            )[0];

    gapPriority.classList.remove(
        "good"
    );

    if (
        determineRecoveryPriority(
            highest
        ) >= 70
    ) {
        gapPriority.classList.add(
            "high"
        );
    } else {
        gapPriority.classList.remove(
            "high"
        );
    }

    gapPriority.innerHTML =
        `<strong>${highest.id}</strong> — ${highest.zone}<br>Recovery priority: ${determineRecoveryPriority(highest)}`;
}

function updateConnectedCount() {
    const reachable =
        getReachableFromCommand();

    connectedCount.textContent =
        Math.max(
            0,
            reachable.size - 1
        );
}

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
                if (
                    person.status !==
                    "EMERGENCY"
                ) {
                    person.status =
                        "UNRESOLVED";
                }

                person.signalState =
                    "NO_SIGNAL";

                person.evidence.confidence =
                    calculateEvidenceConfidence(
                        person
                    );

                logEvent(
                    `${person.id} is outside the Command communication path. Status gap recorded; last known evidence retained.`,
                    "warning"
                );
            }
        }
    );

    updateConnectedCount();
    updatePopulation();
}
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
        () =>
            triggerEmergency()
    );

document
    .getElementById("blockEmergencyBtn")
    .addEventListener(
        "click",
        simulateBlockEmergency
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
        () =>
            sendAlive()
    );

document
    .getElementById("breakBtn")
    .addEventListener(
        "click",
        breakSelectedConnection
    );

document
    .getElementById("restoreBtn")
    .addEventListener(
        "click",
        restoreConnections
    );

document
    .getElementById("hazardBtn")
    .addEventListener(
        "click",
        activateHazard
    );

svg.addEventListener(
    "click",
    () => {
        selectedPerson =
            null;

        renderAll();
        runAI();
    }
);

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
    "Main Control relies on multi-hop mesh routing rather than direct connections to every wearable.",
    "packet"
);

logEvent(
    "Population status recovery protocol initialized.",
    "good"
);

logEvent(
    "Status model: ACCOUNTED / ASSISTANCE REQUESTED / EMERGENCY / UNRESOLVED.",
    "packet"
);

logEvent(
    "NO SIGNAL creates an information gap; it does not determine the person's actual condition.",
    "packet"
);

logEvent(
    "Recovery evidence includes beacon, proximity, location, heartbeat, movement and hazard exposure.",
    "packet"
);

logEvent(
    "AI evidence assessment initialized.",
    "good"
);

simTime.textContent =
    formatTime();

document
    .getElementById("rangeDisplay")
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