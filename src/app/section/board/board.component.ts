import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from '../../services/global.service';
import { PageToggleService } from '../../services/page-toggle.service';
import axios from 'axios';
import conf from '../../../conf/conf.json'
import swal from 'sweetalert2'; 
import { Observable } from 'rxjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {

  boardTitle = ''
  bordType = '';
  serverUrl: string;
  canCreate = false;
  page:number = 1;
  pages: number[] = [];
  maxPage = 1;
  free = '';
  notice = '';
  boards:{
    title: string,
    author : string,
    created : string,
    contentId: number,
  }[] ;

  constructor(private route: ActivatedRoute, private globalService: GlobalService, private pageToggleService: PageToggleService) {
    this.serverUrl = conf.server;
    this.boards = [];
  }
  ngOnInit() {

    this.route.params.subscribe(async params => {
      this.bordType = params['type'];
      this.boardTitle = this.bordType == 'free' ? this.free : this.bordType == 'notice' ? this.notice : '';
      if(sessionStorage.getItem('token') && sessionStorage.getItem('userInfo') && params['type'] == 'free'){
        this.canCreate = true;
      } else {
        this.canCreate = false;
      }
      this.page = Number(params['page'] ?? 1) ?? 1;
      this.pages = [];

      await this.getList('','','','', this.page);
    });

    this.globalService.currentLanguage.subscribe(language => {
      this.free = language == 'ko' ? '자유게시판' : language == 'en' ? 'Open Forum' : 'フリーボード';
      this.notice= language == 'ko' ? '공지사항' : language == 'en' ? 'Notice' : 'お知らせ';
      this.boardTitle = this.bordType == 'free' ? this.free : this.bordType == 'notice' ? this.notice : '';
    });
  }
  goWrite(){
    if(!this.bordType) return;
    this.pageToggleService.goPage(`/board/${this.bordType}/write`);
  }

  async getList(select: string, author: string, title: string, content: string, page: number){
   
    await axios.get(
      `${this.serverUrl}/openApi/content/list`,
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        params: {
          page: page ?? 1,
          type: 'board',
          subType: this.bordType,
          select: select ?? '',
          author: author ?? '',
          title: title ?? '',
          content: content ?? '',
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
      this.boards = res.data.data.contents;
      this.pages = [];
      this.maxPage = res.data.data.maxPage;
      if (this.page <= 10) {
        for (let i = 1; i <= Math.min(10, this.maxPage); i++) {
          this.pages.push(i);
        }
      } else {
        const startPage = Math.floor((this.page - 1) / 10) * 10 + 1;
        const endPage = Math.min(startPage + 9, this.maxPage);
  
        for (let i = startPage; i <= endPage; i++) {
          this.pages.push(i);
        }
      }


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
  goDetail(contentId: number){
    this.pageToggleService.goToDetail('detail', this.bordType, contentId)

  }
  goPage(page: number){
    
    if(this.maxPage < page || page < 1){
      return
    }
    this.pageToggleService.goWithPage(`board`, this.bordType , page)
  }


}
