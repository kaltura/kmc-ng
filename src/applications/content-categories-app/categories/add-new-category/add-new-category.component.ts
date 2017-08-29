import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';
import { EntryCategoryItem } from './../../../content-entries-app/entry/entry-metadata/entry-metadata-handler';
import { Component, Input, AfterViewInit, Output, OnDestroy, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { CategoriesTreeComponent } from '../../../content-entries-app/shared/categories-tree/categories-tree.component';
import { TreeModule } from 'primeng/primeng';

@Component({
    selector: 'kAddNewCategory',
    templateUrl: './add-new-category.component.html',
    styleUrls: ['./add-new-category.component.scss']
})
export class AddNewCategory implements AfterViewInit, OnDestroy {

    @Input() parentPopupWidget: PopupWidgetComponent;
    @Input() value: EntryCategoryItem[] = [];
    @Output() showNotSupportedMsg = new EventEmitter<boolean>();
    @Output() valueChange = new EventEmitter<EntryCategoryItem[]>();
    @ViewChild('categoriesTree') _categoriesTree: CategoriesTreeComponent;
    _addNewCategoryForm: FormGroup;
    private _showConfirmationOnClose: boolean = true;
    public _categoriesLoaded = false;
    public _treeSelection: PrimeTreeNode[] = [];
    public _selectedCategories: EntryCategoryItem[] = [];


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

    public _onTreeCategoriesLoad({ categories }: { categories: PrimeTreeNode[] }): void {
        this._categoriesLoaded = categories && categories.length > 0;
        this.updateTreeSelections();
    }

    private updateTreeSelections(expandNodeId = null): void {

        let treeSelectedItems = [];

        this._selectedCategories.forEach(category => {
            const treeItem = this._categoriesTree.findNodeByFullIdPath(category.fullIdPath);

            if (treeItem) {
                treeSelectedItems.push(treeItem);
                if (expandNodeId && expandNodeId === category.id) {
                    treeItem.expand();
                }
            }
        });

        this._treeSelection = treeSelectedItems;
    }

    public _onTreeNodeSelected({ node }: { node: any }) {
        if (node instanceof PrimeTreeNode) {
            const autoCompleteItemIndex = this._selectedCategories.findIndex(item => item.id + '' === node.data + '');


            if (autoCompleteItemIndex === -1) {
                this._selectedCategories.push({
                    id: node.origin.id,
                    fullIdPath: node.origin.fullIdPath,
                    fullNamePath: node.origin.fullNamePath,
                    name: node.origin.name
                });
            }
        }
    }

    public _onTreeNodeUnselected({ node }: { node: PrimeTreeNode }) {
        if (node instanceof PrimeTreeNode) {
            const autoCompleteItemIndex = this._selectedCategories.findIndex(item => item.id + '' === node.data + '');

            if (autoCompleteItemIndex > -1) {
                this._selectedCategories.splice(autoCompleteItemIndex, 1);
            }

        }
    }

    public _onTreeNodeChildrenLoaded({ node }) {
        if (node instanceof PrimeTreeNode) {
            const selectedNodes: PrimeTreeNode[] = [];

            node.children.forEach((attachedCategory) => {
                if (this._selectedCategories.find(category => category.id === attachedCategory.data)) {
                    selectedNodes.push(attachedCategory);
                }
            });

            if (selectedNodes.length) {
                this._treeSelection = [...this._treeSelection || [], ...selectedNodes];
            }
        }
    }

    goNext() {
        if (this._addNewCategoryForm.valid) {
            this.router.navigate(['/content/categories/category/new/metadata']);
        }
    }
    _close(){
        this.parentPopupWidget.close();
    }
}