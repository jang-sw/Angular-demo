import { Component, OnInit, ElementRef, Output, EventEmitter } from '@angular/core';
import swal from 'sweetalert2'; 
import { Web3ServiceService } from '../../services/web3-service.service';
import axios from 'axios';
import conf from '../../../conf/conf.json'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import qs from 'qs';
import { GlobalService } from '../../services/global.service';

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
  passwordChkInput;
  serverUrl:string;
  wallet: string = 'Wallet Connect';

  @Output() closeEvent = new EventEmitter()

  signupForm: FormGroup;
  isJoining = false;
  isConnecting = false;

  constructor(private element: ElementRef, private web3Service: Web3ServiceService, private fb: FormBuilder, private globalService: GlobalService) {
    this.serverUrl = conf.server;
    let language = globalService.getLanguage();
    this.submitBtn = language == 'ko' ? '가입' : language == 'en' ? 'Sign Up' : '登録'
    this.title = language == 'ko' ? '회원 가입' : language == 'en' ? 'Sign Up' : '会員登録'
    this.nicknameInput = language == 'ko' ? '닉네임 (알파벳 3글자 이상 16글자 이하)' : language == 'en' ? 'Nickname (3 to 16 alphabetic characters)' : 'ニックネーム（アルファベット3文字以上16文字以下）'
    this.passwordInput = language == 'ko' ? '비밀번호 (알파벳, 숫자를 사용해서 8글자 이상 16글자 이하)' : language == 'en' ? 'Password (8 to 16 characters, using letters and numbers)' : 'パスワード（アルファベットと数字を使用して8文字以上16文字以下）'
    this.passwordChkInput = language == 'ko' ? '비밀번호를 다시 한번 입력해 주세요' : language == 'en' ? 'Please enter your password again.' : 'パスワードをもう一度入力してください。';
    this.signupForm = this.fb.group({
      nickname: ['', Validators.required],
      password: ['', Validators.required],
      passwordChk: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    
    document.body.appendChild(this.element.nativeElement)
  }

  ngOnDestroy() {
    this.element.nativeElement.remove()
  }

  closeModal() {
    this.closeEvent.emit()
  }
  async submit(){
    this.isJoining = true;
    let language = this.globalService.getLanguage();
    if(!this.web3Service.account?.value || !this.web3Service.sign){
      this.isJoining = false;
      swal.fire({
        html: '<span class="notranslate">' + (language == 'ko' ? '지갑 연결 및 서명을 진행 해 주세요' : language == 'en' ? 'Please connect your wallet and proceed with the signing' : 'ウォレットを接続しサインしてください。') + '</span>',
        icon: 'warning',
      });
      
      return;
    }
   
    let nicknameRegex: RegExp = /^[a-zA-Z]{3,16}$/;
    let passwordRegex: RegExp = /^[a-zA-Z0-9]{8,16}$/;
    console.log(nicknameRegex.test(this.signupForm.get('nickname')?.value) )
    console.log(passwordRegex.test(this.signupForm.get('password')?.value))
    if(!nicknameRegex.test(this.signupForm.get('nickname')?.value) || !passwordRegex.test(this.signupForm.get('password')?.value)){
      this.isJoining = false;
      swal.fire({
        html: '<span class="notranslate">' + (language == 'ko' ? '닉네임 또는 비밀번호 규칙을 확인 해 주세요' : language == 'en' ? 'Please check nickname or password rule' : 'ニックネームまたはパスワードの要件を確認してください。') + '</html>',
        icon: 'warning',
      });
      return;
    }

    let nicknameChk = await axios.get(
      `${this.serverUrl}/openApi/account/cntByNickname`,
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        params: {nickname: this.signupForm.get('nickname')?.value}
      }
    ).then(async (res)=>{
      
      if(res.data.result == 1){
        if(res.data.data > 0){
          await swal.fire({
            html: '<span class="notranslate">' + (language == 'ko' ? '중복된 닉네임 입니다.' : language == 'en' ? 'The Nickname Already Taken' : 'ニックネームがすでに使用されています。') + '</span>',
            icon: 'warning',
          });
          return -1;
        }
        return 1;
      } else {
        await swal.fire({
          html: '<span class="notranslate">Sign Up Fail</span>',
          icon: 'error',
        });
        return -1;
      }
    }).catch(async (err) =>{
      console.log(err);
      await swal.fire({
        html: '<span class="notranslate">Sign Up Fail</span>',
        icon: 'error'
      });
      return -1;
    })
    if(nicknameChk != 1){
      this.isJoining = false;
      return;
    } 

    if(this.signupForm.get('passwordChk')?.value != this.signupForm.get('password')?.value){
      await swal.fire({
        html: '<span class="notranslate">' + (language == 'ko' ? '비밀번호 확인란이 일치하지 않습니다.' : language == 'en' ? 'Passwords do not match. Please try again.' : 'パスワードが一致しません。もう一度お試しください。') + '</span>',
        icon: 'error'
      });
      this.isJoining = false;
      return;
    }
    
    await axios.post(
      `${this.serverUrl}/openApi/account/join`,
      qs.stringify({
        nickname: this.signupForm.get('nickname')?.value,
        password: this.signupForm.get('password')?.value,
        wallet : this.web3Service.account.value,
        walletAgree: this.web3Service.sign,
       
      }),
      {headers: { 'content-type': 'application/x-www-form-urlencoded' }}
    ).then(async (res)=>{
      this.isJoining = false;
      if(res.data.result == 1){
        await swal.fire({
          html: '<span class="notranslate">Sign Up Complete</span>',
          icon: 'success',
        });
      } else {
        await swal.fire({
          html: '<span class="notranslate">Sign Up Fail</span>',
          icon: 'error',
        });
      }
      this.closeEvent.emit()
    }).catch(async (err) =>{
      this.isJoining = false;
      console.log(err);
      await swal.fire({
        html: '<span class="notranslate">Sign Up Fail</span>',
        icon: 'error'
      });
      this.closeEvent.emit()
    })

  }

  async walletConnect() {
    this.isConnecting = true;
    let res = await this.web3Service.loadMetaMask();  
    if(res == -1 ) {
      this.isConnecting = false;
      return;
    }
    let res2 = await this.web3Service.doSign(this.web3Service.account.value ?? '');
    if(res2 == -1 ) {
      this.isConnecting = false;
      return;
    }
    this.wallet = this.web3Service.getShortAddress(this.web3Service.account.value ?? '');
    if(!this.wallet){
      this.wallet = 'Wallet Connect';
      this.isConnecting = false;
      return;
    }
    let duplChk = await axios.get(
      `${this.serverUrl}/openApi/account/cntByWallet`,
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        params: {wallet: this.web3Service.account.value}
      }
    ).then(async (res)=>{
      if(res.data.result == 1){
        if(res.data.data > 0){
          let language = this.globalService.getLanguage();
          await swal.fire({
            html: '<span class="notranslate">' + (language == 'ko' ? '이미 가입된 지갑입니다.' : language == 'en' ? 'You have already registered with that wallet.' : 'そのウォレットでは既に登録されています。') + '</span>',
            icon: 'warning',
          });
          return -1;
        }
        return 1;
      } else {
        await swal.fire({
          html: '<span class="notranslate">Wallet Connect Fail</span>',
          icon: 'error',
        });
        return -1;
      }
    }).catch(async (err) =>{
      console.log(err);
      await swal.fire({
        html: '<span class="notranslate">Wallet Connect Fail</span>',
        icon: 'error'
      });
      return -1;
    })
    if(duplChk != 1){
      this.wallet = 'Wallet Connect';
      this.closeEvent.emit()
      return;
    }
    
  }
  
}
