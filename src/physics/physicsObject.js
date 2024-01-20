import Vector from "./vector.js";
import ObjectTypes from "@/physics/ObjectTypes";

export default class PhysicsObject {
    constructor({ position, velocity=new Vector({x:0, y:0}), mass, restitution, surfaceArea, color="black", drag=0 }) {
        this._motion = { position, velocity };
        this._mass = mass;
        this._restitution = restitution;
        this._color = color;
        this._force = new Vector({ x: 0, y: 0, z: 0 });
        this._drag = drag;
        this._surfaceArea = surfaceArea;
        this._objectType = "PhysicsObject";
    }

    get objectType(){
        return this._objectType;
    }

    get surfaceArea() {
        return this._surfaceArea;
    }

    get inverseMass() {
        if (this._mass === 0) {
            return 0;
        }
        return 1 / this._mass;
    }

    set surfaceArea(surfaceArea) {
        if (typeof surfaceArea !== "number") {
            throw new Error("surfaceArea must be a number");
        }
        this._surfaceArea = surfaceArea;
    }

    get position() {
        return this._motion.position;
    }

    set position(position) {
        if (!(position instanceof Vector)) {
            throw new Error("position must be an instance of Vector");
        }
        this._motion.position = position;
    }

    get velocity() {
        return this._motion.velocity;
    }

    set velocity(velocity) {
        if (!(velocity instanceof Vector)) {
            throw new Error("velocity must be an instance of Vector");
        }
        this._motion.velocity = velocity;
    }


    get drag() {
        return this._drag;
    }

    set drag(drag) {
        if (typeof drag !== "number") {
            throw new Error("drag must be a number");
        }
        this._drag = drag;
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

    get motion(){
        return this._motion;
    }

    set motion(motion){
        if(!(motion.position instanceof Vector)){
            throw new Error("position must be an instance of Vector");
        }
        if(!(motion.velocity instanceof Vector)){
            throw new Error("velocity must be an instance of Vector");
        }
        this._motion = motion;
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
        switch (other.objectType) {
            case ObjectTypes.POINT:
                return this.intersectPoint(other);
            case ObjectTypes.CIRCLE:
                return this.intersectSphere(other);
            case ObjectTypes.AABB:
                return this.intersectAABB(other);
            case ObjectTypes.LINE:
                return this.intersectPlane(other);
            default:
                throw new Error("objectType not recognized");
        }
    }




    // based on velocity of PhysicsObject, update position (deltaTime is in seconds)
// based on velocity of PhysicsObject, update position (deltaTime is in seconds)
    integrate(deltaTime, settingsRef){
        // Calculate drag force

        const velocityMagnitude = this.velocity.getLength();
        let dragMagnitude = 0.5 * settingsRef.current.airDensity * this.drag * this.surfaceArea * velocityMagnitude * velocityMagnitude;

        const maxDrag = 1000;
        if (dragMagnitude > maxDrag){
            dragMagnitude = maxDrag;
        }
        const dragForce = this.velocity.clone().normalize().multiply(-dragMagnitude);

        // Calculate net force
        const netForce = this.force.clone().add(dragForce);

        // Calculate acceleration from force and mass
        const acceleration = netForce.divide(this.mass);

        // Update velocity based on acceleration
        this.velocity = this.velocity.clone().add(acceleration.multiply(deltaTime));

        // Update position based on velocity
        this.position = this.position.clone().add(this.velocity.clone().multiply(deltaTime));


        // Reset force for the next frame
        this.force = new Vector({x: 0, y: 0, z: 0});
    }
}

