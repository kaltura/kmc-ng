import { Component } from '@angular/core';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KmcMainViewsService } from 'app-shared/kmc-shared/kmc-views';

@Component({
    selector: 'app-default-view',
    templateUrl: './app-default-view.component.html',
    styleUrls: ['./app-default-view.component.scss'],
    providers: [
    ],
})
export class AppDefaultViewComponent {
    constructor(
        logger: KalturaLogger,
        viewsManager: KmcMainViewsService) {

    const menu = viewsManager.getMenu();
        const firstItem = menu && menu.length ? menu[0] : null;

        if (firstItem) {
            firstItem.open();
        } else {
            logger.error('cannot navigate to default view, no available view found');
        }
    }
}
