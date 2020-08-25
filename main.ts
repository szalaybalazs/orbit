const WIDTH: number = 1024;
const HEIGHT: number = 1024;

const UNIT_WIDTH = 2048;
const UNIT_HEIGHT = 2048;

const GRAVITY_CONSTANT: number = 6.67430 * Math.pow(10, 2);

const SPEED = 10;

const calculteForce = (planet1: Planet, planet2: Planet): number => {
  const distance = planet1.currentPosition.distance(planet2.currentPosition);
  console.log(distance);
  return GRAVITY_CONSTANT * (planet1.mass, planet2.mass) / Math.pow(distance, 2);
}

// a = f / m
// G * (m1 * m2) / r^2

class Vector {
  x: number = 0;
  y: number = 0;

  

  constructor(x?: number, y?: number) { 
    this.x = x || 0;
    this.y = y || 0;
  }

  get position(): { x: number, y: number } {
    return {
      x: (this.x + UNIT_WIDTH / 2) / UNIT_WIDTH * WIDTH,
      y: (this.y + UNIT_HEIGHT / 2) / UNIT_HEIGHT * HEIGHT,
    }
  }

  distance(vec: Vector): number {
    return Math.sqrt(Math.pow(this.x - vec.x, 2) + Math.pow(this.y - vec.y, 2));
  }

  get length() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  add(x: number, y: number): Vector {
    this.x += x;
    this.y += y;

    return this;
  }

  clone(): Vector {
    return new Vector(this.x, this.y);
  }

  subtract(x: number, y: number): Vector {
    this.x -= x;
    this.y -= y;

    return this;
  }

  addVector(vec: Vector): Vector {
    this.x += vec.x;
    this.y += vec.y

    return this;
  }
  subtractVector(vec: Vector): Vector {
    this.x -= vec.x;
    this.y -= vec.y

    return this;
  }

  multiply(x: number, y?: number): Vector {
    this.x *= x;
    this.y *= y || x;

    return this;
  }

  normalize(): Vector {
    this.x /= this.length;
    this.y /= this.length;
    return this;
  }
}

class Planet {
  initialVelocity: Vector = new Vector();
  currentVelocity: Vector = new Vector(0, 1);
  currentAcceleration: Vector = new Vector();
  currentPosition: Vector = new Vector();
  mass: number = 1;

  massNode: HTMLInputElement | null = null;
  velocityNode: HTMLInputElement | null = null;
  currentVelocityNode: HTMLElement | null = null;
  id: number | string;

  color: string | null = null;

  ctx: CanvasRenderingContext2D;

  constructor(context: CanvasRenderingContext2D, id: string | number, position: Vector, velocity?: number, color?: string) {
    this.currentPosition = position;
    this.id = id;
    this.ctx = context;

    if (color) this.color = color;

    this.massNode = <HTMLInputElement>document.getElementById(`planet-${id}-mass`);
    this.currentVelocityNode = <HTMLInputElement>document.getElementById(`planet-${id}-current-velocity`);
    this.velocityNode = <HTMLInputElement>document.getElementById(`planet-${id}-initial-velocity`);

    this.currentVelocity = new Vector(0, (parseInt(this.velocityNode.value) - 50) / 10)
  }

  getUpdate() {
    this.mass = Math.max(1, parseInt(this.massNode?.value) * 100);
  }

  updatePosition(deltaTime: number) {
    const { x: vX, y: vY } = this.currentVelocity;
    const dX = vX * deltaTime / 1000;
    const dY = vY * deltaTime / 1000;

    this.currentPosition.add(dX, dY);
  }

  updateVelocity(planets: Planet[], deltaTime: number) {
    const _planets = planets.filter(planet => planet.id !== this.id);
    const force = calculteForce(_planets[0], this);
    const forceVector: Vector = _planets[0].currentPosition.clone().subtractVector(this.currentPosition).normalize().multiply(force / this.mass);
    this.currentVelocity.addVector(this.currentAcceleration.addVector(forceVector).multiply(deltaTime / 1000));
    this.currentVelocityNode.innerText = `${Math.round(this.currentVelocity.length * 1000)/1000} m/s`;
  }

  draw() {
    const { x, y } = this.currentPosition.position;
    this.ctx.beginPath();
    this.ctx.fillStyle = this.color || 'rgb(200, 0, 0)';

    const X = (WIDTH + x) % WIDTH;
    const Y = (HEIGHT + y) % HEIGHT;
    this.ctx.arc(X, Y, Math.pow(this.mass, 1 / 3), 0, 2 * Math.PI);
    this.ctx.fill();
  }
}

const canvas: HTMLCanvasElement | null = <HTMLCanvasElement>document.getElementById('canvas') || null;
const ctx: CanvasRenderingContext2D | null = canvas?.getContext('2d') || null;


const planets = [];
const reset = () => {
  planets.splice(0, planets.length);
  planets.push(new Planet(ctx, 1, new Vector(128, 0), 24, 'rgb(200, 0, 0)'));
  planets.push(new Planet(ctx, 2, new Vector(-128, 0), -24, 'rgb(0, 200, 0)'));
}

reset();


let previousTime: number = 0;
const render = (time: number): void => {
  const deltaTime: number = (time - previousTime) * SPEED;
  previousTime = time;
  
  // Updating planets data
  planets.map(planet => planet.getUpdate());
  
  // Update velocity
  planets.map(planet => planet.updateVelocity(planets, deltaTime));
  

  // Update position
  planets.map(planet => planet.updatePosition(deltaTime));
  
  // Drawing planets
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  planets.map(planet => planet.draw());

  requestAnimationFrame(render);
}

render(0);

