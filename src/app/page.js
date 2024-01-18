"use client"
import "./globals.css"
import {
    LinkIcon,
    UserIcon
} from '@heroicons/react/20/solid'
import {WrenchIcon} from "@heroicons/react/16/solid";
import Link from "next/link";
import Render2D from "../physics/render2D.js";
import OptionsDropdown from "../components/OptionsDropdown.js";
import {useState} from "react";
import AboutModal from "../components/AboutModal.js";


export default function Home() {
    const [selectedTool, setSelectedTool] = useState("select");

    return (
        <div className="container">
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
                    <OptionsDropdown
                        selectedTool={selectedTool}
                        setSelectedTool={setSelectedTool}
                    />
                    <AboutModal/>
                    <span className="sm:ml-3">
                        <Link target={"https://github.com/pablotanner"} href="https://github.com/pablotanner" passHref={true}>
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
            {selectedTool}
            <div className="container py-5 h-full">
                <Render2D selectedTool={selectedTool} setSelectedTool={setSelectedTool}/>
                <canvas id="physicsCanvas" style={{cursor:"pointer",height:"100%", width:"100%", border:"solid #4F46E5 2px"}}/>
                {/*<canvas id="physicsCanvas" className="h-full w-full"/>*/}
            </div>
        </div>
    )
}