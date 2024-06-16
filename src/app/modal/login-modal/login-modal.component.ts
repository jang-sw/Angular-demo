import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.css'
})
export class LoginModalComponent implements OnInit{
  title;
  nicknameInput;
  submitBtn;
  passwordInput;

  constructor(private element: ElementRef) {
   
    let lang: any = !sessionStorage.getItem('lang') ? 'ko' : sessionStorage.getItem('lang');
    this.title = lang == 'ko' ? '로그인' : lang == 'en' ? 'Sign In' : 'ログイン'
    this.nicknameInput = lang == 'ko' ? '닉네임' : lang == 'en' ? 'Nickname' : 'ニックネーム'
    this.passwordInput = lang == 'ko' ? '비밀번호 (알파벳, 숫자를 사용해서 8글자 이상 16글자 이하)' : lang == 'en' ? 'Password (8 to 16 characters, using letters and numbers)' : 'パスワード（アルファベットと数字を使用して8文字以上16文字以下）'
    this.submitBtn = lang == 'ko' ? '가입' : lang == 'en' ? 'Sign In' : 'ログイン'
    
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
}
