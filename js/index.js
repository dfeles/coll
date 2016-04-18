
WebFontConfig = {
    google: { families: [ 'Raleway:400,800:latin' ] },
    active: function(){start();},
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();



gravity = .01;
speed = .3;
duration =  1;
dieAt = 2;

var utils = {
  norm: function(value, min, max) {
    return (value - min) / (max - min);
  },

  lerp: function(norm, min, max) {
    return (max - min) * norm + min;
  },

  map: function(value, sourceMin, sourceMax, destMin, destMax) {
    return utils.lerp(utils.norm(value, sourceMin, sourceMax), destMin, destMax);
  },

  clamp: function(value, min, max) {
    return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
  },

  distance: function(p0, p1) {
    var dx = p1.x - p0.x,
      dy = p1.y - p0.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  distanceXY: function(x0, y0, x1, y1) {
    var dx = x1 - x0,
      dy = y1 - y0;
    return Math.sqrt(dx * dx + dy * dy);
  },

  circleCollision: function(c0, c1) {
    return utils.distance(c0, c1) <= c0.radius + c1.radius;
  },

  circlePointCollision: function(x, y, circle) {
    return utils.distanceXY(x, y, circle.x, circle.y) < circle.radius;
  },

  pointInRect: function(x, y, rect) {
    return utils.inRange(x, rect.x, rect.x + rect.radius) &&
      utils.inRange(y, rect.y, rect.y + rect.radius);
  },

  inRange: function(value, min, max) {
    return value >= Math.min(min, max) && value <= Math.max(min, max);
  },

  rangeIntersect: function(min0, max0, min1, max1) {
    return Math.max(min0, max0) >= Math.min(min1, max1) &&
      Math.min(min0, max0) <= Math.max(min1, max1);
  },

  rectIntersect: function(r0, r1) {
    return utils.rangeIntersect(r0.x, r0.x + r0.width, r1.x, r1.x + r1.width) &&
      utils.rangeIntersect(r0.y, r0.y + r0.height, r1.y, r1.y + r1.height);
  },

  degreesToRads: function(degrees) {
    return degrees / 180 * Math.PI;
  },

  radsToDegrees: function(radians) {
    return radians * 180 / Math.PI;
  },

  randomRange: function(min, max) {
    return min + Math.random() * (max - min);
  },

  randomInt: function(min, max) {
    return min + Math.random() * (max - min + 1);
  },

  getmiddle: function(p0, p1) {
    var x = p0.x,
      x2 = p1.x;
    middlex = (x + x2) / 2;
    var y = p0.y,
      y2 = p1.y;
    middley = (y + y2) / 2;
    pos = [middlex, middley];

    return pos;
  },

  getAngle: function(p0, p1) {
    var deltaX = p1.x - p0.x;
    var deltaY = p1.y - p0.y;
    var rad = Math.atan2(deltaY, deltaX);
    return rad;
  },
  inpercentW: function(size) {
    return (size * W) / 100;
  },

  inpercentH: function(size) {
    return (size * H) / 100;
  },

}

// basic setup  :)

canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
W = canvas.width = window.innerWidth*2;
H = canvas.height = window.innerHeight*2;
canvas.style.width = W/2+"px";
canvas.style.height = H/2+"px";

gridX = 1;
gridY = 1;

function shape(x, y, texte) {
  this.x = x;
  this.y = y;
  this.size = 120;

  this.text = texte;
  this.placement = [];
  this.vectors = [];

}

shape.prototype.getValue = function() {
  console.log("get black pixels position");

  // Draw the shape :^)

  ctx.textAlign = "center";
  ctx.font = '800 120px "Raleway"';
  ctx.fillText(this.text, this.x, this.y);

  // get the data

  var idata = ctx.getImageData(0, 0, W, H);

  // use a 32-bit buffer as we are only checking if a pixel is set or not
  var buffer32 = new Uint32Array(idata.data.buffer);

  // Loop throught the image
  for (var y = 0; y < H; y += gridY) {
    for (var x = 0; x < W; x += gridX) {
        if (buffer32[y * W + x]) {
          if (Math.random() > .5 )
          {
            this.placement.push(new particle(x, y));
          }
        }
    }
  }
  ctx.clearRect(0, 0, W, H);

  ctx.scale(2,2);
}
colors = [
  '#000000','#333333','#0076FF'
];
particleI = 0
function particle(x, y, type) {
  this.radius = .8;

  this.i = particleI
  particleI++

  this.age = 1.1;
  this.dieAt = utils.randomInt(dieAt, dieAt*40);


  this.rebond = utils.randomInt(1, 5);
  this.x = x;
  this.y = y;

  this.noise = utils.randomRange(-1,1);
  this.dying = false;

  this.base = {x:x, y:y};

  this.vx = 0;
  this.vy = 0;
  this.type = type;
  this.friction =.98;
  this.gravity = gravity;
  this.color = colors[Math.floor(Math.random() * colors.length)];

  this.getSpeed = function() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  };

  this.setSpeed = function(speed) {
    var heading = this.getHeading();
    this.vx = Math.cos(heading) * speed;
    this.vy = Math.sin(heading) * speed;
  };

  this.getHeading = function() {
    return Math.atan2(this.vy, this.vx);
  };

  this.setHeading = function(heading) {
    var speed = this.getSpeed();
    this.vx = Math.cos(heading) * speed;
    this.vy = Math.sin(heading) * speed;
  };

  this.angleTo = function(p2) {
    return Math.atan2(p2.y - this.y, p2.x - this.x);

  };

  ctx.fillStyle = "#333333";
  this.update = function(heading) {
    if(pageYOffset>250){

      var d = 2;
      if(this.i%50==0)
      {

        ratio = W/particleI
        this.x = (this.x*d + ratio*this.i)/(d+1)
        this.y = (this.y*d + 170)/(d+1)
        this.dying = true
      }
      else {
        this.x = (this.x*d + this.base.x+Math.sin(this.base.y/5+time)*2)/(d+1)
        this.y = (this.y*d + Math.sin(this.base.x/50+time)*20+this.base.y-230)/(d+1)
        this.dying = true;
      }
    }
    else if(this.dying){
      var d = 0;
      this.x = (this.x*d + this.base.x)/(d+1)
      this.y = (this.y*d + this.base.y-pageYOffset)/(d+1)

      //this.x = this.base.x
      //this.y = this.base.y-pageYOffset

      dist=utils.distanceXY(this.x,this.y,this.base.x,this.base.y-pageYOffset)
      if(dist<2){
          this.dying = false;
          this.age = 1;
          this.setSpeed(utils.randomRange(speed,speed*2));
      }
    }
    else
    {
      d=utils.distanceXY(cursorX,cursorY-pageYOffset,this.x,this.y)
      if(d<200){
          this.setSpeed((this.getSpeed()*2 + ((100+Math.sin(time*2)*100-d)/20+1-10*mouseDown))/3)
          this.setHeading(utils.getAngle({x:cursorX,y:cursorY-pageYOffset},this)+mouseDown*Math.PI)
      }
      this.x += this.vx;
      this.y += this.vy + scrollYOffset;
      this.vy += gravity;

      this.vx *= this.friction;
      this.vy *= this.friction;

      if(this.age < this.dieAt && this.dying === false){
        this.age += duration;
        var d = window.pageYOffset+.1;
        var direction = noise.perlin3(this.x/40, this.y/40, time)*20
        this.setHeading((this.getHeading()*10 + direction)/11);

      }else{
        if(!this.dying)
        {

          this.setHeading(this.angleTo(this.base));
          this.dying = true;
          //this.setSpeed(1);
        }
      }


    }

    ctx.fillRect(this.x,this.y, this.radius,this.radius)

  };

  this.setSpeed(speed);
  this.setHeading(utils.randomInt(utils.degreesToRads(-180), utils.degreesToRads(180)));

}


var cursorX;
var cursorY;
var time = 0;
document.onmousemove = function(e){
    cursorX = e.pageX;
    cursorY = e.pageY;
}
var mouseDown = false;
document.body.onmousedown = function() {
  mouseDown = true;
              console.log(mouseDown*2)
}
document.body.onmouseup = function() {
  mouseDown = false;
              console.log(mouseDown*2)
}

var message = new shape(800, 350, "COLL");

var fps = 100;
function start(){
  message.getValue();
  update();
}

lastScroll = 0
scrollYOffset = 0

function update() {
  setTimeout(function() {

    scrollYOffset = lastScroll - pageYOffset
    lastScroll = pageYOffset
    ctx.clearRect(0, 0, W, H);
    //ctx.fillStyle = 'rgba(255,255,255,.1)';
    //ctx.fillRect(0, 0, W, H);


    for (var i = 0; i < message.placement.length; i++) {
      message.placement[i].update();
    }

    time += .01
    requestAnimationFrame(update);
  }, 1000 / fps);
}
