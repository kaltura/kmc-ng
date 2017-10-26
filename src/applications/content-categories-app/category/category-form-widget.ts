import { KalturaCategory } from 'kaltura-typescript-client/types/KalturaCategory';
import { Injectable } from '@angular/core';
import { WidgetBase } from '@kaltura-ng/kaltura-ui';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { CategoryFormManager } from './category-form-manager';
import { KalturaMultiRequest } from 'kaltura-typescript-client';

@Injectable()
export abstract class CategoryFormWidget extends WidgetBase<CategoryFormManager, KalturaCategory, KalturaMultiRequest> {
    public sectionBlockerMessage: AreaBlockerMessage;
    public showSectionLoader: boolean;

    constructor(private _widgetKey : string)
    {
        super(_widgetKey);
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

    protected _showBlockerMessage(message: AreaBlockerMessage, addBackToCategoriesButton: boolean) {
        let messageToShow = message;
        if (addBackToCategoriesButton) {
            messageToShow = new AreaBlockerMessage({
                message: message.message,
                buttons: [
                    ...this._createBackToCategoriesButton(),
                    ... message.buttons
                ]
            });
        };

        this.showSectionLoader = false;
        this.sectionBlockerMessage = messageToShow;
    }

    protected _createBackToCategoriesButton(): AreaBlockerMessageButton[] {
        if (this.form instanceof CategoryFormManager)
        {
            return [{
                label: 'Back To Categories',
                action: () => {
                    (<CategoryFormManager>this.form).returnToCategories();
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
                message: 'An error occurred while loading data',
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
