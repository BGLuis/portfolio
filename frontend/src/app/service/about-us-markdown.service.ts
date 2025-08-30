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
        md += `# ${json.title}\n`;
        for (const [i, sec] of json.sections.entries()) {
            md += `## ${sec.title}\n`;
            for (const p of sec.paragraphs) {
                md += `${p}\n`;
            }
        }
        md += '\n';
        return md.trim();
    }
}
