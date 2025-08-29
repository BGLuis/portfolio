export default `
uniform float u_time;        // Tempo decorrido, para animações.
uniform vec3 u_radii;        // Raios do elipsoide da galáxia (x, y, z).
uniform vec3 u_color1;       // Cor externa dos braços.
uniform vec3 u_color2;       // Cor interna dos braços.
uniform vec3 u_colorCore;    // Cor do núcleo brilhante.

// --- Varyings ---
// Variáveis recebidas do vertex shader, interpoladas para cada píxel.
varying vec3 v_worldPosition; // Posição do fragmento no espaço do mundo.
varying vec3 v_normal;        // Normal do fragmento.

// --- Funções de Ruído ---
// Implementação de ruído pseudo-aleatório 3D (Simplex Noise) para criar a aparência de gás.
// Este ruído gera valores "aleatórios" mas contínuos, perfeitos para texturas naturais.
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractional Brownian Motion (fbm) - Combina várias camadas de ruído (oitavas)
// para criar uma textura mais rica e detalhada, similar a nuvens.
float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 2.0;
    for (int i = 0; i < 5; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}


void main() {
    // ---- Lógica de Visibilidade ----
    // gl_FrontFacing é um booleano que é 'true' se estivermos a ver a face da frente do polígono.
    // Se for 'false', significa que a câmera está DENTRO da esfera.
    // Nesse caso, 'discard' ignora o píxel, tornando a galáxia invisível por dentro.
    if (!gl_FrontFacing) {
        discard;
    }

    // Normaliza a posição do fragmento para um espaço elipsoidal unitário.
    // Isso simplifica os cálculos de distância e forma.
    vec3 pos = v_worldPosition / u_radii;
    float dist_from_center = length(pos);

    // Se o píxel estiver fora da borda do elipsoide, descarta-o.
    if (dist_from_center > 1.0) {
        discard;
    }

    // ---- Cálculo de Densidade ----

    // 1. Densidade do Núcleo: Mais forte no centro e com decaimento exponencial.
    float core_density = exp(-dist_from_center * 8.0) * 1.5;

    // 2. Densidade dos Braços Espirais:
    float arms_density = 0.0;
    // Só calcula os braços fora do núcleo central para evitar sobreposição.
    if (dist_from_center > 0.1) {
        // Converte para coordenadas cilíndricas no plano XZ para criar a espiral.
        vec2 xy_plane = pos.xz;
        float dist_from_axis = length(xy_plane);
        float angle = atan(xy_plane.y, xy_plane.x);

        float num_arms = 2.0;       // Número de braços.
        float arm_tightness = 4.0;  // Quão "enrolados" são os braços.
        float time_rotation = u_time * 0.05; // Rotação da galáxia ao longo do tempo.

        // Usa uma função seno para modelar a forma ondulada dos braços espirais.
        // A densidade é maior ao longo das cristas da onda.
        float arm_shape = sin(angle * num_arms + dist_from_axis * arm_tightness - time_rotation);
        arms_density = pow(arm_shape, 2.0); // pow() torna os braços mais finos e definidos.

        // Modula a densidade para que os braços apareçam e desapareçam suavemente.
        arms_density *= smoothstep(0.1, 0.4, dist_from_center);      // Começa os braços.
        arms_density *= (1.0 - smoothstep(0.7, 1.0, dist_from_center)); // Desvanece perto da borda.
        arms_density *= 0.6; // Intensidade geral dos braços.
    }

    // 3. Ruído Gasoso: Adiciona a textura de nuvem.
    vec3 noise_coord = v_worldPosition * 0.02;
    float noise = fbm(noise_coord + u_time * 0.02);
    noise = (noise + 1.0) * 0.5; // Mapeia o ruído para o intervalo [0, 1].

    // --- Densidade Final ---
    // Combina as densidades do núcleo, braços e o ruído de gás.
    float total_density = (core_density + arms_density) * noise;

    // ---- Coloração ----
    // Mistura as cores dos braços com base na distância ao centro.
    vec3 color = mix(u_color2, u_color1, smoothstep(0.0, 1.0, dist_from_center));
    // Adiciona a cor do núcleo, que é mais forte no centro.
    color = mix(color, u_colorCore, smoothstep(0.0, 0.2, dist_from_center));

    // ---- Alpha (Transparência) ----
    // O alpha final depende da densidade e da perspectiva da câmera.
    vec3 view_direction = normalize(cameraPosition - v_worldPosition);
    // Este cálculo faz com que as bordas da esfera pareçam mais densas, simulando um volume.
    float edge_fade = pow(1.0 - abs(dot(view_direction, v_normal)), 2.0);

    // O alpha é a densidade total, modulada pelo desvanecimento das bordas.
    float alpha = total_density * edge_fade;
    // Garante que a galáxia desvaneça completamente na sua fronteira exterior.
    alpha *= (1.0 - dist_from_center);

    // Define a cor e o alpha final do píxel.
    // A cor é multiplicada pelo alpha para um efeito de mistura aditiva mais natural.
    gl_FragColor = vec4(color * alpha, alpha);
}
`
