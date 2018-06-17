import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { WidgetBase } from '@kaltura-ng/kaltura-ui';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { EntryWidgetsManager } from './entry-widgets-manager';
import { KalturaMultiRequest } from 'kaltura-ngx-client';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

export abstract class EntryWidget extends WidgetBase<EntryWidgetsManager, KalturaMediaEntry, KalturaMultiRequest>
{
    public sectionBlockerMessage: AreaBlockerMessage;
    public showSectionLoader: boolean;

    constructor(private _widgetKey: string, logger: KalturaLogger)
    {
        super(_widgetKey, logger);
    }

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
        if (this.form) {
            return [{
                label: 'Back To Entries',
                action: () => {
                    this.form.returnToEntries();
                }
            }];
        }else
        {
            return [{
                label: 'dismiss',
                action: () => {
                    this._removeBlockerMessage();
                }
            }];
        }
    }

    protected _showActivationError(message?: string) {
        this._showBlockerMessage(new AreaBlockerMessage(
            {
                message: message || 'An error occurred while loading data',
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
