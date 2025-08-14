import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SceneService } from '../../../service/scene.service';
import { CelestialBody } from '../../../models/celestial-bodies.model';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-ui-galaxy',
  imports: [RouterOutlet, NgClass],
  templateUrl: './ui-galaxy.html',
  styleUrl: './ui-galaxy.scss'
})
export class UiGalaxy {

  subscription: Subscription;
  observedBodies: CelestialBody | null = null;

  constructor(
    private sceneService: SceneService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.sceneService.planetSelected$.subscribe(planet => {
      this.observedBodies = planet;
      this.cdr.detectChanges();
    });
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
