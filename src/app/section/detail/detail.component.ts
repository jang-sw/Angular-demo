import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';
import conf from '../../../conf/conf.json'
import swal from 'sweetalert2'; 
import qs from 'qs';
import { SessionCheckService } from '../../services/session-check.service';
import { PageToggleService } from '../../services/page-toggle.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit {
  serverUrl: string;
  contentId: number = 0;

  author = ''
  contentOri = ''
  liked = 0
  likes = 0
  views = 0
  title = ''
  accountId = 0
  userId = 0;

  comments: {
    accountId: number, 
    comment: string,
    commentId: number,
    nickname: string,
  }[]  = [];


  constructor(private route: ActivatedRoute, private sessionCheckService: SessionCheckService, private pageToggleService: PageToggleService){
    this.serverUrl = conf.server;
  }
   ngOnInit() {
    this.route.params.subscribe(async params => {
      this.contentId = params['contentId'];
      await this.getDetail();
      this.getComments();
    });
  }
 
  async getDetail(){
    let userInfo = sessionStorage.getItem('userInfo')
    let parsedUserInfo: any = qs.parse(userInfo ?? '');
    this.userId = userInfo && parsedUserInfo ? parsedUserInfo['accountId'] : '';

    let header = this.userId ? { 
      'content-type': 'application/x-www-form-urlencoded',
      'accountId': this.userId
    } :  { 'content-type': 'application/x-www-form-urlencoded' };

    await axios.get(
      `${this.serverUrl}/openApi/content/detail`,
      {
        headers: header,
        params: {
          contentId: this.contentId,
        }
      }
    ).then(async (res)=>{
      if(res.data.result != 1) {
        await swal.fire({
          icon: "error",
          html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
        })
        this.pageToggleService.goPage('/')
        return;
      }
      this.author = res.data.data.author
      this.contentOri = res.data.data.contentOri
      this.liked = res.data.data.liked
      this.likes = res.data.data.likes
      this.views = res.data.data.views
      this.title = res.data.data.title
      this.accountId = res.data.data.accountId

    }).catch(async (err) =>{
      console.log(err)
      await swal.fire({
        icon: "error",
        html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
      })
      this.pageToggleService.goPage('/')
      return;
    })
  }

  getComments(){
    axios.get(
      `${this.serverUrl}/openApi/comment/list`,
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        params: {
          contentId: this.contentId,
        }
      }
    ).then(async (res)=>{
      console.log(res)
      if(res.data.result != 1) {
        await swal.fire({
          icon: "error",
          html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
        })
        this.pageToggleService.goPage('/')
        return;
      }
      this.comments = res.data.data;

    }).catch(async (err) =>{
      console.log(err)
      await swal.fire({
        icon: "error",
        html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
      })
      this.pageToggleService.goPage('/')
      return;
    })
  }
  
}
