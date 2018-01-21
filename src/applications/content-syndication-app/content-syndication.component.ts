import {Component} from '@angular/core';
import {FeedsService} from "./feeds/feeds.service";

@Component({
    selector: 'kSyndication',
    templateUrl: './content-syndication.component.html',
    styleUrls: ['./content-syndication.component.scss'],
    providers : [
        FeedsService
    ]
})
export class ContentSyndicationComponent  {
}

