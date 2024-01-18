import Vector from "./vector.js";

class AbstractObject {
    constructor(position, velocity, mass, restitution, color){
        this._position = position;
        this._velocity = velocity;
        this._mass = mass;
        this._restitution = restitution;
        this._color = color;
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
}

export {AbstractObject};
