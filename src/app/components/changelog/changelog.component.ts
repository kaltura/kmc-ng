import { Component, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import {BrowserService} from 'app-shared/kmc-shell';
import {AppAuthentication, AppUser, PartnerPackageTypes, AppNavigator} from 'app-shared/kmc-shell';
import {environment} from 'app-environment';
import {Md5} from 'ts-md5/dist/md5';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kChangelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent {
}
