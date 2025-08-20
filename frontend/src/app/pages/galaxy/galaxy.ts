import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { SceneService } from '../../service/scene.service';
import * as THREE from 'three';

@Component({
  selector: 'app-galaxy',
  imports: [],
  templateUrl: './galaxy.html',
  styleUrl: './galaxy.scss'
})
export class Galaxy implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;

  constructor(private sceneService: SceneService) {}

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.sceneService.init(this.canvas.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.sceneService.ngOnDestroy();
  }

  public flyHome(): void {
    this.sceneService.flyToCenter();
  }
}
