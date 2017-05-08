import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { EntrySection } from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient, KalturaMultiRequest } from '@kaltura-ng2/kaltura-api';
import { KalturaUser, UserGetAction, UserListAction, KalturaUserFilter, KalturaFilterPager, KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';

@Injectable()
export class EntryUsersHandler extends EntrySection
{
    public _creator: string = "";
	public _owner: KalturaUser = null;

	public usersForm : FormGroup;

	constructor(manager : EntrySectionsManager, private _formBuilder : FormBuilder, private _kalturaServerClient: KalturaServerClient)
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
			.monitor('status changes')
			.subscribe(
				value =>
				{
					super._onStatusChanged({isValid : value === 'VALID'});
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
    }

    protected _activate(firstLoad : boolean) {
        this._fetchUsersData();
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
				    if (response.length && response.length ===2 && response[0].result){
					    this._creator = response[0].result.screenName ? response[0].result.screenName : response[0].result.id;
					    if (response[1].result) {
						    this._owner = <KalturaUser>response[1].result;
					    }
				    }

			    },
			    error =>
			    {
				    console.warn("Error getting users data");
			    }
		    );
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
