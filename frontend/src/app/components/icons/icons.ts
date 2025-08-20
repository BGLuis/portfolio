import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icons',
  imports: [CommonModule],
  templateUrl: './icons.html',
  styleUrls: ['./icons.scss']
})

export class IconsComponent implements OnChanges {
  @Input() name!: string;
  @Input() size: string = '24';
  @Input() color: string = 'currentColor';
  @Input() background: string = 'none';
  @Input() stroke: string = '2';
  @Input() modifier: boolean = true;

  svgContent: SafeHtml = '';

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.loadIcon();
  }

  private loadIcon(): void {
    const iconPath = `/assets/icons/${this.name}.svg`;
    if (isPlatformBrowser(this.platformId)) {
      this.http.get(iconPath, { responseType: 'text' }).subscribe({
        next: (svg) => {
          svg = this.applySvgAttributes(svg);
          this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(`Erro ao carregar o ícone: ${this.name}`, error);
          this.svgContent = '';
        }
      });
    } else if (isPlatformServer(this.platformId)) {
      try {
        const fs = require('fs');
        const path = require('path');
        const distPath = path.join(process.cwd(), 'dist', 'browser', 'assets', 'icons', `${this.name}.svg`);
        let svg = fs.readFileSync(distPath, 'utf8');
        svg = this.applySvgAttributes(svg);
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
        this.cdr.markForCheck();
      } catch (error) {
        console.error(`Erro ao carregar o ícone no SSR: ${this.name}`, error);
        this.svgContent = '';
      }
    } else {
      this.svgContent = '';
    }
  }

  private applySvgAttributes(svg: string): string {
    let result = svg
      .replace(/width=".*?"/, `width="${this.size}"`)
      .replace(/height=".*?"/, `height="${this.size}"`);
    if (this.modifier) {
      result = result
        .replace(/stroke=".*?"/, `stroke="${this.color}"`)
        .replace(/fill=".*?"/, `fill="${this.background}"`)
        .replace(/stroke-width=".*?"/, `stroke-width="${this.stroke}"`);
    }
    return result;
  }
}
