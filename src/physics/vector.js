export default class Vector {
    constructor(object) {
        this.vector = Object.assign({}, object)
    }

    clone() {
        return new Vector(this.toObject());
    }

    toObject() {
        return Object.assign({}, this.vector);
    }

    getComponents() {
        return Object.keys(this.vector);
    }

    get(component) {
        return this.vector[component];
    }

    set(component, value) {
        this.vector[component] = value;
    }

    isEqual(vector) {
        const keys = this.getComponents();
        const vectorKeys = vector.getComponents();

        if (keys.length !== vectorKeys.length) {
            return false;
        }

        for (let i = 0; i < keys.length; i += 1) {
            const k = keys[i];

            if (this.vector[k] !== vector.vector[k]) {
                return false;
            }
        }

        return true;
    }

    getDistance(vector) {
        const tmpVector = this.clone().subtract(vector);
        let d = 0;

        tmpVector.getComponents().forEach((k) => {
            d += tmpVector.vector[k] * tmpVector.vector[k];
        });

        return Math.sqrt(d);
    }

    getLength() {
        let l = 0;

        this.getComponents().forEach((k) => {
            l += this.vector[k] * this.vector[k];
        });

        return Math.sqrt(l);
    }

    getDotProduct(vector) {
        let dotProduct = 0;
        this.getComponents().forEach((k) => {
            if (vector.vector[k] !== undefined) {
                dotProduct += this.vector[k] * vector.vector[k];
            }
        });

        return dotProduct;
    }

    getCrossProduct(vector) {
        // 3x3 cross product
        if (this.getComponents().length !== 3 || vector.getComponents().length !== 3) {
            const x = this.vector.y * vector.vector.z - this.vector.z * vector.vector.y;
            const y = this.vector.z * vector.vector.x - this.vector.x * vector.vector.z;
            const z = this.vector.x * vector.vector.y - this.vector.y * vector.vector.x;
            return new Vector({x, y, z});
        }

        // 2x2 cross product (returns scalar!)
        return this.vector.x * vector.vector.y - this.vector.y * vector.vector.x;



    }

    getCosineSimilarity(vector) {
        return this.getDotProduct(vector) / (this.getLength() * vector.getLength());
    }

    normalize() {
        const l = this.getLength();

        if (l === 0) {
            return this;
        }
        return this.divide(l);
    }

    add(vector) {
        vector.getComponents().forEach((k) => {
            if (this.vector[k] !== undefined) {
                this.vector[k] += vector.vector[k];
            } else {
                this.vector[k] = vector.vector[k];
            }
        });

        return this;
    }

    subtract(vector) {
        vector.getComponents().forEach((k) => {
            if (this.vector[k] !== undefined) {
                this.vector[k] -= vector.vector[k];
            } else {
                this.vector[k] = -vector.vector[k];
            }
        });

        return this;
    }

    multiply(scalar) {
        this.getComponents().forEach((k) => {
            this.vector[k] *= scalar;
        });

        return this;
    }

    divide(scalar) {
        this.getComponents().forEach((k) => {
            this.vector[k] /= scalar;
        });

        return this;
    }

    max(vector) {
        if(!vector){
            let max = this.vector[Object.keys(this.vector)[0]];
            Object.keys(this.vector).forEach(key => {
                if (this.vector[key] > max){
                    max = this.vector[key];
                }
            })
            return max;
        }
        vector.getComponents().forEach((k) => {
            if (this.vector[k] !== undefined) {
                this.vector[k] = Math.max(this.vector[k], vector.vector[k]);
            } else {
                this.vector[k] = vector.vector[k];
            }
        });
        return this;
    }

    reflect(vector) {
        const normal = vector.clone().normalize();
        const d = this.getDotProduct(normal);
        const tmpVector = normal.clone().multiply(2 * d);
        return this.clone().subtract(tmpVector);
    }

    abs(){
        this.getComponents().forEach((k) => {
            this.vector[k] = Math.abs(this.vector[k]);
        });
        return this;
    }
}
