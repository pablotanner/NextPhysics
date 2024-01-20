import PhysicsObject from "./physicsObject.js";
import Vector from "./vector.js";
import IntersectData from "./intersectData.js";
import BoundingSphere from "@/physics/boundingSphere";
import Plane from "@/physics/plane";
import objectTypes from "@/physics/ObjectTypes";

export default class AABB extends PhysicsObject {
    constructor({ minExtents, maxExtents, mass = 1, drag = 1.05, velocity = new Vector({x: 0, y: 0}), restitution = 1, color}) {
        super({ position: minExtents, velocity, mass, restitution, color });
        this._minExtents = minExtents;
        this._maxExtents = maxExtents;
        this._drag = drag;
        this._surfaceArea = this.calculateSurfaceArea();
        this._objectType = objectTypes.AABB;
    }


    get position(){
        return this._minExtents;
    }
    set position(position){
        const width = this.maxExtents.vector.x - this.minExtents.vector.x;
        const height = this.maxExtents.vector.y - this.minExtents.vector.y;
        this._minExtents = position;
        this._maxExtents = this._minExtents.clone().add(new Vector({x: width, y: height}));
    }

    calculateSurfaceArea() {
        const width = this.maxExtents.vector.x - this.minExtents.vector.x;
        const height = this.maxExtents.vector.y - this.minExtents.vector.y;
        return 2 * width * height + 2 * width * height + 2 * width * height;
    }

    get minExtents() {
        return this._minExtents;
    }

    get maxExtents() {
        return this._maxExtents;
    }

    set minExtents(minExtents) {
        if (!(minExtents instanceof Vector)) {
            throw new Error("minExtents must be an instance of Vector");
        }
        this._minExtents = minExtents;
    }

    set maxExtents(maxExtents) {
        if (!(maxExtents instanceof Vector)) {
            throw new Error("maxExtents must be an instance of Vector");
        }
        this._maxExtents = maxExtents;
    }


    intersectSphere(sphere) {
        return sphere.intersectAABB(this);
    }

    intersectPoint(pointVector) {
        const point = pointVector.vector;

        const box = {
            minX: this.minExtents.vector.x,
            maxX: this.maxExtents.vector.x,
            minY: this.minExtents.vector.y,
            maxY: this.maxExtents.vector.y,
        };

        //return new IntersectData((point.x >= box.minX && point.x <= box.maxX) && (point.y >= box.minY && point.y <= box.maxY) && (point.z >= box.minZ && point.z <= box.maxZ), 0);
        return new IntersectData((point.x >= box.minX && point.x <= box.maxX) && (point.y >= box.minY && point.y <= box.maxY), {x: 0, y: 0}, 0);
    }

    intersectAABB(otherAABB) {
        const distances1 = otherAABB.minExtents.clone().subtract(this.maxExtents);
        const distances2 = this.minExtents.clone().subtract(otherAABB.maxExtents);

        const distances = distances1.clone().max(distances2);

        const maxDistance = distances.max();

        return new IntersectData(maxDistance < 0, distances, maxDistance);

    }

    intersectPlane(plane) {
        const center = this.minExtents.clone().add(this.maxExtents).divide(2);
        const extents = this.maxExtents.clone().subtract(center);

        const r = extents.vector.x * Math.abs(plane.normal.vector.x) + extents.vector.y * Math.abs(plane.normal.vector.y);// + extents.vector.z * Math.abs(plane.normal.vector.z);
        const s = plane.normal.getDotProduct(center) - plane.distance;

        // Direction is the normal of the plane

        return new IntersectData(Math.abs(s) <= r, plane.normal.clone(), Math.abs(s) - r);
    }


    draw(ctx) {
        const width = this.maxExtents.vector.x - this.minExtents.vector.x;
        const height = this.maxExtents.vector.y - this.minExtents.vector.y;
        ctx.beginPath();
        ctx.rect(this.minExtents.vector.x, this._minExtents.vector.y, width, height);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    resolveCollisionPlane(plane, intersectData) {
        const direction = intersectData.direction;

        const distance = intersectData.distance;

        if (distance < 0) {
            this.position = this.position.clone().add(direction.clone().multiply(distance));
        }
    }

    resolveCollisionAABB(aabb, intersectData) {
        // Calculate the centers of the AABBs
        const center1 = aabb.minExtents.clone().add(aabb.maxExtents.clone()).divide(2);
        const center2 = this.minExtents.clone().add(this.maxExtents.clone()).divide(2);

        // Calculate the collision normal
        const collisionNormal = center2.clone().subtract(center1).normalize();

        // Calculate the half extents of the AABBs
        const halfExtents1 = aabb.maxExtents.clone().subtract(aabb.minExtents).divide(2);
        const halfExtents2 = this.maxExtents.clone().subtract(this.minExtents).divide(2);

        // Calculate the overlap along the collision normal
        const overlap = halfExtents1.add(halfExtents2).subtract(center2.subtract(center1).abs());

        // Calculate the penetration depth
        const penetrationDepth = overlap.max();

        // Calculate the total inverse mass
        const totalInverseMass = aabb.inverseMass + this.inverseMass;

        // Calculate the movement vector
        const movement = collisionNormal.clone().multiply(penetrationDepth / totalInverseMass);

        // Move the AABB out of the collision
        aabb.minExtents = aabb.minExtents.clone().subtract(movement.clone().multiply(aabb.inverseMass));
        aabb.maxExtents = aabb.maxExtents.clone().subtract(movement.clone().multiply(aabb.inverseMass));
    }

    resolveCollisionSphere(sphere, intersectData) {
        sphere.resolveCollisionAABB(this, intersectData);
    }

    // Special integrate method for AABB
    integrate(deltaTime, settings) {
        super.integrate(deltaTime, settings);
        const deltaPosition = this.velocity.clone().multiply(deltaTime);
        this.minExtents = this.minExtents.clone().add(deltaPosition);
        this.maxExtents = this.maxExtents.clone().add(deltaPosition);
        this.position = this.minExtents.clone();
    }
}

/*
const one = new AABB(new Vector({x: 0, y: 0}), new Vector({x: 1, y: 1}));

const two = new AABB(new Vector({x: 0, y: 1}), new Vector({x: 1, y: 1}));

console.log(one.intersectAABB(two));

 */