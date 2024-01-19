import Vector from "./vector.js";
import IntersectData from "./intersectData.js";
import PhysicsObject from "./physicsObject.js";
import Plane from "@/physics/plane";
import AABB from "@/physics/aabb";

export default class BoundingSphere extends PhysicsObject {
    // Center is vector, radius is float
    constructor(center, radius, mass=1) {
        super(center, new Vector({x: 0, y: 0}), mass, 1, "black");
        this._center = center;
        this._radius = radius;
        this._drag = 0.47;
        this._surfaceArea = Math.PI * radius * radius;
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

    intersectPoint(point) {
        const distance = point.clone().subtract(this._center).getLength();
        return new IntersectData(distance < this._radius, distance - this._radius);
    }

    intersectSphere(otherSphere){
        // Distance of centers if both spheres are touching
        const radiusDistance = this._radius + otherSphere._radius;
        // Get length of difference vector of both centerVectors
        const centerDistance = otherSphere._center.clone().subtract(this._center).getLength();
        return new IntersectData(centerDistance <= radiusDistance, centerDistance - radiusDistance);
    }

    intersectAABB(aabb){
        const aabbMin = aabb.minExtents.vector;
        const aabbMax = aabb.maxExtents.vector;
        const sphereCenter = this._center.vector;

        let x = Math.max(aabbMin.x, Math.min(sphereCenter.x, aabbMax.x));
        let y = Math.max(aabbMin.y, Math.min(sphereCenter.y, aabbMax.y));
        let z = Math.max(aabbMin.z, Math.min(sphereCenter.z, aabbMax.z));

        const distance = Math.sqrt((x - sphereCenter.x) * (x - sphereCenter.x) +
            (y - sphereCenter.y) * (y - sphereCenter.y) +
            (z - sphereCenter.z) * (z - sphereCenter.z));

        return new IntersectData(distance < this._radius, distance - this._radius);
    }

    intersectPlane(plane){
        // Normalize the plane
        const normalizedPlane = plane.normalized();

        // Calculate the distance from the sphere's center to the plane
        const distance = normalizedPlane.normal.clone().getDotProduct(this._center) - normalizedPlane.distance;

        // Check if the sphere and the plane are intersecting
        const doesIntersect = Math.abs(distance) <= this._radius;


        return new IntersectData(doesIntersect, distance);

    }

    intersect(other) {
        if (other instanceof BoundingSphere) {
            return this.intersectSphere(other);
        } else if (other instanceof AABB) {
            return this.intersectAABB(other);
        } else if (other instanceof Plane) {
            return this.intersectPlane(other);
        } else if (other instanceof Vector) {
            return this.intersectPoint(other);
        }
        else {
            throw new Error(other.constructor + " is not a valid object to intersect with a BoundingSphere")
        }
    }

    draw(ctx){
        ctx.beginPath();
        ctx.arc(this._position.vector.x, this._position.vector.y, this._radius, 0, 2 * Math.PI);
        ctx.fillStyle = this._color;
        ctx.fill();
    }

    integrate(deltaTime, settingsRef){
        // Inherit but also update center
        super.integrate(deltaTime, settingsRef);
        this._center = this._position;
    }

}
//const one = new BoundingSphere(new Vector({x: 0, y: 1}), 1);
/*
const one = new BoundingSphere(new Vector({x: 0, y: 1}), 1);
const two = new BoundingSphere(new Vector({x: 0, y: 0}), 1);

console.log(one.intersectBoundingSphere(two));

 */