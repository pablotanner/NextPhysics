import Vector from "@/physics/vector";

class IntersectData {

    // doesIntersect is bool, distance is float
    constructor(doesIntersect, direction, distance){
        this._doesIntersect = doesIntersect;
        this._direction = direction;
        this._distance = distance;
    }

    get direction(){
        return this._direction;
    }

    set direction(direction){
        if(!(direction instanceof Vector)){
            throw new Error("direction must be an instance of Vector");
        }
        this._direction = direction;
    }

    get doesIntersect(){
        return this._doesIntersect;
    }

    get distance(){
        return this._distance;
    }

    set doesIntersect(doesIntersect){
        if(typeof doesIntersect !== "boolean"){
            throw new Error("doesIntersect must be a boolean");
        }
        this._doesIntersect = doesIntersect;
    }


}

export default IntersectData;