
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
speed = .5;
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
var ctx
var cursorX;
var cursorY;
var time = 0;

var mouseDown = false;
var gridX = 1;
var gridY = 1;


// basic setup  :)
$(document).ready(function(){
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext('2d');
  W = canvas.width = window.innerWidth*2;
  H = canvas.height = window.innerHeight*2;
  canvas.style.width = W/2+"px";
  canvas.style.height = H/2+"px";

  

  document.onmousemove = function(e){
    cursorX = e.pageX;
    cursorY = e.pageY;
  }
  $( "body" ).mousedown(function() {
    mouseDown = true;
  });

  $( "body" ).mouseup(function() {
    mouseDown = false;
  });
});

var originalX = 0
function shape(x, y, texte, size) {
  this.x = x;
  originalX = x;
  this.y = y;
  this.size = size;

  this.text = texte;
  this.placement = [];
  this.vectors = [];

}

shape.prototype.getValue = function() {
  console.log("get black pixels position");

  // Draw the shape :^)
  console.log($("#coll").css("fontFamily"));
  ctx.font = 'bold '+$("#coll").css("fontSize")+'"'+$("#coll").css("fontFamily")+'"' ;
//  ctx.css("font-size",$("#coll").css("fontSize"));
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
  '#FFFFFF','#FFFFFF','#FFFFFF'
];
particleI = 0



var message;

var fps = 100;
function start(){
  message = new shape($("#coll").offset().left+2, $("#coll").offset().top+parseInt($("#coll").css("fontSize"), 10)-6, $("#coll").text(), $("#coll").css("fontSize"));

  message.getValue();
  update();
}

lastScroll = 0
scrollYOffset = 0
prevMouseDown = true
switchingMouse = false
function update() {
  setTimeout(function() {
    if (prevMouseDown != mouseDown)
    {
      prevMouseDown = mouseDown
      switchingMouse = true
    }
    else
    {
      switchingMouse = false
    }
    XOffset = originalX - ($("#coll").offset().left + 18)

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
