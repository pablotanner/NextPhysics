import Vector from "./vector.js";
import IntersectData from "./intersectData.js";
import PhysicsObject from "./physicsObject.js";
import Plane from "@/physics/plane";
import AABB from "@/physics/aabb";
import objectTypes from "@/physics/ObjectTypes";

export default class BoundingSphere extends PhysicsObject {
    // Center is vector, radius is float
    constructor({
                    center,
                    radius,
                    mass = 1,
                    drag = 0.47,
                    velocity = new Vector({x: 0, y: 0}),
                    restitution = 1,
                    color = "black"
                }) {
        super({position: center, velocity, mass, restitution, color});
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
        if (!(center instanceof Vector)) {
            throw new Error("center must be an instance of Vector");
        }
        this._center = center;
    }

    set radius(radius) {
        if (typeof radius !== "number") {
            throw new Error("radius must be a number");
        }
        this._radius = radius;
    }

    get position() {
        return this._center;
    }

    set position(position) {
        this._center = position;
    }

    intersectPoint(point) {
        const distance = point.clone().subtract(this.center).getLength();
        return new IntersectData(distance < this.radius, distance - this.radius, point.clone().subtract(this.center).normalize().multiply(distance - this.radius));
    }

    intersectSphere(otherSphere) {
        // Distance of centers if both spheres are touching
        const radiusDistance = this.radius + otherSphere.radius;

        // Get direction of both centerVectors
        let direction = otherSphere.center.clone().subtract(this.center);

        // Get length of difference vector of both centerVectors
        const centerDistance = direction.clone().getLength();

        // Normalize direction
        direction = direction.clone().divide(centerDistance);

        const distance = centerDistance - radiusDistance;

        return new IntersectData(distance < 0, direction.clone().multiply(distance), distance - this.radius);
    }

    intersectAABB(aabb) {
        const x = Math.max(aabb.minExtents.vector.x, Math.min(this.center.vector.x, aabb.maxExtents.vector.x));
        const y = Math.max(aabb.minExtents.vector.y, Math.min(this.center.vector.y, aabb.maxExtents.vector.y));

        const closestPoint = new Vector({x, y});
        const direction = closestPoint.clone().subtract(this.center);

        const distance = Math.sqrt((x - this.center.vector.x) * (x - this.center.vector.x) + (y - this.center.vector.y) * (y - this.center.vector.y));

        return new IntersectData(distance < this.radius, direction, Math.abs(distance - this.radius));

    }

    intersectPlane(plane) {
        const distance = plane.normal.getDotProduct(this.center) - plane.distance;

        return new IntersectData(Math.abs(distance) < this.radius, plane.normal, Math.abs(distance) - this.radius);
    }

    resolveCollisionSphere(sphere, intersectData) {
        const direction = sphere.center.clone().subtract(this.center);
        const distance = direction.clone().getLength();
        const normal = direction.clone().divide(distance);
        const totalRadius = this.radius + sphere.radius;
        const penetration = totalRadius - distance;

        const separation = normal.clone().multiply(penetration / 2);

        this.center = this.center.clone().subtract(separation);
        sphere.center = sphere.center.clone().add(separation);

        const relativeVelocity = sphere.velocity.clone().subtract(this.velocity);

        const velocityAlongNormal = relativeVelocity.getDotProduct(normal);

        if (velocityAlongNormal > 0) {
            return;
        }

        const e = Math.min(this.restitution, sphere.restitution);

        const j = -(1 + e) * velocityAlongNormal;
        const jDivide = j / (1 / this.mass + 1 / sphere.mass);

        const impulse = normal.clone().multiply(jDivide);

        this.velocity = this.velocity.clone().subtract(impulse.clone().divide(this.mass));
        sphere.velocity = sphere.velocity.clone().add(impulse.clone().divide(sphere.mass));
    }

    resolveCollisionAABB(aabb, intersectData) {
        const direction = intersectData.direction;
        const distance = intersectData.distance;

        // Calculate the penetration depth
        const penetration = this.radius - distance;

        // Calculate the separation vector
        const separation = direction.clone().multiply(penetration / 2);

        // Move the sphere out of the AABB
        this.center = this.center.clone().subtract(separation);

        // Calculate the relative velocity
        const relativeVelocity = aabb.velocity.clone().subtract(this.velocity);

        // Calculate the velocity along the normal
        const velocityAlongNormal = relativeVelocity.getDotProduct(direction);

        // If the velocities are separating, return
        if (velocityAlongNormal > 0) {
            return;
        }

        // Calculate the restitution
        const e = Math.min(this.restitution, aabb.restitution);

        // Calculate the impulse scalar
        const j = -(1 + e) * velocityAlongNormal;
        const jDivide = j / (1 / this.mass + 1 / aabb.mass);

        // Calculate the impulse
        const impulse = direction.clone().multiply(jDivide);

        // Apply the impulse
        this.velocity = this.velocity.clone().subtract(impulse.clone().divide(this.mass));
        aabb.velocity = aabb.velocity.clone().add(impulse.clone().divide(aabb.mass));
    }

    resolveCollisionPlane(plane, intersectData) {
        const direction = intersectData.direction;
        const distance = intersectData.distance;

        // Determine if the sphere is above or below the plane
        const dotProduct = plane.normal.getDotProduct(this.center.clone().subtract(plane.point));

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