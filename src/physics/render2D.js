'use client'
import BoundingSphere from "./boundingSphere.js";
import Vector from "./vector.js";
import {useEffect, useRef, useState} from "react";
import AABB from "./aabb.js";
import Plane from "@/physics/plane";
import PhysicsEngine from "@/physics/physicsEngine";

export default function Render2D({selectedTool, setSelectedTool, settings, physicsEngine}) {
    const settingsRef = useRef(settings)
    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    const [shapes, setShapes] = useState([]);

    const resetCanvas = () => {
        physicsEngine.current = new PhysicsEngine();
        setShapes([]);
        setSelectedTool("select");
    }

    if(selectedTool === "reset" && shapes.length > 0) resetCanvas();

    function collisionDetection(){
        const intersections = []
        // Check for collisions and handle them
        for (let i = 0; i < physicsEngine.current.objects.length; i++) {
            for (let j = i + 1; j < physicsEngine.current.objects.length; j++) {
                const object1 = physicsEngine.current.objects[i];
                const object2 = physicsEngine.current.objects[j];
                if (object1.intersect(object2).doesIntersect) {
                    intersections.push(i)
                    intersections.push(j)
                }
            }
        }

        for (let i = 0; i < physicsEngine.current.objects.length; i++){
            if (intersections.find(index => index === i) === undefined){
                physicsEngine.current.objects[i].color = "black";
            }
            else {
                physicsEngine.current.objects[i].color = "red";
            }

        /*
        for (let i = 0; i < physicsEngine.current.objects.length; i++) {
            if (intersections[i] === undefined) continue;
            else if (intersections[i].length === 0) physicsEngine.current.objects[i].color = "black";
            for (let j = 0; j < intersections[i].length; j++) {
                const object2 = physicsEngine.current.objects[intersections[i][j]];
                const intersectData = object1.intersect(object2);
                const normal = intersectData.normal;
                const distance = intersectData.distance;
                const relativeVelocity = object1.velocity.clone().subtract(object2.velocity);
                const relativeVelocityAlongNormal = relativeVelocity.getDotProduct(normal);
                if (relativeVelocityAlongNormal > 0) {
                    continue;
                }
                const restitution = 0.7;
                const impulseMagnitude = -(1 + restitution) * relativeVelocityAlongNormal;
                const impulse = normal.clone().multiply(impulseMagnitude);
                object1.velocity = object1.velocity.clone().add(impulse.clone().divide(object1.mass));
                object2.velocity = object2.velocity.clone().subtract(impulse.clone().divide(object2.mass));

                // Move objects apart
                const percent = 0.2;
                const slop = 0.01;
                const correction = Math.max(distance - slop, 0) / (object1.mass + object2.mass) * percent;
                const correctionVector = normal.clone().multiply(correction);
                object1.position = object1.position.clone().add(correctionVector.clone().multiply(object1.mass));
                object2.position = object2.position.clone().subtract(correctionVector.clone().multiply(object2.mass));

             */
            }

                    /*
             shapes.forEach((shape1, index1) => {
                 let isIntersecting = false;
                 shapes.forEach((shape2, index2) => {
                     if (index1 !== index2) {
                         const intersectData = shape1.intersect(shape2);
                         if (intersectData.doesIntersect) {
                             isIntersecting = true;
                         }
                     }
                 });
                 shape1.color = isIntersecting ? "red" : "black";
             });

              */
        }




    useEffect(() => {
        const deltaTime = 1/60;
        const intervalDelay = 1000 * deltaTime;

        // Simulate physics
        function simulate() {
            const isPaused = settingsRef.current.paused;
            const constant_gravity = settingsRef.current.gravity * 1000;
            const constant_airDensity = settingsRef.current.airDensity;

            if (isPaused) return;

            const canvas = document.getElementById('physicsCanvas');
            physicsEngine.current.objects.forEach(object => {
                const gravity = new Vector({x: 0, y: constant_gravity, z: 0});
                // F = m*a
                object._force = gravity.clone().multiply(object.mass);
            });

            collisionDetection();

            physicsEngine.current.integrate(deltaTime, settingsRef);



            // Check for objects outside canvas bounds
            physicsEngine.current.objects = physicsEngine.current.objects.filter(object => {
                const position = object.position.vector;
                const height = Number(canvas.style.height.replace("px", "")) + 40;
                const width = Number(canvas.style.width.replace("px", ""));
                const inBounds = position.x >= 0 && position.x <= width && position.y >= 0 && position.y <= height;
                if (!inBounds) {
                    // Remove object from shapes state as well
                    setShapes(shapes => shapes.filter(shape => shape !== object));
                }
                return inBounds;
            });

            setShapes(physicsEngine.current.objects.map(object => object))

        }

        const intervalId = setInterval(simulate, intervalDelay);

        // Cleanup function
        return () => {
            clearInterval(intervalId);
        };
    }, []);


    useEffect(() => {
        const canvas = document.getElementById('physicsCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const devicePixelRatio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Adjust canvas size for device pixel ratio
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;

        // Adjust canvas style to fit the original space
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        ctx.scale(devicePixelRatio, devicePixelRatio);

        function handleClick(event) {
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top; //rect.top;

            const constant_size = settingsRef.current.size;
            const constant_mass = settingsRef.current.mass;
            const constant_velocity = settingsRef.current.velocity;

            let shape;
            if (selectedTool === "circle"){
                shape = new BoundingSphere(new Vector({x, y, z: 0}), constant_size, constant_mass);
            }
            else if (selectedTool === "square"){
                const position = new Vector({x: x-constant_size/2, y: y-constant_size/2, z: 0})
                shape = new AABB(position, new Vector({x: x+constant_size/2, y: y+constant_size/2, z: 0}), constant_mass, 1.05)
            }
            else if (selectedTool === "plane"){
                const d = event.clientY - rect.top;
                shape = new Plane(new Vector({x: 0, y: 1, z: 0}), d)
            }
            else {
                return;
            }
            physicsEngine.current.objects.every(object => {
                const intersectData = shape.intersect(object);
                if (intersectData.doesIntersect){
                    shape.color = "red";
                    object.color = "red"
                    return false;
                }
                else {
                    return true;
                }
            })



        /*
            shapes.every(s => {
                const intersectData = shape.intersect(s);
                if (intersectData.doesIntersect){
                    shape.color = "red";
                    s.color = "red"
                    return false;
                }
                else {
                    return true;
                }
            })

         */
            physicsEngine.current.addObject(shape)
            setShapes([...shapes, shape]);
        }

        function handleElementSelect(event){
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const position = new Vector({x: x, y: y, z: 0})
            let found = false;
            [...shapes].reverse().find(shape => {
                if (found) return true;
                const intersectData = shape.intersectPoint(position)
                if (intersectData.doesIntersect){
                    physicsEngine.current.removeObject(shape)
                    setShapes(shapes.filter(s => s !== shape));
                    found = true;
                    return false;
                }
            });
            event.preventDefault();
        }

        // Add click event listener
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('contextmenu', handleElementSelect);


        //shapes.forEach(shape => shape.draw(ctx));
        physicsEngine.current.objects.forEach(object => object.draw(ctx));

        // Cleanup function
        return () => {
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('contextmenu', handleElementSelect);
        };

    }, [shapes, selectedTool]);
}
