import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Polygon } from '../../components/animation/polygon/polygon';
import { Router } from '@angular/router';
import { TranslateService } from '../../service/translate.service';

@Component({
  selector: 'app-init',
  imports: [Polygon],
  templateUrl: './init.html',
  styleUrl: './init.scss'
})
export class Init implements OnInit {
  private readonly interval = 850;
  logs: string[] = [];
  private logConstants: string[] = [];
  private logRandom: string[] = [];
  title = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private readonly router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.translate.get(['ui.init.title', 'ui.init.logs.constant', 'ui.init.logs.random']).subscribe((res: any) => {
      this.title = (res['ui.init.title'] || '').replace(/\n/g, '<br>');
      this.logConstants = res['ui.init.logs.constant'] || [];
      this.logRandom = res['ui.init.logs.random'] || [];
      this.startLogging();
    });
  }

  private async startLogging() {
    for (const text of this.logConstants) {
      this.logs = [text, ...this.logs];
      this.cdr.detectChanges();
      await new Promise(resolve => setTimeout(resolve, this.interval));
    }
    const shuffled = this.logRandom
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
      .slice(0, 3);
    for (const text of shuffled) {
      this.logs = [text, ...this.logs];
      this.cdr.detectChanges();
      await new Promise(resolve => setTimeout(resolve, this.interval));
    }
    this.router.navigate(['/galaxy']);
  }
}
