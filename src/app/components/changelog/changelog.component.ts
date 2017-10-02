import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { environment } from 'app-environment';

@Component({
  selector: 'kChangelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent implements OnInit {
  @Output() onShowChangelog = new EventEmitter<boolean>();
  @ViewChild('changelog') changelogPopup: PopupWidgetComponent;

  private _appCachedVersionToken = 'kmc-cached-app-version';
  public _showChangelog = false;

  constructor(private _browserService: BrowserService) {
  }

  ngOnInit() {
    const cachedVersion = this._browserService.getFromLocalStorage(this._appCachedVersionToken);
    this._showChangelog = cachedVersion !== environment.appVersion;
    setTimeout(() => {
      this.onShowChangelog.emit(this._showChangelog);
    });
  }

  public _openChangelog(): void {
    this._showChangelog = false;
    this._browserService.setInLocalStorage(this._appCachedVersionToken, environment.appVersion);
    this.onShowChangelog.emit(this._showChangelog);
    this.changelogPopup.open();
  }
}
