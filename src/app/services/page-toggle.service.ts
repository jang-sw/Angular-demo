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
  
  goToDetail(target:string, type:string , contentId:number) {
    this.router.navigate([target, type, contentId]);
  }
  goWithPage(target: string, type: string ,page: number) {
    this.router.navigate([target, type, page]);
  }
}
