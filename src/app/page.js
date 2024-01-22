"use client"
import "./globals.css"
import {
    LinkIcon, UserIcon,WrenchIcon
} from '@heroicons/react/20/solid'
import Link from "next/link";
import {useEffect, useRef, useState} from "react";
import AboutModal from "../components/AboutModal.js";
import PhysicsEngine from "@/physics/physicsEngine";
import Render2D from "@/rendering/render2D";
import Toolbar from "@/components/Toolbar";



export default function Home() {
    const [selectedTool, setSelectedTool] = useState("select");

    const defaultSettings = {
        gravity: 9.8, mass: 1000, size: 30, velocity: 1, airDensity:1.225,  paused: false,
    }

    const [settings, setSettings] = useState(defaultSettings);

    const physicsEngine = useRef(new PhysicsEngine(settings));


    useEffect(() => {
        physicsEngine.current.settings = settings;
    }, [settings]);

    const settingsMenu = (<form>
        <div className="mt-6 border-b border-gray-900/10 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-full">
                    <h2 className="text-base font-semibold text-gray-900">Global Settings</h2>
                    <div className="flex gap-x-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-900">
                                Gravity
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="gravity"
                                    min={0}
                                    max={1000}
                                    value={settings.gravity}
                                    id="gravity"
                                    onChange={(e) => setSettings({...settings, gravity: Number(e.target.value)})}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="mt-1">
                            <label className="block text-sm font-medium text-gray-900">
                                Air Density
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={settings.airDensity}
                                name="airDensity"
                                id="airDensity"
                                onChange={(e) => setSettings({...settings, airDensity: Number(e.target.value)})}
                                className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        {/*
                        <div>
                            <label className="block text-sm font-medium text-gray-900">
                                Pause Simulation
                            </label>
                            <div className="mt-2.5">
                                {pauseToggle}
                            </div>
                        </div>
                        */}

                        <span className="mt-6">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        onClick={() => {
                                            setSettings(defaultSettings)
                                        }}
                                    >
                                        Reset Settings
                                    </button>
                        </span>
                        {/*
                         <div className="mt-5">
                            <ToolDropdown setSelectedTool={setSelectedTool}/>
                        </div>
                        <div className="mt-3">
                            <CurrentTool selectedTool={selectedTool}/>
                        </div>

                        <span className="mt-5">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        onClick={() => {
                                            physicsEngine.current.reset()
                                        }}
                                    >
                                        Reset Env
                                    </button>
                        </span>
                        */}
                    </div>
                </div>

                <div className="col-span-full">
                    <h2 className="text-base font-semibold text-gray-900">Object Settings</h2>
                    <div className="flex gap-x-3">
                        <div className="mt-1">
                            <label className="block text-sm font-medium text-gray-900">
                                Mass
                            </label>
                            <input
                                type="number"
                                name="mass"
                                min={0}
                                max={100000}
                                id="mass"
                                value={settings.mass}
                                onChange={(e) => setSettings({...settings, mass: Number(e.target.value)})}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        <div className="mt-1">
                            <label className="block text-sm font-medium text-gray-900">
                                Size
                            </label>
                            <input
                                type="number"
                                name="Size"
                                min={0}
                                max={100}
                                value={settings.size}
                                id="Size"
                                onChange={(e) => setSettings({...settings, size: Number(e.target.value)})}
                                className="block w-full px-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        <div className="mt-1" hidden>
                            <label className="block text-sm font-medium text-gray-900">
                                Velocity
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={settings.velocity}
                                name="velocity"
                                id="velocity"
                                onChange={(e) => setSettings({...settings, velocity: Number(e.target.value)})}
                                className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>

                    </div>


                </div>
            </div>
        </div>
    </form>)


    /*
    function settingsChanged(){
        physicsEngine.current.objects.forEach(object => {
            object.mass = settings.mass;
            object.restitution = settings.restitution;
            object.friction = settings.friction;
            object.airDensity = settings.airDensity;
            object.dragCoefficient = settings.dragCoefficient;
            object.surfaceArea = settings.surfaceArea;
            object.radius = settings.radius;
            object.size = settings.size;
            object.velocity = settings.velocity;
        })
    }
     */


    return (<div className="container">
            <div className="lg:flex lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        NextPhysics
                    </h2>
                    <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <WrenchIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true"/>
                            Built using Next.js
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <UserIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true"/>
                            by Pablo Tanner
                        </div>
                    </div>
                </div>
                <div className="mt-5 flex lg:ml-4 lg:mt-0">
                    <AboutModal/>
                    <span className="ml-3">
                        <Link target={"https://github.com/pablotanner"} href="https://github.com/pablotanner"
                              passHref={true}>
                            <button
                                type="button"
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                <LinkIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true"/>
                                Github
                            </button>
                        </Link>
                    </span>
                </div>
            </div>
            {settingsMenu}
            <div className="container py-3 h-full w-full space-y-2">
                <Toolbar
                    selectedTool={selectedTool}
                    setSelectedTool={setSelectedTool}
                    resetEnvironment={() => physicsEngine.current.reset()}
                    isPaused={settings.paused}
                    pause={() =>  setSettings({...settings, paused: true})}
                    play={() =>  setSettings({...settings, paused: false})}
                />
                <Render2D selectedTool={selectedTool} setSelectedTool={setSelectedTool} settings={settings}
                          physicsEngine={physicsEngine.current}/>
                <canvas id="physicsCanvas"
                        style={{cursor: "pointer", height: "100%", width: "100%", border: "solid #4F46E5 2px"}}/>
            </div>
        </div>)
}