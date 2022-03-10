import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaFlavorAssetStatus, KalturaMediaEntry, KalturaFlavorAssetWithParams } from 'kaltura-ngx-client';
import { Menu } from 'primeng/menu';
import { EntryFlavoursChildrenWidget} from './entry-flavours-children-widget.service';
import { Flavor } from './flavor';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/kmc-shared/columns-resize-manager';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';

export interface ChildEntry {
    id: string,
    name: string,
    flavors: Flavor[]
}

@Component({
    selector: 'kEntryFlavoursChildren',
    templateUrl: './entry-flavours-children.component.html',
    styleUrls: ['./entry-flavours-children.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'flavors-table' }
    ]
})
export class EntryFlavoursChildren implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('actionsmenu', { static: true }) 
    private actionsMenu: Menu;
    
    public _actions: MenuItem[] = [];
    public childEntries : ChildEntry[] = [];

	public _selectedFlavor: Flavor;
    public _loadingError = null;

	public _documentWidth: number = 2000;
	public _showActionsView = false;

	constructor(public _columnsResizeManager: ColumnsResizeManagerService,
                public _widgetService: EntryFlavoursChildrenWidget,
                public route: ActivatedRoute,
                private _appLocalization: AppLocalization) {

        // Get childEntries and create Flavor objects.
        const parentEntryId = this.route.parent.snapshot.url[1].path
        this._widgetService.getChildEntries(parentEntryId).subscribe((mediaEntries) => {
            if (mediaEntries.objects.length > 0) {
                for (let mediaEntry of mediaEntries.objects) {
                    this._widgetService.getFlavorAssetWithParams(mediaEntry.id).subscribe(
                        (flavors) => {
                            let tempFlavors: Flavor[] = [];
                            for (let flavor of flavors) {
                                if (flavor.flavorAsset && flavor.flavorAsset.size > 0) {
                                tempFlavors.push(this._createFlavor(flavor));
                                }
                            }
                            const childEntry = {
                                name: mediaEntry.name,
                                id: mediaEntry.id,
                                flavors: Array.from(tempFlavors)
                            }
                            this.childEntries.push(childEntry)
                        }
                    )
                }
            }
        })
    }

    private _createFlavor(flavor: KalturaFlavorAssetWithParams): Flavor {
        let newFlavor : Flavor = <Flavor>flavor;
        newFlavor.name = flavor.flavorParams ? flavor.flavorParams.name : '';
        newFlavor.id = flavor.flavorAsset ? flavor.flavorAsset.id : '';
        newFlavor.paramsId = flavor.flavorParams ? flavor.flavorParams.id : null;
        newFlavor.isSource = flavor.flavorAsset ? flavor.flavorAsset.isOriginal : false;
        newFlavor.isWeb = flavor.flavorAsset ? flavor.flavorAsset.isWeb : false;
        newFlavor.format = flavor.flavorAsset ? flavor.flavorAsset.fileExt : '';
        newFlavor.codec = flavor.flavorAsset ? flavor.flavorAsset.videoCodecId : '';
        newFlavor.bitrate = (flavor.flavorAsset && flavor.flavorAsset.bitrate && flavor.flavorAsset.bitrate > 0) ? flavor.flavorAsset.bitrate.toString() : '';
        newFlavor.size = flavor.flavorAsset ? (flavor.flavorAsset.status.toString() === KalturaFlavorAssetStatus.ready.toString() ? flavor.flavorAsset.size.toString() : '0') : '';
        newFlavor.status = flavor.flavorAsset ? flavor.flavorAsset.status.toString() : '';
        newFlavor.statusLabel = "";
        newFlavor.statusTooltip = "";
        newFlavor.tags = flavor.flavorAsset ? flavor.flavorAsset.tags : '-';

        // set dimensions
        const width: number = flavor.flavorAsset ? flavor.flavorAsset.width : flavor.flavorParams.width;
        const height: number = flavor.flavorAsset ? flavor.flavorAsset.height : flavor.flavorParams.height;
        const w: string = width === 0 ? "[auto]" : width.toString();
        const h: string = height === 0 ? "[auto]" : height.toString();
        newFlavor.dimensions = w + " x " + h;
        
        // set status
        if (flavor.flavorAsset) {
            newFlavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.' + KalturaFlavorAssetStatus[flavor.flavorAsset.status]);
            if (flavor.flavorAsset.status.toString() === KalturaFlavorAssetStatus.notApplicable.toString()) {
                newFlavor.statusTooltip = this._appLocalization.get('applications.content.entryDetails.flavours.status.naTooltip');
            }
        }
        return newFlavor;
    }

    ngOnInit() {
	    this._documentWidth = document.body.clientWidth;
    }

	openActionsMenu(event: any, flavor: Flavor): void{
		if (this.actionsMenu){
			this._actions = [];
			if (flavor.status === KalturaFlavorAssetStatus.exporting.toString() || flavor.status === KalturaFlavorAssetStatus.ready.toString() ) {
				this._actions.push({id: 'download', label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.download'), command: (event) => {this.actionSelected("download");}});
			}
			if (this._actions.length) {
				this._selectedFlavor = flavor;
				this.actionsMenu.toggle(event);
			}
		}
	}

	private actionSelected(action: string): void{
		switch (action){
			case "download":
				this._widgetService.downloadFlavor(this._selectedFlavor);
				break;
            default:
                break;
		}
	}

    ngAfterViewInit(): void {
    }

    ngOnDestroy() {
	    this.actionsMenu.hide();
	}
}
