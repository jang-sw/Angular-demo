import { Component } from '@angular/core';
import { PageToggleService } from '../../services/page-toggle.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(private pageToggleService: PageToggleService){

  }
  goMain(){
    this.pageToggleService.goPage('')
  }
}
