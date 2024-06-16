import { Component, OnInit, ElementRef, Output, EventEmitter } from '@angular/core';
import Web3 from "web3";
import swal from 'sweetalert2'; 
import { Web3ServiceService } from '../../services/web3-service.service';

@Component({
  selector: 'app-join-modal',
  templateUrl: './join-modal.component.html',
  styleUrl: './join-modal.component.css',
})
export class JoinModalComponent implements OnInit {

  title;
  nicknameInput;
  submitBtn;
  passwordInput;
  web3: any;
  constructor(private element: ElementRef, private web3Service: Web3ServiceService) {
   
    let lang: any = !sessionStorage.getItem('lang') ? 'ko' : sessionStorage.getItem('lang');
    this.title = lang == 'ko' ? '회원 가입' : lang == 'en' ? 'Sign Up' : '会員登録'
    this.nicknameInput = lang == 'ko' ? '닉네임 (알파벳 3글자 이상 16글자 이하)' : lang == 'en' ? 'Nickname (3 to 16 alphabetic characters)' : 'ニックネーム（アルファベット3文字以上16文字以下）'
    this.passwordInput = lang == 'ko' ? '비밀번호 (알파벳, 숫자를 사용해서 8글자 이상 16글자 이하)' : lang == 'en' ? 'Password (8 to 16 characters, using letters and numbers)' : 'パスワード（アルファベットと数字を使用して8文字以上16文字以下）'
    this.submitBtn = lang == 'ko' ? '가입' : lang == 'en' ? 'Sign Up' : '登録'
    
  }

  @Output() closeEvent = new EventEmitter()

  ngOnInit(): void {
    
    document.body.appendChild(this.element.nativeElement)
  }

  ngOnDestroy() {
    this.element.nativeElement.remove()
  }

  closeModal() {
    this.closeEvent.emit()
  }
  submit(){
    swal.fire({
      title:'ok',
      text: '가입 성곡',
    });
    this.closeEvent.emit()
  }
  walletConnect() {
    this.web3Service.loadMetaMask();
  }
 
}
