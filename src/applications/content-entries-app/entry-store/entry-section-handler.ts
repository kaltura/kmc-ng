import { Injectable } from '@angular/core';
import { EntrySectionTypes } from './entry-sections-types';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/all';
import { FormSection } from '@kaltura-ng2/kaltura-ui/form-sections';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng2/kaltura-ui';
import { EntrySectionsManager } from './entry-sections-manager';

@Injectable()
export abstract class EntrySection extends FormSection<KalturaMediaEntry,EntrySectionTypes> {
    public sectionBlockerMessage: AreaBlockerMessage;
    public showSectionLoader: boolean;

    protected _showLoader() {
	    this._removeBlockerMessage();
        this.showSectionLoader = true;
    }

    protected _hideLoader() {
        this.showSectionLoader = false;
    }

    protected _removeBlockerMessage() : void{
        this.sectionBlockerMessage = null;
    }

    protected _showBlockerMessage(message: AreaBlockerMessage, addBackToEntriesButton: boolean) {
        let messageToShow = message;
        if (addBackToEntriesButton) {
            messageToShow = new AreaBlockerMessage({
                message: message.message,
                buttons: [
                    ...this._createBackToEntriesButton(),
                    ... message.buttons
                ]
            })
        }
        ;

        this.showSectionLoader = false;
        this.sectionBlockerMessage = messageToShow;
    }

    protected _createBackToEntriesButton(): AreaBlockerMessageButton[] {
        if (this.manager instanceof EntrySectionsManager)
        {
            return [{
                label: 'Back To Entries',
                action: () => {
                    (<EntrySectionsManager>this.manager).returnToEntries();
                }
            }];
        }else
        {
            return [];
        }

    }

    protected _showActivationError() {
        this._showBlockerMessage(new AreaBlockerMessage(
            {
                message: 'Something happened during section initialization',
                buttons: [
                    {
                        label: 'Retry',
                        action: () => {
                            this.activate();
                        }
                    }
                ]
            }
        ), true);
    }
}
