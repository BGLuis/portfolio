import { starSystems } from '@config/star-systems.config';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SceneService } from '@service/scene.service';
import { TranslateService } from '@service/translate.service';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { IconsComponent } from '@components/icons/icons';
import { MarkdownModule } from 'ngx-markdown';
@Component({
  selector: 'app-ui-galaxy',
  imports: [RouterOutlet, NgClass, IconsComponent, MarkdownModule],
  templateUrl: './ui-galaxy.html',
  styleUrl: './ui-galaxy.scss'
})
export class UiGalaxy {
  openedSystem: any = null;
  subscription: Subscription;
  observedBodies: string | null = null;
  planetTranslation: any = null;
  starSystems: any[] = [];

  constructor(
    private sceneService: SceneService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) {
    this.starSystems = starSystems.map((system, systemIndex) => ({
      name: system.name,
      planets: system.planets.map((planet, planetIndex) => {
        let translatedName = planet.name;
        this.translateService.get(`planet.${planet.name}.title`).subscribe(title => {
          if (title && typeof title === 'string') {
            this.starSystems[systemIndex].planets[planetIndex].name = title;
          }
        });
        return {
          name: translatedName,
          originalName: planet.name
        };
      })
    }));

    this.subscription = this.sceneService.planetSelected$.subscribe(planetName => {
      this.observedBodies = planetName;
      if (planetName) {
        this.translateService.get(`planet.${planetName}`).subscribe(planetObj => {
          this.planetTranslation = planetObj;
          this.cdr.markForCheck();
        });
      } else {
        this.planetTranslation = null;
        this.cdr.markForCheck();
      }
    });

    // Verifica se a URL já contém um body ao iniciar
    const urlBody = this.route.snapshot.paramMap.get('body') || this.getBodyFromUrl();
    if (urlBody) {
      setTimeout(() => this.flyToPlanet(urlBody!), 0);
    }

  }

  private getBodyFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    const match = window.location.pathname.match(/\/galaxy\/(.+)$/);
    return match ? match[1] : null;
  }

  private static getBodyFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    const match = window.location.pathname.match(/\/galaxy\/(.+)$/);
    return match ? match[1] : null;
  }


  public flyToPlanet(body: string): void {
    this.sceneService.flyToBodyByName(body);
    this.location.replaceState(`/galaxy/${body}`);
  }

  toggleSystem(system: any) {
    this.openedSystem = this.openedSystem === system ? null : system;
  }

  flyToSystem(systemName: string) {
    this.sceneService.flyToSystemByName(systemName);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
