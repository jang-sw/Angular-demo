import { Component } from '@angular/core';
import { Web3ServiceService } from '../../services/web3-service.service';
import { SessionCheckService } from '../../services/session-check.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  joinModalStatus = false
  loginModalStatus = false;


  constructor(private sessionCheckService: SessionCheckService) { 
    
  }

  ngOnInit(): void {
    let token = sessionStorage.getItem('token')
    let userInfo = sessionStorage.getItem('userInfo')
    
    if(token && userInfo ){
      this.sessionCheckService.sessionCheck('/');
    }
    
  }

  toggleJoinModal() {
    this.joinModalStatus = !this.joinModalStatus
  }
  toggleLoginModal() {
    this.loginModalStatus = !this.loginModalStatus
  }
  
  
}
