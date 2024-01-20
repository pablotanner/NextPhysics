import PhysicsObject from "./physicsObject";
import IntersectData from "@/physics/intersectData";
import Vector from "@/physics/vector";
import BoundingSphere from "@/physics/boundingSphere";
import AABB from "@/physics/aabb";
import objectTypes from "@/physics/ObjectTypes";


export default class Plane extends PhysicsObject {
    constructor({ normal, distance, mass = 1, drag = 0, velocity = new Vector({x: 0, y: 0}), restitution = 1, color = "black" }) {
        super({ position: normal, velocity, mass, restitution, color });
        this._normal = normal;
        this._distance = distance;
        this._drag = drag;
        this._surfaceArea = 1;
        this._objectType = objectTypes.LINE;
    }

    get normal() {
        return this._normal;
    }

    get distance() {
        return this._distance;
    }

    set normal(normal) {
        if (!(normal instanceof Vector)) {
            throw new Error("normal must be an instance of Vector");
        }
    }

    set distance(distance) {
        if (typeof distance !== "number") {
            throw new Error("distance must be a number");
        }
        this._distance = distance;
    }

    normalized() {
        const magnitude = this.normal.getLength();
        return new Plane({ normal: this.normal.clone().divide(magnitude), distance: this.distance / magnitude });
    }

    intersectSphere(sphere) {
        return sphere.intersectPlane(this);
        /*
        const normalizedNormal = this.normalized();
        const distanceFromSphereCenter = normalizedNormal.normal.getDotProduct(sphere.center) - normalizedNormal.distance;

        // Check if the sphere and the plane are intersecting
        const doesIntersect = Math.abs(distanceFromSphereCenter) <= sphere.radius;

        return new IntersectData(doesIntersect, distanceFromSphereCenter);

         */
    }

    intersectPoint(pointVector) {
        // Get the distance from the point to the plane
        const signedDistance = this.normal.getDotProduct(pointVector) - this.distance;

        // If the absolute value of the distance is less than the sphere's radius, the sphere and the plane are intersecting
        return new IntersectData(Math.abs(signedDistance) < 0, Math.abs(signedDistance));
    }

    intersectAABB(aabb) {
        return aabb.intersectPlane(this);
        /*
        const center = aabb.minExtents.clone().add(aabb.maxExtents).divide(2);
        const extents = aabb.maxExtents.clone().subtract(center);

        const r = extents.vector.x * Math.abs(this.normal.vector.x) + extents.vector.y * Math.abs(this.normal.vector.y) //+ extents.vector.z * Math.abs(this.normal.vector.z);
        const s = this.normal.getDotProduct(center) - this.distance;

        return new IntersectData(Math.abs(s) <= r, s - r);

         */
    }

    intersectPlane(plane) {
        const signedDistance = this.normal.getDotProduct(plane.normal) - this.distance;

        // If the absolute value of the distance is less than the sphere's radius, the sphere and the plane are intersecting
        return new IntersectData(Math.abs(signedDistance) < 0, Math.abs(signedDistance));
    }

    draw(ctx){
        const yIntercept = this.distance;
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.moveTo(0, yIntercept);
        ctx.lineTo(1500, yIntercept);
        ctx.stroke();
    }

    integrate(deltaTime){
        // Do nothing
    }
}