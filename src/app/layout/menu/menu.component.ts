import { Component } from '@angular/core';
import { PageToggleService } from '../../services/page-toggle.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {

  constructor(private pageToggleService: PageToggleService){

  }

  goPage(target:string){
    this.pageToggleService.goPage(target)
  }

  goPageWithType(target:string, type:string){
    this.pageToggleService.goToPageWithType(target, type)
  }
}
