import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from '../../services/global.service';
import { PageToggleService } from '../../services/page-toggle.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {

  boardTitle = ''
  bordType = '';
  canCreate = false;

  constructor(private route: ActivatedRoute, private globalService: GlobalService, private pageToggleService: PageToggleService) {

    

  }
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.boardTitle = params['type'] == 'free' ? '자유게시판' : params['type'] == 'notice' ? '공지사항' : '';
      this.bordType = params['type'];
      if(sessionStorage.getItem('token') && sessionStorage.getItem('userInfo') && params['type'] == 'free'){
        this.canCreate = true;
      } else {
        this.canCreate = false;
      }
    });
  }
  goWrite(){
    if(!this.bordType) return;
    this.pageToggleService.goPage(`/board/${this.bordType}/write`);
  }
}
