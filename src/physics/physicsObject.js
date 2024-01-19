import Vector from "./vector.js";

export default class PhysicsObject {
    constructor(position, velocity, mass, restitution, color){
        this._position = position;
        this._velocity = velocity;
        this._mass = mass;
        this._restitution = restitution;
        this._color = color;
        this._force = new Vector({x: 0, y: 0, z: 0});
    }

    get force(){
        return this._force;
    }

    set force(force){
        if(!(force instanceof Vector)){
            throw new Error("force must be an instance of Vector");
        }
        this._force = force;
    }

    get position(){
        return this._position;
    }

    get velocity(){
        return this._velocity;
    }

    get mass(){
        return this._mass;
    }

    get restitution(){
        return this._restitution;
    }

    get color(){
        return this._color;
    }

    set position(position){
        if(!(position instanceof Vector)){
            throw new Error("position must be an instance of Vector");
        }
        this._position = position;
    }

    set velocity(velocity){
        if(!(velocity instanceof Vector)){
            throw new Error("velocity must be an instance of Vector");
        }
        this._velocity = velocity;
    }

    set mass(mass){
        if(typeof mass !== "number"){
            throw new Error("mass must be a number");
        }
        this._mass = mass;
    }

    set restitution(restitution){
        if(typeof restitution !== "number"){
            throw new Error("restitution must be a number");
        }
        this._restitution = restitution;
    }

    set color(color){
        if(typeof color !== "string"){
            throw new Error("color must be a string");
        }
        this._color = color;
    }

    draw(ctx){
        throw new Error("draw method must be implemented");
    }

    intersectPoint(point){
        throw new Error("intersectPoint method must be implemented");
    }

    intersectSphere(sphere){
        throw new Error("intersectSphere method must be implemented");
    }

    intersectAABB(aabb){
        throw new Error("intersectAABB method must be implemented");
    }

    intersectPlane(plane){
        throw new Error("intersectPlane method must be implemented");
    }

    intersect(other) {
        throw new Error("intersect method must be implemented");
    }



    // based on velocity of PhysicsObject, update position (deltaTime is in seconds)
    integrate(deltaTime){
        // Calculate acceleration from force and mass
        const acceleration = this._force.divide(this._mass);

        // Update velocity based on acceleration
        this._velocity = this._velocity.add(acceleration.multiply(deltaTime));

        // Update position based on velocity
        this._position = this._position.add(this._velocity.multiply(deltaTime));

        // Reset force for the next frame
        this._force = new Vector({x: 0, y: 0, z: 0});
    }

}

