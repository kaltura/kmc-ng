import { Component, Input } from '@angular/core';
import { Flavor } from '../entry-flavours-handler';

@Component({
    selector: 'kDRMDetails',
    templateUrl: './drm-details.component.html',
    styleUrls: ['./drm-details.component.scss']
})
export class DRMDetails{

	@Input() currentFlavor: Flavor;

    constructor() {
    }



}

