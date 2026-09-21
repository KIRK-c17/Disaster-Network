const svg = document.getElementById("network");

const connectionsGroup =
    document.getElementById("connections");

const nodesGroup =
    document.getElementById("nodes");

const packetsGroup =
    document.getElementById("packets");

const deviceInfo =
    document.getElementById("deviceInfo");

const eventLog =
    document.getElementById("eventLog");

const disasterBtn =
    document.getElementById("disasterBtn");

const emergencyBtn =
    document.getElementById("emergencyBtn");

const timeBtn =
    document.getElementById("timeBtn");

const aliveBtn =
    document.getElementById("aliveBtn");


/* =========================================
   PEOPLE
========================================= */

const people = [

    { id: "SN-001", name: "Maria", x: 600, y: 80, hr: 78, status: "ACTIVE" },

    { id: "SN-002", name: "Juan", x: 410, y: 120, hr: 81, status: "ACTIVE" },

    { id: "SN-003", name: "Carlo", x: 790, y: 120, hr: 112, status: "ACTIVE" },

    { id: "SN-004", name: "Ana", x: 250, y: 220, hr: 76, status: "ACTIVE" },

    { id: "SN-005", name: "Miguel", x: 430, y: 210, hr: 83, status: "ACTIVE" },

    { id: "SN-006", name: "Sofia", x: 770, y: 210, hr: 79, status: "ACTIVE" },

    { id: "SN-007", name: "Daniel", x: 950, y: 220, hr: 82, status: "ACTIVE" },

    { id: "SN-008", name: "Lea", x: 170, y: 350, hr: 80, status: "ACTIVE" },

    { id: "SN-009", name: "Mark", x: 390, y: 330, hr: 75, status: "ACTIVE" },

    { id: "SN-010", name: "Grace", x: 810, y: 330, hr: 84, status: "ACTIVE" },

    { id: "SN-011", name: "Paolo", x: 1030, y: 350, hr: 77, status: "ACTIVE" },

    { id: "SN-012", name: "Nina", x: 260, y: 500, hr: 80, status: "ACTIVE" },

    { id: "SN-013", name: "Ethan", x: 470, y: 530, hr: 82, status: "ACTIVE" },

    { id: "SN-014", name: "Kate", x: 730, y: 530, hr: 79, status: "ACTIVE" },

    { id: "SN-015", name: "Luis", x: 940, y: 500, hr: 81, status: "ACTIVE" }

];


/* =========================================
   CONTROL CENTER
========================================= */

const controlCenter = {
    x: 600,
    y: 350
};


/* =========================================
   NETWORK STATE
========================================= */

let disasterMode = false;

let simulatedMinutes = 0;

let selectedPerson = null;

let draggingPerson = null;


/* =========================================
   CREATE CONNECTIONS
========================================= */

function createConnections() {

    connectionsGroup.innerHTML = "";

    /*
        Connect people that are close enough.

        This produces a dense mesh instead
        of a simple chain.
    */

    for (let i = 0; i < people.length; i++) {

        for (let j = i + 1; j < people.length; j++) {

            const a = people[i];
            const b = people[j];

            const dx = a.x - b.x;
            const dy = a.y - b.y;

            const distance =
                Math.sqrt(dx * dx + dy * dy);

            /*
                Maximum connection distance.

                Increase this number to make
                the web denser.
            */

            if (distance < 430) {

                createConnection(a, b);

            }

        }

    }


    /*
        Connect every person to the
        Main Control Center.
    */

    people.forEach(person => {

        createConnection(
            person,
            controlCenter,
            true
        );

    });

}


/* =========================================
   DRAW CONNECTION
========================================= */

function createConnection(a, b, center = false) {

    const line =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

    line.setAttribute("x1", a.x);
    line.setAttribute("y1", a.y);

    line.setAttribute("x2", b.x);
    line.setAttribute("y2", b.y);

    line.classList.add("connection");

    if (center) {

        line.style.opacity = "0.35";

    }

    connectionsGroup.appendChild(line);

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

        group.classList.add("person-node");

        group.setAttribute(
            "transform",
            `translate(${person.x}, ${person.y})`
        );


        /*
            Person circle
        */

        const circle =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        circle.setAttribute("r", 22);

        circle.classList.add("person-circle");

        group.appendChild(circle);


        /*
            Person ID
        */

        const label =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );

        label.setAttribute("y", 42);

        label.classList.add("person-label");

        label.textContent = person.id;

        group.appendChild(label);


        /*
            Heartbeat
        */

        const heart =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );

        heart.setAttribute("y", 5);

        heart.classList.add("person-heart");

        heart.textContent =
            `♥ ${person.hr}`;

        group.appendChild(heart);


        /*
            Emergency class
        */

        if (person.status === "EMERGENCY") {

            group.classList.add("emergency");

        }


        /*
            Click
        */

        group.addEventListener(
            "click",
            () => selectPerson(person)
        );


        /*
            Dragging
        */

        group.addEventListener(
            "mousedown",
            event => {

                draggingPerson = {
                    person,
                    group
                };

                event.stopPropagation();

            }
        );


        nodesGroup.appendChild(group);

    });

}


/* =========================================
   DRAW CONTROL CENTER
========================================= */

function drawControlCenter() {

    const group =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );


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
        "control-center-ring"
    );

    group.appendChild(ring);


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
        42
    );

    circle.classList.add(
        "control-center"
    );

    group.appendChild(circle);


    const label =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

    label.setAttribute(
        "x",
        controlCenter.x
    );

    label.setAttribute(
        "y",
        controlCenter.y + 5
    );

    label.classList.add(
        "control-label"
    );

    label.textContent = "CONTROL";

    group.appendChild(label);


    const subLabel =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

    subLabel.setAttribute(
        "x",
        controlCenter.x
    );

    subLabel.setAttribute(
        "y",
        controlCenter.y + 20
    );

    subLabel.classList.add(
        "control-label"
    );

    subLabel.style.fontSize = "9px";

    subLabel.textContent = "CENTER";

    group.appendChild(subLabel);


    nodesGroup.appendChild(group);

}


/* =========================================
   SELECT PERSON
========================================= */

function selectPerson(person) {

    selectedPerson = person;

    deviceInfo.innerHTML = `

        <strong>${person.name}</strong><br>

        Device ID:
        ${person.id}<br>

        Heartbeat:
        ♥ ${person.hr} BPM<br>

        Status:
        ${person.status}<br>

        Network:
        MESH CONNECTED

    `;

}


/* =========================================
   DISASTER MODE
========================================= */

disasterBtn.addEventListener(
    "click",
    () => {

        disasterMode = !disasterMode;

        disasterBtn.classList.toggle(
            "active",
            disasterMode
        );


        if (disasterMode) {

            addEvent(
                "DISASTER MODE activated — cellular/internet unavailable."
            );

        } else {

            addEvent(
                "DISASTER MODE deactivated."
            );

        }

    }
);


/* =========================================
   TRIGGER EMERGENCY
========================================= */

emergencyBtn.addEventListener(
    "click",
    () => {

        if (!selectedPerson) {

            selectedPerson = people[2];

        }


        selectedPerson.status =
            "EMERGENCY";


        drawPeople();


        selectPerson(
            selectedPerson
        );


        addEvent(
            `${selectedPerson.id} emergency signal activated.`
        );


        sendPacket(
            selectedPerson
        );

    }
);


/* =========================================
   +3 MINUTES
========================================= */

timeBtn.addEventListener(
    "click",
    () => {

        simulatedMinutes += 3;


        people.forEach(person => {

            /*
                Small heartbeat variation.
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

        });


        drawPeople();


        if (selectedPerson) {

            selectPerson(
                selectedPerson
            );

        }


        addEvent(
            `Simulation advanced +3 minutes.`
        );

    }
);


/* =========================================
   SEND ALIVE
========================================= */

aliveBtn.addEventListener(
    "click",
    () => {

        if (!selectedPerson) {

            selectedPerson = people[0];

        }


        addEvent(
            `${selectedPerson.id} sent ALIVE beacon.`
        );


        sendPacket(
            selectedPerson,
            true
        );

    }
);


/* =========================================
   PACKET ANIMATION
========================================= */

function sendPacket(
    person,
    alive = false
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


    if (alive) {

        packet.style.fill =
            "#26e6a6";

    }


    packetsGroup.appendChild(
        packet
    );


    /*
        For V1, demonstrate the packet
        moving from the selected person
        toward the Control Center.
    */

    const startX = person.x;
    const startY = person.y;

    const endX = controlCenter.x;
    const endY = controlCenter.y;


    let progress = 0;


    function animate() {

        progress += 0.015;


        if (progress >= 1) {

            packet.remove();

            addEvent(
                `${person.id} packet received by Control Center.`
            );

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
   EVENT LOG
========================================= */

function addEvent(message) {

    const entry =
        document.createElement("p");

    const time =
        new Date()
            .toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    entry.textContent =
        `${time} — ${message}`;


    eventLog.prepend(entry);

}


/* =========================================
   DRAGGING
========================================= */

svg.addEventListener(
    "mousemove",
    event => {

        if (!draggingPerson) return;


        const rect =
            svg.getBoundingClientRect();


        const scaleX =
            1200 / rect.width;

        const scaleY =
            750 / rect.height;


        const x =
            (event.clientX - rect.left) *
            scaleX;

        const y =
            (event.clientY - rect.top) *
            scaleY;


        draggingPerson.person.x =
            Math.max(
                40,
                Math.min(
                    1160,
                    x
                )
            );


        draggingPerson.person.y =
            Math.max(
                40,
                Math.min(
                    710,
                    y
                )
            );


        render();

    }
);


window.addEventListener(
    "mouseup",
    () => {

        draggingPerson = null;

    }
);


/* =========================================
   RENDER
========================================= */

function render() {

    createConnections();

    drawPeople();

    drawControlCenter();

}


/* =========================================
   START
========================================= */

render();

addEvent(
    "SentinelNet mesh initialized."
);

addEvent(
    "15 wearable devices detected."
);

addEvent(
    "Main Control Center connected."
);