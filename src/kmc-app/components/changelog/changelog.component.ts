import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from "app-shared/kmc-shell";

@Component({
  selector: 'kChangelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent {
  @Input() changelogIsShown = false;
  @Output() showChangelog = new EventEmitter<void>();
  @ViewChild('changelog', { static: true }) changelogPopup: PopupWidgetComponent;

  constructor(private _browserService: BrowserService,) {
  }

  public _openChangelog(): void {
    this.showChangelog.emit();
    this.changelogPopup.open();
  }

  public _error(): void {
      this._browserService.navigateToError();
  }
}
