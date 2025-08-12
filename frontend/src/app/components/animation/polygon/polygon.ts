import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { startWith } from 'rxjs/operators';

// Importações da GSAP e do plugin
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'; // Requer uma licença Club GreenSock
import { PolygonGeometryService } from '../../../service/polygon-geometry';

@Component({
  selector: 'app-polygon',
  templateUrl: './polygon.html',
  styleUrls: ['./polygon.scss']
})
export class Polygon implements OnInit, AfterViewInit, OnDestroy {
  // Referência ao elemento <polygon> no template [4]
  @ViewChild('poly') polygonRef!: ElementRef<SVGPolygonElement>;

  // Configurações do polígono
  private sides = 2;
  private readonly radius = 100;
  private readonly centerX = 125;
  private readonly centerY = 125;
  private animationDuration = 1.5;
  private trasitionInterval = 3500;
  private maxSides = 9;

  private intervalSubscription!: Subscription;

  constructor(private polygonService: PolygonGeometryService) {
    gsap.registerPlugin(MorphSVGPlugin);
  }

  ngOnInit(): void {
    const source = interval(this.trasitionInterval);
    this.intervalSubscription = source.subscribe(() => {
      if (this.sides < this.maxSides) {
        this.sides++;
      } else {
        this.sides = 3;
      }
      this.updatePolygonShape();
    });
  }

  ngAfterViewInit(): void {
    const initialVertices = this.polygonService.calculateVertices(this.sides, this.radius, this.centerX, this.centerY);
    const initialPointsString = this.polygonService.formatPointsForSvg(initialVertices);
    if (this.polygonRef && this.polygonRef.nativeElement) {
      this.polygonRef.nativeElement.setAttribute('points', initialPointsString);
    }
    gsap.set(this.polygonRef.nativeElement, { attr: { points: initialPointsString } });
  }

  private updatePolygonShape(): void {
    if (!this.polygonRef) return;

    const newVertices = this.polygonService.calculateVertices(this.sides, this.radius, this.centerX, this.centerY);
    const newPointsString = this.polygonService.formatPointsForSvg(newVertices);

    gsap.to(this.polygonRef.nativeElement, {
      morphSVG: newPointsString,
      duration: this.animationDuration,
      ease: 'power2.inOut'
    });
  }

  ngOnDestroy(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }
}
