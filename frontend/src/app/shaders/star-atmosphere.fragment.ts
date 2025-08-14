export default `
uniform vec3 u_glowColor;
uniform float u_intensity;
varying vec3 vNormal;
void main() {
    float fresnel = pow(1.0 - abs(vNormal.z), 3.0);
    gl_FragColor = vec4(u_glowColor * fresnel * u_intensity, 1.0);
}
`;
