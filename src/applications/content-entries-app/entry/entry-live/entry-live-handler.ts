import { Injectable, OnDestroy } from '@angular/core';
import { EntrySection } from '../../entry-store/entry-section-handler';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Message } from 'primeng/primeng';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { KalturaSourceType, KalturaLiveStreamBitrate, KalturaLiveStreamConfiguration, KalturaConversionProfile, ConversionProfileListAction, KalturaConversionProfileFilter,
	KalturaConversionProfileType, KalturaFilterPager, LiveStreamRegenerateStreamTokenAction, KalturaRecordStatus, KalturaLiveStreamEntry, KalturaDVRStatus } from '@kaltura-ng2/kaltura-api/types';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';

@Injectable()
export class EntryLiveHandler extends EntrySection
{

	public _msgs: Message[] = [];
	private _liveType: string = "";

	private _conversionProfiles : BehaviorSubject<{ items : KalturaConversionProfile[], loading : boolean, error? : any}> =
		new BehaviorSubject<{ items : KalturaConversionProfile[], loading : boolean, error? : any}>({ items : [], loading : false});
	public _conversionProfiles$ = this._conversionProfiles.asObservable().monitor('conversion profiles');

	public _regeneratingToken: boolean = false;
	public _recordStatus: string = "";
	public _DVRStatus: string = "";
	public _showDVRWindow: boolean = false;

    constructor(manager : EntrySectionsManager, private _kalturaServerClient: KalturaServerClient, private _appLocalization: AppLocalization)
    {
        super(manager);
    }

    public get sectionType() : EntrySectionTypes
    {
        return EntrySectionTypes.Live;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _reset()
    {
    }

    protected _activate(firstLoad : boolean) {
	    // set live type
	    switch (this.data.sourceType.toString()){
		    case KalturaSourceType.liveStream.toString():
		    	this._liveType = "kaltura";
			    this._fetchConversionProfiles();
			    this._setRecordStatus();
			    this._setDVRStatus();
			    break;
		    case KalturaSourceType.akamaiUniversalLive.toString():
		    	this._liveType = "universal";
			    this._showDVRWindow = true;
			    this._setDVRStatus();
			    break;
		    case KalturaSourceType.manualLiveStream.toString():
		    	this._liveType = "manual";
			    break;
	    }
    }

    private _fetchConversionProfiles():void{
	    this._conversionProfiles.next({items : [], loading : true});

	    this._kalturaServerClient.request(new ConversionProfileListAction({
		    filter: new KalturaConversionProfileFilter({
			    typeEqual : KalturaConversionProfileType.liveStream
		    }),
		    pager: new KalturaFilterPager({
			    pageIndex: 1,
			    pageSize: 500
		    })
	    }))
	    .cancelOnDestroy(this,this.sectionReset$)
	    .monitor('get conversion profiles')
	    .subscribe(
		    response =>
		    {
			    if (response.objects && response.objects.length){
				    // set the default profile first in the array
				    response.objects.sort(function(a,b) {
					    if ( a.isDefault > b.isDefault )
						    return -1;
					    if ( a.isDefault < b.isDefault )
						    return 1;
					    return 0;
				    } );
				    this._conversionProfiles.next({items : response.objects, loading : false});
			    }

		    },
		    error =>
		    {
			    this._conversionProfiles.next({items : [], loading : false, error : error});
		    }
	    );
    }

    public regenerateStreamToken(): void{
	    this._regeneratingToken = true;
	    this._kalturaServerClient.request(new LiveStreamRegenerateStreamTokenAction({entryId: this.data.id}))
		    .cancelOnDestroy(this,this.sectionReset$)
		    .monitor('regenerate stream token')
		    .subscribe(
			    response =>
			    {
				    this._regeneratingToken = false;
				    this._msgs.push({severity: 'success', summary: '', detail: this._appLocalization.get('applications.content.entryDetails.live.regenerateSuccess')});
			    },
			    error =>
			    {
				    this._regeneratingToken = false;
				    this._msgs.push({severity: 'error', summary: '', detail: this._appLocalization.get('applications.content.entryDetails.live.regenerateFailure')});
			    }
		    );
    }

    private _setDVRStatus():void{
	    let entry = this.data as KalturaLiveStreamEntry;
	    if (!entry.dvrStatus || entry.dvrStatus.toString() === KalturaDVRStatus.disabled.toString()) {
		    this._DVRStatus = this._appLocalization.get('app.common.off');
	    } else if (entry.dvrStatus.toString() == KalturaDVRStatus.enabled.toString()) {
		    this._DVRStatus = this._appLocalization.get('app.common.on');
		    if (this._liveType === "kaltura"){
		        this._showDVRWindow = true;
		    }
	    }
    }

    private _setRecordStatus(): void{
	    let entry = this.data as KalturaLiveStreamEntry;
	    if (!entry.recordStatus || entry.recordStatus.toString() === KalturaRecordStatus.disabled.toString()) {
		    this._recordStatus = this._appLocalization.get('app.common.off');
	    } else if (entry.recordStatus.toString() === KalturaRecordStatus.appended.toString() || entry.recordStatus.toString() === KalturaRecordStatus.perSession.toString()) {
		    this._recordStatus = this._appLocalization.get('app.common.on');
	    }
    }
}
