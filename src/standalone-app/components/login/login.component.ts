import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { environment } from 'app-environment';

import { AppAuthentication, AppNavigator, BrowserService, ILoginError, ILoginResponse } from 'app-shared/kmc-shell';
import { TranslateService } from 'ng2-translate';
import { Observable } from 'rxjs/Observable';

export enum LoginScreens {
  Login,
  ForgotPassword,
  PasswordExpired,
  InvalidLoginHash
}

@Component({
  selector: 'kKMCLogin',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  public _username: string;
  public _errorMessage: string;
  public _errorCode: string;
  public _inProgress = false;
  public _showLogin = false;
  public _showIEMessage = false;
  public _loginScreens = LoginScreens;
  public _currentScreen = LoginScreens.Login;
  public _passwordReset = false;

  // Caution: this is extremely dirty hack, don't do something similar to that, damn you IE
  @HostListener('window:resize')
  onResize() {
    if (!this._browserService.isIE11()) { // ignore for others
      return;
    }
    const areaBlocker = <any>document.querySelector('k-area-blocker');
    const content = this._el.nativeElement.querySelector('.kLoginCenter');
    const windowHeight = window.innerHeight;

    if (windowHeight <= content.offsetHeight) {
      this._renderer.setStyle(areaBlocker, 'height', 'auto');
    } else {
      this._renderer.setStyle(areaBlocker, 'height', '100%');
    }
  }

  constructor(private _appAuthentication: AppAuthentication,
              private _appNavigator: AppNavigator,
              private _translate: TranslateService,
              private _browserService: BrowserService,
              private _el: ElementRef,
              private _renderer: Renderer2) {
  }

  ngAfterViewInit() {
    this.onResize();
  }

  private _makeLoginRequest(username: string, password: string): Observable<ILoginResponse> {
    return this._appAuthentication.login(username, password, {
      privileges: environment.core.kaltura.privileges,
      expiry: environment.core.kaltura.expiry
    }).cancelOnDestroy(this);
  }

  private _handleLoginResponse(success: boolean, error: ILoginError, username: string): void {
    this._errorCode = '';
    this._errorMessage = '';

    if (success) {
      this._appNavigator.navigateToDefault();
      return;
    }

    this._errorCode = error.code;

    if (error.passwordExpired) {
      this._username = username;
      return this._setScreen(LoginScreens.PasswordExpired);
    }

    if (!error.custom) {
      this._translate.get(error.message).subscribe(message => {
        this._errorMessage = message;
      });
    } else {
      this._errorMessage = error.message;
    }
    this._inProgress = false;
  }

  ngOnInit() {
    if (this._appAuthentication.isLogged()) {
      this._appNavigator.navigateToDefault();
    } else if (typeof document['documentMode'] !== "undefined" && document['documentMode'] < 11){
        this._showIEMessage = true;
      } else{
        this._showLogin = true;
        this._username = this._browserService.getFromLocalStorage('login.username');
    }
  }

  ngOnDestroy() {
    // for cancelOnDestroy
  }

  public _login({ username, password }: { username: string, password: string }): void {
    this._errorMessage = '';
    this._inProgress = true;

    this._makeLoginRequest(username, password).subscribe(
      ({ success, error }) => {
        this._handleLoginResponse(success, error, username);
      },
      (err) => {
        this._errorMessage = err.message;
        this._inProgress = false;
      }
    );
  }

  public _rememberMe(username: string): void {
    if (username) {
      this._browserService.setInLocalStorage('login.username', username);
    } else {
      this._browserService.removeFromLocalStorage('login.username');
    }
  }

  public _setScreen(screen: LoginScreens): void {
    this.onResize();

    this._currentScreen = screen;

    this._inProgress = false;
    this._errorCode = '';
    this._errorMessage = '';

    if (screen !== LoginScreens.ForgotPassword) {
      this._passwordReset = false;
    }
  }

  public _forgotPassword(email: string): void {
    this._inProgress = true;

    this._appAuthentication.resetPassword(email)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._passwordReset = true;
          this._inProgress = false;
        },
        err => {
          this._errorMessage = err;
          this._inProgress = false;
        }
      );
  }

  public _resetPassword({ password, newPassword }: { password: string, newPassword: string }): void {
    const payload = {
      password,
      newPassword,
      email: this._username,
      newEmail: ''
    };

    this._inProgress = true;

    this._appAuthentication.updatePassword(payload)
      .switchMap(({ email, password: userPassword }) => this._makeLoginRequest(email, userPassword))
      .subscribe(
        ({ success, error }) => {
          this._inProgress = false;
          this._handleLoginResponse(success, error, this._username)
        },
        (error: ILoginError) => {
          this._inProgress = false;
          this._errorCode = error.code;
          if (!error.custom) {
            this._translate.get(error.message).subscribe(message => {
              this._errorMessage = message;
            });
          } else {
            this._errorMessage = error.message;
          }
        }
      );
  }

  public _signUp(): void {
    this._browserService.openLink(environment.core.externalLinks.SIGNUP, {}, '_self');
  }
}
