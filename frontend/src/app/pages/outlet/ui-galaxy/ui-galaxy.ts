import { starSystems } from '@config/star-systems.config';
import { ChangeDetectorRef, Component, AfterViewInit } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SceneService } from '@service/scene.service';
import { TranslateService } from '@service/translate.service';
import { AboutUsMarkdownService } from '@service/about-us-markdown.service';
import { ProjectMarkdownService } from '@service/project-markdown.service';
import { ExperienceMarkdownService } from '@service/experience-markdown.service';
import { Subscription } from 'rxjs';
import { ModalEmailService } from '@service/modal-email.service';
import { NgClass, CommonModule } from '@angular/common';
import { IconsComponent } from '@components/icons/icons';
import { MarkdownModule } from 'ngx-markdown';
import { SelectorLanguage } from '@app/components/selector-language/selector-language';
@Component({
  selector: 'app-ui-galaxy',
  imports: [RouterOutlet, NgClass, IconsComponent, MarkdownModule, SelectorLanguage, CommonModule],
  templateUrl: './ui-galaxy.html',
  styleUrl: './ui-galaxy.scss'
})
export class UiGalaxy implements AfterViewInit {
  configTitle = '';
  configDescription = '';
  contactButtonLabel = '';
  openedSystem: any = null;
  subscription: Subscription;
  observedBodies: string | null = null;
  planetTranslation: any = null;
  planetMarkdown: string | null = null;
  starSystems: any[] = [];

  constructor(
    private sceneService: SceneService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private aboutUsMarkdown: AboutUsMarkdownService,
    private projectMarkdown: ProjectMarkdownService,
    private experienceMarkdown: ExperienceMarkdownService,
    private modalEmailService: ModalEmailService
  ) {
    this.loadTranslations();
    this.loadStarSystems();

    this.translateService.onLangChange().subscribe(() => {
      this.loadTranslations();
      this.loadStarSystems();
      this.updateSelectedPlanetContent();
      this.cdr.markForCheck();
    });

    this.subscription = this.sceneService.planetSelected$.subscribe(planetName => {
      this.observedBodies = planetName;
      this.updateSelectedPlanetContent();
    });
  }

  ngAfterViewInit() {
    const initialBody = UiGalaxy.getBodyFromUrl();
    if (initialBody) {
      this.sceneService.flyToBodyByName(initialBody);
      this.observedBodies = initialBody;
      this.updateSelectedPlanetContent();
    } else {
      this.location.replaceState('/galaxy');
    }
  }

  public openEmailModal() {
    this.modalEmailService.openModal();
  }

  private loadTranslations() {
    this.translateService.get('ui.galaxy.configuration.title').subscribe((title: string) => {
      this.configTitle = title;
      this.cdr.markForCheck();
    });
    this.translateService.get('ui.galaxy.configuration.description').subscribe((desc: string) => {
      this.configDescription = desc;
      this.cdr.markForCheck();
    });
    this.translateService.get('ui.contact.sendMessage').subscribe((label: string) => {
      this.contactButtonLabel = label;
      this.cdr.markForCheck();
    });
  }

  private loadStarSystems() {
    this.starSystems = starSystems.map(system => ({
      name: system.name,
      translatedName: system.name,
      planets: system.planets.map(planet => ({
        name: planet.name,
        originalName: planet.name
      }))
    }));

    this.starSystems.forEach((system: any, systemIndex: number) => {
      this.translateService.get(`starSystem.${system.name}`).subscribe((translated: string) => {
        if (translated && typeof translated === 'string') {
          this.starSystems[systemIndex].translatedName = translated;
          this.cdr.markForCheck();
        }
      });

      system.planets.forEach((planet: any, planetIndex: number) => {
        this.translateService.get(`planet.${planet.originalName}.title`).subscribe(title => {
          if (title && typeof title === 'string') {
            this.starSystems[systemIndex].planets[planetIndex].name = title;
            this.cdr.markForCheck();
          }
        });
      });
    });
  }

  private static getBodyFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    const match = window.location.pathname.match(/\/galaxy\/(.+)$/);
    if (!match) return null;
    const body = match[1];
    const systemExists = starSystems.some(system => system.name === body);
    if (systemExists) return body;
    const planetExists = starSystems.some(system =>
      system.planets && system.planets.some(planet => planet.name === body)
    );
    return planetExists ? body : null;
  }

  private updateSelectedPlanetContent() {
    const planetName = this.observedBodies;
    if (planetName) {
      this.translateService.get(`planet.${planetName}`).subscribe(planetObj => {
        this.planetTranslation = planetObj;
        if (planetName === 'My' && planetObj?.data) {
          this.planetMarkdown = this.aboutUsMarkdown.toMarkdown({
            title: planetObj.title,
            sections: planetObj.data
          });
        } else if (planetName === 'Projects' && planetObj?.data) {
          this.planetMarkdown = this.projectMarkdown.toMarkdown({ title: planetObj.title, projects: planetObj.data });
        } else if (planetName === 'Experiences' && planetObj?.data) {
          this.planetMarkdown = this.experienceMarkdown.jsonToMarkdown({ title: planetObj.title, experiences: planetObj.data });
        } else {
          this.planetMarkdown = null;
        }
        this.cdr.markForCheck();
      });
    } else {
      this.planetTranslation = null;
      this.planetMarkdown = null;
      this.cdr.markForCheck();
    }
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
