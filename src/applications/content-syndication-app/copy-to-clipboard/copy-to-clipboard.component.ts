import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'kCopyToClipboard',
  templateUrl: './copy-to-clipboard.component.html',
  styleUrls: ['./copy-to-clipboard.component.scss']
})
export class CopyToClipboardComponent implements OnInit {

  public _status: 'success' | 'failure' | 'idle' | 'notSupported' = 'idle';
  public _text: string;

  @Input() iconSwitchTimeout: number = 5000;

  @Input() tooltips: { success: string, failure: string, idle: string, notSupported: string } =
    {
      success: 'Copied',
      failure: 'Failed to copy to clipboard',
      idle: 'Copy to clipboard',
      notSupported: 'Copy to clipboard not supported'
    };

  @Input()
  set text(text: string) {
    this._status = 'idle';
    if (!this._isCopyToClipboardSupportedByBrowser()) {
      this._status = 'notSupported';
    } else {
      this._text = text;
    }
  }

  constructor() {
  }

  ngOnInit() {
  }

  copy(): void {
    if (this._status !== 'idle' || !this._text ) {
      return undefined;
    }

    const elementToCopy: HTMLInputElement = this._getInputElementForCopy(this._text);
    this._status = this._copyElement(elementToCopy);
    document.body.removeChild(elementToCopy);
    setTimeout(() => {
        this._status = 'idle';
      },
      this.iconSwitchTimeout
    );
  }

  private _copyElement(el: HTMLInputElement): 'success' | 'failure' {
    try {
      if (document.body['createTextRange']) {
        // IE
        const textRange = document.body['createTextRange']();
        textRange.moveToElementText(el);
        textRange.select();
        textRange.execCommand('Copy');
        return 'success';
      } else if (window.getSelection && document.createRange) {
        // non-IE
        const editable = el.contentEditable; // Record contentEditable status of element
        const readOnly = el.readOnly; // Record readOnly status of element
        el.contentEditable = 'true'; // iOS will only select text on non-form elements if contentEditable = 'true'
        el.readOnly = false; // iOS will not select in a read only form element
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range); // Does not work for Firefox if a textarea or input
        if (el.nodeName === 'TEXTAREA' || el.nodeName === 'INPUT') {
          el.select(); // Firefox will only select a form element with select()
        }
        if (el.setSelectionRange && navigator.userAgent.match(/ipad|ipod|iphone/i)) {
          el.setSelectionRange(0, 999999); // iOS only selects "form" elements with SelectionRange
        }
        el.contentEditable = editable; // Restore previous contentEditable status
        el.readOnly = readOnly; // Restore previous readOnly status
        if (document.queryCommandSupported('copy')) {
          document.execCommand('copy');
          return 'success';
        }
      }
      return 'failure';
    } catch (err) {
      return 'failure';
    }
  }

  private _getInputElementForCopy(text: string): HTMLInputElement {
    // Create an element off screen.
    let element = <HTMLInputElement>document.getElementById('copyToClipboardInput');
    if (typeof element === 'undefined' || element === null) {
      element = <HTMLInputElement>document.createElement('INPUT');
      element.setAttribute('id', 'copyToClipboardInput');
      element.setAttribute('type', 'text');
      element.setAttribute('style', 'position: absolute; left: -9999px; top: -9999px;');
      element.setAttribute('aria-hidden', 'true');
      element.setAttribute('tabindex', '-1');
    }
    // Add the input value to the temp element.
    element.value = text;
    document.body.appendChild(element);
    return element;
  }

  public _isCopyToClipboardSupportedByBrowser(): boolean {
    if (document.body['createTextRange']) { // IE
      return true;
    } else if (window.getSelection && document.createRange) {  // non-IE
      return document.queryCommandSupported('copy');
    }
    return false;
  }
}
