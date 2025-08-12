import { Routes } from '@angular/router';
import { Init } from './pages/init/init';
import { RenderMode } from '@angular/ssr';

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
    }
];
