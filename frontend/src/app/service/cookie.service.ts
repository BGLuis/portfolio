import { Injectable } from "@angular/core";
import { CookieService as AgCookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
@Injectable({
    providedIn: 'root',
})
export class CookieService {
    KEY = environment.storagePrefix;
    cookieConfig: { path?: string; expires?: Date; secure?: boolean } = {};
    constructor(
        private cookieService: AgCookieService
    ) {
        this.cookieConfig = {
            path: '/',
            secure: false,
            expires: new Date(new Date().setDate(new Date().getDate() + 7))
        };
    }

    set(key: string, value: string, usePrefix: boolean = true, options?: { path?: string; expires?: Date; secure?: boolean }) {
        const cookieOptions = { ...this.cookieConfig, ...options };
        if (usePrefix) {
            key = `${this.KEY}/${key}`;
        }
        this.cookieService.set(key, value, cookieOptions);
    }

    get(key: string, usePrefix: boolean = true): string | null {
        if (usePrefix) {
            key = `${this.KEY}/${key}`;
        }
        return this.cookieService.get(key);
    }

    delete(key: string, usePrefix: boolean = true): void {
        if (usePrefix) {
            key = `${this.KEY}/${key}`;
        }
        this.cookieService.delete(key, this.cookieConfig.path);
    }
}
