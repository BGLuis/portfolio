import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Polygon } from '../../components/animation/polygon/polygon';

@Component({
  selector: 'app-init',
  imports: [Polygon],
  templateUrl: './init.html',
  styleUrl: './init.scss'
})
export class Init implements OnInit {
  private text = [
    "Lorem ipsum1",
    "Lorem ipsum2",
    "Lorem ipsum3",
    "Lorem ipsum4",
    "Lorem ipsum5",
    "Lorem ipsum6",
    "Lorem ipsum7",
    "Lorem ipsum8",
    "Lorem ipsum9",
    "Lorem ipsum10",
    "Lorem ipsum1",
    "Lorem ipsum2",
    "Lorem ipsum3",
    "Lorem ipsum4",
    "Lorem ipsum5",
    "Lorem ipsum6",
    "Lorem ipsum7",
    "Lorem ipsum8",
    "Lorem ipsum9",
    "Lorem ipsum10",
  ];
  private readonly interval = 950;
  logs: string[] = [];

  constructor(private cdr: ChangeDetectorRef) {}
  ngOnInit() {
    this.startLogging();
  }

  private async startLogging() {
    for (const text of this.text) {
      this.logs = [text, ...this.logs];
      this.cdr.detectChanges();
      await new Promise(resolve => setTimeout(resolve, this.interval));
    }
    this.logs = [...this.logs, "Carregamento completo"];
    this.cdr.detectChanges();
  }

}
