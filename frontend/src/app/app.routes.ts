import { Routes } from '@angular/router';
import { Latest } from './pages/latest/latest';
import { Trend } from './pages/trend/trend';
import { TrendMetric } from './pages/trend-metric/trend-metric';
import { DebugComponent } from './pages/debug/debug';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'latest'
    },

    {
        path: 'latest',
        component: Latest,
        title: 'Live-Daten'
    },

    {
        path: 'trend',
        component: Trend,
        title: 'Trendanalyse'
    },

    {
        path: 'trend/:metric',
        component: TrendMetric,
        title: 'Trend: Einzelwert'
    },
    
    {
        path: 'debug',
        component: DebugComponent,
        title: 'Debug / Dateninfo'
    },
    
    {
        path: '**',
        component: NotFound,
        title: 'Seite nicht gefunden'
    }
];
