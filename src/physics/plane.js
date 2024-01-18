import {AbstractObject} from "@/physics/abstractObject";
import IntersectData from "@/physics/intersectData";
import Vector from "@/physics/vector";


export default class Plane extends AbstractObject {
constructor(normal, distance) {
        super(normal, 0, 0, 0, "black");
        this._normal = normal;
        this._distance = distance;
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
        const magnitude = this._normal.getLength();
        return new Plane(this._normal.clone().divide(magnitude), this._distance / magnitude);
    }

    intersectSphere(sphere) {
        const normalizedNormal = this.normalized();
        const distanceFromSphereCenter = Math.abs(normalizedNormal._normal.getDotProduct(sphere._center) - normalizedNormal._distance);

        const distanceFromSphere = distanceFromSphereCenter - sphere.radius;

        return new IntersectData(distanceFromSphere < 0, distanceFromSphere);
    }
    intersectPoint(pointVector) {
        // Get the distance from the point to the plane
        const signedDistance = this._normal.getDotProduct(pointVector) - this._distance;

        // If the absolute value of the distance is less than the sphere's radius, the sphere and the plane are intersecting
        return new IntersectData(Math.abs(signedDistance) < 0, Math.abs(signedDistance));
    }

    intersectAABB(aabb) {
        const aabbMin = aabb.minExtents;
        const aabbMax = aabb.maxExtents;

        // Get the distance from the AABB's center to the plane
        const signedDistance = this._normal.getDotProduct(aabbMin) - this._distance;

        // If the absolute value of the distance is less than the sphere's radius, the sphere and the plane are intersecting
        return new IntersectData(Math.abs(signedDistance) < 0, Math.abs(signedDistance));
    }

    intersectPlane(plane) {
        const signedDistance = this._normal.getDotProduct(plane.normal) - this._distance;

        // If the absolute value of the distance is less than the sphere's radius, the sphere and the plane are intersecting
        return new IntersectData(Math.abs(signedDistance) < 0, Math.abs(signedDistance));
    }

    draw(ctx){
        const yIntercept = this._distance;
        ctx.beginPath();
        ctx.strokeStyle = this._color;
        ctx.moveTo(0, yIntercept);
        ctx.lineTo(1500, yIntercept);
        ctx.stroke();
    }
}