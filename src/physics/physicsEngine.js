import ObjectTypes from "@/physics/ObjectTypes";
import Vector from "@/physics/vector";


export default class PhysicsEngine {
    constructor(settings) {
        // Array of PhysicsObject instances
        this.objects = [];
        this._settings = settings;
    }

    reset() {
        this.objects = [];
    }

    get settings(){
        return this._settings;
    }

    set settings(settings) {
        this._settings = settings;
    }


    addObject(object) {
        this.objects.push(object);
    }

    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index !== -1) {
            this.objects.splice(index, 1);
        }
    }


    handleCollisions() {
        const hasIntersection = []
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                const intersectData = this.objects[i].intersect(this.objects[j]);
                if (intersectData.doesIntersect) {
                    hasIntersection.push(i)
                    hasIntersection.push(j)
                    // Change colors for visibility
                    //this.objects[i].color = "red";
                    //this.objects[j].color = "red";

                    // Resolve collision
                    this.objects[i].resolveCollision(this.objects[j], intersectData);

                }
            }
        }
        // Set all objects that don't have an intersection to black
        for (let i = 0; i < this.objects.length; i++) {
            if (hasIntersection.find(index => index === i) === undefined) {
                //this.objects[i].color = "black";
            }
        }
    }

    applyDrag() {
        const airDensity = this.settings.airDensity;
        this.objects.forEach((object) => {
            const velocityMagnitude = object.velocity.getLength();
            let dragMagnitude = 0.5 * airDensity * object.drag * object.surfaceArea * velocityMagnitude * velocityMagnitude;

            const dragForce = object.velocity.clone().normalize().multiply(-dragMagnitude);

            object.applyForce(dragForce);
        });
    }

    applyFriction() {
        this.objects.forEach((object) => {
            const frictionForce = object.velocity.clone().normalize().multiply(-object.friction * object.mass * (this.settings.gravity * 100));
            object.applyForce(frictionForce);

        });
    }

    applyGravity() {
        this.objects.forEach((object) => {
            const gravityForce = new Vector({x: 0, y: object.mass * (this.settings.gravity * 100)});
            object.applyForce(gravityForce);
        });
    }


    integrate(deltaTime) {
        this.objects.forEach((object) => {
            object.integrate(deltaTime, this.settings);
        });
    }

    update(deltaTime) {
        this.applyDrag(); // Objects slow down in air (if larger surface area, more slow)
        this.applyFriction(); // Sliding objects slow down
        this.applyGravity(); // All objects fall
        this.integrate(deltaTime); // Move objects
        this.handleCollisions(); // Handle collisions
    }

}