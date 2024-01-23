import PhysicsObject from "@/physics/physicsObject";
import ObjectTypes from "@/physics/ObjectTypes";
import IntersectData from "@/physics/intersectData";
import intersectData from "@/physics/intersectData";
import Vector from "@/physics/vector";

export default class Square extends PhysicsObject {
    constructor({ position, velocity = new Vector({x: 0, y: 0}), mass, restitution, color, length, drag=0.47}) {
        super({ position, velocity, mass, restitution, color, drag});
        this._objectType = ObjectTypes.SQUARE;
        this._length = length;
        this._surfaceArea = this.length * this.length;
    }


    get length(){
        return this._length;
    }

    set length(length){
        this._length = length;
        this._surfaceArea = length * length;
    }


    intersectPlane(plane) {
        // Calculate the Square's top, bottom, left, and right edges
        const halfLength = this.length / 2;
        const top = this.position.vector.y - halfLength;
        const bottom = this.position.vector.y + halfLength;
        const left = this.position.vector.x - halfLength;
        const right = this.position.vector.x + halfLength;

        // Calculate the signed distances from the edges to the Plane
        const signedDistances = [
            plane.normal.getDotProduct(new Vector({x: left, y: top})) - plane.distance,
            plane.normal.getDotProduct(new Vector({x: right, y: top})) - plane.distance,
            plane.normal.getDotProduct(new Vector({x: right, y: bottom})) - plane.distance,
            plane.normal.getDotProduct(new Vector({x: left, y: bottom})) - plane.distance
        ];

        // Check if all signed distances have the same sign
        const allPositive = signedDistances.every(distance => distance >= 0);
        const allNegative = signedDistances.every(distance => distance <= 0);

        // Get distance to plane
        const distance = Math.abs(plane.normal.getDotProduct(this.position)) - plane.distance + this.length/2;

        // If all signed distances have the same sign, the Square and the Plane do not intersect
        // If the signed distances have different signs, the Square and the Plane intersect
        return new IntersectData(!allPositive && !allNegative, plane.normal, distance);
    }
    intersectSphere(sphere) {
        const distance = sphere.position.clone().subtract(this.position).getLength();
        return new IntersectData(distance < this.radius + sphere.radius, distance - (this.radius + sphere.radius), sphere.position.clone().subtract(this.position).normalize().multiply(distance - (this.radius + sphere.radius)));
    }

    intersectSquare(square) {
        const halfLength1 = this.length / 2;
        const halfLength2 = square.length / 2;

        const left1 = this.position.vector.x - halfLength1;
        const right1 = this.position.vector.x + halfLength1;
        const top1 = this.position.vector.y - halfLength1;
        const bottom1 = this.position.vector.y + halfLength1;

        const left2 = square.position.vector.x - halfLength2;
        const right2 = square.position.vector.x + halfLength2;
        const top2 = square.position.vector.y - halfLength2;
        const bottom2 = square.position.vector.y + halfLength2;

        const doesIntersect = !(left1 > right2 || right1 < left2 || top1 > bottom2 || bottom1 < top2);

        const direction = this.position.clone().subtract(square.position);
        const distance = direction.getLength() - this.length / 2 - square.length / 2;

        return new IntersectData(doesIntersect, direction, distance);
    }
    intersectAABB(aabb) {
        // AABB not implemented
    }

    intersectPoint(point) {
        // Calculate the four corners of the Square
        const halfLength = this.length / 2;
        const topLeft = this.position.clone().add(new Vector({x: -halfLength, y: -halfLength}));
        const bottomRight = this.position.clone().add(new Vector({x: halfLength, y: halfLength}));

        // Check if the Point lies within the Square
        const doesIntersect = point.vector.x >= topLeft.vector.x && point.vector.x <= bottomRight.vector.x && point.vector.y >= topLeft.vector.y && point.vector.y <= bottomRight.vector.y;

        // Return an IntersectData object
        return new IntersectData(doesIntersect, 0, 0);
    }

    resolveCollisionSphere(sphere, intersectData) {
        // TODO
    }

    resolveCollisionSquare(square, intersectData) {
        // Calculate the centers of the Squares
        const center1 = square.position.clone();
        const center2 = this.position.clone();

        // Calculate the collision normal
        const collisionNormal = center2.clone().subtract(center1).normalize();

        // Calculate the half extents of the Squares
        const halfExtents1 = square.length / 2;
        const halfExtents2 = this.length / 2;

        // Calculate the overlap along the collision normal
        const overlap = new Vector({x: halfExtents1 + halfExtents2, y: halfExtents1 + halfExtents2}).subtract(center2.clone().subtract(center1).abs());

        // Calculate the penetration depth
        const penetrationDepth = overlap.max();

        // Calculate the total inverse mass
        const totalInverseMass = square.inverseMass + this.inverseMass;

        // Calculate the movement vector
        const movement = collisionNormal.clone().multiply(penetrationDepth / totalInverseMass);

        // Calculate the relative velocity
        const relativeVelocity = this.velocity.clone().subtract(square.velocity);

        // Calculate the velocity along the normal
        const velocityAlongNormal = relativeVelocity.getDotProduct(collisionNormal);

        // If the velocity along the normal is less than a threshold, do not resolve the collision
        if (velocityAlongNormal < 0.01) {
            return;
        }

        // Move the squares out of the collision gradually
        square.position = square.position.clone().subtract(movement.clone().multiply(square.inverseMass));
        this.position = this.position.clone().add(movement.clone().multiply(this.inverseMass));
    }


    resolveCollisionPlane(plane, intersectData) {
        const direction = intersectData.direction;
        const distance = intersectData.distance;

        // Determine if the sphere is above or below the plane
        const dotProduct = plane.normal.getDotProduct(this.position.clone().subtract(plane.point));

        // If the dot product is negative, the sphere is below the plane
        if (dotProduct < 0) {
            // Move the sphere out of the plane by adding the displacement
            this.position = this.position.clone().subtract(direction.clone().multiply(distance));
        } else {
            // Move the sphere out of the plane by subtracting the displacement
            this.position = this.position.clone().add(direction.clone().multiply(distance));
        }

        // Reflect the sphere's velocity about the plane's normal
        const reflectedVelocity = this.velocity.clone().reflect(direction);

        // Scale the reflected velocity by the sphere's restitution
        this.velocity = reflectedVelocity.clone().multiply(this.restitution);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.vector.x, this.position.vector.y);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.length/2, -this.length/2, this.length, this.length);
        ctx.restore();
    }
}