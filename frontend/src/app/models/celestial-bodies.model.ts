export interface Rotate {
    x: number;
    y: number;
    z: number;
}

export interface CelestialBody {
    name: string,
    size: number;
    angle: number;
    colors: number[];
    rotate: Rotate;
}

export interface Star extends CelestialBody {
    intensity: number;
    light: {
        color: number;
        intensity: number;
        distance: number;
    };
    atmosphere: {
        size: number;
        color: number;
        colorIntensity: number;
        rotate?: Rotate;
    };
}

export interface Planet extends CelestialBody {
    properties: {
        roughness: number;
        metalness: number;
    };
    orbit: {
        radius: number;
        speed: number;
    };
}

export interface StarSystem {
    name: string;
    position: { x: number; y: number; z: number };
    description: string;
    star: Star;
    planets: Planet[];
}
