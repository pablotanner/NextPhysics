import AABB from "@/physics/aabb";
import Vector from "@/physics/vector";

class QuadTree {
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.elements = [];
        this.divided = false;
    }

    subdivide() {
        let x = this.boundary.center.vector.x;
        let y = this.boundary.center.vector.y;
        let w = this.boundary.halfDimension.vector.x / 2;
        let h = this.boundary.halfDimension.vector.y / 2;

        let ne = new AABB(new Vector({x: x + w, y: y - h, z: 0}), new Vector({x: w, y: h, z: 0}));
        this.northeast = new QuadTree(ne, this.capacity);
        let nw = new AABB(new Vector({x: x - w, y: y - h, z: 0}), new Vector({x: w, y: h, z: 0}));
        this.northwest = new QuadTree(nw, this.capacity);
        let se = new AABB(new Vector({x: x + w, y: y + h, z: 0}), new Vector({x: w, y: h, z: 0}));
        this.southeast = new QuadTree(se, this.capacity);
        let sw = new AABB(new Vector({x: x - w, y: y + h, z: 0}), new Vector({x: w, y: h, z: 0}));
        this.southwest = new QuadTree(sw, this.capacity);

        this.divided = true;
    }

    insert(element) {
        if (!this.boundary.intersectAABB(element.boundingBox)) {
            return false;
        }

        if (this.elements.length < this.capacity) {
            this.elements.push(element);
            return true;
        } else {
            if (!this.divided) {
                this.subdivide();
            }

            if (this.northeast.insert(element)) return true;
            if (this.northwest.insert(element)) return true;
            if (this.southeast.insert(element)) return true;
            if (this.southwest.insert(element)) return true;
        }
    }

    query(range, found) {
        if (!found) {
            found = [];
        }

        if (!range.intersectAABB(this.boundary)) {
            return found;
        }

        for (let p of this.elements) {
            if (range.intersectAABB(p.boundingBox)) {
                found.push(p);
            }
        }

        if (this.divided) {
            this.northwest.query(range, found);
            this.northeast.query(range, found);
            this.southwest.query(range, found);
            this.southeast.query(range, found);
        }

        return found;
    }
}