import { Component, Input } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { ReachData, ReachPages } from 'app-shared/kmc-shared/reach/reach-frame.component';

@Component({
    selector: 'kReach',
    templateUrl: './reach.component.html',
    styleUrls: ['./reach.component.scss']
})
export class ReachComponent {
    @Input() page: ReachPages;
    @Input() data: ReachData;
    @Input() parentPopup: PopupWidgetComponent;
}
