import { Injectable, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { StarSystem, Star, Planet } from '../models/celestial-bodies.model';
import { starSystems } from '../config/star-systems.config';

import starCoreVertexShader from '../shaders/star-core.vertex';
import starCoreFragmentShader from '../shaders/star-core.fragment';
import starAtmosphereVertexShader from '../shaders/star-atmosphere.vertex';
import starAtmosphereFragmentShader from '../shaders/star-atmosphere.fragment';


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

    private starSystems: StarSystem[] = []
    private animatedShaders: THREE.ShaderMaterial[] = [];
    private rotatableObjects: THREE.Object3D[] = [];
    private orbitalPivots: THREE.Object3D[] = [];

    private frameId: number | null = null;

    constructor(private ngZone: NgZone) {
        this.starSystems = starSystems
    }

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
        this.createStarSystems();

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
            this.renderer.setAnimationLoop(() => {
                const delta = this.clock.getDelta();
                const elapsed = this.clock.getElapsedTime();

                this.animatedShaders.forEach(shader => {
                    shader.uniforms['u_time'].value = elapsed;
                });

                this.rotatableObjects.forEach(obj => {
                    if (obj.userData['rotation']) {
                        const rotation = obj.userData['rotation'];
                        if (rotation.x) obj.rotation.x += rotation.x * delta;
                        if (rotation.y) obj.rotation.y += rotation.y * delta;
                        if (rotation.z) obj.rotation.z += rotation.z * delta;
                    }
                });

                this.orbitalPivots.forEach(pivot => {
                    if (pivot.userData['orbitalSpeed']) {
                        pivot.rotation.y = elapsed * pivot.userData['orbitalSpeed'];
                    }
                });
                this.cameraControls.update(delta);
                this.renderer.render(this.scene, this.camera);
            });
        });
    }

    private createPlanet(planet: Planet, parentPivot: THREE.Object3D): void {
        const planetPivot = new THREE.Object3D();
        planetPivot.userData['orbitalSpeed'] = planet.orbit.speed;
        this.orbitalPivots.push(planetPivot);
        parentPivot.add(planetPivot);

        const geometry = new THREE.SphereGeometry(planet.size, 128, 128);
        const material = new THREE.MeshStandardMaterial({
            color: planet.colors[0],
            ...planet.properties,
        });
        const planetMesh = new THREE.Mesh(geometry, material);
        if (planet.rotate) {
            planetMesh.userData['rotation'] = planet.rotate;
        }
        planetMesh.position.x = planet.orbit.radius;
        this.rotatableObjects.push(planetMesh);

        planetPivot.add(planetMesh);
    }

    private createStar(star: Star): THREE.Object3D[] {
        const pointLight = new THREE.PointLight(
            star.light.color,
            star.light.intensity,
            star.light.distance
        );
        this.scene.add(pointLight);

        const coreGeometry = new THREE.SphereGeometry(star.size, 128, 128);
        const coreMaterial = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0.0 },
                u_darkColor: { value: new THREE.Color(star.colors[0]) },
                u_hotColor: { value: new THREE.Color(star.colors[1]) },
                u_intensity: { value: star.intensity }
            },
            vertexShader: starCoreVertexShader,
            fragmentShader: starCoreFragmentShader
        });
        this.animatedShaders.push(coreMaterial);

        const starCore = new THREE.Mesh(coreGeometry, coreMaterial);
        if (star.rotate) {
            starCore.userData['rotation'] = {
                x: star.rotate.x,
                y: star.rotate.y,
                z: star.rotate.z
            };
        }

        const atmosphereGeometry = new THREE.SphereGeometry(star.size * star.atmosphere.size, 128, 128);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                u_glowColor: { value: new THREE.Color(star.atmosphere.color) },
                u_intensity: { value: star.atmosphere.colorIntensity }
            },
            vertexShader: starAtmosphereVertexShader,
            fragmentShader: starAtmosphereFragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        const starAtmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        if (star.atmosphere.rotate) {
            starAtmosphere.userData['rotation'] = star.atmosphere.rotate
        }
        this.rotatableObjects.push(starCore, starAtmosphere);

        this.scene.add(starCore);
        this.scene.add(starAtmosphere);
        return [starCore, starAtmosphere];
    }

    private createStarSystems(): void {
        this.starSystems.forEach(system => {
            const SystemPivot = new THREE.Object3D();

            SystemPivot.position.set(system.position.x, system.position.y, system.position.z);
            this.scene.add(SystemPivot);

            const starComponents = this.createStar(system.star);
            starComponents.forEach(component => SystemPivot.add(component));

            for (const planet of system.planets) {
                this.createPlanet(planet, SystemPivot);
            }
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
}
