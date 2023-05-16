import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'heroes',
        loadChildren: () =>
            import('./heroes/heroes.module').then((m) => m.HeroesModule),
        data: { preload: true },
    },
    { path: '', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
