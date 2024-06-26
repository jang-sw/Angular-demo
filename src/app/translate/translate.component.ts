import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styleUrl: './translate.component.css',
})
export class TranslateComponent implements OnInit {
 
  language:string = 'ko';

 

  constructor(private globalService: GlobalService){ 

  }

  ngOnInit(): void {
    this.loadGoogleTranslate();
  }
  
  loadGoogleTranslate(): void {
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    (window as any).googleTranslateElementInit = this.googleTranslateElementInit;

    if(!sessionStorage.getItem("lang") || sessionStorage.getItem("lang") == 'ko'){
      this.globalService.changeLanguage('ko')
    }else if(sessionStorage.getItem("lang") == 'ja'){
      this.globalService.changeLanguage('ja')
    }else{
      this.globalService.changeLanguage('en')
    }
    this.language = this.globalService.getLanguage()

  }

  googleTranslateElementInit(): void {
    new (window as any).google.translate.TranslateElement(
      {pageLanguage:  'ko' ,includedLanguages: 'en,ja,ko'}
      , 'google_translate_element');
  }

  translate(event: any){
    const tolang = event.target.value;
   
    sessionStorage.setItem("lang", tolang);    
		const gtcombo: any = document.querySelector('.goog-te-combo');
    if (gtcombo == null) {
      alert("Error: Could not find Google translate Combolist.");
      return false;
    }
    gtcombo.value = tolang; 
    gtcombo.dispatchEvent(new Event('change')); 
    this.globalService.changeLanguage(tolang);
    this.language = tolang;
    return false;
  }
  
}
