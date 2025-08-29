import { StarSystem } from "../models/celestial-bodies.model";

const starSystems: StarSystem[] = [
    {
        name: 'AboutMe',
        position: { x: 0, y: 0, z: 0 },
        star: {
            name: 'about me',
            size: 10.0,
            angle: 0.0,
            intensity: 3.5,
            colors: [
                0x993300,
                0xfffdd0,
            ],
            light: {
                color: 0xffffff,
                intensity: 1000.0,
                distance: 1000.0
            },
            rotate: {
                x: 0.0,
                y: 0.1,
                z: 0.0
            },
            atmosphere: {
                size: 1.04,
                color: 0xffa500,
                colorIntensity: 1.5
            },
        },
        planets: [
            {
                name: 'My',
                size: 0.4,
                angle: 0.0,
                colors: [
                    0xdeb887
                ],
                properties: {
                    roughness: 0.8,
                    metalness: 0.5
                },
                rotate: {
                    x: 0.0,
                    y: 1.2,
                    z: 0.0
                },
                orbit: {
                    radius: 30.0,
                    speed: 1.1
                },
            },
            {
                name: 'Projects',
                size: 2.0,
                angle: 0.0,
                colors: [
                    0xb7410e
                ],
                properties: {
                    roughness: 0.8,
                    metalness: 0.5
                },
                rotate: {
                    x: 0.0,
                    y: 1.2,
                    z: 0.0
                },
                orbit: {
                    radius: 60.0,
                    speed: 0.6
                },
            },
            {
                name: 'Experiences',
                size: 2.0,
                angle: 0.0,
                colors: [
                    0x05C548
                ],
                properties: {
                    roughness: 0.8,
                    metalness: 0.5
                },
                rotate: {
                    x: 0.0,
                    y: 1.2,
                    z: 0.0
                },
                orbit: {
                    radius: 90.0,
                    speed: 0.3
                },
            }
        ]
    }
];


export { starSystems };
