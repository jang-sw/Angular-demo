import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateComponent } from './translate/translate.component';
import { HeaderComponent } from './layout/header/header.component';
import { MenuComponent } from './layout/menu/menu.component';
import { SectionModule } from './section/section.module';
import { LoginModalComponent } from './modal/login-modal/login-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    TranslateComponent,
    HeaderComponent,
    MenuComponent,
  ],
  imports: [
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserModule,
    SectionModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    const originalStripTrailingSlash = (Location as any).stripTrailingSlash;
    (Location as any).stripTrailingSlash = function(url: string): string {
      return url.endsWith('/') && url.length > 1 ? url.slice(0, -1) : url;
    };
  }
 }
