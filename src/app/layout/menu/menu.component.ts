import { Component, OnInit } from '@angular/core';
import { PageToggleService } from '../../services/page-toggle.service';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  language: any = '';
  notice_btn;
  openForum_btn;
  search;
  
  constructor(private pageToggleService: PageToggleService, private globalService: GlobalService){
    this.language = sessionStorage.getItem('lang') == null ? 'ko' : sessionStorage.getItem('lang');
    this.notice_btn = this.language == 'ko' ? '공지사항' : this.language == 'en' ? 'Notice' : 'お知らせ';
    this.openForum_btn = this.language == 'ko' ? '자유게시판' : this.language == 'en' ? 'Open Forum' : 'フリーボード'
    this.search = this.language == 'ko' ? '검색' : this.language == 'en' ? 'Search' : '検索';
   
  }

  ngOnInit() {
    this.globalService.currentLanguage.subscribe(language => {
      this.language = language;
      this.notice_btn = this.language == 'ko' ? '공지사항' : this.language == 'en' ? 'Notice' : 'お知らせ';
      this.openForum_btn = this.language == 'ko' ? '자유게시판' : this.language == 'en' ? 'Open Forum' : 'フリーボード';
      this.search = this.language == 'ko' ? '이동' : this.language == 'en' ? 'Move' : '移動';
    });
  }
  goPage(target:string){
    this.pageToggleService.goPage(target)
  }

  goPageWithType(target:string, type:string){
    this.pageToggleService.goWithPage(target, type, 1)
  }
}
