import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { GenerateCodeService } from "./generate-code.service";
import { BrowserService } from "app-shared/kmc-shell";

@Component({
  selector: 'kGenerateCode',
  templateUrl: './generate-code.component.html',
  styleUrls: ['./generate-code.component.scss'],
  providers: [
    GenerateCodeService,
    KalturaLogger.createLogger('GenerateCodeComponent')
  ],
})
export class GenerateCodeComponent implements OnInit, OnDestroy {

  @Output() onClose = new EventEmitter();
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _code = "";

  constructor(private _generateCodeService: GenerateCodeService,
              private _logger: KalturaLogger,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
     this._generateCode();
  }

  ngOnDestroy(): void {
  }

  // Generate zoom integration code
  private _generateCode() {
    this._logger.info(`handle loading partner account info data`);
    this._updateAreaBlockerState(true, null);

    this._generateCodeService
      .generateCode()
      .pipe(cancelOnDestroy(this))
      .subscribe((response: string) => {
          this._logger.info(`handle successful integration code generation`);
          this._code = response;
          this._updateAreaBlockerState(false, null);

        },
        error => {
          this._logger.warn(`handle failed integartion code generation, show alert`, { errorMessage: error.message });
          const blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('applications.settings.integrationSettings.zoom.codeFailed'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._logger.info(`user selected retry, retry action`);
                    this._generateCode();
                  }
                },
                  {
                      label: this._appLocalization.get('app.common.close'),
                      action: () => {
                          this._updateAreaBlockerState(false, null);
                      }
                  }
              ]
            }
          );
          this._updateAreaBlockerState(false, blockerMessage);
        });
  }

  private _updateAreaBlockerState(isBusy: boolean, areaBlocker: AreaBlockerMessage): void {
    this._logger.debug(`update areablocker state`, { isBusy, message: areaBlocker ? areaBlocker.message : null });
    this._isBusy = isBusy;
    this._blockerMessage = areaBlocker;
  }

    public copyCode(el):void{
        this._browserService.copyElementToClipboard(el);
        this._browserService.showToastMessage({severity: 'success', detail: this._appLocalization.get('app.common.copySuccess')});
        this.close();
    }

  public close(): void {
      this.onClose.emit();
  }
}
