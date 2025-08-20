import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { StarSystem, Star, Planet, CelestialBody } from '../models/celestial-bodies.model';
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
    private _cameraAnimationStartTime?: number;
    private animatedShaders: THREE.ShaderMaterial[] = [];
    private rotatableObjects: THREE.Object3D[] = [];
    private orbitalPivots: THREE.Object3D[] = [];

    private _planetSelected$ = new Subject<CelestialBody | null>();
    public get planetSelected$(): Observable<CelestialBody | null> {
        return this._planetSelected$.asObservable();
    }

    private frameId: number | null = null;
    private trackedPlanet: THREE.Object3D | null = null;
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();

    get planetFocus(): THREE.Object3D | null {
        return this.trackedPlanet;
    }

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

        window.addEventListener('resize', this.onWindowResize);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x12151A);

        this.camera = new THREE.PerspectiveCamera(
            75,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            1e20
        );
        this.camera.position.z = 50;

        this.onWindowResize = this.onWindowResize.bind(this);

        this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);

        this.cameraControls.dollyToCursor = true;
        this.cameraControls.infinityDolly = true;
        // this.cameraControls.maxDistance = 100;

        this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
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

        window.removeEventListener('resize', this.onWindowResize);
    }

    private onWindowResize(): void {
        if (!this.renderer || !this.camera || !this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        const width = this.canvas.width;
        const height = window.innerHeight;

        if (width === 0 || height === 0) return;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
                if (this.trackedPlanet) {
                    const planetPos = new THREE.Vector3();
                    this.trackedPlanet.getWorldPosition(planetPos);

                    let planetRadius = 1;
                    if (this.trackedPlanet instanceof THREE.Mesh && this.trackedPlanet.geometry instanceof THREE.SphereGeometry) {
                        planetRadius = this.trackedPlanet.geometry.parameters.radius;
                    }

                    const CAMERA_DEPTH_FACTOR = 6;
                    const depthOffset = planetRadius * CAMERA_DEPTH_FACTOR;
                    const newCameraPos = new THREE.Vector3(
                        planetPos.x,
                        planetPos.y,
                        planetPos.z + depthOffset
                    );
                    const newTargetPos = new THREE.Vector3(
                        planetPos.x,
                        newCameraPos.y - (planetRadius * CAMERA_DEPTH_FACTOR) * 0.5,
                        planetPos.z
                    );

                    const cameraCurrentPos = this.camera.position;
                    const distance = cameraCurrentPos.distanceTo(newCameraPos);
                    let animation = distance > planetRadius * CAMERA_DEPTH_FACTOR;

                    if (animation) {
                        if (!this._cameraAnimationStartTime) {
                            this._cameraAnimationStartTime = performance.now();
                        } else {
                            const elapsed = (performance.now() - this._cameraAnimationStartTime) / 1000;
                            if (elapsed > 3) {
                                animation = false;
                            }
                        }
                    } else {
                        this._cameraAnimationStartTime = undefined;
                    }

                    this.cameraControls.setLookAt(
                        newCameraPos.x,
                        newCameraPos.y,
                        newCameraPos.z,
                        newTargetPos.x,
                        newTargetPos.y,
                        newTargetPos.z,
                        animation
                    );
                } else {
                    this._cameraAnimationStartTime = undefined;
                }
                this.cameraControls.update(delta);
                this.renderer.render(this.scene, this.camera);
            });
        });
    }

    private onPointerDown(event: PointerEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.rotatableObjects, false);
        if (intersects.length > 0) {
            this.trackedPlanet = intersects[0].object;
            this._planetSelected$.next(this.trackedPlanet.userData['data'] || null);
        } else {
            this.trackedPlanet = null;
            this._planetSelected$.next(null);
        }
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
        planetMesh.userData['data'] = planet;
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
        // Adiciona referência ao objeto de dados da estrela
        starCore.userData['data'] = star;
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

    private createGalaxy(): void {

    }

    private addStarfield(): void {
        const vertices = [];
        const radius = 1000;
        const starCount = 10000;

        for (let i = 0; i < starCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const r = radius * Math.cbrt(Math.random());

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            vertices.push(x, y, z);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0x888888, size: 0.1 });
        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
    }

    public flyToBodyByName(name: string): void {
        let foundObject: THREE.Object3D | null = null;

        for (const obj of this.rotatableObjects) {
            const data = obj.userData['data'];
            if (data && data.name === name) {
                foundObject = obj;
                break;
            }
        }

        if (foundObject) {
            const pos = new THREE.Vector3();
            foundObject.getWorldPosition(pos);

            let radius = 1;
            if (foundObject instanceof THREE.Mesh && foundObject.geometry instanceof THREE.SphereGeometry) {
                radius = foundObject.geometry.parameters.radius;
            }
            const cameraPos = new THREE.Vector3(pos.x, pos.y, pos.z + radius * 4);
            this.flyTo(pos, cameraPos, true);
            this.trackedPlanet = foundObject;
            this._planetSelected$.next(name);
        }
    }

    public flyToCenter(): void {
        const center = new THREE.Vector3(0, 0, 0);
        const cameraPos = new THREE.Vector3(0, 0, 50);
        this.flyTo(center, cameraPos, true);
        this.trackedPlanet = null;
        this._planetSelected$.next(null);
    }

    public flyToSystemByName(systemName: string): void {
        const system = this.starSystems.find(s => s.name === systemName);
        if (system) {
            const pos = new THREE.Vector3(system.position.x, system.position.y, system.position.z);
            const cameraPos = new THREE.Vector3(pos.x, pos.y, pos.z + 100);
            this.flyTo(pos, cameraPos, true);
            this.trackedPlanet = null;
            this._planetSelected$.next(null);
        }
    }
}
