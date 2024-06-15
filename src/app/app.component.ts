import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
 
})
export class AppComponent {

  notice_btn;
  openForum_btn;
  search;
  language = 'ko'

  constructor(){

    this.notice_btn = this.language == 'ko' ? '공지사항' : this.language == 'en' ? 'Notice' : 'お知らせ';
    this.openForum_btn = this.language == 'ko' ? '자유게시판' : this.language == 'en' ? 'Open Forum' : 'フリーボード'
    this.search = this.language == 'ko' ? '검색' : this.language == 'en' ? 'Search' : '検索'

  }
  
  
  

}
