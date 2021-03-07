const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const restitution = 0.9;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const personImages = [new Image(), new Image(), new Image(), new Image()];
const infectedPersonImages = [new Image(), new Image(), new Image(), new Image()];

personImages[0].src = "images/person1.png";
infectedPersonImages[0].src = "images/person1_infected.png";

personImages[1].src = "images/person2.png";
infectedPersonImages[1].src = "images/person2_infected.png";

personImages[2].src = "images/person3.png";
infectedPersonImages[2].src = "images/person3_infected.png";

personImages[3].src = "images/person4.png";
infectedPersonImages[3].src = "images/person4_infected.png";

var people = [];

// for stats
var peopleInfected = document.getElementById("input2").value;
var peopleWithMasks = document.getElementById("input4").value;
var peopleQuarantine = document.getElementById("input5").value;


var maxPeople = document.getElementById("input1").value;

Person.prototype.clicked = function () {
  var clicked = true;
};

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  people = [];
  maxPeople = document.getElementById("input1").value;
  for (let i = 0; i < eval(maxPeople); i++) {
    people.push(new Person());
  }
}

function detectEdgeCollisions() {
  let person;
  for (let i = 0; i < people.length; i++) {
    person = people[i];

    // Check for left and right
    if (person.x < person.size / 2) {
      person.velX = Math.abs(person.velX) * restitution;
      person.x = person.size / 2;
    } else if (person.x > canvas.width - person.size / 2) {
      person.velX = -Math.abs(person.velX) * restitution;
      person.x = canvas.width - person.size / 2;
    }

    // Check for bottom and top
    if (person.y < person.size / 2) {
      person.velY = Math.abs(person.velY) * restitution;
      person.y = person.size / 2;
    } else if (person.y > canvas.height - person.size / 2) {
      person.velY = -Math.abs(person.velY) * restitution;
      person.y = canvas.height - person.size / 2;
    }
  }
}

function updateTextInput(val, id) {
  document.getElementById("text" + id).innerHTML = val;
}

for (let i = 0; i < eval(maxPeople); i++) {
  people.push(new Person());
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < people.length; i++) {
    people[i].update();
  }
  requestAnimationFrame(gameLoop);
}

personImages[personImages.length-1].onload = function () {
  gameLoop();
};

function Person() {
  this.x = Math.random() * canvas.width;
  this.y = Math.random() * canvas.height;
  // this.x = canvas.width/2;
  // this.y = canvas.height/2;
  this.startingPos = [this.x, this.y];
  this.velX = Math.random() * 4 - 2;
  this.velY = Math.random() * 4 - 2;
  this.speed = 1;
  this.angle = 100;
  this.rotationSpeed = 3;
  this.rotateTarget = 0;
  this.size = Math.random() * 20 + 30;
  this.mass = 0.3;
  // if slider is 70%, then 70% will be true, and 30% will be false
  this.isInfected =
    Math.random() < document.getElementById("input2").value / 100;
  this.isMasked = Math.random() < document.getElementById("input4").value / 100;
  this.infectionChance = this.isMasked
    ? document.getElementById("input3").value / 2
    : document.getElementById("input3").value;
  this.isQuarantined =
    Math.random() < document.getElementById("input6").value / 100;
  this.walkDistance = document.getElementById("input7").value;
  // from 0 to walking distance for both x and y
  this.targetPos = [
    this.startingPos[0] +
      Math.random() * this.walkDistance -
      this.walkDistance / 2,
    this.startingPos[1] +
      Math.random() * this.walkDistance -
      this.walkDistance / 2,
  ];
  this.isColliding = false;
  this.isSymptomatic = false;
  this.isAsymptomatic = false;
  this.id = Math.random();
  this.collisionIgnore = [];
  this.infectionIgnore = [];
  this.image = Math.floor(Math.random()*4);
}

Person.prototype.update = function () {
  this.x += this.velX;
  this.y += this.velY;

  this.velX = this.speed * Math.cos((this.angle * Math.PI) / 180);
  this.velY = this.speed * Math.sin((this.angle * Math.PI) / 180);
  this.rotate();
  this.walk();
  this.detectCollisions();
  //this.detectEdgeCollisions();
  this.infected();
  this.drawPerson();
};


/*
Person.prototype.quarantine = function () {
  // only infected people can self-quarantine
  if (this.isInfected && this.isQuarantined) {
    // one second = 1 day
    // after 14 days they will go back to their normal speed
    this.speed = 0;

    setTimeout(
      function () {
        this.speed = 0.75;
        this.isInfected = false;
        this.isQuarantined = false;
      }.bind(this),
      14000
    );
  }
};
*/
Person.prototype.walk = function () {
  let a = this.x - this.targetPos[0];
  let b = this.y - this.targetPos[1];

  let distanceToTarget = Math.sqrt(a * a + b * b);

  if (distanceToTarget < 15) {
    this.targetPos = [
      this.startingPos[0] +
        Math.random() * this.walkDistance -
        this.walkDistance / 2,
      this.startingPos[1] +
        Math.random() * this.walkDistance -
        this.walkDistance / 2,
    ];
  }
};

Person.prototype.rotate = function () {
  this.rotateTarget = angle(
    this.x,
    this.y,
    this.targetPos[0],
    this.targetPos[1]
  );

  var targetDeg = Math.round(
    (Math.atan2(300 - this.y, 300 - this.x) * 180) / Math.PI
  );
  var targetDist = angleDiff(this.angle, this.rotateTarget);

  // Convert -180 180 range to 0 360
  if (targetDeg < 0) {
    targetDeg += 360;
  }

  // Rotate clockwise
  if (Math.abs(targetDist) > 0) {
    var rotateDist =
      Math.abs(targetDist) - this.rotationSpeed > 0
        ? this.rotationSpeed
        : Math.abs(targetDist);

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

Person.prototype.drawPerson = function () {
  try {
    // ctx.beginPath();
    // ctx.strokeStyle = "rgba(255,255,255,.07)";
    // ctx.arc(
    //   this.startingPos[0],
    //   this.startingPos[1],
    //   this.walkDistance,
    //   0,
    //   2 * Math.PI
    // );
    // ctx.stroke();

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(((this.angle + 90) * Math.PI) / 180);

    if (this.isInfected) {
      ctx.drawImage(
        infectedPersonImages[this.image],
        -this.size / 2,
        -this.size / 2,
        this.size,
        this.size
      );
    } else {
      ctx.drawImage(
        personImages[this.image],
        -this.size / 2,
        -this.size / 2,
        this.size,
        this.size
      );
    }
    ctx.restore();
  } catch (e) {
    console.log(e);
  }
};

Person.prototype.detectCollisions = function () {
  //reset collision states
  for (let i = 0; i < people.length; i++) {
    people[i].isColliding = false;
  }

  //start check
  for (let i = 0; i < people.length; i++) {
    person1 = people[i];
    for (let j = i + 1; j < people.length; j++) {
      person2 = people[j];

      if (
        circleIntersect(
          person1.x,
          person1.y,
          person1.size / 1.5, // 2,
          person2.x,
          person2.y,
          person2.size / 1,5 // 2
        )
      ) {
        person1.isColliding = true;
        person2.isColliding = true;
        
        if (person1.isInfected && !person2.isInfected) {
            if (Math.floor(Math.random() * 100) <= 100) {
                person2.isInfected = true;
                if (Math.floor(Math.random() * 100) 
                <= document.getElementById("input6").value) {
                   person2.isQuarantined = true;
                }
            }
        }
        person1.collisionIgnore.push(person2.id);
        
        setTimeout(() => {
            person1.collisionIgnore.splice(0, 1);
            }, 1000
        );
        

        if (!person1.isInfected && person2.isInfected) {
            if (Math.floor(Math.random() * 100)  <= 100) {
                person1.isInfected = true;
                if (Math.floor(Math.random() * 100) 
                <= document.getElementById("input6").value) {
                    person1.isQuarantined = true;
                }
            }
            
        }
        
        /*
        if (!person1.collisionIgnore.includes(person2.id)) {
            if (person1.isInfected && !person2.isInfected) {
                if (Math.floor(Math.random() * 100) <= 100) {
                    person2.isInfected = true;
                    }
            person1.collisionIgnore.push(person2.id);
            console.log("\nbefore timeout\np1 Id: " + person1.id 
            + "\nbefore timeout\np2 Id: " + person2.id
            + "\nentire colIg[]: " + person1.collisionIgnore)
            setTimeout(
                function () {
                    console.log("\nbefore func\np1 Id: " + person1.id
                + "\nbefore  func\np2 Id: " + person2.id
                + "\nentire colIg[]: " + person1.collisionIgnore)
                person1.collisionIgnore.splice(0, 1);
                console.log("\nafter func\np1 Id: " + person1.id
                + "\nafter  func\np2 Id: " + person2.id
                + "\nentire colIg[]: " + person1.collisionIgnore)
                }.bind(person1),
                1000
                );
            }
        }

        if (!person2.collisionIgnore.includes(person1.id)) {
            if (!person1.isInfected && person2.isInfected) {
                if (Math.floor(Math.random() * 100)  <= 100) {
                    person1.isInfected = true;
                }
            person2.collisionIgnore.push(person1.id);
            setTimeout(
                function () {
                person2.collisionIgnore.splice(0, 1);
                }.bind(person2),
                1000
                );
            }
        } 
        */   

        //calculate collision vector
        let vCollision = { x: person2.x - person1.x, y: person2.y - person1.y };
        //calculate distance of collision vector
        let distance = Math.sqrt(
          (person2.x - person1.x) * (person2.x - person1.x) +
            (person2.y - person1.y) * (person2.y - person1.y)
        );

        //normalized collision vector (direction)
        let vCollisionNorm = {
          x: vCollision.x / distance,
          y: vCollision.y / distance,
        };
        //collision speed
        let vRelativeVelocity = {
          x: person1.velX - person2.velX,
          y: person1.velY - person2.velY,
        };
        let speed =
          vRelativeVelocity.x * vCollisionNorm.x +
          vRelativeVelocity.y * vCollisionNorm.y;

        //if moving away from eachother break

        if (speed < 0) {
          break;
        }

        var impulse = (1 * speed) / (person1.mass + person2.mass);
        person1.velX -= impulse * person2.mass * vCollisionNorm.x;
        person1.velY -= impulse * person2.mass * vCollisionNorm.y;
        person2.velX += impulse * person1.mass * vCollisionNorm.x;
        person2.velY += impulse * person1.mass * vCollisionNorm.y;
      }
    }
  }
};

Person.prototype.infected = function () {
    if (this.isInfected && this.isQuarantined) {
      // one second = 1 day
      // after 14 days they will go back to their normal speed
      this.speed = 0;
    }
  
    if (this.isInfected) {
      if (!this.infectionIgnore.includes(this.id)) {
          setTimeout(
          function () {
              if (this.isQuarantined) {
                  this.speed = .75;
              }
              this.isInfected = false;
              this.isQuarantined = false;
          }.bind(this), 
          14000
          );
  
          this.infectionIgnore.push(this.id);
          setTimeout(
          function () {
              this.infectionIgnore.splice(0, 1);
          }.bind(this),
          14000
          );
      }
    }
};
  
function circleIntersect(x1, y1, r1, x2, y2, r2) {
  // Calculate the distance between the two circles
  let squareDistance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);

  // When the distance is smaller or equal to the sum
  // of the two radius, the circles touch or overlap
  return squareDistance <= (r1 + r2) * (r1 + r2);
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
  var b = ((a + 180) % 360) - 180;
  return b;
}
