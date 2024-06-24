import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlSegment } from '@angular/router';

const routes: Routes = [
  {
    matcher: (url: UrlSegment[]) => {
      if (url.length > 0 && url[url.length - 1].path.endsWith('/')) {
        return {
          consumed: url,
          posParams: {
            slash: new UrlSegment(url[url.length - 1].path.replace(/\/$/, ''), {})
          }
        };
      }
      return null;
    },
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
