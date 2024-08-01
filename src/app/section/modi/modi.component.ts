import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2'; 
import axios from 'axios';
import conf from '../../../conf/conf.json'
import qs from 'qs';
import Editor from '../../../assets/ckeditor/build/ckeditor';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { GlobalService } from '../../services/global.service';
import { PageToggleService } from '../../services/page-toggle.service';
import { SessionCheckService } from '../../services/session-check.service';
import { Web3ServiceService } from '../../services/web3-service.service';
	
@Component({
  selector: 'app-modi',
  templateUrl: './modi.component.html',
  styleUrl: './modi.component.css'
})
export class ModiComponent implements OnInit {
  contentOri: string = '';
  accountId: number = 0
  contentId: number = 0
  editorData: string = '';
  titleData: string = '';
  form: FormGroup;
	serverUrl:string;
	noticeTxt;
	titleInput;
	contentInput;
	title;
	btnText;
	editor = Editor;
	processing = false;
	boardType: string = '';
  conf = {
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'imageUpload',
				'blockQuote',
				'|',
				'insertTable',
				'mediaEmbed',
				'undo',
				'redo',
				'alignment',
				'codeBlock',
				'code',
				'findAndReplace',
				'fontBackgroundColor',
				'fontColor',
				'fontSize',
				'fontFamily',
				'highlight',
				'horizontalLine',
				'htmlEmbed',
				'imageInsert',
				'pageBreak',
				'selectAll',
				'removeFormat',
				'sourceEditing',
				'specialCharacters',
				'strikethrough',
				'restrictedEditingException',
				'subscript',
				'style',
				'superscript',
				'textPartLanguage',
				'todoList',
				'underline'
			]
		},
		language: 'en',
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells',
				'tableCellProperties',
				'tableProperties'
			]
		},
		mediaEmbed: {
			previewsInData: true 
		}
    };
    constructor(private route: ActivatedRoute, private globalService: GlobalService, private fb: FormBuilder, private pageToggleService: PageToggleService, private sessionCheckService: SessionCheckService, private web3Service: Web3ServiceService){
      this.route.params.subscribe(params => {
        this.boardType = params['type'] 
      });
      let lang = this.globalService.getLanguage();
      this.noticeTxt = lang == 'ko' ? '부적절한 컨텐츠는 운영자에 의해 삭제될 수 있음에 동의합니다.' : lang == 'en' ? 'I agree that inappropriate content may be removed by the administrator.':'不適切なコンテンツは管理者によって削除される可能性があることに同意します。'
      this.title = lang == 'ko' ? '게시물 수정' : lang == 'en' ? 'Update Post':'投稿編集'
      this.titleInput = lang == 'ko' ? '제목' : lang == 'en' ? 'Title':'タイトル'
      this.contentInput = lang == 'ko' ? '내용' : lang == 'en' ? 'Content':'内容'
      this.btnText = lang == 'ko' ? '등록' : lang == 'en' ? 'Submit':'登録'
      this.serverUrl = conf.server;
      this.form = this.fb.group({
        title: ['', Validators.required],
        checked:  [false, Validators.required],
        content:  ['', Validators.required],
      });
    }
    ngOnInit() {
      this.globalService.currentLanguage.subscribe(language => {
        this.noticeTxt = language == 'ko' ? '부적절한 컨텐츠는 운영자에 의해 삭제될 수 있음에 동의합니다.' : language == 'en' ? 'I agree that inappropriate content may be removed by the administrator.':'不適切なコンテンツは管理者によって削除される可能性があることに同意します。'
        this.title = language == 'ko' ? '게시물 수정' : language == 'en' ? 'Update Post':'投稿編集'
        this.titleInput = language == 'ko' ? '제목' : language == 'en' ? 'Title':'タイトル'
        this.contentInput = language == 'ko' ? '내용' : language == 'en' ? 'Content':'内容'
        this.btnText = language == 'ko' ? '등록' : language == 'en' ? 'Submit':'登録'
      });
      this.route.params.subscribe(async params => {
        this.contentId = params['contentId'];
        this.boardType = params['type'] 
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
      });
  } 
  async submit(isRetry: number){
    this.processing = true;
    
    let userInfo = sessionStorage.getItem('userInfo')
    let token = sessionStorage.getItem('token')
    let lang = this.globalService.getLanguage();

    let confirm = await swal.fire({
      icon: "question",
      html: "<span class='notranslate'>"+ (lang == 'ko' ? '게시글을 수정하시겠습니까?' : lang == 'ja' ? '投稿を編集しますか？' : 'Would you like to update the post?') + "</span>",
      confirmButtonText : "OK",
			cancelButtonText : "NO",
      showCancelButton : true,
    })
    if(!confirm.isConfirmed) {
      this.processing = false;
      return;
    }
    if(!this.form.get('checked')?.value){
      await swal.fire({
        html: '<span class="notranslate">' + (lang == 'ko' ? '안내 내용에 동의 해 주세요' : lang == 'ja' ? '案内内容に同意してください。' : 'Please agree to the information provided') + '</span>',
        icon: 'error',
      });
      this.processing = false;
      return;
    }	
    if(!userInfo || !token || !confirm.isConfirmed){
      await swal.fire({
        html: '<span class="notranslate">Check Your Session</span>',
        icon: 'error',
      });
      this.processing = false;
      this.pageToggleService.goPage(`/login`)
      return;
    }
    let parsedUserInfo: any = qs.parse(userInfo ?? '');
    
    let contentOri = this.form.get('content')?.value.trim();
    let content = contentOri.replace(/<[^>]*>?/g, ' ').trim();
    let title = this.form.get('title')?.value.trim();
    let type = 'board'
    let subType = this.boardType;
    let nickname = parsedUserInfo['nickname'];
    let accountId = parsedUserInfo['accountId'];
  
    
    if(!contentOri || !content || !title || !type || !subType || !nickname || !accountId){
      await swal.fire({
        html: '<span class="notranslate">Bad Request</span>',
        icon: 'error',
      });
      this.processing = false;
      this.pageToggleService.goPage(`/login`)
      return;
    }
    if(!contentOri || !title){
      await swal.fire({
        html: '<span class="notranslate">Please Input Title or Content</span>',
        icon: 'warning',
      });
      this.processing = false;
      return;
    }
    
    await axios.post(
      `${this.serverUrl}/api/content/update`,
      qs.stringify({
        contentOri: contentOri,
        content: content,
        title: title,
        contentId: this.contentId,
      }),
      {headers: { 
        'content-type': 'application/x-www-form-urlencoded'
        , 'accountId': accountId
        , 'Authorization': token
      }}
      ).then(async (res)=>{
      this.processing = false;
      if(res.data.result == 1){
        await swal.fire({
        html: '<span class="notranslate">Complete</span>',
        icon: 'success',
        });
        history.back();
      } else {
        await swal.fire({
        html: '<span class="notranslate">Fail</span>',
        icon: 'error',
        });
        this.processing = false;
      }
      }).catch(async (err) =>{
      this.processing = false;
      console.log(err);
      if(err.response.status == 401  && isRetry != 1){
        await this.sessionCheckService.refreshSession()
        this.submit(1);
        return;
      }
      await swal.fire({
        html: '<span class="notranslate">Fail</span>',
        icon: 'error'
      });
      })
    }


    async getDetail(){
      let userInfo = sessionStorage.getItem('userInfo')
      let parsedUserInfo: any = qs.parse(userInfo ?? '');
  
      await axios.get(
        `${this.serverUrl}/openApi/content/detail`,
        {
          headers:  { 
            'content-type': 'application/x-www-form-urlencoded',
            'accountId': parsedUserInfo['accountId']
          },
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
        this.titleData = res.data.data.title
        this.editorData = res.data.data.contentOri
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
