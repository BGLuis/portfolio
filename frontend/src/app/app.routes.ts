import { Routes } from '@angular/router';
import { Init } from './pages/init/init';
import { RenderMode } from '@angular/ssr';
import { Galaxy } from './pages/galaxy/galaxy';
import { UiGalaxy } from './pages/outlet/ui-galaxy/ui-galaxy';

export const routes: Routes = [
    {
        component: Init,
        path: '',
        pathMatch: 'full',
        data: {
            ssr: {
                renderMode: RenderMode.Client,
            }
        }
    },
    {
        component: UiGalaxy,
        path: 'galaxy',
        data: {
            ssr: {
                renderMode: RenderMode.Client,
            }
        },
        children: [
            {
                component: Galaxy,
                path: '',
                data: {
                    ssr: {
                        renderMode: RenderMode.Client,
                    }
                },
            },
            {
                component: Galaxy,
                path: ':body',
                data: {
                    ssr: {
                        renderMode: RenderMode.Client,
                    }
                },
            }
        ]
    }
];
