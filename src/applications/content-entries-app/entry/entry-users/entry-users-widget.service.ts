import { Injectable, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs';
import { KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaUser } from 'kaltura-ngx-client';
import { UserGetAction } from 'kaltura-ngx-client';
import { UserListAction } from 'kaltura-ngx-client';
import { KalturaUserFilter } from 'kaltura-ngx-client';
import { KalturaFilterPager } from 'kaltura-ngx-client';
import { KalturaMediaEntry } from 'kaltura-ngx-client';

import 'rxjs/add/observable/forkJoin';
import { EntryWidget } from '../entry-widget';
import { async } from 'rxjs/scheduler/async';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ContentEntryViewSections } from 'app-shared/kmc-shared/kmc-views/details-views/content-entry-view.service';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Injectable()
export class EntryUsersWidget extends EntryWidget implements OnDestroy
{

    public _creator: string = "";
	public _owner: KalturaUser = null;

	public usersForm : FormGroup;

	constructor(private _formBuilder: FormBuilder,
              private _kalturaServerClient: KalturaClient,
              private _permissionsService: KMCPermissionsService,
                logger: KalturaLogger)
    {
        super(ContentEntryViewSections.Users, logger);
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
            .observeOn(async) // using async scheduler so the form group status/dirty mode will be synchornized
            .cancelOnDestroy(this)
            .subscribe(
				() => {
					super.updateState({
						isValid: this.usersForm.status !== 'INVALID',
						isDirty: this.usersForm.dirty
					});
				}
			);
	}

	protected onDataSaving(data: KalturaMediaEntry, request: KalturaMultiRequest){
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
    protected onReset()
    {
	    this._creator = "";
	    this._owner = null;
	    this.usersForm.reset({
		    owners: [],
		    editors: [],
		    publishers: []
	    });
    }

    protected onActivate(firstTimeActivating: boolean) {

	    super._showLoader();

	    let actions : Observable<void>[] = [];

	    if (!this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_ENTRY_USERS)) {
        this.usersForm.disable({ emitEvent: false });
      }

      const fetchUsersData$ = this._kalturaServerClient.multiRequest(new KalturaMultiRequest(
        new UserGetAction({ userId: this.data.creatorId }),
        new UserGetAction({ userId: this.data.userId })
      ))
        .cancelOnDestroy(this, this.widgetReset$)
        .map(([creatorResponse, ownerResponse]) => {
          if (creatorResponse.error || (ownerResponse.error && ownerResponse.error.code !== 'INVALID_USER_ID')) {
            throw new Error('failed to fetch users data');
          } else {
            const creator = creatorResponse.result;
            this._creator = creator.screenName ? creator.screenName : creator.id;
            this._owner = ownerResponse.result ? ownerResponse.result : new KalturaUser({ screenName: this.data.userId });
          }
          return undefined;
        });
      actions.push(fetchUsersData$);

	    if (this.data.entitledUsersEdit && this.data.entitledUsersEdit.length) {
		    const entitledUsersEdit = this.data.entitledUsersEdit.split(",");
		    const request = new KalturaMultiRequest();
		    entitledUsersEdit.forEach(entitledUser=>{
			    request.requests.push(new UserGetAction({userId: entitledUser}));
		    });

		    const fetchEditorsData$ = this._kalturaServerClient.multiRequest(request)
			    .cancelOnDestroy(this, this.widgetReset$)
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
			    .cancelOnDestroy(this, this.widgetReset$)
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
				.cancelOnDestroy(this, this.widgetReset$)
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

    ngOnDestroy()
    {

    }

}
