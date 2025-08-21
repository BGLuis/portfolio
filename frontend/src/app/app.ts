
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from './service/translate.service';
import { MetaDataService } from './service/meta-data.service';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MarkdownModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  public metadata = inject(MetaDataService);
  public translateService = inject(TranslateService);

  ngOnInit(): void {
    const defaultLang = 'pt';
    this.translateService.setDefaultLang(defaultLang);
    this.translateService.use(defaultLang);
    this.translateService.loadTranslationFromAssets(defaultLang).subscribe();

    this.metadata.initDefaultMeta();
  }
}
