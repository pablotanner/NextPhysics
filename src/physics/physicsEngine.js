

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
    integrate(deltaTime, settingsRef) {
        this.objects.forEach((object) => {
            object.integrate(deltaTime, settingsRef);
        });
    }
}