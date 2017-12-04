import { Injectable } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { FriendlyHashId } from '@kaltura-ng/kaltura-common/friendly-hash-id';

@Injectable()
export class PageExitVerificationService {
  private _tokenGenerator = new FriendlyHashId();
  private _tokens: string[] = [];
  private _verificationMessage: string;
  private _defaultVerificationMessage = this._appLocalizations.get('app.pageExitVerification.defaultMessage');

  constructor(private _appLocalizations: AppLocalization) {
    window.onbeforeunload = (e) => {
      if (this._tokens.length) {
        const confirmationMessage = this._verificationMessage || this._defaultVerificationMessage;
        (e || window.event).returnValue = confirmationMessage; // Gecko + IE
        return confirmationMessage;                            // Webkit, Safari, Chrome
      }

      return null;
    };
  }

  public setVerificationMessage(message: string): void {
    if (message) {
      this._verificationMessage = message;
    }
  }

  public setDefaultVerificationMessage(): void {
    this._verificationMessage = null;
  }

  public add(): string {
    const token = this._tokenGenerator.generateUnique(this._tokens);
    this._tokens.push(token);

    return token;
  }

  public remove(token: string): void {
    const tokenIndex = this._tokens.indexOf(token);

    if (tokenIndex !== -1) {
      this._tokens.splice(tokenIndex, 1);
    }
  }

  public disable(): void {
    this._tokens = [];
  }
}
