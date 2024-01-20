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

    if(selectedTool === "reset" && (shapes.length > 0 || physicsEngine.current.objects.length > 0)) resetCanvas();


    function collisionDetection() {
        const intersections = []
        // Check for collisions and handle them
        for (let i = 0; i < physicsEngine.current.objects.length; i++) {
            for (let j = i + 1; j < physicsEngine.current.objects.length; j++) {
                const object1 = physicsEngine.current.objects[i];
                const object2 = physicsEngine.current.objects[j];
                if (object1.intersect(object2).doesIntersect) {
                    console.log(object1.intersect(object2))
                    intersections.push(i)
                    intersections.push(j)
                }
            }
        }

        for (let i = 0; i < physicsEngine.current.objects.length; i++) {
            if (intersections.find(index => index === i) === undefined) {
                physicsEngine.current.objects[i].color = "black";
            } else {
                physicsEngine.current.objects[i].color = "red";
            }
        }
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
                object.force = gravity.clone().multiply(object.mass);
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

            let object;
            if (selectedTool === "circle"){
                object = new BoundingSphere({
                    center: new Vector({x: x, y: y}),
                    radius: constant_size,
                    mass: constant_mass,
                    drag: 0.47,
                    velocity: new Vector({x: 0, y: 0}),
                    restitution: 0.8,
                    color: "black"
                });
            }
            else if (selectedTool === "square"){
                object = new AABB({
                    minExtents: new Vector({x: x-constant_size/2, y: y-constant_size/2, z: 0}),
                    maxExtents: new Vector({x: x+constant_size/2, y: y+constant_size/2, z: 0}),
                    mass: constant_mass,
                    drag: 1.05,
                    velocity: new Vector({x: 0, y: 0}),
                    restitution: 1,
                    color: "black"
                });
            }
            else if (selectedTool === "plane"){
                const dist = event.clientY - rect.top;
                object = new Plane({
                    normal: new Vector({x: 0, y: 1}),
                    distance: dist,
                    mass: 1,
                    drag: 0,
                    velocity: new Vector({x: 0, y: 0}),
                    restitution: 1,
                    color: "black"
                });
            }
            else {
                return;
            }

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

            physicsEngine.current.addObject(object)
            setShapes([...shapes, object]);
        }

        function handleElementSelect(event){
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const position = new Vector({x: x, y: y})
            let found = false;
            [...shapes].reverse().find(shape => {
                if (found) return true;
                const intersectData = shape.intersectPoint(position)
                console.log(shape,position,intersectData)
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
