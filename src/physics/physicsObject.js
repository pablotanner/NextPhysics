import Vector from "./vector.js";

export default class PhysicsObject {
    constructor(position, velocity){
        this._position = position;
        this._velocity = velocity;
    }

    get position(){
        return this._position;
    }

    get velocity(){
        return this._velocity;
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

    // based on velocity of PhysicsObject, update position (deltaTime is in seconds)
    integrate(deltaTime){
        this._position = this._position.add(this._velocity.multiply(deltaTime));
    }


}

