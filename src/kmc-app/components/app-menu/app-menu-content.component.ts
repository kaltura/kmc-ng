import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { KMCAppMenuItem } from 'app-shared/kmc-shared/kmc-views';
import { Router, NavigationEnd } from '@angular/router';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kKMCAppContentMenu',
  templateUrl: './app-menu-content.component.html',
  styleUrls: ['./app-menu-content.component.scss']
})
export class AppMenuContentComponent implements OnChanges, OnDestroy {

    public _items: Array<KMCAppMenuItem>;
    private _selectedMenuItem: KMCAppMenuItem;

    @Input()
    menuItems: KMCAppMenuItem[];

    @Input()
    position: 'right' | 'left';

    constructor(
                private router: Router
                ) {

        router.events
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.setSelectedRoute(event.urlAfterRedirects);
            }
        });
    }

    setSelectedRoute(path) {
        if (this._items) {
            this._selectedMenuItem = this._items.find(item => item.isActiveView(path));
        }else {
            this._selectedMenuItem = null;
        }
    }

    ngOnChanges() {
        this._items = (this.menuItems || []).filter(item => (item.position || 'left') === this.position);

        if (this.router.navigated)
        {
            this.setSelectedRoute(this.router.routerState.snapshot.url);
        }
    }

    ngOnDestroy() {

    }
}
