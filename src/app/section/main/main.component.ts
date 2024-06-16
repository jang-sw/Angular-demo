import { Component } from '@angular/core';
import { JoinModalComponent } from '../../modal/join-modal/join-modal.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  joinModalStatus = false
  loginModalStatus = false;

  constructor() { }

  ngOnInit(): void {
  }

  toggleJoinModal() {
    this.joinModalStatus = !this.joinModalStatus
  }
  toggleLoginModal() {
    this.loginModalStatus = !this.loginModalStatus
  }
  
}
