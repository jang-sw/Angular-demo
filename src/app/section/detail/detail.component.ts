import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';
import conf from '../../../conf/conf.json'
import swal from 'sweetalert2'; 
import qs from 'qs';
import { SessionCheckService } from '../../services/session-check.service';
import { PageToggleService } from '../../services/page-toggle.service';
import { GlobalService } from '../../services/global.service';
import { Web3ServiceService } from '../../services/web3-service.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit {
  serverUrl: string;
  contentId: number = 0;
  boardType: string = ''; 
  isProcessing = false;
  author = ''
  contentOri: SafeHtml = ''
  liked = 0
  likes = 0
  views = 0
  title = ''
  accountId = 0
  userId = 0;
  comment: string = '';

  comments: {
    accountId: number, 
    comment: string,
    commentId: number,
    nickname: string,
  }[]  = [];


  constructor(private sanitizer: DomSanitizer, private route: ActivatedRoute, private globalService: GlobalService, private pageToggleService: PageToggleService, private sessionCheckService : SessionCheckService, private web3Service: Web3ServiceService){
    this.serverUrl = conf.server;
  }
   ngOnInit() {
    this.route.params.subscribe(async params => {
      this.contentId = params['contentId'];
      this.boardType = params['type'];
			if(this.boardType != 'free' && this.boardType != 'notice'){
				const regex = /^0x[a-fA-F0-9]{40}$/;
				if(!regex.test(this.boardType)){
				  swal.fire({
					html: '<span class="notranslate">Please Check NFT Contract Address</span>',
					icon: 'warning',
				  });
				  this.pageToggleService.goPage(`/`);
				  return;
				}
				let res = await this.web3Service.checkNFTOwnership(params['type'])
				if(res != 1){
				  let lang = this.globalService.getLanguage()
				  swal.fire({
					html: '<span class="notranslate">' + lang == 'ko' ? 'NFT를 가지고 있지 않거나 잘못된 컨트렉트 주소' : lang == 'ja' ? 'NFTを持っていないか、間違ったコントラクトアドレス' : 'You do not own the NFT or the contract address is incorrect.'+ '</span>',
					icon: 'warning',
				  });
				  this.pageToggleService.goPage(`/`);
				  return;
				}
			}
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
      this.contentOri = this.sanitizer.bypassSecurityTrustHtml(res.data.data.contentOri);
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
  async deleteContent(isRetry: number){
    if(this.isProcessing) return;

    this.isProcessing = true;
    let token = sessionStorage.getItem('token');
    let userInfo = sessionStorage.getItem('userInfo')
    let parsedUserInfo: any = qs.parse(userInfo ?? '');

    let accountId = parsedUserInfo['accountId'];
    let lang = this.globalService.getLanguage();

    let confirm = await swal.fire({
      icon: "question",
      html: "<span class='notranslate'>"+ (lang == 'ko' ? '게시글을 삭제하시겠습니까?' : lang == 'ja' ? '投稿を削除しますか？' : 'Would you like to delete the post?') + "</span>",
      confirmButtonText : "OK",
			cancelButtonText : "NO",
      showCancelButton : true,
    })
    if(!confirm.isConfirmed || !token || !accountId || !this.contentId ) {
      this.isProcessing = false;
      return;
    }

    await axios.post(
      `${this.serverUrl}/api/content/delete`,
      qs.stringify({
        contentId: this.contentId
      }),
      {
        headers: { 
        'content-type': 'application/x-www-form-urlencoded' 
        , 'Authorization': token
        , 'accountId': accountId
      }}
    ).then(async (res)=>{
      this.isProcessing = false;
      history.back();
    }).catch(async (err) =>{
      this.isProcessing = false;
      if(err.response.status == 401 && isRetry != 1){
        await this.sessionCheckService.refreshSession()
        this.deleteContent(1);
        return;
      }
      await swal.fire({
        icon: "error",
        html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
      })
      this.pageToggleService.goPage('/')
    })
  }
  async deleteComment(commentId: number, isRetry: number){
    if(this.isProcessing) return;

    this.isProcessing = true;
    let token = sessionStorage.getItem('token');
    let userInfo = sessionStorage.getItem('userInfo')
    let parsedUserInfo: any = qs.parse(userInfo ?? '');

    let accountId = parsedUserInfo['accountId'];
    let lang = this.globalService.getLanguage();

    let confirm = await swal.fire({
      icon: "question",
      html: "<span class='notranslate'>"+ (lang == 'ko' ? '댓글을 삭제하시겠습니까?' : lang == 'ja' ? 'コメントを削除しますか？' : 'Would you like to delete the comment?') + "</span>",
      confirmButtonText : "OK",
			cancelButtonText : "NO",
      showCancelButton : true,
    })
    if(!confirm.isConfirmed || !token || !accountId || !commentId ) {
      this.isProcessing = false;
      return;
    }
    await axios.post(
      `${this.serverUrl}/api/comment/delete`,
      qs.stringify({
        commentId: commentId
      }),
      {
        headers: { 
        'content-type': 'application/x-www-form-urlencoded' 
        , 'Authorization': token
        , 'accountId': accountId
      }}
    ).then(async (res)=>{
      this.isProcessing = false;
      if(res.data.result != 1){
        await swal.fire({
          icon: "error",
          html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
        })
        this.pageToggleService.goPage('/')
        return;
      }
      this.getComments();
    }).catch(async (err) =>{
      this.isProcessing = false;
      if(err.response.status == 401 && isRetry != 1){
        await this.sessionCheckService.refreshSession()
        this.deleteComment(commentId, 1);
        return;
      }
      await swal.fire({
        icon: "error",
        html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
      })
      this.pageToggleService.goPage('/')
    })
  }
  async saveComment(isRetry: number){
    if(this.isProcessing) return;
    
    let token = sessionStorage.getItem('token');
    let userInfo = sessionStorage.getItem('userInfo')
    let parsedUserInfo: any = qs.parse(userInfo ?? '');

    let accountId = parsedUserInfo['accountId'];
    let nickname = parsedUserInfo['nickname'];
    let lang = this.globalService.getLanguage();
    let confirm = await swal.fire({
      icon: "question",
      html: "<span class='notranslate'>"+ (lang == 'ko' ? '댓글을 추가하시겠습니까?' : lang == 'ja' ? 'コメントを登録しますか？' : 'Would you like to post the comment?') + "</span>",
      confirmButtonText : "OK",
			cancelButtonText : "NO",
      showCancelButton : true,
    })
   
    if(!confirm.isConfirmed || !token || !accountId || !nickname || !this.comment) {
      this.isProcessing = false;
      return;
    }
    await axios.post(
      `${this.serverUrl}/api/comment/save`,

      qs.stringify({
        contentId: this.contentId,
        nickname: nickname,
        comment: this.comment
      }),
      {
        headers: { 
        'content-type': 'application/x-www-form-urlencoded' 
        , 'Authorization': token
        , 'accountId': accountId
      }}
    ).then(async (res)=>{
      this.isProcessing = false;
      if(res.data.result != 1){
        await swal.fire({
          icon: "error",
          html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
        })
        this.pageToggleService.goPage('/')
        return;
      }
      this.getComments();
    }).catch(async (err) =>{
      this.isProcessing = false;
      if(err.response.status == 401  && isRetry != 1){
        await this.sessionCheckService.refreshSession()
        this.saveComment(1);
        return;
      }
      await swal.fire({
        icon: "error",
        html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
      })
      this.pageToggleService.goPage('/')
    })
  }
  async toggleLike(isRetry: number){
    if(this.isProcessing) return;

    this.isProcessing = true;
    let token = sessionStorage.getItem('token');
    let userInfo = sessionStorage.getItem('userInfo')
    let parsedUserInfo: any = qs.parse(userInfo ?? '');

    let accountId = parsedUserInfo['accountId'];


    if(this.liked > 0){
      await axios.post(
        `${this.serverUrl}/api/content/cancelLike`,
  
        qs.stringify({
          contentId: this.contentId
        }),
        {
          headers: { 
          'content-type': 'application/x-www-form-urlencoded' 
          , 'Authorization': token
          , 'accountId': accountId
        }}
      ).then(async (res)=>{
        this.isProcessing = false;
        if(res.data.result != 1){
          await swal.fire({
            icon: "error",
            html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
          })
          this.pageToggleService.goPage('/')
          return;
        }
        this.getDetail();
      }).catch(async (err) =>{
        this.isProcessing = false;
        if(err.response.status == 401  && isRetry != 1){
          await this.sessionCheckService.refreshSession()
          this.toggleLike(1);
          return;
        }
        await swal.fire({
          icon: "error",
          html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
        })
        this.pageToggleService.goPage('/')
      })
    } else {
      await axios.post(
        `${this.serverUrl}/api/content/like`,
  
        qs.stringify({
          contentId: this.contentId
        }),
        {
          headers: { 
          'content-type': 'application/x-www-form-urlencoded' 
          , 'Authorization': token
          , 'accountId': accountId
        }}
      ).then(async (res)=>{
        this.isProcessing = false;
        if(res.data.result != 1){
          await swal.fire({
            icon: "error",
            html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
          })
          this.pageToggleService.goPage('/')
          return;
        }
        this.getDetail();
      }).catch(async (err) =>{
        this.isProcessing = false;
        if(err.response.status == 401  && isRetry != 1){
          await this.sessionCheckService.refreshSession()
          this.toggleLike(1);
          return;
        }
        await swal.fire({
          icon: "error",
          html: "<span class='notranslate'>Something Wrong.. Please Try Again</span>",
        })
        this.pageToggleService.goPage('/')
      })
    }
  }
  goModi(){
    this.pageToggleService.goToDetail('modi',this.boardType,this.contentId)
  }
}
