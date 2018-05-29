import { Injectable, OnDestroy } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { FriendlyHashId } from '@kaltura-ng/kaltura-common/friendly-hash-id';

@Injectable()
export class PageExitVerificationService implements OnDestroy{
  private _tokenGenerator = new FriendlyHashId();
  private _tokens: string[] = [];
  private _defaultVerificationMessage = this._appLocalizations.get('app.pageExitVerification.defaultMessage');

    // TODO [kmcng] replace this function with log library
    private _log(level: 'silly' | 'verbose' | 'info' | 'warn' | 'error', message: string, context?: string): void {
        const messageContext = context || 'general';
        const origin = 'page exit verification';
        const formattedMessage = `log: [${level}] [${origin}] ${messageContext}: ${message}`;
        switch (level) {
            case 'silly':
            case 'verbose':
            case 'info':
                console.log(formattedMessage);
                break;
            case 'warn':
                console.warn(formattedMessage);
                break;
            case 'error':
                console.error(formattedMessage);
                break;
        }
    }

  constructor(private _appLocalizations: AppLocalization) {
    window.onbeforeunload = (e) => {
      if (this._tokens.length) {
        const confirmationMessage = this._defaultVerificationMessage;
        (e || window.event).returnValue = confirmationMessage; // Gecko + IE
        return confirmationMessage;                            // Webkit, Safari, Chrome
      }

      return null;
    };
  }

  ngOnDestroy()
  {
      window.onbeforeunload = null;
  }

  public add(): string {
      const token = this._tokenGenerator.generateUnique(this._tokens);
      this._tokens.push(token);
      this._log('verbose', `increase page exit verification counter with new token '${token}'. counter = ${this._tokens.length}`);
      return token;
  }

  public remove(token: string): void {
      const tokenIndex = this._tokens.indexOf(token);

      if (tokenIndex !== -1) {
          this._tokens.splice(tokenIndex, 1);
          this._log('verbose', `decreased page exit verification counter with token '${token}'. counter = ${this._tokens.length}`);
      }else {
          this._log('warn', `unknown token provided '${token}' to decrease page exit verification counter. ignoring request`);
      }
  }

  public removeAll(): void {
    this._tokens = [];
  }
}
