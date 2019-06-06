import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BrowserService} from "app-shared/kmc-shell";
import {KalturaClient, UserGenerateQrCodeAction} from "kaltura-ngx-client";
import {cancelOnDestroy} from "@kaltura-ng/kaltura-common";
import {AppLocalization} from "@kaltura-ng/mc-shared";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'kKMCAuthentication',
  templateUrl: './authentication-form.component.html',
  styleUrls: ['./authentication-form.component.scss']
})
export class AuthenticationFormComponent implements OnInit, OnDestroy{

  @Input() hash: string = '';
  @Output() onAuthContinue = new EventEmitter();

  public qrCodeBase64 = null;

  constructor(private _browserService: BrowserService,
              private _kalturaServerClient: KalturaClient,
              private _appLocalization: AppLocalization,
              private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
      if (this.hash && this.hash.length) {
          this._kalturaServerClient.request(new UserGenerateQrCodeAction({hashKey: this.hash}))
              .pipe(cancelOnDestroy(this))
              .subscribe((qrCode) => {
                  this.qrCodeBase64 = this.sanitizer.bypassSecurityTrustStyle(`url("data:image/png;base64,${qrCode}")`);
              },
              error => {
                  this._browserService.alert({
                      header: this._appLocalization.get('app.common.error'),
                      message: error.message
                  });
              });
      }
  }

  public _continue(event: Event): void {
    event.preventDefault();
    this.onAuthContinue.emit();
  }

  public openLink(vendor: string): void {
      let link = null;
      if (vendor === 'google'){
          link = 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en';
      }
      if (vendor === 'apple'){
          link = 'https://itunes.apple.com/il/app/google-authenticator/id388497605?mt=8';
      }
      if (link) {
          this._browserService.openLink(link);
      }
  }

    ngOnDestroy(): void {
    }
}
