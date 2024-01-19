import PhysicsObject from "./physicsObject";
import IntersectData from "@/physics/intersectData";
import Vector from "@/physics/vector";
import BoundingSphere from "@/physics/boundingSphere";
import AABB from "@/physics/aabb";


export default class Plane extends PhysicsObject {
constructor(normal, distance) {
        super(normal, new Vector({x:0 ,y:0, z:0}), 1, 1, "black");
        this._normal = normal;
        this._distance = distance;
        this._drag = 0;
        this._surfaceArea = 1;
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
        const distanceFromSphereCenter = normalizedNormal._normal.getDotProduct(sphere._center) - normalizedNormal._distance;

        // Check if the sphere and the plane are intersecting
        const doesIntersect = Math.abs(distanceFromSphereCenter) <= sphere.radius;

        return new IntersectData(doesIntersect, distanceFromSphereCenter);
    }

    intersectPoint(pointVector) {
        // Get the distance from the point to the plane
        const signedDistance = this._normal.getDotProduct(pointVector) - this._distance;

        // If the absolute value of the distance is less than the sphere's radius, the sphere and the plane are intersecting
        return new IntersectData(Math.abs(signedDistance) < 0, Math.abs(signedDistance));
    }

    intersectAABB(aabb) {
        const center = aabb._minExtents.clone().add(aabb._maxExtents).divide(2);
        const extents = aabb._maxExtents.clone().subtract(center);

        const r = extents.vector.x * Math.abs(this._normal.vector.x) + extents.vector.y * Math.abs(this._normal.vector.y) + extents.vector.z * Math.abs(this._normal.vector.z);
        const s = this._normal.getDotProduct(center) - this._distance;

        return new IntersectData(Math.abs(s) <= r, s - r);
    }

    intersectPlane(plane) {
        const signedDistance = this._normal.getDotProduct(plane.normal) - this._distance;

        // If the absolute value of the distance is less than the sphere's radius, the sphere and the plane are intersecting
        return new IntersectData(Math.abs(signedDistance) < 0, Math.abs(signedDistance));
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
        } else {
            throw new Error(other.constructor + " is not a valid object to intersect with a plane");
        }
    }

    draw(ctx){
        const yIntercept = this._distance;
        ctx.beginPath();
        ctx.strokeStyle = this._color;
        ctx.moveTo(0, yIntercept);
        ctx.lineTo(1500, yIntercept);
        ctx.stroke();
    }

    integrate(deltaTime){
        // Do nothing
    }
}