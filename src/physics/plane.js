import PhysicsObject from "./physicsObject";
import IntersectData from "@/physics/intersectData";
import Vector from "@/physics/vector";
import BoundingSphere from "@/physics/boundingSphere";
import AABB from "@/physics/aabb";


export default class Plane extends PhysicsObject {
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
}