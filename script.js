const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const restitution = 0.9;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const personImg = new Image();
personImg.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Walking_person_top_view.svg/1013px-Walking_person_top_view.svg.png";

const infectedImg = new Image();
infectedImg.src = "https://i.pinimg.com/originals/55/7a/1e/557a1e13af535e8351cb7056fde8589f.png";

var people = [];
var maxPeople = document.getElementById("input1").value;

Person.prototype.clicked = function() {
    var clicked = true;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    people = [];
    maxPeople = document.getElementById("input1").value;
    for (let i=0; i<eval(maxPeople); i++) {
        people.push(new Person());
    }
}

function detectEdgeCollisions()
 {
     let person;
     for (let i = 0; i < people.length; i++)
     {
         person = people[i];

         // Check for left and right
         if (person.x < person.size/2){
            person.velX = Math.abs(person.velX) * restitution;
            person.x = person.size/2;
         }else if (person.x > canvas.width - person.size/2){
            person.velX = -Math.abs(person.velX) * restitution;
            person.x = canvas.width - person.size/2;
         }

         // Check for bottom and top
         if (person.y < person.size/2){
            person.velY = Math.abs(person.velY) * restitution;
            person.y = person.size/2;
         } else if (person.y > canvas.height - person.size/2){
            person.velY = -Math.abs(person.velY) * restitution;
            person.y = canvas.height - person.size/2;
         }
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
    this.x = (Math.random() * canvas.width);
    this.y = (Math.random() * canvas.height);
    // this.x = canvas.width/2;
    // this.y = canvas.height/2;
    this.startingPos = [this.x, this.y];
    this.velX = ((Math.random() * 4) - 2);
    this.velY = ((Math.random() * 4) - 2);
    this.speed = 1;
    this.angle = 100;
    this.rotationSpeed = 3;
    this.rotateTarget = 0;
    this.size = (Math.random() * 20) + 30;
    this.mass = .3;
    // if slider is 70%, then 70% will be true, and 30% will be false
    this.isInfected = Math.random()  < document.getElementById("input2").value / 100;
    this.infectionChance = document.getElementById("input3").value;
    this.isMasked = Math.random() < document.getElementById("input4").value / 100;
    this.isQuarantined = Math.random() < document.getElementById("input6").value / 100;
    this.walkDistance = document.getElementById("input7").value;
    // from 0 to walking distance for both x and y
    this.targetPos = [this.startingPos[0] + Math.random() * this.walkDistance - this.walkDistance/2, this.startingPos[1] + Math.random() * this.walkDistance - this.walkDistance/2];
    this.isColliding = false;
    this.isSymptomatic = false;
    this.isAsymptomatic = false;
    this.id = Math.random();
    this.collisionIgnore = [];
};

Person.prototype.update = function() {
    this.x += this.velX;
    this.y += this.velY;

    this.velX = this.speed * Math.cos(this.angle * Math.PI / 180);
    this.velY = this.speed * Math.sin(this.angle * Math.PI / 180);
    this.rotate();
    this.walk();
    this.quarantine();
    this.detectCollisions();
    //this.detectEdgeCollisions();
    this.drawPerson();
};

Person.prototype.quarantine = function() {
    // only infected people can self-quarantine
    if (this.isInfected && this.isQuarantined) {
        // one second = 1 day
        // after 14 days they will go back to their normal speed
        this.speed = 0;

        setTimeout(function() {
            this.speed = .75;
            this.isInfected = false;
            this.isQuarantined = false;
        }.bind(this), 14000);
    }
}

Person.prototype.walk = function() {
    let a = this.x - this.targetPos[0];
    let b = this.y - this.targetPos[1];;
    
    let distanceToTarget = Math.sqrt( a*a + b*b );

    if (distanceToTarget < 15) {
        this.targetPos = [this.startingPos[0] + Math.random() * this.walkDistance - this.walkDistance/2, this.startingPos[1] + Math.random() * this.walkDistance - this.walkDistance/2];
    }
};

Person.prototype.rotate = function() {
    this.rotateTarget = angle(this.x, this.y, this.targetPos[0], this.targetPos[1]);

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

Person.prototype.drawPerson = function() {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,.07)';
    ctx.arc(this.startingPos[0], this.startingPos[1], this.walkDistance, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.startingPos[0], this.startingPos[1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = 'rgba(0,0,0,.15)';
    ctx.stroke();

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.angle+90) * Math.PI / 180);

    if (this.isInfected)
    {
        ctx.drawImage(infectedImg, -this.size/2, -this.size/2, this.size, this.size);
    }
    else 
    {
        ctx.drawImage(personImg, -this.size/2, -this.size/2, this.size, this.size);
    }
    ctx.restore();
}

Person.prototype.detectCollisions = function() {
        
    //reset collision states
    for (let i = 0; i < people.length; i++) {
        people[i].isColliding = false;
    }
    
    //start check
    for (let i = 0; i < people.length; i++) {
        person1 = people[i];
        for (let j = i + 1; j < people.length; j++){
            person2 = people[j];
            
        if (circleIntersect(person1.x, person1.y, person1.size/2, 
            person2.x, person2.y, person2.size/2)) {
                person1.isColliding = true;
                person2.isColliding = true;

                if (!person1.collisionIgnore.includes(person2.id)) {
                    if (person1.isInfected && !person2.isInfected) 
                    {
                        if (Math.floor(Math.random() * 100) < person2.infectionChance) {
                            person2.isInfected = true;                      
                        }
                    }

                    person1.collisionIgnore.push(person2.id);
                    setTimeout(function() {
                        person1.collisionIgnore.splice(0,1);
                    }.bind(person1),2000);
                }

                if (!person1.isInfected && person2.isInfected) 
                {
                    if (Math.floor(Math.random() * 100) < person1.infectionChance){
                        person1.isInfected = true;
                    }

                    // hey baby...
                    person2.collisionIgnore.push(person1.id);
                    setTimeout(function() {
                        person2.collisionIgnore.splice(0,1);
                    }.bind(person2),2000)
                }
                                                
                //calculate collision vector
                let vCollision = {x: person2.x  - person1.x, y: person2.y  - person1.y}
                //calculate distance of collision vector
                let distance = Math.sqrt((person2.x-person1.x)*(person2.x-person1.x) 
                    + (person2.y-person1.y)*(person2.y-person1.y));
                //normalized collision vector (direction)
                let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
                //collision speed
                let vRelativeVelocity = {x: person1.velX - person2.velX, y: person1.velY - person2.velY};
                let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
                
                //if moving away from eachother break
                
                if (speed < 0){
                    break;
                }
                
                var impulse = 3 * speed / (person1.mass + person2.mass);
                person1.velX -= (impulse * person2.mass  * vCollisionNorm.x);
                person1.velY -= (impulse * person2.mass  * vCollisionNorm.y);
                person2.velX += (impulse * person1.mass  * vCollisionNorm.x);
                person2.velY += (impulse * person1.mass  * vCollisionNorm.y);

            }
        }
    }
}

function circleIntersect(x1, y1, r1, x2, y2, r2) {

    // Calculate the distance between the two circles
    let squareDistance = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);

    // When the distance is smaller or equal to the sum
    // of the two radius, the circles touch or overlap
    return squareDistance <= ((r1 + r2) * (r1 + r2))
}

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


