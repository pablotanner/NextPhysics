import Vector from "./vector.js";
import IntersectData from "./intersectData.js";
import PhysicsObject from "./physicsObject.js";
import Plane from "@/physics/plane";
import AABB from "@/physics/aabb";
import objectTypes from "@/physics/ObjectTypes";

export default class BoundingSphere extends PhysicsObject {
    // Center is vector, radius is float
    constructor({ center, radius, mass = 1, drag = 0.47, velocity = new Vector({x: 0, y: 0}), restitution = 1, color = "black" }) {
        super({ position: center, velocity, mass, restitution, color });
        this._center = center;
        this._radius = radius;
        this._drag = drag;
        this._surfaceArea = Math.PI * radius * radius;
        this._objectType = objectTypes.CIRCLE;
    }
    get center() {
        return this._center;
    }

    get radius() {
        return this._radius
    }

    set center(center) {
        if(!(center instanceof Vector)) {
            throw new Error("center must be an instance of Vector");
        }
        this._center = center;
    }

    set radius(radius) {
        if(typeof radius !== "number") {
            throw new Error("radius must be a number");
        }
        this._radius = radius;
    }

    get position(){
        return this._center;
    }

    set position(position){
        this._center = position;
    }

    intersectPoint(point) {
        const distance = point.clone().subtract(this.center).getLength();
        return new IntersectData(distance < this.radius, distance - this.radius);
    }

    intersectSphere(otherSphere){
        // Distance of centers if both spheres are touching
        const radiusDistance = this.radius + otherSphere.radius;
        // Get length of difference vector of both centerVectors
        const centerDistance = otherSphere.center.clone().subtract(this.center).getLength();
        return new IntersectData(centerDistance <= radiusDistance, centerDistance - radiusDistance);
    }

    intersectAABB(aabb){
        const aabbMin = aabb.minExtents.vector;
        const aabbMax = aabb.maxExtents.vector;
        const sphereCenter = this.center.vector;

        let x = Math.max(aabbMin.x, Math.min(sphereCenter.x, aabbMax.x));
        let y = Math.max(aabbMin.y, Math.min(sphereCenter.y, aabbMax.y));

        const distance = Math.sqrt((x - sphereCenter.x) * (x - sphereCenter.x) + (y - sphereCenter.y) * (y - sphereCenter.y));

        return new IntersectData(distance < this.radius, distance - this.radius);
    }

    intersectPlane(plane){
        // Normalize the plane
        const normalizedPlane = plane.normalized();

        // Calculate the distance from the sphere's center to the plane
        const distance = normalizedPlane.normal.clone().getDotProduct(this.center) - normalizedPlane.distance;

        // Check if the sphere and the plane are intersecting
        const doesIntersect = Math.abs(distance) <= this.radius;
        return new IntersectData(doesIntersect, distance);

    }



    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.center.vector.x, this.center.vector.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

}
//const one = new BoundingSphere(new Vector({x: 0, y: 1}), 1);
/*
const one = new BoundingSphere(new Vector({x: 0, y: 1}), 1);
const two = new BoundingSphere(new Vector({x: 0, y: 0}), 1);

console.log(one.intersectBoundingSphere(two));

 */