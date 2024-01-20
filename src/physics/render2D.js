'use client'
import BoundingSphere from "./boundingSphere.js";
import Vector from "./vector.js";
import {useEffect, useState} from "react";
import AABB from "./aabb.js";
import Plane from "@/physics/plane";

export default function Render2D({selectedTool, physicsEngine}) {
    const [shapes, setShapes] = useState([]);

    const [selectedObject, setSelectedObject] = useState(null);
    const [previousMousePosition, setPreviousMousePosition] = useState(null);



    useEffect(() => {
        const deltaTime = 1/60;
        const intervalDelay = 1000 * deltaTime;

        // Simulate physics
        function simulate() {
            const isPaused = physicsEngine.current.settings.paused;

            if (isPaused) {
                // Just update shape state
                setShapes(physicsEngine.current.objects.map(object => object))
                return;
            }

            const canvas = document.getElementById('physicsCanvas');
            /*
            physicsEngine.current.objects.forEach(object => {
                const gravity = new Vector({x: 0, y: constant_gravity});
                // F = m*a
                object.force = gravity.clone().multiply(object.mass);
            });

             */

            // Run simulation, update positions, collisions, etc.
            physicsEngine.current.update(deltaTime);

            // Check for objects outside canvas bounds
            physicsEngine.current.objects = physicsEngine.current.objects.filter(object => {
                const threshold = object.radius || (object.maxExtents?.vector?.y - object.minExtents?.vector?.y) || 50;
                const position = object.position.vector;
                const height = Number(canvas.style.height.replace("px", "")) + threshold;
                //const width = Number(canvas.style.width.replace("px", ""));
                //const inBounds = position.x >= 0 && position.x <= width && position.y >= 0 && position.y <= height;
                const inBounds = position.y <= height;
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


        function handleMouseDown(event){
            if (selectedTool !== "select") return;
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const position = new Vector({x: x, y: y})
            let found = false;
            [...shapes].reverse().find(shape => {
                if (found) return true;
                const intersectData = shape.intersectPoint(position)
                if (intersectData.doesIntersect){
                    setSelectedObject(shape);
                    setPreviousMousePosition(position);
                    found = true;
                    return false;
                }
            });
            event.preventDefault();
        }

        function handleMouseMove(event){
            if (selectedObject && selectedTool === "select"){
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const position = new Vector({x: x, y: y});
                selectedObject.position = position;
                setPreviousMousePosition(position);
                //selectedObject.freeze();
            }
        }

        function handleMouseUp(event){
            // Apply velocity to object
            if (selectedObject && selectedTool === "select"){
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const finalMousePosition = new Vector({x: x, y: y});
                selectedObject.velocity = finalMousePosition.clone().subtract(previousMousePosition).multiply(30);
                selectedObject.angularVelocity = 0;
                selectedObject.torque = 0;
            }
            setSelectedObject(null);
            setPreviousMousePosition(null);
        }




        function handleClick(event) {
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top; //rect.top;

            const constant_size = physicsEngine.current.settings.size;
            const constant_mass = physicsEngine.current.settings.mass * 100; // kg
            const constant_velocity = physicsEngine.current.settings.velocity;

            let object;
            if (selectedTool === "circle"){
                object = new BoundingSphere({
                    center: new Vector({x: x, y: y}),
                    radius: constant_size,
                    mass: constant_mass,
                    drag: 0.47,
                    velocity: new Vector({x: 0, y: 0}),
                    restitution: 10,
                    color: "green",
                    friction: 0
                });
            }
            else if (selectedTool === "square"){
                object = new AABB({
                    minExtents: new Vector({x: x-constant_size/2, y: y-constant_size/2}),
                    maxExtents: new Vector({x: x+constant_size/2, y: y+constant_size/2}),
                    mass: constant_mass,
                    drag: 1.05,
                    velocity: new Vector({x: 0, y: 0}),
                    restitution: 0.5,
                    color: "black",
                    friction: 0.5,
                    rotation: 0
                });
            }
            else if (selectedTool === "plane"){
                const dist = event.clientY - rect.top;
                object = new Plane({
                    normal: new Vector({x: 0, y: 1}),
                    distance: dist,
                    mass: 99999999,
                    drag: 0,
                    velocity: new Vector({x: 0, y: 0}),
                    restitution: 1,
                    color: "black",
                    friction: 0.1
                });
            }
            else {
                return;
            }

            /* Will detect if paused as well
            physicsEngine.current.objects.every(obj => {
                const intersectData = object.intersect(obj);
                if (intersectData.doesIntersect){
                    obj.color = "red";
                    object.color = "red"
                    return false;
                }
                else {
                    return true;
                }
            })
             */

            physicsEngine.current.addObject(object)
            setShapes(shapes => [...shapes, object]);
        }

        function handleElementSelect(event){
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const position = new Vector({x: x, y: y})
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

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        //shapes.forEach(shape => shape.draw(ctx));
        physicsEngine.current.objects.forEach(object => object.draw(ctx));



        // Cleanup function
        return () => {
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('contextmenu', handleElementSelect);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };

    }, [shapes, selectedTool]);
}
