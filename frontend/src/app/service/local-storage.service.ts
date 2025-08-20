import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    KEY = '@gatuno';
    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

    set(key: string, value: string) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(`${this.KEY}/${key}`, value);
        }
    }
    get(key: string): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem(`${this.KEY}/${key}`);
        }
        return null;
    }
    delete(key: string) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(`${this.KEY}/${key}`);
        }
    }
    clear() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.clear();
        }
    }
    has(key: string): boolean {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem(`${this.KEY}/${key}`) !== null;
        }
        return false;
    }
    keys(): string[] {
        const keys: string[] = [];
        if (isPlatformBrowser(this.platformId)) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`${this.KEY}/`)) {
                    keys.push(key.replace(`${this.KEY}/`, ''));
                }
            }
        }
        return keys;
    }
}
