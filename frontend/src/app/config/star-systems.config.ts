import { StarSystem } from "../models/celestial-bodies.model";

const starSystems: StarSystem[] = [
    {
        name: 'Solar',
        position: { x: 0, y: 0, z: 0 },
        description: 'The Solar System is the gravitationally bound system of the Sun and the objects',
        star: {
            name: 'Sun',
            size: 10.0,
            angle: 0.0,
            intensity: 3.5,
            colors: [
                0x993300,
                0xfffdd0,
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
                name: 'Earth',
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
                    radius: 30.0,
                    speed: 1.1
                },
                description: 'Isso e um teste para visualização de texto de um planeta'
            }
        ]
    }
];


export { starSystems };
