import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IbgeComponent } from './pages/ibge/ibge.component';

const routes: Routes = [
    {
        path: '',
        component: IbgeComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class IbgeApiRoutingModule {}
