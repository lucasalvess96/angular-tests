import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HeroesRoutingModule } from './heroes-routing.module';
import { HeroDetailComponent } from './pages/hero-detail/hero-detail.component';
import { HeroListComponent } from './pages/hero-list/hero-list.component';

@NgModule({
  declarations: [HeroListComponent, HeroDetailComponent],
  imports: [CommonModule, HeroesRoutingModule, HttpClientModule],
})
export class HeroesModule {}
