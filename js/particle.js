gravity = .01;
speed = .5;
duration =  1;
dieAt = 2;

function particle(x, y, type) {
  this.radius = .8;

  this.i = particleI
  particleI++

  this.age = 1.1;
  this.dieAt = utils.randomInt(dieAt, dieAt*80);


  this.rebond = utils.randomInt(1, 5);
  this.x = x;
  this.y = y;

  this.noise = utils.randomRange(-1,1);
  this.dying = false;

  this.base = {x:x, y:y};

  this.vx = 0;
  this.vy = 0;
  this.type = type;
  this.friction =1;
  this.gravity = 15;
  this.speed = speed

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
      this.alpha = 1;

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

     if(switchingMouse){
       this.setSpeed(50)
     }
     if(mouseDown)
     {
      this.setSpeed(5)
      this.radius = (30*this.radius + 1.5)/31
      this.alpha = noise.perlin3(this.x/40, this.y/40, time)+.3;
     }
     else
     {

      this.radius = (30*this.radius +(noise.perlin3(this.x/40, this.y/40, time) + .5))/31
      this.alpha = 1;
      this.setSpeed((30*this.getSpeed() + speed)/31);
     }
    }
    ctx.globalAlpha=this.alpha;
    ctx.fillRect(this.x,this.y, this.radius,this.radius)

  };

  this.setSpeed(speed);

  this.setHeading(utils.randomInt(utils.degreesToRads(-180), utils.degreesToRads(180)));

}