import { Injectable } from '@angular/core';

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
    jsonToMarkdown(json: ExperienceJson): string {
        let md = `# ${json.title}\n\n`;
        for (const exp of json.experiences) {
            md += `## ${exp.company}\n\n`;
            md += `Período: ${exp.period}<br/>\n`;
            md += `Cargo: ${exp.position}<br/>\n`;
            md += `Descrição: ${exp.description}<br/>\n`;
            md += `Tarefas:<br/>\n`;
            md += '\n';
            for (const task of exp.tasks) {
                md += `- ${task}\n\n`;
            }
        }
        return md.trim();
    }
}
