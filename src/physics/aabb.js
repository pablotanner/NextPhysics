import PhysicsObject from "./physicsObject.js";
import Vector from "./vector.js";
import IntersectData from "./intersectData.js";
import BoundingSphere from "@/physics/boundingSphere";
import Plane from "@/physics/plane";

export default class AABB extends PhysicsObject {
    constructor(minExtents, maxExtents, mass = 1, drag = 1.05, velocity = new Vector({x: 0, y: 0}), restitution = 1, color = "black") {
        super(minExtents, velocity, mass, restitution, color);
        this._minExtents = minExtents;
        this._maxExtents = maxExtents;
        this._drag = drag;
        // Calculate surface area
        const width = this._maxExtents.vector.x - this._minExtents.vector.x;
        const height = this._maxExtents.vector.y - this._minExtents.vector.y;
        this._surfaceArea = 2 * width * height + 2 * width * height + 2 * width * height;
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
        const sphereCenter = sphere.position.vector;

        // Check if the sphere's center is inside the AABB
        if (this._minExtents.vector.x <= sphereCenter.x && sphereCenter.x <= this._maxExtents.vector.x &&
            this._minExtents.vector.y <= sphereCenter.y && sphereCenter.y <= this._maxExtents.vector.y &&
            this._minExtents.vector.z <= sphereCenter.z && sphereCenter.z <= this._maxExtents.vector.z) {
            // If the sphere's center is inside the AABB, the sphere and the AABB are intersecting
            return new IntersectData(true, 0);
        }

        // If the sphere's center is outside the AABB, calculate the closest point on the AABB to the sphere
        const x = Math.max(this._minExtents.vector.x, Math.min(sphereCenter.x, this._maxExtents.vector.x));
        const y = Math.max(this._minExtents.vector.y, Math.min(sphereCenter.y, this._maxExtents.vector.y));
        const z = Math.max(this._minExtents.vector.z, Math.min(sphereCenter.z, this._maxExtents.vector.z));

        const distance = Math.sqrt((x - sphereCenter.x) * (x - sphereCenter.x) +
            (y - sphereCenter.y) * (y - sphereCenter.y) +
            (z - sphereCenter.z) * (z - sphereCenter.z));

        return new IntersectData(distance < sphere.radius, distance - sphere.radius);
    }

    intersectPoint(pointVector) {
        const point = pointVector.vector;

        const box = {
            minX: this._minExtents.vector.x,
            maxX: this._maxExtents.vector.x,
            minY: this._minExtents.vector.y,
            maxY: this._maxExtents.vector.y,
            minZ: this._minExtents.vector.z,
            maxZ: this._maxExtents.vector.z
        };

        return new IntersectData((point.x >= box.minX && point.x <= box.maxX) && (point.y >= box.minY && point.y <= box.maxY) && (point.z >= box.minZ && point.z <= box.maxZ), 0);
    }

    intersectAABB(otherAABB) {
        /*
        const distances1 = otherAABB.minExtents.clone().subtract(this._maxExtents);
        const distances2 = this._minExtents.clone().subtract(otherAABB.maxExtents);

        const distances = distances1.max(distances2);

        const maxDistance = distances.max();

        return new IntersectData(maxDistance < 0, maxDistance);
         */

        const min1 = this._minExtents.vector;
        const max1 = this._maxExtents.vector;
        const min2 = otherAABB.minExtents.vector;
        const max2 = otherAABB.maxExtents.vector;

        for (let dimension in min1) {
            if (max1[dimension] < min2[dimension] || min1[dimension] > max2[dimension]) {
                return new IntersectData(false, 0);
            }
        }
        // If none of the above conditions are met, the AABBs are intersecting.
        return new IntersectData(true, 0);

    }

    intersectPlane(plane) {
        const center = this._minExtents.clone().add(this._maxExtents).divide(2);
        const extents = this._maxExtents.clone().subtract(center);

        const r = extents.vector.x * Math.abs(plane.normal.vector.x) + extents.vector.y * Math.abs(plane.normal.vector.y) + extents.vector.z * Math.abs(plane.normal.vector.z);
        const s = plane.normal.getDotProduct(center) - plane.distance;

        return new IntersectData(Math.abs(s) <= r, s - r);
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
            throw new Error(other.constructor + " is not a valid type to intersect with an AABB");
        }
    }


    draw(ctx) {
        const width = this._maxExtents.vector.x - this._minExtents.vector.x;
        const height = this._maxExtents.vector.y - this._minExtents.vector.y;
        ctx.beginPath();
        ctx.rect(this._minExtents.vector.x, this._minExtents.vector.y, width, height);
        ctx.fillStyle = this._color;
        ctx.fill();
    }

    // Special integrate method for AABB
    integrate(deltaTime, settingsRef) {
        // Calculate drag force
        /*
        const velocityMagnitude = this._velocity.getLength();
        let dragMagnitude = 0.5 * settingsRef.current.airDensity * this._drag * this._surfaceArea * velocityMagnitude * velocityMagnitude;

        // Limit the maximum value of the drag force
        const maxDrag = 1000;
        if (dragMagnitude > maxDrag) {
            dragMagnitude = maxDrag;
        }

        const dragForce = this._velocity.clone().normalize().multiply(-dragMagnitude);

        // Calculate net force
        const netForce = this._force.clone().add(dragForce);

        // Calculate acceleration from force and mass
        const acceleration = netForce.clone().divide(this._mass);

        // Update velocity based on acceleration
        this._velocity = this._velocity.clone().add(acceleration.clone().multiply(deltaTime));

        // Update position based on velocity
        const deltaPosition = this._velocity.clone().multiply(deltaTime);
        this._minExtents = this._minExtents.clone().add(deltaPosition);
        this._maxExtents = this._maxExtents.clone().add(deltaPosition);
        this._position = this._minExtents.clone();

        // Reset force for the next frame
        this._force = new Vector({x: 0, y: 0, z: 0});
         */
        super.integrate(deltaTime, settingsRef);
        const deltaPosition = this._velocity.clone().multiply(deltaTime);
        this._minExtents = this._minExtents.clone().add(deltaPosition);
        this._maxExtents = this._maxExtents.clone().add(deltaPosition);
        this._position = this._minExtents.clone();
    }
}

/*
const one = new AABB(new Vector({x: 0, y: 0}), new Vector({x: 1, y: 1}));

const two = new AABB(new Vector({x: 0, y: 1}), new Vector({x: 1, y: 1}));

console.log(one.intersectAABB(two));

 */