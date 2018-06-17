import { Component, Input, OnInit } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/mc-shared';

export interface EmailConfig {
    email: string;
    title: string;
    message: string;
}

@Component({
  selector: 'kOpenEmail',
  templateUrl: './open-email.component.html',
  styleUrls: ['./open-email.component.scss']
})
export class OpenEmailComponent implements OnInit {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() emailConfig: EmailConfig;

  public _copyToClipboardTooltips: { success: string, failure: string, idle: string, notSupported: string } = null;

  constructor(private _browserService: BrowserService, private _appLocalization: AppLocalization) {
      this._copyToClipboardTooltips = {
          success: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.success'),
          failure: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.failure'),
          idle: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.idle'),
          notSupported: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.notSupported')
      };
  }

  ngOnInit() {

  }

  openEmail(): void {
      if (this.emailConfig && this.emailConfig.email) {
          this._browserService.openEmailWithMailTo(this.emailConfig.email);
      }
  }

  close(): void{
      this.parentPopupWidget.close();
  }

}

