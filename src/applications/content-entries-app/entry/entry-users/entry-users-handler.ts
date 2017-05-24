import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { EntrySection } from '../entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { EntrySectionTypes } from '../entry-sections-types';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { KalturaUser, UserGetAction, UserListAction, KalturaUserFilter, KalturaFilterPager, KalturaMediaEntry } from 'kaltura-typescript-client/types/all';
import { EntrySectionsManager } from '../entry-sections-manager';

import 'rxjs/add/observable/forkJoin';

@Injectable()
export class EntryUsersHandler extends EntrySection
{

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
			editors: [],
			publishers: []
		});

		Observable.merge(this.usersForm.valueChanges,
			this.usersForm.statusChanges)
            .cancelOnDestroy(this)
            .subscribe(
				() => {
					super._onSectionStateChanged({
						isValid: this.usersForm.status === 'VALID',
						isDirty: this.usersForm.dirty
					});
				}
			);
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

			if (editors && editors.length){
				let entitledUsersEdit = '';
				editors.forEach(editor => {
					entitledUsersEdit += editor.id + ",";
				});
				entitledUsersEdit = entitledUsersEdit.substring(0, entitledUsersEdit.length-1); // remove last comma
				data.entitledUsersEdit = entitledUsersEdit;
			}else{
				data.entitledUsersEdit = null;
			}
			// save publishers
			const publishers: KalturaUser[] = this.usersForm.value.publishers;
			if (publishers && publishers.length){
				let entitledUsersPublish = '';
				publishers.forEach(publisher => {
					entitledUsersPublish += publisher.id + ",";
				});
				entitledUsersPublish = entitledUsersPublish.substring(0, entitledUsersPublish.length-1); // remove last comma
				data.entitledUsersPublish = entitledUsersPublish;
			}else{
				data.entitledUsersPublish = null;
			}
		}
	}
    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _reset()
    {
	    this._creator = "";
	    this._owner = null;
	    this.usersForm.reset({
		    owners: null,
		    editors: [],
		    publishers: []
	    });
    }

    protected _activate(firstLoad : boolean) {

	    super._showLoader();

	    let actions : Observable<void>[] = [];

	    const fetchUsersData$ = this._kalturaServerClient.multiRequest(new KalturaMultiRequest(
			    new UserGetAction({userId: this.data.creatorId}),
			    new UserGetAction({userId: this.data.userId})
		    ))
		    .cancelOnDestroy(this,this.sectionReset$)
		    .monitor('get users details')
		    .map(
		    	responses =>
			    {
				    if (responses.hasErrors())
				    {
					    throw new Error('failed to fetch users data');
				    }else
				    {
					    if (responses.length && responses.length ===2 && responses[0].result){
						    this._creator = responses[0].result.screenName ? responses[0].result.screenName : responses[0].result.id;
						    if (responses[1].result) {
							    this._owner = <KalturaUser>responses[1].result;
						    }
					    }
				    }

				    return undefined;
			    }
		    );

	    actions.push(fetchUsersData$);

	    if (this.data.entitledUsersEdit && this.data.entitledUsersEdit.length) {
		    const entitledUsersEdit = this.data.entitledUsersEdit.split(",");
		    const request = new KalturaMultiRequest();
		    entitledUsersEdit.forEach(entitledUser=>{
			    request.requests.push(new UserGetAction({userId: entitledUser}));
		    });

		    const fetchEditorsData$ = this._kalturaServerClient.multiRequest(request)
			    .cancelOnDestroy(this, this.sectionReset$)
			    .monitor('get editors')
			    .map(
				    responses =>
				    {
					    if (responses.hasErrors())
					    {
						    throw new Error('failed to fetch editor data');
					    }else
					    {
						    let editors = [];
						    responses.forEach(res => {
							    editors.push(res.result);
						    });
						    this.usersForm.patchValue({editors: editors});
					    }

					    return undefined;
				    }
			    );

		    actions.push(fetchEditorsData$);
	    }

	    if (this.data.entitledUsersPublish && this.data.entitledUsersPublish.length) {
		    const entitledUsersPublish = this.data.entitledUsersPublish.split(",");
		    const request = new KalturaMultiRequest();
		    entitledUsersPublish.forEach(entitledUser=>{
			    request.requests.push(new UserGetAction({userId: entitledUser}));
		    });

		    const fetchPublishersData$ = this._kalturaServerClient.multiRequest(request)
			    .cancelOnDestroy(this, this.sectionReset$)
			    .monitor('get publishers')
			    .map(
				    responses =>
				    {
					    if (responses.hasErrors())
					    {
						    throw new Error('failed to fetch publishers data');
					    }else
					    {
						    let publishers = [];
						    responses.forEach(res => {
							    publishers.push(res.result);
						    });
						    this.usersForm.patchValue({publishers: publishers});
					    }

					    return undefined;
				    }
			    );

		    actions.push(fetchPublishersData$);
	    }

	    return Observable.forkJoin(actions)
		    .map(responses => {
			    super._hideLoader();
			    return {failed : false};
		    })
		    .catch((error, caught) =>
		    {
			    super._hideLoader();
			    super._showActivationError();

			    return Observable.of({failed : true, error});
		    });

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
