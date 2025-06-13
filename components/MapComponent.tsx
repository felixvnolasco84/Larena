"use client";

import React, { useState } from 'react';
import Map from "@/public/images/Map.png";
import Image from 'next/image';

const MapComponent = () => {
    const [selectedLocation, setSelectedLocation] = useState(0);

    type Location = {
        id: number;
        number: string;
        title: string;
        description: string;
        position: {
            top: string;
            left: string;
        };
    };

    const locations: Location[] = [
        {
            id: 0,
            number: "02",
            title: "MIN WALK",
            description: "GOLF CLUBHOUSE CAMPESTRE SAN JOSE",
            position: {
                top: "35%",
                left: "44%"
            }
        },
        {
            id: 1,
            number: "02",
            title: "MIN DRIVE BY CAR",
            description: "GOLF CLUBHOUSE CAMPESTRE",
            position: {
                top: "38%",
                left: "51%"
            }
        },
        {
            id: 2,
            number: "10",
            title: "MIN DRIVE BY CAR",
            description: "PALMILLA BEACH",
            position: {
                top: "90%",
                left: "40%"
            }
        },
        {
            id: 3,
            number: "12",
            title: "MIN DRIVE BY CAR",
            description: "DOWNTOWN SAN JOSE DEL CABO",
            position: {
                top: "10%",
                left: "58%"
            }
        },
        {
            id: 4,
            number: "20",
            title: "MIN DRIVE BY CAR",
            description: "SAD INTERNATIONAL AIRPORT",
            position: {
                top: "5%",
                left: "15%"
            }
        },
    ];

    const handleMarkerClick = (locationId: number) => {
        setSelectedLocation(locationId);
    };

    return (
        <div className="grid gap-4">
            <div className="relative aspect-video">
                {/* Background Map */}
                <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 relative">

                    <Image
                        src={Map}
                        alt="Rombo"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
                        className="w-full h-full  rounded-[15px] object-cover"
                    />

                    {/* La Arena label */}
                    <div className="absolute bottom-20 left-10 flex items-center gap-2">

                    </div>

                    {/* Interactive Markers */}
                    {locations.map((location) => (
                        <button
                            key={location.id}
                            onClick={() => handleMarkerClick(location.id)}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 ${selectedLocation === location.id
                                ? 'scale-125 z-20'
                                : 'scale-100 z-10 hover:z-15'
                                }`}
                            style={{
                                top: location.position.top,
                                left: location.position.left,
                            }}
                        >
                            <div className="relative">
                                {/* Marker Circle */}
                                <div className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${selectedLocation === location.id
                                    ? 'bg-gray-800 border-gray-900 shadow-lg'
                                    : 'bg-white border-gray-400 hover:bg-gray-100'
                                    }`}>
                                    <div className={`w-3 h-3 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${selectedLocation === location.id ? 'bg-white' : 'bg-gray-600'
                                        }`}></div>
                                </div>

                                {/* Connection Line (optional visual enhancement) */}
                                {selectedLocation === location.id && (
                                    <div className="absolute top-8 left-1/2 w-0.5 h-4 bg-gray-600 transform -translate-x-1/2"></div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Information Card */}
                <div className="hidden lg:block absolute bottom-10 right-10 z-30 rounded-[15px] bg-[#EBE9E2] w-full max-w-sm lg:w-[456px] lg:h-[251px] px-6 py-8 shadow-lg transition-all duration-500">
                    <div className="h-full flex flex-col justify-between">
                        <div className="flex items-start gap-6 w-full">
                            <p className="text-4xl lg:text-8xl xl:text-9xl font-light text-gray-800 leading-none">
                                {locations[selectedLocation].number}
                            </p>
                            <div className="flex-1 pt-2">
                                <p className="text-sm lg:text-base text-gray-600 font-medium leading-tight">
                                    {locations[selectedLocation].title}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-base lg:text-xl font-semibold text-gray-800 leading-relaxed">
                                {locations[selectedLocation].description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="block lg:hidden rounded-[15px] bg-[#EBE9E2] w-full aspect-auto px-6 py-8  transition-all duration-500">
                <div className="h-full flex flex-col justify-between">
                    <div className="flex items-start gap-6 w-full">
                        <p className="text-8xl  xl:text-9xl font-light text-gray-800 leading-none">
                            {locations[selectedLocation].number}
                        </p>
                        <div className="flex-1 pt-2">
                            <p className="text-sm lg:text-base text-gray-600 font-medium leading-tight">
                                {locations[selectedLocation].title}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-base lg:text-xl max-w-[280px] lg:max-w-none font-semibold text-gray-800 leading-relaxed">
                            {locations[selectedLocation].description}
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default MapComponent;