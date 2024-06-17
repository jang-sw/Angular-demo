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
        this.doSign(accounts[0])
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
  getShortAddress(address:string){
		return address.slice(0, 3) + "..." + address.slice(address.length - 4, 4)
	}
  async doSign(address: string){
    let now = new Date().getTime().toString(); 
    return await window.ethereum.request({
        "method": "personal_sign",
        "params": [
            `Sign in to the Kyou Create Net .\n\ntimestamp: ${now}\n\naddress: ${(address.substring(0, 3) + "..." + address.substring(address.length - 4, address.length ))}`,address
        ]
      }).then((res: any) => {
        console.log(res)
        return {'hash': res, 'ts': now};
      }).catch((error: any) => {
        if (error.code === 4001) {
            console.log("the user doesn't want to change the network!")
            return -1
        }
        else if (error.code === 4902) {
            console.log("this network is not in the user's wallet")
            return -1
        }
        else {
            console.log(`Error ${error.code}: ${error.message}`)
            return -1
        }
      })
  }
 
}
