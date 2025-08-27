import { Injectable } from '@angular/core';

export interface AboutUsSection {
    title: string;
    paragraphs: string[];
}

@Injectable({ providedIn: 'root' })
export class AboutUsMarkdownService {
    toMarkdown(sections: AboutUsSection[]): string {
        let md = '';
        for (const [i, sec] of sections.entries()) {
            md += i === 0 ? `# ${sec.title}\n\n` : `## ${sec.title}\n\n`;
            for (const p of sec.paragraphs) {
                md += `${p}\n\n`;
            }
        }
        return md.trim();
    }

    fromMarkdown(markdown: string): AboutUsSection[] {
        const lines = markdown.split(/\r?\n/);
        const sections: AboutUsSection[] = [];
        let current: AboutUsSection | null = null;
        for (const line of lines) {
            if (line.startsWith('# ')) {
                if (current) sections.push(current);
                current = { title: line.replace('# ', '').trim(), paragraphs: [] };
            } else if (line.startsWith('## ')) {
                if (current) sections.push(current);
                current = { title: line.replace('## ', '').trim(), paragraphs: [] };
            } else if (line.trim().length && current) {
                current.paragraphs.push(line.trim());
            }
        }
        if (current) sections.push(current);
        return sections;
    }
}
