import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateComponent } from './translate/translate.component';
import { HeaderComponent } from './layout/header/header.component';
import { MenuComponent } from './layout/menu/menu.component';
import { SectionModule } from './section/section.module';

@NgModule({
  declarations: [
    AppComponent,
    TranslateComponent,
    HeaderComponent,
    MenuComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    SectionModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
