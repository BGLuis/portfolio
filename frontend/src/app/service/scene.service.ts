import { Injectable, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
CameraControls.install({ THREE: THREE });

@Injectable({
    providedIn: 'root'
})
export class SceneService implements OnDestroy {
    private canvas!: HTMLCanvasElement;
    private renderer!: THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private cameraControls!: CameraControls;
    private clock = new THREE.Clock();
    private starMaterial!: THREE.ShaderMaterial;
    private rotatableObjects: THREE.Object3D[] = [];

    private frameId: number | null = null;

    constructor(private ngZone: NgZone) {}

    public init(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            // logarithmicDepthBuffer: true, erro de profundidade
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000005);

        this.camera = new THREE.PerspectiveCamera(
            75,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            1e20
        );
        this.camera.position.z = 50;

        this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);

        this.cameraControls.dollyToCursor = true;
        this.cameraControls.infinityDolly = true;

        this.startRenderingLoop();

        this.addStarfield();
        this.createStar();
        this.createPlanet();

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
    }

    public ngOnDestroy(): void {
        if (this.frameId != null) {
            cancelAnimationFrame(this.frameId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }


    public flyTo(targetPosition: THREE.Vector3, cameraPosition: THREE.Vector3, enableTransition = true): void {
        this.cameraControls.setLookAt(
            cameraPosition.x, cameraPosition.y, cameraPosition.z,
            targetPosition.x, targetPosition.y, targetPosition.z,
            enableTransition
        );
    }

    private startRenderingLoop(): void {
        this.ngZone.runOutsideAngular(() => {
            const loop = () => {
                this.frameId = requestAnimationFrame(loop);

                const delta = this.clock.getDelta();
                const hasControlsUpdated = this.cameraControls.update(delta);
                this.rotatableObjects.forEach(obj => {
                    if (obj.userData['rotation']) {
                        const { axis, speed } = obj.userData['rotation'];
                        type Axis = 'x' | 'y' | 'z';
                        if (['x', 'y', 'z'].includes(axis)) {
                            (obj.rotation as any)[axis as Axis] += speed * delta;
                        }
                    }
                });
                this.renderer.render(this.scene, this.camera);
            };
            loop();
        });
    }

    private addStarfield(): void {
        const vertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = THREE.MathUtils.randFloatSpread(2000);
            const y = THREE.MathUtils.randFloatSpread(2000);
            const z = THREE.MathUtils.randFloatSpread(2000);
            vertices.push(x, y, z);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0x888888, size: 0.1 });
        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
    }

    private createPlanet(): void {
        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xb7410e,
            roughness: 0.8,
            metalness: 0.5
        });
        const planet = new THREE.Mesh(geometry, material);
        planet.userData['rotation'] = {
            axis: 'y',
            speed: 1.2
        };
        planet.position.set(80, 0, 10);
        this.rotatableObjects.push(planet);
        this.scene.add(planet);
    }

    private createStar(): void {
        const pointLight = new THREE.PointLight(0xffffff, 80000.0, 90000);
        this.scene.add(pointLight);

        const coreGeometry = new THREE.SphereGeometry(10, 128, 128);
        const coreMaterial = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0.0 },
                u_darkColor: { value: new THREE.Color(0x993300) },
                u_hotColor: { value: new THREE.Color(0xfffdd0) },
                u_intensity: { value: 3.5 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,
            fragmentShader: `
                uniform float u_time;
                uniform vec3 u_darkColor;
                uniform vec3 u_hotColor;
                uniform float u_intensity;
                varying vec2 vUv;
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
                float snoise(vec2 v) { const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439); vec2 i  = floor(v + dot(v, C.yy) ); vec2 x0 = v -   i + dot(i, C.xx); vec2 i1 = (x0.x > x0.y)? vec2(1.0, 0.0) : vec2(0.0, 1.0); vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod289(i); vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 )); vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); m = m*m; m = m*m; vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox; m *= (1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h )); vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw; return 130.0 * dot(m, g); }
                #define OCTAVES 6
                float fbm(vec2 v) { float value = 0.0; float amplitude = 0.5; for (int i = 0; i < OCTAVES; i++) { value += amplitude * snoise(v); v *= 2.0; amplitude *= 0.5; } return value; }
                void main() {
                    float time = u_time * 0.1;
                    vec2 uv1 = vUv * 3.0 + time;
                    vec2 uv2 = vUv * 2.5 - time * 0.5;
                    float noise = (fbm(uv1) + fbm(uv2)) / 2.0;
                    noise = (noise + 1.0) * 0.5;
                    noise = pow(noise, 2.0);
                    vec3 mixed_color = mix(u_darkColor, u_hotColor, noise);
                    vec3 final_color = mixed_color * u_intensity;
                    gl_FragColor = vec4(final_color, 1.0);
                }`
        });
        const starCore = new THREE.Mesh(coreGeometry, coreMaterial);
        starCore.userData['rotation'] = {
            speed: 0.1,
            axis: 'y'
        };
        this.scene.add(starCore);

        const atmosphereGeometry = new THREE.SphereGeometry(10.2, 128, 128);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                u_glowColor: { value: new THREE.Color(0xffa500) },
                u_intensity: { value: 1.5 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,
            fragmentShader: `
                uniform vec3 u_glowColor;
                uniform float u_intensity;
                varying vec3 vNormal;
                void main() {
                    float fresnel = pow(1.0 - abs(vNormal.z), 3.0);
                    gl_FragColor = vec4(u_glowColor * fresnel * u_intensity, 1.0);
                }`,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        const starAtmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        starAtmosphere.userData['rotation'] = {
            speed: 0.05,
            axis: 'y'
        };
        this.rotatableObjects.push(starCore, starAtmosphere);
        this.scene.add(starAtmosphere);

        this.ngZone.runOutsideAngular(() => {
            this.renderer.setAnimationLoop(() => {
                const delta = this.clock.getDelta();
                const elapsed = this.clock.getElapsedTime();

                coreMaterial.uniforms['u_time'].value = elapsed;

                this.cameraControls.update(delta);
                this.renderer.render(this.scene, this.camera);
            });
        });
    }
}
