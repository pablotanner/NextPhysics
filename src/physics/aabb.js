import PhysicsObject from "./physicsObject.js";
import Vector from "./vector.js";
import IntersectData from "./intersectData.js";
import BoundingSphere from "@/physics/boundingSphere";
import Plane from "@/physics/plane";
import objectTypes from "@/physics/ObjectTypes";

export default class AABB extends PhysicsObject {
    constructor({ minExtents, maxExtents, mass = 1, drag = 1.05, velocity = new Vector({x: 0, y: 0}), restitution = 1, color, rotation = 0, size,friction}) {
        super({ position: minExtents, velocity, mass, restitution, color,friction });
        this._minExtents = minExtents;
        this._maxExtents = maxExtents;
        this._drag = drag;
        this._surfaceArea = this.calculateSurfaceArea();
        this._objectType = objectTypes.AABB;
        this._rotation = rotation;
        this._size = size;
    }

    get size(){
        return this._size;
    }

    set size(size){
        this._size = size;
    }

    get rotation(){
        return this._rotation;
    }

    set rotation(rotation){
        this._rotation = rotation;
    }

    applyRotation(rotation){
        this.rotation += rotation;
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

    // Calculates the center of this AABB
    getCenter() {
        return new Vector({x: (this.minExtents.vector.x + this.maxExtents.vector.x) / 2, y: (this.minExtents.vector.y + this.maxExtents.vector.y) / 2});
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
/*
    intersectAABB(otherAABB) {
        const distances1 = otherAABB.minExtents.clone().subtract(this.maxExtents);
        const distances2 = this.minExtents.clone().subtract(otherAABB.maxExtents);

        const distances = distances1.clone().max(distances2);

        const maxDistance = distances.max();

        // Calculate direction from this AABB to the other
        const direction = otherAABB.minExtents.clone().add(otherAABB.maxExtents).divide(2)
            .subtract(this.minExtents.clone().add(this.maxExtents).divide(2));

        return new IntersectData(maxDistance < 0, direction, maxDistance);
    }

 */

// Method to check intersection with another AABB
    intersectAABB(other) {
        // Calculate centers
        const centerA = this.getCenter();
        const centerB = other.getCenter();

        // Calculate the difference in centers
        const dx = centerB.vector.x - centerA.vector.x;
        const dy = centerB.vector.y - centerA.vector.y;

        // Sum of half-widths and half-heights
        const widthSum = this.size / 2 + other.size / 2;
        const heightSum = this.size / 2 + other.size / 2;

        // Check if there is an intersection
        if (Math.abs(dx) < widthSum && Math.abs(dy) < heightSum) {
            // Calculate overlap on each axis
            const overlapX = widthSum - Math.abs(dx);
            const overlapY = heightSum - Math.abs(dy);

            // Determine the axis of least penetration
            if (overlapX < overlapY) {
                // Collision is primarily on the x-axis
                return new IntersectData(true, new Vector({x: Math.sign(dx), y:0}), overlapX);
            } else {
                // Collision is primarily on the y-axis
                return new IntersectData(true, new Vector({x: 0, y:Math.sign(dy)}), overlapY);

            }
        } else {
            // No intersection
            return new IntersectData(false, new Vector({x: 0, y: 0}), 0);
        }
    }


    intersectPlane(plane) {
        const halfLength = this.maxExtents.clone().subtract(this.minExtents).divide(2);
        const center = this.minExtents.clone().add(halfLength);

        const corners = [
            new Vector({x: center.vector.x - halfLength.vector.x, y: center.vector.y - halfLength.vector.y}),
            new Vector({x: center.vector.x + halfLength.vector.x, y: center.vector.y - halfLength.vector.y}),
            new Vector({x: center.vector.x + halfLength.vector.x, y: center.vector.y + halfLength.vector.y}),
            new Vector({x: center.vector.x - halfLength.vector.x, y: center.vector.y + halfLength.vector.y})
        ];

        const distances = corners.map(corner => Math.abs(plane.normal.getDotProduct(corner) - plane.distance));

        const maxDistance = Math.max(...distances) - (this.maxExtents.vector.x - this.minExtents.vector.x)

        return new IntersectData(maxDistance <= 0, plane.normal, maxDistance);
    }


    draw(ctx) {
        const width = this.maxExtents.vector.x - this.minExtents.vector.x;
        const height = this.maxExtents.vector.y - this.minExtents.vector.y;
        const centerX = this.minExtents.vector.x + width / 2;
        const centerY = this.minExtents.vector.y + height / 2;

        ctx.save();

        // Translate to center
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        //Draw AABB
        ctx.beginPath();
        ctx.rect(-width/2, -height/2, width, height);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.restore();
    }

    resolveCollisionPlane(plane, intersectData) {
        const direction = intersectData.direction;
        const distance = intersectData.distance;

        // Determine if the sphere is above or below the plane
        const dotProduct = plane.normal.getDotProduct(this.minExtents.clone().subtract(plane.point));

        // If the dot product is negative, the sphere is below the plane
        if (dotProduct < 0) {
            // Move the sphere out of the plane by adding the displacement
            this.position = this.position.clone().add(direction.clone().multiply(distance));
        } else {
            // Move the sphere out of the plane by subtracting the displacement
            this.position = this.position.clone().subtract(direction.clone().multiply(distance));
        }

        // Reflect the sphere's velocity about the plane's normal
        const reflectedVelocity = this.velocity.clone().reflect(direction);

        // Scale the reflected velocity by the sphere's restitution
        this.velocity = reflectedVelocity.clone().multiply(this.restitution);
    }
    resolveCollisionAABB(aabb, intersectData) {
        const direction = intersectData.direction.normalize(); // Normalized collision normal
        const penetrationDepth = intersectData.distance;

        // Positional correction to prevent sinking
        // Adjust the distribution if one is static or based on mass
        // For simplicity, this example assumes an equal distribution


        this.position = this.position.clone().subtract(direction.clone().multiply(penetrationDepth / 2));
        aabb.position = aabb.position.clone().add(direction.clone().multiply(penetrationDepth / 2));

        // Update velocities based on the collision
        // This example assumes a simple elastic collision response
        // Adjust based on your simulation requirements
        const restitution = 1; // Coefficient of restitution (0 for inelastic, 1 for elastic)
        let relativeVelocity = this.velocity.clone().clone().subtract(aabb.velocity);
        let velocityAlongNormal = relativeVelocity.getDotProduct(direction);

        // Only resolve if objects are moving towards each other
        if (velocityAlongNormal > 0) {
            return;
        }

        let j = -(1 + restitution) * velocityAlongNormal;
        j /= 1 / this.mass + 1 / aabb.mass;  // Assuming both AABBs have a 'mass' property

        // Apply the impulse
        let impulse = direction.clone().multiply(j);
        this.velocity = this.velocity.clone().add(impulse.clone().divide(this.mass));
        aabb.velocity = aabb.velocity.clone().subtract(impulse.clone().divide(aabb.mass));


    }

    resolveCollisionSphere(sphere, intersectData) {
        sphere.resolveCollisionAABB(this, intersectData);
    }


}

/*
const one = new AABB(new Vector({x: 0, y: 0}), new Vector({x: 1, y: 1}));

const two = new AABB(new Vector({x: 0, y: 1}), new Vector({x: 1, y: 1}));


 */