import { Injectable, OnDestroy } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { FriendlyHashId } from '@kaltura-ng/kaltura-common/friendly-hash-id';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Injectable()
export class PageExitVerificationService implements OnDestroy{
  private _tokenGenerator = new FriendlyHashId();
  private _tokens: string[] = [];
  private _defaultVerificationMessage = this._appLocalizations.get('app.pageExitVerification.defaultMessage');

  constructor(private _appLocalizations: AppLocalization,
              private _logger: KalturaLogger) {
      this._logger = _logger.subLogger('PageExitVerificationService');
    window.onbeforeunload = (e) => {
      if (this._tokens.length) {
        const confirmationMessage = this._defaultVerificationMessage;
        (e || window.event).returnValue = confirmationMessage; // Gecko + IE
        return confirmationMessage;                            // Webkit, Safari, Chrome
      }

      return null;
    };
  }

  ngOnDestroy() {
      window.onbeforeunload = null;
  }

  public add(): string {
      const token = this._tokenGenerator.generateUnique(this._tokens);
      this._tokens.push(token);
      this._logger.debug(`increase page exit verification counter with new token '${token}'. counter = ${this._tokens.length}`);
      return token;
  }

  public remove(token: string): void {
      const tokenIndex = this._tokens.indexOf(token);

      if (tokenIndex !== -1) {
          this._tokens.splice(tokenIndex, 1);
          this._logger.debug(`decreased page exit verification counter with token '${token}'. counter = ${this._tokens.length}`);
      } else {
          this._logger.warn(`unknown token provided '${token}' to decrease page exit verification counter. ignoring request`);
      }
  }

  public removeAll(): void {
    this._tokens = [];
  }
}
