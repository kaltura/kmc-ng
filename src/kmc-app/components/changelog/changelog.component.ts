import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';

@Component({
  selector: 'kChangelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent {
    @Input() changelogIsShown = false;
  @Output() showChangelog = new EventEmitter<void>();
  @ViewChild('changelog', { static: false }) changelogPopup: PopupWidgetComponent;

  public _openChangelog(): void {
    this.showChangelog.emit();
    this.changelogPopup.open();
  }
}
