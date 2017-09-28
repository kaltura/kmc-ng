import {Component, OnInit, ViewChild} from '@angular/core';
import {KalturaMediaType} from 'kaltura-typescript-client/types/KalturaMediaType';
import {Router} from "@angular/router";
import {PopupWidgetComponent} from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";
import {DraftEntry, PrepareEntryService} from "./prepare-entry.service";

@Component({
  selector: 'kPrepareEntry',
  templateUrl: './prepare-entry.component.html',
  styleUrls: ['./prepare-entry.component.scss']
})
export class PrepareEntryComponent implements OnInit {
  public _selectedMediaType: KalturaMediaType;
  @ViewChild('transcodingProfileSelectMenu') transcodingProfileSelectMenu: PopupWidgetComponent;

  constructor(private _prepareEntryService: PrepareEntryService, private _router: Router) {
  }

  ngOnInit() {
  }

  public prepareEntry(kalturaMediaType: KalturaMediaType) {
      this._selectedMediaType = kalturaMediaType;
      // TODO [kmcng] If user permissions allows setting transcoding profile - show transcoding profile selector
      this.transcodingProfileSelectMenu.open();
  }

  private _loadEntry(selectedProfile: { profileId: number }) {
    this._prepareEntryService.createDraftEntry(this._selectedMediaType,
      selectedProfile.profileId || -1)
      .subscribe((draftEntry: DraftEntry) => {
          this._router.navigate(['/content/entries/entry', draftEntry.id]);
          this.transcodingProfileSelectMenu.close();
        },
        error => {
          // const blockerMessage = new AreaBlockerMessage(
          //   {
          //     message: this._appLocalization.get('applications.settings.accountUpgrade.errors.sendFailed'),
          //     buttons: [
          //       {
          //         label: this._appLocalization.get('app.common.ok'),
          //         action: () => {
          //           this._updateAreaBlockerState(false, null);
          //         }
          //       }
          //     ]
          //   }
          // );
          // this._updateAreaBlockerState(false, blockerMessage);
        });
  }
}
