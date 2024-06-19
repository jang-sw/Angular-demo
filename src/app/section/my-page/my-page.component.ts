import { Component, OnInit } from '@angular/core';
import { PageToggleService } from '../../services/page-toggle.service';
import axios from 'axios';
import conf from '../../../conf/conf.json'
import { GlobalService } from '../../services/global.service';
import { Web3ServiceService } from '../../services/web3-service.service';
import qs from 'qs';
import { SessionCheckService } from '../../services/session-check.service';

@Component({
  selector: 'app-my-page',
  templateUrl: './my-page.component.html',
  styleUrl: './my-page.component.css'
})
export class MyPageComponent implements OnInit{
  serverUrl:string;
  nickname = '...';
  wallet = '...........';
  changeBtn = '';
  constructor(private sessionCheckService: SessionCheckService, private globalService: GlobalService, private web3ServiceService: Web3ServiceService){
    let language = globalService.getLanguage();
    this.serverUrl = conf.server;
    this.changeBtn = language == 'ko' ? '변경' : language == 'ja' ? '変更' : 'Change'
    
  }
  async ngOnInit() {
    await this.sessionCheckService.sessionCheck('')
    
    let userInfo = sessionStorage.getItem('userInfo')
    const parsedUserInfo: any = qs.parse(userInfo ?? '');
    this.nickname = parsedUserInfo['nickname'];
    this.wallet = this.web3ServiceService.getShortAddress(this.web3ServiceService.account.value ?? '...........');
    this.globalService.currentLanguage.subscribe(language => {
      this.changeBtn = language == 'ko' ? '변경' : language == 'ja' ? '変更' : 'Change'
    });
  }
}
