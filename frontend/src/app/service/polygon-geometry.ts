import { Injectable } from '@angular/core';

// Define uma interface para a estrutura de um ponto
export interface Point {
    x: number;
    y: number;
}

@Injectable({
    providedIn: 'root'
})
export class PolygonGeometryService {

    constructor() {}

    /**
     * Calcula os vértices de um polígono regular.
     * @param sides - O número de lados do polígono.
     * @param radius - O raio do círculo que circunscreve o polígono.
     * @param centerX - A coordenada X do centro do polígono.
     * @param centerY - A coordenada Y do centro do polígono.
     * @returns Um array de objetos Point com as coordenadas dos vértices.
     */
    calculateVertices(sides: number, radius: number, centerX: number, centerY: number): Point[] {
        const vertices: Point[] = [];
        // O ângulo entre cada vértice é 2*PI dividido pelo número de lados [2]
        const angleStep = (2 * Math.PI) / sides;

        for (let i = 0; i < sides; i++) {
            const angle = angleStep * i;

            // Converte de coordenadas polares para cartesianas para obter a posição do vértice [2]
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            vertices.push({ x, y });
        }

        return vertices;
    }

    /**
     * Formata um array de vértices em uma string para o atributo 'points' do SVG.
     * @param vertices - Um array de objetos Point.
     * @returns Uma string no formato "x1,y1 x2,y2...".
     */
    formatPointsForSvg(vertices: Point[]): string {
        return vertices.map((v: Point) => `${v.x},${v.y}`).join(' ');
    }
}
