export default `
varying vec3 v_worldPosition;
varying vec3 v_normal;

void main() {
    // Calcula a posição do vértice no espaço do mundo multiplicando pela matriz do modelo.
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    v_worldPosition = worldPosition.xyz;

    // Calcula a normal no espaço de visualização para garantir que a orientação esteja correta
    // em relação à câmera.
    v_normal = normalize(normalMatrix * normal);

    // gl_Position é uma variável especial que define a posição final do vértice na tela.
    // A posição é transformada pelas matrizes de modelo-visualização e de projeção.
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
