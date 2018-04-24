
import { KmcRouteViews } from 'app-shared/kmc-shared/kmc-views/kmc-route-views';
import { KmcRouteViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-route-view-base.service';
import { ContentEntriesViewService } from 'app-shared/kmc-shared/kmc-views/content-entries-view.service';
// TODO sakal remove
export class KmcRouteViewsProviderService {

    constructor(private _contentEntriesView: ContentEntriesViewService) {
    }

    private _addRouteView(): void {

    }

    getRouteView(view: KmcRouteViews): KmcRouteViewBaseService {
        let result: KmcRouteViewBaseService;
        switch (view) {
            case KmcRouteViews.ContentEntries:
                result = this._contentEntriesView;
                break;
            default:
                result = null;
        }
        return result;
    }
}
