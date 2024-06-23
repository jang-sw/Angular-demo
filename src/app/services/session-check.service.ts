import { Injectable } from '@angular/core';
import conf from '../../conf/conf.json'
import axios from 'axios';
import qs from 'qs';
import { GlobalService } from './global.service';
import { Web3ServiceService } from './web3-service.service';
import { PageToggleService } from './page-toggle.service';

@Injectable({
  providedIn: 'root'
})
export class SessionCheckService {
  serverUrl:string;

  constructor(private pageToggleService: PageToggleService, private globalService: GlobalService, private web3Service: Web3ServiceService) {
    this.serverUrl = conf.server;
  }
  async sessionCheck(target: string, isRetry:number){
    let token = sessionStorage.getItem('token')
    let userInfo = sessionStorage.getItem('userInfo')
    if(!token || !userInfo ){
      this.pageToggleService.goPage('/login')
      return;
    }
    
    if(!this.web3Service.account?.value){
      await this.web3Service.loadMetaMask();
    }
    const parsedUserInfo: any = qs.parse(userInfo ?? '');
    axios.get(
      `${this.serverUrl}/api/account/chkUserInfo`,
      {
        headers: { 
          'content-type': 'application/x-www-form-urlencoded' 
          , 'accountId' : parsedUserInfo['accountId']
          , 'Authorization': token
        },
        params: {
          auth: parsedUserInfo['auth'],
          nickname: parsedUserInfo['nickname'],
          wallet: this.web3Service.account.value
        }
      }
    ).then(async (res)=>{
      if(res.data.result == 1 && res.data.data >= 1){
        if(!target){
          console.log('ok')
        }else{
          this.pageToggleService.goPage(target)
          return;
        }
      }else{
        this.pageToggleService.goPage('/login')
        return;
      }
    }).catch(async (err) =>{
        this.pageToggleService.goPage('/login')
        if(err.response.status == 401  && isRetry != 1){
          await this.refreshSession()
          this.sessionCheck(target, 1);
          return;
        }
        return;
    })
  }

  async refreshSession(){
    
    let token = sessionStorage.getItem('token')
    let userInfo = sessionStorage.getItem('userInfo')
    if(!token || !userInfo ){
      this.pageToggleService.goPage('/login')
      return;
    }
    let parsedUserInfo: any = qs.parse(userInfo ?? '');

    await axios.get(
      `${this.serverUrl}/openApi/account/refresh`,
      {
        headers: { 
          'content-type': 'application/x-www-form-urlencoded' 
          , 'accountId' : parsedUserInfo['accountId']
          , 'Authorization': token
        }
      }
    ).then(async (res)=>{
      if(res.data.result == 1){
        sessionStorage.setItem('token' ,res.headers['authorization']);
        return;
      }else{
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('userInfo')
        this.pageToggleService.goPage('/login')
        return;
      }
    }).catch(async (err) =>{
        console.log(err)
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('userInfo')
        this.pageToggleService.goPage('/login')
        return;
    })
  }
}
