import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';
import swal from 'sweetalert2';
import { GlobalService } from './global.service';
import {ethers} from 'ethers';

@Injectable({
  providedIn: 'root'
})
export class Web3ServiceService {
  private web3: Web3 | undefined;
  account = new BehaviorSubject<string | undefined>(undefined);
  account$ = this.account.asObservable();
  sign = '';

  constructor(private globalService : GlobalService) {
  }

  async loadMetaMask() {

    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      try {
        const _provider = new ethers.BrowserProvider(window.ethereum)
        if((await _provider.getNetwork()).chainId != BigInt(1)){
          await _provider.send('wallet_switchEthereumChain', [{chainId :`0x${(1).toString(16)}`}]);
        }
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await this.web3.eth.getAccounts();
        this.account.next(accounts[0]);
        
        return 1;
      } catch (error) {
        console.error('User denied account access', error);
        return -1;
      }
    } else if (window.web3) {
      this.web3 = new Web3(window.web3.currentProvider);
      const accounts = await this.web3.eth.getAccounts();
      this.account.next(accounts[0]);
      return 1;
    } else {
      await swal.fire({
        html: '<span class="notranslate">Please install MetaMask first.</span>',
        icon: 'warning',
      })
      window.open('https://metamask.io/download/')
      return -1;
    }
  }

  getWeb3(): Web3 | undefined {
    return this.web3;
  }
  getShortAddress(address: string){
		return address.substring(0, 3) + "..." + address.substring(address.length - 4, address.length )
	}
  async doSign(address: string){
    let now = new Date().getTime().toString(); 
    return await window.ethereum.request({
        "method": "personal_sign",
        "params": [
            `Sign in to the Kyou Create Net .\n\ntimestamp: ${now}\n\naddress: ${this.getShortAddress(address)}`,address
        ]
      }).then((res: any) => {
        this.sign = res;
        return 1;
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

  
  async checkNFTOwnership(contractAddress: string): Promise<number> {
    if (!this.web3) {
      await this.loadMetaMask()
    }
    if(!this.web3){
      return -1;
    }
    if(!sessionStorage.getItem('token') || !sessionStorage.getItem('userInfo')) {
      return -2
    }
    const contractABI = [
      {
        "constant": true,
        "inputs": [
          {
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "balance",
            "type": "uint256"
          }
        ],
        "type": "function"
      }
    ];

    const contract = new this.web3!.eth.Contract(contractABI, contractAddress);

    try {
      const balance: string = await contract.methods['balanceOf'](this.account.value).call();
      return parseInt(balance) > 0 ? 1 : 0;
    } catch (error) {
      console.error('Error checking NFT ownership', error);
      return -3;
    }
  }
}
