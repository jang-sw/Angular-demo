import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from '../../services/global.service';
import { PageToggleService } from '../../services/page-toggle.service';
import axios from 'axios';
import conf from '../../../conf/conf.json'
import swal from 'sweetalert2'; 
import { Observable } from 'rxjs';
import { Web3ServiceService } from '../../services/web3-service.service';

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
  keyword = '';
  select = 'title';
  isSearching = false;
  boards:{
    title: string,
    author : string,
    created : string,
    contentId: number,
  }[] ;

  constructor(private route: ActivatedRoute, private globalService: GlobalService, private pageToggleService: PageToggleService, private web3Service: Web3ServiceService) {
    this.serverUrl = conf.server;
    this.boards = [];
  }

  ngOnInit() {
    this.isSearching = true;
    this.globalService.currentLanguage.subscribe(language => {
      this.free = language == 'ko' ? '자유게시판' : language == 'en' ? 'Open Forum' : 'フリーボード';
      this.notice= language == 'ko' ? '공지사항' : language == 'en' ? 'Notice' : 'お知らせ';
      this.boardTitle = this.bordType == 'free' ? this.free : this.bordType == 'notice' ? this.notice : '';
    });

    this.route.params.subscribe(async params => {
      this.boards = [];
      
      if(params['type'] != this.bordType){
        this.keyword = '';
      }
      
      this.bordType = params['type'].trim();
      this.boardTitle = this.bordType == 'free' ? this.free : this.bordType == 'notice' ? this.notice : params['type'];
     
      if(this.bordType != 'free' && this.bordType != 'notice'){
        const regex = /^0x[a-fA-F0-9]{40}$/;
        if(!regex.test(this.bordType)){
          swal.fire({
            html: '<span class="notranslate">Please Check NFT Contract Address</span>',
            icon: 'warning',
          });
          this.pageToggleService.goPage(`/`);
          this.isSearching = false;
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
          this.isSearching = false;
          return;
        }
      }

      if(sessionStorage.getItem('token') && sessionStorage.getItem('userInfo') && params['type'] != 'notice'){
        this.canCreate = true;
      } else {
        this.canCreate = false;
      }
      this.page = Number(params['page'] ?? 1) ?? 1;
      this.pages = [];

      await this.getList('','','','', this.page);
    });

    
  }
  goWrite(){
    if(!this.bordType) return;
    this.pageToggleService.goPage(`/write/board/${this.bordType}`);
  }
  openEtherScan(address: string){
    window.open(`https://etherscan.io/address/${address}`)
  }
  async getList(select: string, author: string, title: string, content: string, page: number){
    this.isSearching = true;
    this.boards = [];
    await axios.get(
      `${this.serverUrl}/openApi/content/list`,
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        params: {
          page: page ?? 1,
          type: 'board',
          subType: this.bordType,
          select: this.select && this.keyword ? this.select : '',
          author: this.select == 'author' ? this.keyword : '',
          title: this.select == 'title' ? this.keyword : '',
          content: this.select == 'content' ? this.keyword : '',
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
      this.isSearching = false;
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
  search(searchInput: string){
    history.pushState(null, '', `/board/${this.bordType}/1`);
    this.keyword = searchInput;
    this.page = 1
    this.getList(this.select, this.select == 'author' ? searchInput : '', this.select == 'title' ? searchInput : '', this.select == 'content' ? searchInput : '', this.page)
    
  }
  setSelect(event: Event){
    let selectElement = event.target as HTMLSelectElement;
    this.select = selectElement.value;
    
  }  
}
