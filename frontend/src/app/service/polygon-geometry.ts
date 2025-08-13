import { Injectable } from '@angular/core';

export interface Point {
    x: number;
    y: number;
}

@Injectable({
    providedIn: 'root'
})
export class PolygonGeometryService {

    constructor() {}

    calculateVertices(sides: number, radius: number, centerX: number, centerY: number): Point[] {
        const vertices: Point[] = [];
        const angleStep = (2 * Math.PI) / sides;

        for (let i = 0; i < sides; i++) {
            const angle = angleStep * i;

            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            vertices.push({ x, y });
        }

        return vertices;
    }

    formatPointsForSvg(vertices: Point[]): string {
        return vertices.map((v: Point) => `${v.x},${v.y}`).join(' ');
    }
}
