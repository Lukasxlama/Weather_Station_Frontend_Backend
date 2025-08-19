import { Routes } from '@angular/router';
import { About } from './pages/about/about';
import { Latest } from './pages/latest/latest';
import { Trends } from './pages/trends/trends';
import { Debug } from './pages/debug/debug';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'about'
    },

    {
        path: 'about',
        component: About,
        title: 'About'
    },

    {
        path: 'latest',
        component: Latest,
        title: 'Latest'
    },

    {
        path: 'trend',
        component: Trends,
        title: 'Trend'
    },
    
    {
        path: 'debug',
        component: Debug,
        title: 'Debug'
    },
    
    {
        path: '**',
        component: NotFound,
        title: 'Not Found'
    }
];
