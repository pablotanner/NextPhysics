'use client'
import BoundingSphere from "./boundingSphere.js";
import Vector from "./vector.js";
import { useEffect, useState } from "react";
import AABB from "./aabb.js";
import Plane from "@/physics/plane";
import PhysicsEngine from "@/physics/physicsEngine";

export default function Render2D({selectedTool, setSelectedTool}) {
    const size = 30;
    const [shapes, setShapes] = useState([]);

    console.log(shapes)

    const resetCanvas = () => {
        setShapes([]);
        setSelectedTool("select");
    }
    if(selectedTool === "reset" && shapes.length > 0) resetCanvas();

    useEffect(() => {
        const canvas = document.getElementById('physicsCanvas');
        if (!canvas) return;

        const devicePixelRatio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Adjust canvas size for device pixel ratio
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;

        // Adjust canvas style to fit the original space
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        ctx.scale(devicePixelRatio, devicePixelRatio);

        function handleClick(event) {
            const x = event.clientX - rect.left;
            const y = event.clientY - canvas.offsetTop; //rect.top;
            let shape;
            if (selectedTool === "circle"){
                shape = new BoundingSphere(new Vector({x, y, z: 0}), size);
            }
            else if (selectedTool === "square"){
                const position = new Vector({x: x-size/2, y: y-size/2, z: 0})
                shape = new AABB(position, new Vector({x: x+size/2, y: y+size/2, z: 0}));
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
                    return false;
                }
                else {
                    return true;
                }
            })
            setShapes([...shapes, shape]);
        }

        function handleElementSelect(event){
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const position = new Vector({x: x, y: y, z: 0})
            shapes.find(shape => {
                const intersectData = shape.intersectPoint(position)
                if (intersectData.doesIntersect){
                    setShapes(shapes.filter(s => s !== shape));
                    /*
                    shape.velocity = new Vector({x:5, y: 5, z: 0});
                    shape.integrate(1/60);

                     */
                }
            });
            event.preventDefault();
        }

        function simulate(event) {
            return
            /*
            const gravity = new Vector({x: 0, y: 9.8, z: 0});
            const deltaTime = 1/60;
            const engine = new PhysicsEngine();
            shapes.forEach(shape => {
                shape.force = gravity.multiply(shape.mass);
                engine.addObject(shape);
            })
            engine.integrate(deltaTime);
            setShapes(engine.objects);
            
             */
        }

        // Add click event listener
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('mousedown', simulate);
        canvas.addEventListener('contextmenu', handleElementSelect);

        // Cleanup function
        return () => {
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('contextmenu', handleElementSelect);
            //canvas.removeEventListener('mousedown', simulate);
        };

    }, [shapes,selectedTool]);

    useEffect(() => {
        const canvas = document.getElementById('physicsCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach(shape => shape.draw(ctx));
    }, [shapes, selectedTool]);
}
