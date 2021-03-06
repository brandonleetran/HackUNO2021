const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const personImg = new Image();
personImg.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Walking_person_top_view.svg/1013px-Walking_person_top_view.svg.png";

var people = [];
var maxPeople = document.getElementById("input1").value;

Person.prototype.clicked = function() {
    var clicked = true;
    alert("clicked");

}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    people = [];
    maxPeople = document.getElementById("input1").value;
    for (let i=0; i<eval(maxPeople); i++) {
        people.push(new Person());
    }
}

function updateTextInput(val, id) {
    document.getElementById("text" + id).innerHTML = val;
}

for (let i=0; i<eval(maxPeople); i++) {
    people.push(new Person());
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i=0; i<people.length; i++) {
        people[i].update();     
    }
    requestAnimationFrame(gameLoop);
}

personImg.onload = function() {
    gameLoop();
};

function Person() {
    // this.x = (Math.random() * canvas.width);
    // this.y = (Math.random() * canvas.height);
    this.x = canvas.width/2;
    this.y = canvas.height/2;
    this.startingPos = [this.x, this.y];
    this.velX = ((Math.random() * 4) - 2);
    this.velY = ((Math.random() * 4) - 2);
    this.speed = 1;
    this.angle = 100;
    this.rotationSpeed = 5000;
    this.rotateTarget = 0;
    this.size = (Math.random() * 20) + 30;
    this.infectionChance = document.getElementById("input3").value;
    this.walkDistance = document.getElementById("input7").value;
    this.antibodyDuration = 3000;
    this.isMasked = false; 
    this.isInfected = false;
    this.isQuarantined = false;
    this.isSymptomatic = false;
    this.isAsymptomatic = false;
};

Person.prototype.update = function() {
    this.x += this.velX;
    this.y += this.velY;

    // this.velX = this.speed * Math.cos(this.angle * Math.PI / 180);
    // this.velY = this.speed * Math.sin(this.angle * Math.PI / 180);
    this.rotate();
    this.drawPerson();
};

Person.prototype.drawPerson = function() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.angle+90) * Math.PI / 180);

    ctx.drawImage(personImg, -this.size/2, -this.size/2, this.size, this.size);
    ctx.restore();
}

Person.prototype.rotate = function() {
    this.rotateTarget = angle(this.x, this.y, canvas.width/2, canvas.height/2);

    var targetDeg = Math.round(Math.atan2(300 - this.y, 300 - this.x) * 180 / Math.PI);
    var targetDist = angleDiff(this.angle, this.rotateTarget);

    // Convert -180 180 range to 0 360
    if (targetDeg < 0) {
        targetDeg += 360;
    }

    // Rotate clockwise
    if (Math.abs(targetDist) > 0) {
        var rotateDist = Math.abs(targetDist) - this.rotationSpeed > 0 ? this.rotationSpeed : Math.abs(targetDist);

        if (targetDist < 0) {
            this.angle += rotateDist;
        } else {
            this.angle -= rotateDist;
        }
    }

    // If goes beyond 360 or under 0
    this.angle = this.angle % 360;

    if (this.angle < 0) {
        this.angle += 360;
    }
};

function angle(x, y, x2, y2) {
    var dy = y2 - y;
    var dx = x2 - x;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}

function angleDiff(angle1, angle2) {
    var a = angle1 - angle2;
    var b = (a + 180) % 360 - 180;
    return b;
}
