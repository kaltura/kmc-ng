import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kChangelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent implements OnInit {
  @Output() onChangelogSeen = new EventEmitter<boolean>();
  @ViewChild('changelog') changelogPopup: PopupWidgetComponent;

  private _changelogSeen = false;
  private _changelogCacheToken = 'kmc-changelog-seen';

  constructor(private _browserService: BrowserService) {
  }

  ngOnInit() {
    this._changelogSeen = !!this._browserService.getFromLocalStorage(this._changelogCacheToken);
    setTimeout(() => {
      this.onChangelogSeen.emit(this._changelogSeen);
    });
  }

  public _openChangelog(): void {
    this._changelogSeen = true;
    this._browserService.setInLocalStorage(this._changelogCacheToken, this._changelogSeen);
    this.onChangelogSeen.emit(this._changelogSeen);
    this.changelogPopup.open();
  }
}
