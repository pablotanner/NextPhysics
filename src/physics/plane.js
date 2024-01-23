import PhysicsObject from "./physicsObject";
import IntersectData from "@/physics/intersectData";
import Vector from "@/physics/vector";
import BoundingSphere from "@/physics/boundingSphere";
import AABB from "@/physics/aabb";
import objectTypes from "@/physics/ObjectTypes";
import intersectData from "@/physics/intersectData";


export default class Plane extends PhysicsObject {
    constructor({ normal, distance, mass = 1, drag = 0, velocity = new Vector({x: 0, y: 0}), restitution = 1, color = "black" }) {
        super({ position: normal, velocity, mass, restitution, color });
        this._normal = normal;
        this._distance = distance;
        this._drag = drag;
        this._surfaceArea = 1;
        this._objectType = objectTypes.LINE;
        this._point = this._normal.clone().multiply(distance); // Add this line

    }

    get point() {
        return this._point;
    }

    set point(point) {
        if (!(point instanceof Vector)) {
            throw new Error("point must be an instance of Vector");
        }
        this._point = point;
        this._distance = this._normal.getDotProduct(point); // Update the distance when the point changes
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
        this._normal = normal;
        this._point = normal.clone().multiply(this._distance); // Update the point when the normal changes

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
    }

    intersectPoint(pointVector) {
        // Get the distance from the point to the plane
        const signedDistance = this.normal.getDotProduct(pointVector) - this.distance;

        // If the absolute value of the distance is less than the sphere's radius, the sphere and the plane are intersecting
        return new IntersectData(Math.abs(signedDistance) < 0, {x: 0, y: 0});
    }

    intersectAABB(aabb) {
        return aabb.intersectPlane(this);
    }

    intersectPlane(plane) {
        const signedDistance = this.normal.getDotProduct(plane.normal) - this.distance;

        // If the absolute value of the distance is less than the sphere's radius, the sphere and the plane are intersecting
        return new IntersectData(Math.abs(signedDistance) < 0, {x: 0, y: 0});
    }

    intersectSquare(square) {
        return square.intersectPlane(this);
    }


    resolveCollisionSquare(square, intersectData) {
        square.resolveCollisionPlane(this, intersectData);
    }

    resolveCollisionAABB(aabb, intersectData) {
        aabb.resolveCollisionPlane(this, intersectData);
    }

    resolveCollisionPlane(plane, intersectData) {
        // Do nothing
    }

    resolveCollisionSphere(sphere, intersectData) {
        sphere.resolveCollisionPlane(this, intersectData);
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