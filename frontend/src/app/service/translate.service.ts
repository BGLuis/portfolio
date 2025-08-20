import { Injectable } from '@angular/core';
import { TranslateService as NgxTranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CookieService } from './cookie.service';
import { LocalStorageService } from './local-storage.service';
import { AVAILABLE_LANGUAGES, LanguageOption } from '../utils/available-langs';

@Injectable({
    providedIn: 'root',
})
export class TranslateService {
    constructor(
        private ngxTranslate: NgxTranslateService,
        private http: HttpClient,
        private cookieService: CookieService,
        private localStorageService: LocalStorageService
    ) {
        const codes = this.AvailableLanguages.map(lang => lang.code);
        this.ngxTranslate.addLangs(codes);
        this.loadLang();
        this.ngxTranslate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.saveLang(event.lang);
        });
    }

    get AvailableLanguages(): LanguageOption[] {
        return AVAILABLE_LANGUAGES;
    }

    loadLang() {
        const lang = this.cookieService.get('lang') || this.localStorageService.get('lang') || 'pt';
        this.ngxTranslate.use(lang);
    }

    setDefaultLang(lang: string) {
        this.ngxTranslate.setFallbackLang(lang);
    }

    use(lang: string) {
        this.ngxTranslate.use(lang);
        this.saveLang(lang);
    }

    private saveLang(lang: string) {
        this.cookieService.set('lang', lang, true);
        this.localStorageService.set('lang', lang);
    }

    get currentLang(): string {
        return this.ngxTranslate.getCurrentLang();
    }

    onLangChange(): Observable<LangChangeEvent> {
        return this.ngxTranslate.onLangChange;
    }

    instant(key: string | Array<string>, interpolateParams?: Object): string | any {
        return this.ngxTranslate.instant(key, interpolateParams);
    }

    get(key: string | Array<string>, interpolateParams?: Object): Observable<string | any> {
        return this.ngxTranslate.get(key, interpolateParams);
    }

    loadTranslationFromAssets(lang: string): Observable<any> {
        return this.http.get(`/assets/i18n/${lang}.json`).pipe(
            map((res) => {
                this.ngxTranslate.setTranslation(lang, res as any, true);
                return res;
            }),
            catchError(() => of(null))
        );
    }

    loadTranslationFromApi(lang: string, apiUrl: string): Observable<any> {
        return this.http.get(`${apiUrl}/${lang}`).pipe(
            map((res) => {
                this.ngxTranslate.setTranslation(lang, res as any, true);
                return res;
            }),
            catchError(() => of(null))
        );
    }
}
