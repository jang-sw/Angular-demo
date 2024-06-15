import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionComponent } from './section.component';
import { MainComponent } from './main/main.component';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { BoardComponent } from './board/board.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  {
    path:'',
    pathMatch: 'full',
    component: MainComponent,
  },
  {
    path:'about',
    pathMatch: 'full',
    component: AboutComponent,
  },
  {
    path:'board/:type',
    pathMatch: 'full',
    component: BoardComponent,
  },
  
];


@NgModule({
  declarations: [
    MainComponent,
    SectionComponent,
    AboutComponent,
    DetailComponent,
    BoardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    
    SectionComponent,
    RouterModule,
  ]
})
export class SectionModule { }
