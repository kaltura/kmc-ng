import { Injectable } from '@angular/core';
import { EntrySectionTypes } from './entry-sections-types';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/all';
import { FormSection, FormSectionErrors } from '@kaltura-ng2/kaltura-ui/form-sections';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export abstract class EntrySection extends FormSection<KalturaMediaEntry,EntrySectionTypes>
{
    private _errorDialogMessage = new ReplaySubject<{
        message : string,
        buttons : {label : string, action : () => void}[]
    }>(1);
    public errorDialogMessage$ = this._errorDialogMessage.asObservable();

    protected _initialize() : void
    {
        super._initialize();

        this.sectionError$
            .cancelOnDestroy(this)
            .subscribe(response =>
            {
                if (response) {
                    console.warn("[kmcng] - missing implementation for 'back to entries' button");

                    const buttons: {label: string, action: () => void}[] = [
                        {
                            label: 'Back To Entries',
                            action: () => {

                            }
                        }
                    ];

                    if (response.errorId = FormSectionErrors.activationFailure) {
                        buttons.push({
                            label: 'Retry',
                            action: () => {
                                this.activate();
                            }
                        });
                    }

                    this._errorDialogMessage.next({
                        message: response.error ? response.error.message : 'Failed to load section data',
                        buttons
                    });
                }else {
                    this._errorDialogMessage.next(null);
                }
            })
    }

}
