import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable(
  {providedIn: 'root'},
)
export class PageToggleService {
 
  constructor( private router: Router) {
  }
  goPage(target:string){
    this.router.navigateByUrl(target);
  }
  goToPageWithType(target:string, type:string) {
    this.router.navigate([target, type]);
  }
  goToDetail(target:string, type:string ,id:string) {
    this.router.navigate([target, type, id]);
  }
}
