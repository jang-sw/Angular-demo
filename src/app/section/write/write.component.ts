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
	
@Component({
  selector: 'app-write',
  templateUrl: './write.component.html',
  styleUrl: './write.component.css'
})
export class WriteComponent implements OnInit {
	form: FormGroup;
	serverUrl:string;
	noticeTxt;
	titleInput;
	contentInput;
	title;
	btnText;
	Editor = Editor;
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
		}
    };
 
  	constructor(private route: ActivatedRoute, private globalService: GlobalService, private fb: FormBuilder, private pageToggleService: PageToggleService){
		this.route.params.subscribe(params => {
			this.boardType = params['type'] 
		});
		this.noticeTxt = globalService.getLanguage() == 'ko' ? '부적절한 컨텐츠는 운영자에 의해 삭제될 수 있음에 동의합니다.' : globalService.getLanguage() == 'en' ? 'I agree that inappropriate content may be removed by the administrator.':'不適切なコンテンツは管理者によって削除される可能性があることに同意します。'
		this.title = globalService.getLanguage() == 'ko' ? '게시물 작성' : globalService.getLanguage() == 'en' ? 'Create Post':'投稿作成'
		this.titleInput = globalService.getLanguage() == 'ko' ? '제목' : globalService.getLanguage() == 'en' ? 'Title':'タイトル'
		this.contentInput = globalService.getLanguage() == 'ko' ? '내용' : globalService.getLanguage() == 'en' ? 'Content':'内容'
		this.btnText = globalService.getLanguage() == 'ko' ? '등록' : globalService.getLanguage() == 'en' ? 'Submit':'登録'
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
		this.title = language == 'ko' ? '게시물 작성' : language == 'en' ? 'Create Post':'投稿作成'
		this.titleInput = language == 'ko' ? '제목' : language == 'en' ? 'Title':'タイトル'
		this.contentInput = language == 'ko' ? '내용' : language == 'en' ? 'Content':'内容'
		this.btnText = language == 'ko' ? '등록' : language == 'en' ? 'Submit':'登録'

    });
  }
  async submit(){
	this.processing = true;
	let userInfo = sessionStorage.getItem('userInfo')
	let token = sessionStorage.getItem('token')
	if(!userInfo || !token){
		await swal.fire({
			html: '<span class="notranslate">Check Your Session</span>',
			icon: 'error',
		});
		this.processing = false;
		this.pageToggleService.goPage(`/login`)
		return;
	}
    const parsedUserInfo: any = qs.parse(userInfo ?? '');
	
	let contentOri = this.form.get('content')?.value
	let content = contentOri.replace(/<[^>]*>?/g, ' ');
	let title = this.form.get('title')?.value
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
		`${this.serverUrl}/api/content/create`,
		qs.stringify({
		  nickname: nickname,
		  subType : subType,
		  type: type,
		  contentOri: contentOri,
		  content: content,
		  title: title,
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
		  this.pageToggleService.goPage(`/board/${this.boardType}`)
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
		await swal.fire({
		  html: '<span class="notranslate">Fail</span>',
		  icon: 'error'
		});
	  })

	
  }
  
}
