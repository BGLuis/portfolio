
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from './service/translate.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'portifolio';

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    // Define o idioma padrão e carrega o arquivo de tradução do assets
    const defaultLang = 'pt';
    this.translateService.setDefaultLang(defaultLang);
    this.translateService.use(defaultLang);
    this.translateService.loadTranslationFromAssets(defaultLang).subscribe();
  }
}
