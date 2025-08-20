import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { Router, NavigationEnd } from '@angular/router';
import { Meta, MetaDefinition, Title } from "@angular/platform-browser";

interface MetaDataOptions {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    robots?: string;
    keywords?: string | string[];
    author?: string;
}

@Injectable({
    providedIn: 'root',
})
export class MetaDataService {
    private managedTags: HTMLMetaElement[] = [];
    private defaultMeta: MetaDataOptions = {
        title: 'Portfolio Luis',
        description: 'Portfolio de Luis',
        image: 'https://example.com/default-image.jpg',
        url: 'https://example.com',
        robots: 'noindex, nofollow',
        keywords: '',
    }

    constructor(
        private metaService: Meta,
        private titleService: Title,
        @Inject(DOCUMENT) private doc: Document,
        private router: Router
    ) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.initDefaultMeta();
            }
        });
    }

    initDefaultMeta(): void {
        this.setMetaData(this.defaultMeta);
    }

    setMetaData(options: MetaDataOptions): void {
        this.clearMetaTags();
        options = { ...this.defaultMeta, ...options };
        if (options.title) this.setTitle(options.title);
        if (options.description) this.setDescription(options.description);
        if (options.image) this.setImage(options.image);
        if (options.url) this.setUrl(options.url);
        if (options.robots) this.setRobots(options.robots);
        if (options.keywords) this.setKeywords(options.keywords);
        if (options.author) this.setAuthor(options.author);
        this.setOpenGraph();
        this.setTwitter();
    }

    setTitle(title: string): void {
        if (title != this.defaultMeta.title) title += ' | Gatuno';
        this.titleService.setTitle(title);
        this.metaService.addTag({ property: 'og:site_name', content: title });
        this.metaService.addTag({ name: 'twitter:site', content: title });
    }

    setDescription(description: string): void {
        this.updateTag({ name: 'description', content: description });
        this.updateTag({ property: 'og:description', content: description });
        this.updateTag({ name: 'twitter:description', content: description });
    }

    setImage(imageUrl: string): void {
        this.updateTag({ property: 'og:image', content: imageUrl });
        this.updateTag({ name: 'twitter:image', content: imageUrl });
    }

    setUrl(url: string): void {
        this.updateTag({ property: 'og:url', content: url });
        this.updateTag({ name: 'twitter:url', content: url });
        this.updateCanonicalLink(url);
    }

    setRobots(robots: string): void {
        this.updateTag({ name: 'robots', content: robots });
        this.updateTag({ name: 'googlebot', content: robots });
    }

    setKeywords(keywords: string | string[]): void {
        if (Array.isArray(keywords)) {
            keywords = keywords.join(', ');
        }
        this.updateTag({ name: 'keywords', content: keywords });
    }

    setAuthor(author: string): void {
        this.updateTag({ name: 'author', content: author });
    }

    setOpenGraph() {
        this.updateTag({ property: 'og:type', content: 'website' });
        this.updateTag({ property: 'og:locale', content: 'pt_BR' });
    }

    setTwitter() {
        this.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    }

    private updateTag(tag: MetaDefinition): void {
        const metaElement = this.metaService.updateTag(tag);
        if (metaElement) {
            this.managedTags.push(metaElement);
        }
    }

    clearMetaTags(): void {
        this.managedTags.forEach(tag => this.metaService.removeTagElement(tag));
        this.managedTags = [];
    }

    private updateCanonicalLink(url: string): void {
        let link: HTMLLinkElement | null = this.doc.querySelector('link[rel="canonical"]');
        if (link) {
            link.setAttribute('href', url);
        } else {
            link = this.doc.createElement('link');
            link.setAttribute('rel', 'canonical');
            link.setAttribute('href', url);
            this.doc.head.appendChild(link);
        }
    }
}
