import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';
import { IbgeApiRoutingModule } from './ibge-api-routing.module';
import { IbgeComponent } from './pages/ibge/ibge.component';

@NgModule({
    declarations: [IbgeComponent],
    imports: [
        CommonModule,
        HttpClientModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        IbgeApiRoutingModule,
    ],
})
export class IbgeApiModule {}
