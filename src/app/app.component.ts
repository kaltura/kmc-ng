import {Component, OnInit} from '@angular/core';
import {ConfirmationService} from 'primeng/primeng';
import {AppStatus, BrowserService, GrowlMessage} from 'app-shared/kmc-shell/providers/browser.service';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {AppLocalization, OperationTagManagerService} from '@kaltura-ng/kaltura-common';
import {NavigationEnd, Router} from '@angular/router';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers : [ConfirmationService]
})
export class AppComponent implements OnInit {

  public _isBusy: boolean = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _growlMessages: GrowlMessage[] = [];

  constructor(private _confirmationService : ConfirmationService, private _browserService : BrowserService, private _appLocalization: AppLocalization, private router: Router, private _oprationsTagManager: OperationTagManagerService) {

  }

  ngOnInit() {
    this._browserService.registerOnShowConfirmation((message) =>
    {
      let htmlMessageContent = message.message.replace(/\n/g,'<br/>');
      const newMessage = Object.assign({}, message, { message : htmlMessageContent });
      this._confirmationService.confirm(newMessage);
    });

    // scroll window to top upon navigation change
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
          window.scrollTo(0, 0);
        }
      });

    // handle app status: busy and error messages. Allow closing error window using the 'OK' button
    this._browserService.appStatus$.subscribe(
      (status: AppStatus) => {
        if ( status.errorMessage !== null ){
          this._blockerMessage = new AreaBlockerMessage({
            message: status.errorMessage,
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this._isBusy = false;
                this._blockerMessage = null;
              }
            }]
          });
        }
      }
    );

    // handle app status: busy and error messages. Allow closing error window using the 'OK' button
    this._oprationsTagManager.tagStatus$.subscribe(
      (tags: {[key: string]: number}) => {
        this._isBusy = tags['block-shell'] > 0;
        console.log(status);
      }
    );

    // handle app growlMessages
    this._browserService.growlMessage$.subscribe(
      (message: GrowlMessage) => {
        this._growlMessages = [ ...this._growlMessages, message ];
      }
    );
  }
}
