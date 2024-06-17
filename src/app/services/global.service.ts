import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private language = new BehaviorSubject<string>('ko');
  currentLanguage = this.language.asObservable();

  constructor() { }

  changeLanguage(value: string) {
    this.language.next(value);
  }
  getLanguage(){
    return this.language.value;
  }
}
