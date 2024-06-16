import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class Web3ServiceService {
  private web3: Web3 | undefined;
  private account = new BehaviorSubject<string | undefined>(undefined);
  public account$ = this.account.asObservable();

  constructor() {
   
  }

  async loadMetaMask() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await this.web3.eth.getAccounts();
        this.account.next(accounts[0]);
        console.log(accounts[0]);
      } catch (error) {
        console.error('User denied account access', error);
      }
    } else if (window.web3) {
      this.web3 = new Web3(window.web3.currentProvider);
      const accounts = await this.web3.eth.getAccounts();
      this.account.next(accounts[0]);
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  getWeb3(): Web3 | undefined {
    return this.web3;
  }
}
