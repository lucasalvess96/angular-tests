import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'heroes',
        loadChildren: () =>
            import('./heroes/heroes.module').then((m) => m.HeroesModule),
        data: { preload: true },
    },
    {
        path: 'ibge',
        loadChildren: () =>
            import('./ibge-api/ibge-api.module').then((m) => m.IbgeApiModule),
        data: { preload: true },
    },
    { path: '', redirectTo: '/', pathMatch: 'full' },
    // {
    //     path: '**',
    //     loadChildren: () =>
    //       import('./features/errors/errors.module').then((m) => m.ErrorsModule)
    //   }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
