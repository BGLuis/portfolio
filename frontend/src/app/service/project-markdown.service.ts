import { Injectable } from '@angular/core';

export interface Project {
    title: string;
    technologies: string[];
    description: string;
}

export interface ProjectJson {
    title: string;
    projects: Project[];
}

@Injectable({ providedIn: 'root' })
export class ProjectMarkdownService {
    toMarkdown(json: ProjectJson): string {
        let md = `# ${json.title}\n\n`;
        for (const project of json.projects) {
            md += `## ${project.title}\n\n`;
            if (project.technologies.length) {
                md += `● ${project.technologies.join(' ● ')}\n\n`;
            }
            md += `${project.description}\n\n`;
        }
        return md.trim();
    }
}
