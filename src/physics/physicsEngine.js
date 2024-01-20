

export default class PhysicsEngine {
    constructor() {
        // Array of PhysicsObject instances
        this.objects = [];
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


    collisionDetection() {
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                if (this.objects[i].intersects(this.objects[j])) {
                    // Handle
                }
            }
        }
    }

    integrate(deltaTime, settingsRef) {
        this.objects.forEach((object) => {
            object.integrate(deltaTime, settingsRef);
        });
    }
}