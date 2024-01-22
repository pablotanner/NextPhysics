import {Dialog, Menu, Transition} from "@headlessui/react";
import classNames from "classnames";
import {Fragment, useEffect, useRef, useState} from "react";


export default function ObjectMenu({selectedObject, setSelectedObject, physicsEngine}) {
    const object = selectedObject.object;
    const position = selectedObject.position;

    const modalRef = useRef();
    const menuRef = useRef();

    const [inspectMenuOpen, setInspectMenuOpen] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);

    const closeModal = () => {
        setEditModalOpen(false);
    }

    const openModal = () => {
        setEditModalOpen(true);
    }


    useEffect(() => {
        function handleClickOutside(event) {
            if(modalRef.current && modalRef.current?.contains(event.target)) return;


            if (menuRef.current && !menuRef?.current?.contains(event.target)) {
                setSelectedObject({object: undefined, position: {x: 0, y: 0}});
            }
        }
        //document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setSelectedObject]);


    function deleteObject(){
        physicsEngine.removeObject(object);
        setSelectedObject({object: undefined, position: {x: 0, y: 0}});
    }

    const inspectObject = () => {
        return (
            <div className="flex flex-col cursor-default" onClick={() => setInspectMenuOpen(false)}>
                <p className="text-sm text-gray-500">Position: {Math.round(object.position.vector.x)}, {Math.round(object.position.vector.y)}</p>
                <p className="text-sm text-gray-500">Mass: {object.mass / 100}</p>
                <p className="text-sm text-gray-500">Restitution: {object.restitution}</p>
                <p className="text-sm text-gray-500">Drag: {object.drag}</p>
                <p className="text-sm text-gray-500">Friction: {object.friction}</p>
                <p hidden className="text-sm text-gray-500">Angular Velocity: {object.angularVelocity}</p>
                <p hidden className="text-sm text-gray-500">Torque: {object.torque}</p>
            </div>
        )
    }

    const editObject = () => {
        return (
            <div className="flex flex-col space-y-2 p-4 bg-white rounded-lg">
                <label className="text-sm text-gray-700">Mass</label>
                <input
                    className="w-full p-2 text-sm text-gray-700 border rounded-md"
                    type="number"
                    value={object.mass / 100}
                    onChange={(e) => {
                        object.mass = Number(e.target.value) * 100;
                    }}
                />
                <label className="text-sm text-gray-700">Restitution</label>
                <input
                    className="w-full p-2 text-sm text-gray-700 border rounded-md"
                    type="number"
                    value={object.restitution}
                    onChange={(e) => {
                        object.restitution = Number(e.target.value);
                    }}
                />
                <label className="text-sm text-gray-700">Drag</label>
                <input
                    className="w-full p-2 text-sm text-gray-700 border rounded-md"
                    type="number"
                    value={object.drag}
                    onChange={(e) => {
                        object.drag = Number(e.target.value);
                    }}
                />
                <label className="text-sm text-gray-700">Friction</label>
                <input
                    className="w-full p-2 text-sm text-gray-700 border rounded-md"
                    type="number"
                    value={object.friction}
                    onChange={(e) => {
                        object.friction = Number(e.target.value);
                    }}
                />
                <label className="text-sm text-gray-700">Color</label>
                <input
                    className="w-full p-2 text-sm text-gray-700 border rounded-md"
                    type="text"
                    value={object.color}
                    onChange={(e) => {
                        object.color = e.target.value;
                    }}
                />
            </div>
        )
    }

    if (!object) return null;

    return (
        <>
        <Menu as="div" ref={menuRef} id="object-context-menu" style={{top: position.y, left: position.x}}
             className="absolute z-10 mt-2 w-40 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none cursor-pointer"
             role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
                <Menu.Item>
                    {({active}) => (
                        <a
                            className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm hover:bg-gray-200 rounded-t-md'
                            )}
                            onClick={openModal}
                        >
                            Edit
                        </a>
                    )}
                </Menu.Item>

                <Menu.Item>
                    {({active}) => (
                        <a
                            className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm hover:bg-gray-200 rounded-t-md'
                            )}
                            onClick={() => setInspectMenuOpen(!inspectMenuOpen)}
                        >
                            Inspect
                        </a>
                    )}
                </Menu.Item>
                {inspectMenuOpen && <Menu.Item>
                    {({active}) => (
                        <a
                            className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm hover:bg-gray-200'
                            )}
                        >
                            {inspectObject()}
                        </a>
                    )}
                </Menu.Item>
                }

                <Menu.Item>
                    {({active}) => (
                        <a
                            className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm hover:bg-gray-200 rounded-b-md'
                            )}
                            onClick={deleteObject}

                        >
                            Delete
                        </a>
                    )}
                </Menu.Item>

        </Menu>
            <Transition appear show={editModalOpen} as={Fragment}>
                <Dialog
                    ref={modalRef}
                    as="div"
                    className="fixed inset-0 z-10 overflow-y-auto"

                    onClose={closeModal}
                >
                    <div className="min-h-screen px-4 text-center">
                        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

                        {/* This element is to trick the browser into centering the modal contents. */}
                        <span
                            className="inline-block h-screen align-middle"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                >
                                    Edit Object
                                </Dialog.Title>
                                <div className="mt-2">
                                    {editObject()}
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                                        onClick={closeModal}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
            </>
    )

}