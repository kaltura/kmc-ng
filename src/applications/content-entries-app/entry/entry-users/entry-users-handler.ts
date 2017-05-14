import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { EntrySection } from '../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { EntrySectionTypes } from '../entry-store/entry-sections-types';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { KalturaUser, UserGetAction, UserListAction, KalturaUserFilter, KalturaFilterPager, KalturaMediaEntry } from 'kaltura-typescript-client/types/all';
import { EntrySectionsManager } from '../entry-store/entry-sections-manager';

@Injectable()
export class EntryUsersHandler extends EntrySection
{
	public _loading = 0;
	public _loadingError = null;

    public _creator: string = "";
	public _owner: KalturaUser = null;

	public usersForm : FormGroup;

	constructor(manager : EntrySectionsManager, private _formBuilder : FormBuilder, private _kalturaServerClient: KalturaClient)
    {
        super(manager);
	    this._buildForm();
    }
	private _buildForm() : void{
		this.usersForm = this._formBuilder.group({
			owners : null,
			editors: null,
			publishers: null
		});

		this.usersForm.statusChanges
			.cancelOnDestroy(this)
			.subscribe(
				value =>
				{
					super._onSectionStateChanged({isValid : value === 'VALID'});
				}
			)

	}


    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Users;
    }

	protected _onDataSaving(data: KalturaMediaEntry, request: KalturaMultiRequest){
		if (this.usersForm.dirty){
			// save owner
			if (this._owner && this._owner.id) {
				data.userId = this._owner.id;
			}
			// save editors
			const editors: KalturaUser[] = this.usersForm.value.editors;

			if (editors.length){
				let entitledUsersEdit = '';
				editors.forEach(editor=>{
					entitledUsersEdit += editor.id + ",";
				});
				entitledUsersEdit = entitledUsersEdit.substring(0, entitledUsersEdit.length-1); // remove last comma
				data.entitledUsersEdit = entitledUsersEdit;
			}else{
				data.entitledUsersEdit = null;
			}
			// save publishers
			const publishers: KalturaUser[] = this.usersForm.value.publishers;
		}
	}
    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _reset()
    {
	    this._creator = "";
	    this._owner = null;
	    this.usersForm.setValue({
		    owners: null,
		    editors: null,
		    publishers: null
	    });
        this._loading = 0;
        this._loadingError = null;
    }

    protected _activate(firstLoad : boolean) {
	    this.initData();
    }

    public initData():void{
	    this._loading = 3;
	    this._fetchUsersData();
	    this._fetchEditorsData();
	    this._fetchPublishersData();
    }

    private _fetchUsersData():void{
	    const request = new KalturaMultiRequest(
		    new UserGetAction({userId: this.data.creatorId}),
		    new UserGetAction({userId: this.data.userId})
	    );

	    this._kalturaServerClient.multiRequest(request)
		    .cancelOnDestroy(this,this.sectionReset$)
		    .monitor('get users details')
		    .subscribe(
			    response =>
			    {
				    this._loading -= 1;
				    if (response.length && response.length ===2 && response[0].result){
					    this._creator = response[0].result.screenName ? response[0].result.screenName : response[0].result.id;
					    if (response[1].result) {
						    this._owner = <KalturaUser>response[1].result;
					    }
				    }

			    },
			    error =>
			    {
					this._loading = 0;
				    this._loadingError = { message : error.errorMessage, buttons : { retry : 'Retry'}};
				    console.warn("[kmcng] - Error getting users data");
			    }
		    );
    }

    private _fetchEditorsData():void{
	    if (this.data.entitledUsersEdit && this.data.entitledUsersEdit.length) {
		    const entitledUsersEdit = this.data.entitledUsersEdit.split(",");
		    const request = new KalturaMultiRequest();
		    entitledUsersEdit.forEach(entitledUser=>{
			    request.requests.push(new UserGetAction({userId: entitledUser}));
		    });

		    this._kalturaServerClient.multiRequest(request)
			    .cancelOnDestroy(this, this.sectionReset$)
			    .monitor('get editors')
			    .subscribe(
				    response => {
					    this._loading -= 1;
					    let editors = [];
					    response.forEach(res => {
						    editors.push(res.result);
					    });
					    this.usersForm.patchValue({editors: editors});
				    },
				    error => {
					    this._loading = 0;
					    this._loadingError = { message : error.errorMessage, buttons : { retry : 'Retry'}};
					    console.warn("[kmcng] - Error getting editors");
				    }
			    );
	    }else{
		    this._loading -= 1;
	    }
    }

    private _fetchPublishersData():void{
	    if (this.data.entitledUsersPublish && this.data.entitledUsersPublish.length) {
		    const entitledUsersPublish = this.data.entitledUsersPublish.split(",");
		    const request = new KalturaMultiRequest();
		    entitledUsersPublish.forEach(entitledUser=>{
			    request.requests.push(new UserGetAction({userId: entitledUser}));
		    });

		    this._kalturaServerClient.multiRequest(request)
			    .cancelOnDestroy(this, this.sectionReset$)
			    .monitor('get publishers')
			    .subscribe(
				    response => {
					    this._loading -= 1;
					    let publishers = [];
					    response.forEach(res => {
						    publishers.push(res.result);
					    });
					    this.usersForm.patchValue({publishers: publishers});
				    },
				    error => {
					    this._loading = 0;
					    this._loadingError = { message : error.errorMessage, buttons : { retry : 'Retry'}};
					    console.warn("[kmcng] - Error getting publishers");
				    }
			    );
	    }else{
		    this._loading -= 1;
	    }
    }

	public searchUsers(text : string)
	{
		return Observable.create(
			observer => {
				const requestSubscription: ISubscription = this._kalturaServerClient.request(
					new UserListAction(
						{
							filter: new KalturaUserFilter({
								idOrScreenNameStartsWith : text
							}),
							pager: new KalturaFilterPager({
								pageIndex : 0,
								pageSize : 30
							})
						}
					)
				)
				.cancelOnDestroy(this, this.sectionReset$)
				.monitor('search owners')
				.subscribe(
					result =>
					{
						observer.next(result.objects);
						observer.complete();
					},
					err =>
					{
						observer.error(err);
					}
				);

				return () =>
				{
					console.log("entryUsersHandler.searchOwners(): cancelled");
					requestSubscription.unsubscribe();
				}
			});
	}

	public saveOwner(): void{
		this._owner = this.usersForm.value.owners[0];
	}

}
