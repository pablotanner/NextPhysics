
class IntersectData {

    // doesIntersect is bool, distance is float
    constructor(doesIntersect, distance){
        this._doesIntersect = doesIntersect;
        this._distance = distance;
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

    set distance(distance){
        if(typeof distance !== "number"){
            throw new Error("distance must be a number");
        }
        this._distance = distance;
    }

}

export default IntersectData;