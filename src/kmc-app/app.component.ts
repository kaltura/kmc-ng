import {Component, OnInit, ViewChild} from '@angular/core';
import { ConfirmationService, ConfirmDialog } from 'primeng/primeng';
import { BrowserService, GrowlMessage } from 'app-shared/kmc-shell/providers/browser.service';
import { OperationTagManagerService} from '@kaltura-ng/kaltura-common';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { NavigationEnd, Router } from '@angular/router';
import { KmcLoggerConfigurator } from 'app-shared/kmc-shell/kmc-logs/kmc-logger-configurator';
import { OpenEmailEvent } from 'app-shared/kmc-shared/events';
import { AppEventsService } from 'app-shared/kmc-shared';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { EmailConfig } from './components/open-email/open-email.component';

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

  @ViewChild('confirm') private _confirmDialog: ConfirmDialog;
  @ViewChild('alert') private _alertDialog: ConfirmDialog;
  @ViewChild('openEmailPopup') private _emailDialog: PopupWidgetComponent;

  public _isBusy: boolean = false;
  public _growlMessages: GrowlMessage[] = [];
  public _confirmDialogAlignLeft = false;
  public _openEmailConfig: EmailConfig = {email: "", title: "", message:""};

  constructor(private _confirmationService: ConfirmationService,
              private _browserService : BrowserService,
              private router: Router,
              private _loggerConfigurator: KmcLoggerConfigurator,
              private _oprationsTagManager: OperationTagManagerService,
              private _appEvents: AppEventsService
              ) {

  }

  ngOnInit() {
    this._browserService.registerOnShowConfirmation((confirmationMessage) => {
        const htmlMessageContent = confirmationMessage.message.replace(/\r|\n/g, '<br/>');
        const formattedMessage = Object.assign({}, confirmationMessage, {message: htmlMessageContent});

        if (confirmationMessage.alignMessage === 'byContent') {
            this._confirmDialogAlignLeft = confirmationMessage.message && /\r|\n/.test(confirmationMessage.message);
        } else {
            this._confirmDialogAlignLeft = confirmationMessage.alignMessage === 'left';
        }

      this._confirmationService.confirm(formattedMessage);
      // fix for PrimeNG no being able to calculate the correct content height
      setTimeout(() => {
          const dialog: ConfirmDialog = (confirmationMessage.key && confirmationMessage.key === 'confirm') ? this._confirmDialog : this._alertDialog;
          dialog.center();
      },0);
    });

    // scroll window to top upon navigation change
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
          window.scrollTo(0, 0);
        }
      });

    // handle app status: busy and error messages. Allow closing error window using the 'OK' button
    this._oprationsTagManager.tagStatus$.subscribe(
      (tags: {[key: string]: number}) => {
        this._isBusy = tags['block-shell'] > 0;
      }
    );

    // handle app growlMessages
    this._browserService.growlMessage$.subscribe(
      (message: GrowlMessage) => {
        this._growlMessages = [ ...this._growlMessages, message ];
      }
    );

      // handle open Email event
      this._appEvents.event(OpenEmailEvent)
          .subscribe(({email, title, message}) => {
              this._openEmailConfig = {email, title, message}
              this._emailDialog.open();
          });

      this._loggerConfigurator.init();
  }
}
