
import { RenderMode, ServerRoute } from '@angular/ssr';
import { starSystems } from './config/star-systems.config';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'galaxy/:body',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      const params: { body: string }[] = [];
      for (const system of starSystems) {
        if (system.planets) {
          for (const planet of system.planets) {
            params.push({ body: planet.name });
          }
        }
      }
      return params;
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
