import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { Web3ServiceService } from '../../services/web3-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2'; 
import axios from 'axios';
import conf from '../../../conf/conf.json'
import qs from 'qs';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.css'
})
export class LoginModalComponent implements OnInit{
  title;
  nicknameInput;
  nickname = '';
  submitBtn;
  passwordInput;
  wallet: string = 'Wallet Connect';
  signinForm: FormGroup;
  serverUrl:string;
  isConnecting = false;
  isSignining = false;

  @Output() closeEvent = new EventEmitter()

  constructor(private element: ElementRef, private web3Service: Web3ServiceService, private fb: FormBuilder, private globalService: GlobalService) {
    this.serverUrl = conf.server;
    let lang: any = !sessionStorage.getItem('lang') ? 'ko' : sessionStorage.getItem('lang');
    this.title = lang == 'ko' ? '로그인' : lang == 'en' ? 'Sign In' : 'ログイン'
    this.nicknameInput = lang == 'ko' ? '닉네임' : lang == 'en' ? 'Nickname' : 'ニックネーム'
    this.passwordInput = lang == 'ko' ? '비밀번호' : lang == 'en' ? 'Password' : 'パスワード'
    this.submitBtn = lang == 'ko' ? '가입' : lang == 'en' ? 'Sign In' : 'ログイン'
    this.signinForm = this.fb.group({
      password: ['', Validators.required]
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
    this.isSignining = true;
    let language = this.globalService.getLanguage();
    
    if(!this.isConnecting || !this.web3Service.account.value){
      this.isSignining = false;
      swal.fire({
        html: '<span class="notranslate">' + (language == 'ko' ? '지갑 연결 및 서명을 진행 해 주세요' : language == 'en' ? 'Please connect your wallet and proceed with the signing' : 'ウォレットを接続しサインしてください。') + '</span>',
        icon: 'warning',
      });
      return;
    }
    await axios.post(
      `${this.serverUrl}/openApi/account/login`,
      qs.stringify({
        password: this.signinForm.get('password')?.value,
        wallet : this.web3Service.account.value,       
      }),
      {headers: { 'content-type': 'application/x-www-form-urlencoded' }}
    ).then(async (res)=>{
      
      if(res.data.result == 1){
        if(!res.data.data.accountId){
          await swal.fire({
            html: '<span class="notranslate">Login Fail, Check Your Password</span>',
            icon: 'warning',
          });
        } else {
          await swal.fire({
            html: '<span class="notranslate">Login Success</span>',
            icon: 'success',
          });
          sessionStorage.setItem('token',res.headers['authorization']);
          sessionStorage.setItem('userInfo',qs.stringify({
            accountId: res.data.data.accountId,
            nickname: res.data.data.nickname,
            main: res.data.data.main,
            auth: res.data.data.auth,
          }));
          this.closeEvent.emit()
        }
      } else {
        await swal.fire({
          html: '<span class="notranslate">Login Fail</span>',
          icon: 'error',
        });
      }
      this.isSignining = false;
    }).catch(async (err) =>{
      console.log(err);
      await swal.fire({
        html: '<span class="notranslate">Login Fail</span>',
        icon: 'error'
      });
      this.isSignining = false;
    })
  }
 
  async walletConnect() {
    this.isConnecting = true;
    let res = await this.web3Service.loadMetaMask();  
    if(res == -1 ) {
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
      `${this.serverUrl}/openApi/account/findNicknameByWallet`,
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        params: {wallet: this.web3Service.account.value}
      }
    ).then(async (res)=>{
      if(res.data.result == 1){
        if(!res.data.data){
          let language = this.globalService.getLanguage();
          await swal.fire({
            html: '<span class="notranslate">' + (language == 'ko' ? '해당 지갑에 가입된 계정이 없습니다.' : language == 'en' ? 'There is no account registered with that wallet.' : 'そのウォレットには登録されたアカウントがありません。') + '</span>',
            icon: 'warning',
          });
          return -1;
        }
        this.nickname = res.data.data;
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
