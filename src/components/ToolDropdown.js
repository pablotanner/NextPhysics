"use client"
import { Menu, Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import {ChevronDownIcon, CursorArrowRaysIcon, MinusIcon, TrashIcon} from '@heroicons/react/20/solid'
import {PencilIcon, StopIcon} from "@heroicons/react/16/solid";


export default function ToolDropdown({selectedTool, setSelectedTool}) {

    return (
        <div className="">
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        Select Tool
                        <ChevronDownIcon
                            className="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100"
                            aria-hidden="true"
                        />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                        <div className="px-1 py-1 ">
                            <Menu.Item>
                                {({active}) => (
                                    <button className={`${active ? 'bg-violet-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setSelectedTool("select");
                                            }}
                                    >
                                        <CursorArrowRaysIcon
                                            className="mr-2 h-5 w-5"
                                            aria-hidden="true"
                                        />
                                        Select
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({active}) => (
                                    <button className={`${active ? 'bg-violet-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setSelectedTool("circle")
                                            }}
                                    >
                                        <CircleIcon
                                            className="mr-2 h-5 w-5"
                                            aria-hidden="true"
                                            active={active}
                                        />
                                        Place Circle
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({active}) => (
                                    <button className={`${active ? 'bg-violet-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setSelectedTool("square");
                                            }}
                                    >
                                        <StopIcon
                                            className="mr-2 h-5 w-5"
                                            aria-hidden="true"
                                            active={active}
                                        />
                                        Place Square
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({active}) => (
                                    <button className={`${active ? 'bg-violet-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setSelectedTool("plane")
                                            }}
                                    >
                                        <MinusIcon
                                            className="mr-2 h-5 w-5"
                                            aria-hidden="true"
                                            active={active}
                                        />
                                        Place Floor
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({active}) => (
                                    <button className={`${active ? 'bg-violet-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setSelectedTool("edit")
                                            }}
                                    >
                                        <PencilIcon
                                            className="mr-2 h-5 w-5"
                                            aria-hidden="true"
                                            active={active}
                                        />
                                        Edit
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    )
}




function CircleIcon(props) {
    return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>

)
}