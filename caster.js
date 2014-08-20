var canvas, canvasContext, buffer, bufferContext;
var map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

function Vec2(x, y) {
  this.x = x;
  this.y = y;

  this.rotate = function(angle) {
    angle = angle * Math.PI / 180;
    newX = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    newY = this.x * Math.sin(angle) + this.y * Math.cos(angle);
    this.x = newX;
    this.y = newY;
  }

  this.add = function(vec2) {
    return new Vec2(this.x + vec2.x, this.y + vec2.y);
  }

  this.mult = function(scalar) {
    return new Vec2(this.x * scalar, this.y * scalar);
  }
}

function Camera(position, direction) {
  this.position = position;
  this.direction = direction;
  // create a view vector perpendicular to direction
  this.view = new Vec2(-direction.y, direction.x).mult(0.60);

  this.rotate = function(angle) {
    this.direction.rotate(angle);
    this.view.rotate(angle);
  }
}

function setUp() {
  // set up world
  player = new Camera(new Vec2(5, 4), new Vec2(-1.0, 0.0));
  // set up rendering
  canvas = document.getElementById('render');
  if (canvas.getContext) {
    canvasContext = canvas.getContext('2d');
  }
  buffer = document.createElement('canvas');
  buffer.width = canvas.width;
  buffer.height = canvas.height;
  if (buffer.getContext) {
    bufferContext = buffer.getContext('2d')
  }
  // shim layer with setTimeout fallback
  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();
  update();
}

function update() {
  window.requestAnimFrame(update);
  player.rotate(0.5);
  draw();
}

function castRay(column, origin, direction) {
  mapX = Math.floor(origin.x);
  mapY = Math.floor(origin.y);

  distancePerX = Math.sqrt(1 + (direction.y * direction.y) / (direction.x * direction.x));
  distancePerY = Math.sqrt(1 + (direction.x * direction.x) / (direction.y * direction.y));
  if(direction.x < 0) {
    stepX = -1;
    sideX = (origin.x - mapX) * distancePerX;
  } else {
    stepX = 1;
    sideX = (mapX + 1 - origin.x) * distancePerX;
  }
  if(direction.y < 0) {
    stepY = -1;
    sideY = (origin.y - mapY) * distancePerY;
  } else {
    stepY = 1;
    sideY = (mapY + 1 - origin.y) * distancePerY;
  }

  hit = 0;
  while (!hit) {
    if(sideX < sideY) {
      sideX += distancePerX;
      mapX += stepX;
      side = 0;
    } else {
      sideY += distancePerY;
      mapY += stepY;
      side = 1;
    }
    if(mapX < 0 || mapX > map.length - 1 || mapY < 0 || mapY > map.length - 1) {
      return
    }
    if(map[mapX][mapY] > 0) {
      hit = 1;
    }
  }
  if(side == 0) {
    wallDist = Math.abs((mapX - origin.x + (1 - stepX) / 2) / direction.x);
  } else {
    wallDist = Math.abs((mapY - origin.y + (1 - stepY) / 2) / direction.y);
  }
  wallHeight = Math.abs(Math.floor(buffer.height / wallDist));

  lineTop = -wallHeight / 2 + buffer.height / 2;
  if(lineTop < 0) {
    lineTop = 0;
  }
  lineBottom = wallHeight / 2 + buffer.height / 2;
  if(lineBottom > buffer.height) {
    lineBottom = buffer.height;
  }

  if (side == 1) {
    bufferContext.fillStyle = "rgb(128, 0, 0)";
  } else {
    bufferContext.fillStyle = "rgb(192, 0, 0)";
  }
  bufferContext.fillRect(column, lineTop, 1, lineBottom - lineTop);

}

function draw() {
  //draw sky
  bufferContext.fillStyle = "rgb(64, 64, 192)";
  bufferContext.fillRect(0, 0, buffer.width, buffer.height / 2);
  //draw grass
  bufferContext.fillStyle = "rgb(64, 192, 64)";
  bufferContext.fillRect(0, buffer.height / 2, buffer.width, buffer.height);

  //draw walls
  for(var x=0; x<=buffer.width; x++ ) {
    xRatio = 2 * x / buffer.width - 1;
    castRay(x, player.position, player.direction.add(player.view.mult(xRatio)));
  }
  canvasContext.drawImage(buffer, 0, 0);
}
