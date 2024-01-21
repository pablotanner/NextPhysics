'use client'
import BoundingSphere from "../physics/boundingSphere.js";
import Vector from "../physics/vector.js";
import {useContext, useEffect, useState} from "react";
import AABB from "../physics/aabb.js";
import Plane from "@/physics/plane";
import ObjectMenu from "@/components/ObjectMenu";
import findClosestElement from "@/rendering/utility/findClosestElement";

export default function Render2D({selectedTool, physicsEngine}) {

    const [shapes, setShapes] = useState([]);

    // Used for dragging objects
    const [draggingObject, setDraggingObject] = useState(null);

    // Used for selecting objects
    const [selectedObject, setSelectedObject] = useState({object: null, position: {x: 0, y: 0}});

    const [previousMousePosition, setPreviousMousePosition] = useState(null);


    useEffect(() => {
        const deltaTime = 1/60;
        const intervalDelay = 1000 * deltaTime;

        // Simulate physics
        function simulate() {
            const isPaused = physicsEngine.settings.paused;
            const objectContextMenu = document.getElementById('object-context-menu');


            if (isPaused || objectContextMenu) {
                // Just update shape state
                setShapes(physicsEngine.objects.map(object => object))
                return;
            }

            const canvas = document.getElementById('physicsCanvas');

            // Run simulation, update positions, collisions, etc.
            physicsEngine.update(deltaTime);

            // Check for objects outside canvas bounds
            physicsEngine.objects = physicsEngine.objects.filter(object => {
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

            setShapes(physicsEngine.objects.map(object => object))

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
            const object = findClosestElement({mousePosition: position, objects: physicsEngine.objects})
            setDraggingObject(object);
            setPreviousMousePosition(position);
            //event.preventDefault();
        }

        function handleMouseMove(event){
            if (draggingObject && selectedTool === "select"){
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const position = new Vector({x: x, y: y});
                draggingObject.position = position;
                setPreviousMousePosition(position);
            }
        }

        function handleMouseUp(event){
            // Apply velocity to object
            if (draggingObject && selectedTool === "select"){
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const finalMousePosition = new Vector({x: x, y: y});
                draggingObject.velocity = finalMousePosition.clone().subtract(previousMousePosition).multiply(30);
                draggingObject.angularVelocity = 0;
                draggingObject.torque = 0;
            }
            setDraggingObject(null);
            setPreviousMousePosition(null);
        }




        function handleClick(event) {
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top; //rect.top;

            const constant_size = physicsEngine.settings.size;
            const constant_mass = physicsEngine.settings.mass * 100; // kg
            const constant_velocity = physicsEngine.settings.velocity;

            let object;
            if (selectedTool === "circle"){
                object = new BoundingSphere({
                    center: new Vector({x: x, y: y}),
                    radius: constant_size,
                    mass: constant_mass,
                    drag: 0.47,
                    velocity: new Vector({x: 0, y: 0}),
                    restitution: 0.9,
                    color: "black",
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
                    friction: 0.6,
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
            physicsEngine.objects.every(obj => {
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

            physicsEngine.addObject(object)
        }

        function handleElementSelect(event){
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const closestObject = findClosestElement({mousePosition: new Vector({x: x, y:y}), objects: physicsEngine.objects})
            const pagePosition = {x: event.pageX, y: event.pageY};
            setSelectedObject({object: closestObject, position: pagePosition});
            event.preventDefault();
        }

        // Mobile
        function handleTouchStart(event){
            handleMouseDown(event.touches[0]);
        }

        function handleTouchMove(event){
            handleMouseMove(event.touches[0]);
        }

        function handleTouchEnd(event){
            handleMouseUp(event.changedTouches[0]);
        }

        function handleTouchCancel(event){
            handleMouseUp(event.changedTouches[0]);
        }

        // Add touch event listeners
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.addEventListener('touchcancel', handleTouchCancel);


        // Add click event listener
        canvas.addEventListener('click', handleClick);

        canvas.addEventListener('contextmenu', handleElementSelect);

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        //shapes.forEach(shape => shape.draw(ctx));
        physicsEngine.objects.forEach(object => object.draw(ctx));



        // Cleanup function
        return () => {
            // Remove event listeners
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('contextmenu', handleElementSelect);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);

            // Remove touch event listeners
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            canvas.removeEventListener('touchcancel', handleTouchCancel);
        };

    }, [shapes, selectedTool]);


    return (
        <ObjectMenu selectedObject={selectedObject} setSelectedObject={setSelectedObject} physicsEngine={physicsEngine}/>
    )
}
