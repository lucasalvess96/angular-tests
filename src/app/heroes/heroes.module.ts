import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../shared/material.module';
import { HeroesRoutingModule } from './heroes-routing.module';
import { HeroDetailComponent } from './pages/hero-detail/hero-detail.component';
import { HeroListComponent } from './pages/hero-list/hero-list.component';
import { HeroServiceService } from './services/hero-service.service';

@NgModule({
    declarations: [HeroListComponent, HeroDetailComponent],
    imports: [
        CommonModule,
        HeroesRoutingModule,
        HttpClientModule,
        MaterialModule,
    ],
    providers: [HttpClientModule, HeroServiceService],
})
export class HeroesModule {}
