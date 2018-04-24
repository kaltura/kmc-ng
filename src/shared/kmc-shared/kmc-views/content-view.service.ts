import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ContentEntriesViewService } from 'app-shared/kmc-shared/kmc-views/content-entries-view.service';

export class ContentViewService {

    constructor(private _appPermissions: KMCPermissionsService,
                private _contentEntriesView: ContentEntriesViewService) {
    }

    isAvailable(): boolean {
        //return this._contentEntriesView.isAvailable();
        return false;
    }

    isEnabled(): boolean {
        return true;
    }
}
