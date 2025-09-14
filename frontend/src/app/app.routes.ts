import type { Routes } from '@angular/router';
import { AboutComponent } from '@app/pages/about/about';
import { LatestComponent } from '@app/pages/latest/latest';
import { TrendsComponent } from '@app/pages/trends/trends';
import { DebugComponent } from '@app/pages/debug/debug';
import { NotFound } from '@app/pages/not-found/not-found';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'about'
    },

    {
        path: 'about',
        component: AboutComponent,
        title: 'About'
    },

    {
        path: 'latest',
        component: LatestComponent,
        title: 'Latest'
    },

    {
        path: 'trends',
        component: TrendsComponent,
        title: 'Trends'
    },
    
    {
        path: 'debug',
        component: DebugComponent,
        title: 'Debug'
    },
    
    {
        path: '**',
        component: NotFound,
        title: 'Not Found'
    }
];
