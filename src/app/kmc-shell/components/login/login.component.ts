import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AppAuthentication, AppAuthStatusTypes } from '@kaltura/kmcng-core';
import { BrowserService } from '@kaltura/kmcng-shell';

@Component({
  selector: 'kmc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  errorMessage : string;
  inProgress = false;
  userContext : any;

  showDetails: boolean = false; // TODO for demo only, remove after demo.

  constructor(private appAuthentication : AppAuthentication, private browserService : BrowserService) {

  }

  ngOnInit() {
    if (this.appAuthentication.isLogged()){
      this.userContext = this.appAuthentication.appUser;
    }
  }


  login(username, password, rememberMe,event) {


    event.preventDefault();


    this.errorMessage = '';
    this.inProgress = true;


    this.appAuthentication.login(username, password,rememberMe).subscribe(
        (result) =>
        {
          this.userContext = this.appAuthentication.appUser;
          this.inProgress = false;
        },
        (err) =>{
            this.errorMessage = err.message;
            this.userContext = '';
          this.inProgress = false;
        }
    );
  }


  toggleDetailsPanel(){
    this.showDetails = !this.showDetails;
  }
}
