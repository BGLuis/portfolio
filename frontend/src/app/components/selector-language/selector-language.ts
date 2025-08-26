import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../service/translate.service';
import { LanguageOption } from '../../utils/available-langs';
import { IconsComponent } from '../icons/icons';

@Component({
  selector: 'app-selector-language',
  imports: [CommonModule, IconsComponent],
  templateUrl: './selector-language.html',
  styleUrl: './selector-language.scss'
})
export class SelectorLanguage {
  private translateService = inject(TranslateService);
  languages: LanguageOption[] = this.translateService.AvailableLanguages;
  currentLang: string = this.translateService.currentLang;
  get currentLangObj(): LanguageOption {
    return this.languages.find(l => l.code === this.currentLang) || this.languages[0];
  }
  dropdownOpen = false;

  getFlagPath(flag: string): string {
    return `/assets/icons/${flag}.svg`;
  }

  selectLang(lang: string) {
    this.translateService.use(lang);
    this.currentLang = lang;
    this.dropdownOpen = false;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
