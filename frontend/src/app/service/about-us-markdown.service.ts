import { Injectable } from '@angular/core';

export interface AboutUs {
    title: string;
    sections: AboutUsSection[];
}
export interface AboutUsSection {
    title: string;
    paragraphs: string[];
}

@Injectable({ providedIn: 'root' })
export class AboutUsMarkdownService {
    toMarkdown(json: AboutUs): string {
        let md = '';
        md += `# ${json.title}\n\n`;
        for (const [i, sec] of json.sections.entries()) {
            md += i === 0 ? `# ${sec.title}\n\n` : `## ${sec.title}\n\n`;
            for (const p of sec.paragraphs) {
                md += `${p}\n\n`;
            }
        }
        return md.trim();
    }
}
