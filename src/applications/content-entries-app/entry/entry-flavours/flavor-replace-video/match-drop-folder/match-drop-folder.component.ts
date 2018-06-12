import { Component, Input } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';

@Component({
    selector: 'kReplaceMatchDropFolder',
    templateUrl: './match-drop-folder.component.html',
    styleUrls: ['./match-drop-folder.component.scss'],
    providers: [KalturaLogger.createLogger('MatchDropFolderComponent')]
})
export class MatchDropFolderComponent {
    @Input() parentPopupWidget: PopupWidgetComponent;

    public _isLoading = false;
    public _blockerMessage: AreaBlockerMessage;
}
