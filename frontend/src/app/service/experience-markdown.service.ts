import { Injectable } from '@angular/core';
import { TranslateService } from './translate.service';

export interface Experience {
    company: string;
    period: string;
    position: string;
    description: string;
    tasks: string[];
}

export interface ExperienceJson {
    title: string;
    experiences: Experience[];
}

@Injectable({ providedIn: 'root' })
export class ExperienceMarkdownService {
    constructor(private translateService: TranslateService) {}

    jsonToMarkdown(json: ExperienceJson): string {
        let md = `# ${json.title}\n\n`;
        const periodLabel = this.translateService.instant('experience.period');
        const positionLabel = this.translateService.instant('experience.position');
        const descriptionLabel = this.translateService.instant('experience.description');
        const tasksLabel = this.translateService.instant('experience.tasks');
        for (const exp of json.experiences) {
            md += `## ${exp.company}\n\n`;
            md += `${periodLabel}: ${exp.period}<br/>\n`;
            md += `${positionLabel}: ${exp.position}<br/>\n`;
            md += `${descriptionLabel}: ${exp.description}<br/>\n`;
            md += `${tasksLabel}:<br/>\n`;
            md += '\n';
            for (const task of exp.tasks) {
                md += `- ${task}\n\n`;
            }
        }
        return md.trim();
    }
}
