'use client'
import BoundingSphere from "./boundingSphere.js";
import Vector from "./vector.js";
import { useEffect, useState } from "react";
import AABB from "./aabb.js";
import Plane from "@/physics/plane";

export default function Render2D({selectedTool, setSelectedTool}) {
    const size = 30;
    const [shapes, setShapes] = useState([]);
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
            else if (selectedTool === "select"){
                const d = event.clientY - rect.top;
                shape = new Plane(new Vector({x: 0, y: 1, z: 0}), d)
            }
            else {
                return;
            }
            shapes.every(s => {
                if (s instanceof BoundingSphere){
                    const intersectData = shape.intersectSphere(s);
                    console.log(intersectData)
                    if (intersectData.doesIntersect){
                        shape.color = "red";
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                else if (s instanceof AABB){
                    const intersectData = shape.intersectAABB(s);
                    if (intersectData.doesIntersect){
                        shape.color = "red";
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                else if (s instanceof Plane){
                    const intersectData = shape.intersectPlane(s);
                    console.log(intersectData)
                    if (intersectData.doesIntersect){
                        shape.color = "red";
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            })

            /*
            let doesIntersect = false;
            spheres.every(s => {
                const intersectData = s.intersectBoundingSphere(sphere);
                   if (intersectData.doesIntersect){
                        doesIntersect = true;
                        return false;
                    }
                    else {
                        return true;
                }
            })
            if (doesIntersect){
                //sphere.color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
                sphere.color = "red";
            }
            else {
                sphere.color = "black";
            }

             */
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
                }

            });
            event.preventDefault();
        }

        // Add click event listener
        canvas.addEventListener('click', handleClick);


        canvas.addEventListener('contextmenu', handleElementSelect);

        // Cleanup function
        return () => {
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('contextmenu', handleElementSelect);
        };

    }, [shapes,selectedTool]);

    useEffect(() => {

        const canvas = document.getElementById('physicsCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach(shape => shape.draw(ctx));
    }, [shapes, selectedTool]);
}
