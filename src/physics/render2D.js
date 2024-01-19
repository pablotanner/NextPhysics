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
        if (shapes.length === 1){
            shapes[0].color = "black";
        }
        else {
            shapes.forEach(shape1 => {
                shapes.forEach(shape2 => {
                    if (shape1 === shape2) return;
                    const intersectData = shape1.intersect(shape2);
                    if (intersectData.doesIntersect){
                        shape1.color = "red";
                        shape2.color = "red";
                    }
                    else {
                        shape1.color = "black";
                        shape2.color = "black";
                    }
                })
            })
        }
    }

    useEffect(() => {
        const deltaTime = 1/60;
        const intervalDelay = 1000 * deltaTime;

        // Simulate physics
        function simulate() {
            const isPaused = settingsRef.current.paused;
            const constant_gravity = settingsRef.current.gravity;

            if (isPaused) return;

            const canvas = document.getElementById('physicsCanvas');
            physicsEngine.current.objects.forEach(object => {


                const gravity = new Vector({x: 0, y: constant_gravity, z: 0});
                object._force = gravity.multiply(object.mass);
            });

            physicsEngine.current.integrate(deltaTime);


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
            const y = event.clientY - canvas.offsetTop; //rect.top;

            const constant_size = settingsRef.current.size;
            const constant_mass = settingsRef.current.mass;
            const constant_velocity = settingsRef.current.velocity;

            let shape;
            if (selectedTool === "circle"){
                shape = new BoundingSphere(new Vector({x, y, z: 0}), constant_size, constant_mass);
            }
            else if (selectedTool === "square"){
                const position = new Vector({x: x-constant_size/2, y: y-constant_size/2, z: 0})
                shape = new AABB(position, new Vector({x: x+constant_size/2, y: y+constant_size/2, z: 0}), constant_mass);
            }
            else if (selectedTool === "plane"){
                const d = event.clientY - rect.top;
                shape = new Plane(new Vector({x: 0, y: 1, z: 0}), d)
            }
            else {
                return;
            }
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

        collisionDetection();

        //shapes.forEach(shape => shape.draw(ctx));
        physicsEngine.current.objects.forEach(object => object.draw(ctx));

        // Cleanup function
        return () => {
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('contextmenu', handleElementSelect);
        };

    }, [shapes, selectedTool]);
}
