import { Component, Input, AfterViewInit, Output, OnDestroy, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

@Component({
    selector: 'kAddNewCategory',
    templateUrl: './add-new-category.component.html',
    styleUrls: ['./add-new-category.component.scss']
})
export class AddNewCategory implements AfterViewInit, OnDestroy {

    @Input() parentPopupWidget: PopupWidgetComponent;
    @Output() showNotSupportedMsg = new EventEmitter<boolean>();
    _addNewCategoryForm: FormGroup;
    private _showConfirmationOnClose: boolean = true;

    constructor(private _formBuilder: FormBuilder, private _appLocalization: AppLocalization, public router: Router,
        private _browserService: BrowserService) {
        // build FormControl group
        this._addNewCategoryForm = _formBuilder.group({
            name: ['', Validators.required],
            description: '',
            playlistType: ['manual'],
            ruleBasedSub: false
        });
    }

    _goNext() {
        if (this._addNewCategoryForm.valid) {
            if (this._addNewCategoryForm.controls['playlistType'].value === 'ruleBased') {
                this.showNotSupportedMsg.emit();
            } else {
                // this._playlistsStore.setNewPlaylistData({
                //     name: this._addNewCategoryForm.controls['name'].value,
                //     description: this._addNewCategoryForm.controls['description'].value
                // });
                this.router.navigate(['/content/categories/category/new/metadata']);
            }
        }
    }

    ngAfterViewInit() {
        if (this.parentPopupWidget) {
            this.parentPopupWidget.state$
                .cancelOnDestroy(this)
                .subscribe(event => {
                    if (event.state === PopupWidgetStates.Open) {
                        this._showConfirmationOnClose = true;
                    }
                    if (event.state === PopupWidgetStates.BeforeClose) {
                        if (event.context && event.context.allowClose) {
                            if (this._addNewCategoryForm.dirty && this._showConfirmationOnClose) {
                                event.context.allowClose = false;
                                this._browserService.confirm(
                                    {
                                        header: this._appLocalization.get('applications.content.addNewCategory.cancelEdit'),
                                        message: this._appLocalization.get('applications.content.addNewCategory.discard'),
                                        accept: () => {
                                            this._showConfirmationOnClose = false;
                                            this.parentPopupWidget.close();
                                        }
                                    }
                                );
                            }
                        }
                    }
                });
        }
    }

    ngOnDestroy() { }
}