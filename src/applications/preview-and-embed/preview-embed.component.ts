import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, ViewChild, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";

import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { subApplicationsConfig } from 'config/sub-applications';
import { PreviewEmbedService } from './preview-and-embed.service';

import { KalturaPlaylist } from 'kaltura-ngx-client';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { KalturaUiConfListResponse } from 'kaltura-ngx-client';
import { KalturaUiConf } from 'kaltura-ngx-client';
import { KalturaShortLink } from 'kaltura-ngx-client';
import { KalturaSourceType } from 'kaltura-ngx-client';
import { serverConfig } from 'config/server';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kPreviewEmbedDetails',
  templateUrl: './preview-embed.component.html',
  styleUrls: ['./preview-embed.component.scss'],
  providers: [ PreviewEmbedService ]
})
export class PreviewEmbedDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() closePopup = new EventEmitter();

  @Input() media: KalturaPlaylist | KalturaMediaEntry;

  @ViewChild('previewIframe') previewIframe: ElementRef;

  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;

  public _players: { label: string, value: KalturaUiConf }[] = [];
  public _playersSortBy: 'name' | 'createdAt' | 'updatedAt' = 'updatedAt';
  public _embedTypes: { label: string, value: string }[] = [];

  public _generatedCode = "";
  public _generatedPreviewCode = "";
  public _shortLink = "";
  public _showEmbedParams = true;
  public _showAdvanced = false;
  public _title: string;
  public _embedTypesHelpExists = !!serverConfig.externalLinks.previewAndEmbed && !!serverConfig.externalLinks.previewAndEmbed.embedTypes;
  public _deliveryProtocolsHelpExists = !!serverConfig.externalLinks.previewAndEmbed && !!serverConfig.externalLinks.previewAndEmbed.deliveryProtocols;

  public _previewForm: FormGroup;

  private generator: any;
  private _previewLink = null;

  public get _showEmberCode(): boolean {
    const showForPlaylist = this.media instanceof KalturaPlaylist && this._permissionsService.hasPermission(KMCPermissions.PLAYLIST_EMBED_CODE);
    const showForEntry = this.media instanceof KalturaMediaEntry && this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_EMBED_CODE);
    return showForEntry || showForPlaylist;
  }

  constructor(private _previewEmbedService: PreviewEmbedService,
              private _appAuthentication: AppAuthentication,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _permissionsService: KMCPermissionsService,
              private _fb: FormBuilder) {

  }

  ngOnInit(){
    this._playersSortBy = this._browserService.getFromLocalStorage('previewEmbed.sortBy') || 'updatedAt';
    this.listPlayers();
    this.setEmbedTypes();
    this.createForm();
    this.generator = this.getGenerator();
    this._title = this._showEmberCode
      ? this._appLocalization.get('applications.embed.previewShare')
      : this._appLocalization.get('applications.embed.previewInPlayer');
  }

  ngAfterViewInit(){
    this._previewForm.valueChanges.pipe(cancelOnDestroy(this)).subscribe(() => {
      this._browserService.setInLocalStorage('previewEmbed.embedType', this._previewForm.controls['selectedEmbedType'].value);
      this._browserService.setInLocalStorage('previewEmbed.seo', this._previewForm.controls['seo'].value);
      this._browserService.setInLocalStorage('previewEmbed.secured', this._previewForm.controls['secured'].value);
      this._generatedCode = this.generateCode(false);
      this._generatedPreviewCode = this.generateCode(true);
      this.createPreviewLink(false);
      this.showPreview();
    });
  }

  private listPlayers(){

    const isPlaylist = this.media instanceof KalturaPlaylist;
    this._isBusy = true;
    this._blockerMessage = null;

    this._previewEmbedService.listPlayers(isPlaylist).pipe(cancelOnDestroy(this)).subscribe(
        (res: KalturaUiConfListResponse) => {
          // create players array from returned UICong list
          res.objects.forEach(uiConf => {
            this._players.push({label: uiConf.name, value: uiConf});
          });

          this.sortPlayers(this._playersSortBy);

          // select first player
          if (this._players.length > 0) {
            this._previewForm.patchValue({
              selectedPlayer: this._players[0].value
            });
          }else{
            this._blockerMessage = new AreaBlockerMessage(
                {
                  message: isPlaylist ? this._appLocalization.get("applications.embed.playersErrorPlaylist") : this._appLocalization.get("applications.embed.playersErrorVideo"),
                  buttons: [
                    {
                      label: this._appLocalization.get('app.common.ok'),
                      action: () => {
                        this._blockerMessage = null;
                      }
                    }
                  ]
                }
            );
          }

          this._isBusy = false;
        },
        error => {
          this._isBusy = false;

          this._blockerMessage = new AreaBlockerMessage(
              {
                message: error.message,
                buttons: [
                  {
                    label: this._appLocalization.get('app.common.retry'),
                    action: () => {
                      this.listPlayers();
                    }
                  },
                  {
                    label: this._appLocalization.get('app.common.cancel'),
                    action: () => {
                      this._blockerMessage = null;
                    }
                  }
                ]
              }
          );
        }
    );
  }

  private sortPlayers(sortBy){
    this._players.sort((a,b)=>{
      let val1 = a.value[sortBy];
      let val2 = b.value[sortBy];
      if (sortBy === "name" && typeof val1 === "string" && typeof val2 === "string"){
        val1 = val1.toLowerCase();
        val2 = val2.toLowerCase();
      }
      if (val1 < val2)
        return 1;
      if (val1 > val2)
        return -1;
      return 0;
    });
    // refresh dropdown by refrshing the array
    this._players = this._players.slice(0);
  }

  private createForm():void{
    const seo: boolean | null = this._browserService.getFromLocalStorage('previewEmbed.seo');
    const secured: boolean | null = this._browserService.getFromLocalStorage('previewEmbed.secured');
    this._previewForm = this._fb.group({
      selectedPlayer: null,
      selectedEmbedType: this._browserService.getFromLocalStorage('previewEmbed.embedType') || subApplicationsConfig.previewAndEmbedApp.embedType,
      seo: seo !== null ? seo : subApplicationsConfig.previewAndEmbedApp.includeSeoMetadata,
      secured: secured !== null ? secured : subApplicationsConfig.previewAndEmbedApp.secureEmbed
    });
  }

  private setEmbedTypes():void{
    this._embedTypes.push({"label": this._appLocalization.get("applications.embed.embedDynamic"), "value": "dynamic"});
    this._embedTypes.push({"label": this._appLocalization.get("applications.embed.embedIframe"), "value": "iframe"});
    this._embedTypes.push({"label": this._appLocalization.get("applications.embed.embedAuto"), "value": "auto"});
    if (this.media instanceof KalturaMediaEntry) {
      this._embedTypes.push({"label": this._appLocalization.get("applications.embed.embedThumb"), "value": "thumb"}); // no thumb embed for playlists
    }
  }

  private getGenerator():any{
    const baseCdnUrl = serverConfig.cdnServers.serverUri.replace("http://","");
    const securedCdnUrl = serverConfig.cdnServers.securedServerUri.replace("https://","");
    // 'kEmbedCodeGenerator' is bundled with the app. Location: assets/js/KalturaEmbedCodeGenerator.min.js
    return new window['kEmbedCodeGenerator']({
      host: baseCdnUrl,
      securedHost: securedCdnUrl,
      partnerId: this._appAuthentication.appUser.partnerId,
      includeKalturaLinks: subApplicationsConfig.previewAndEmbedApp.includeKalturaLinks
    });
  }

  private generateCode(isPreview = false): string{
    this._previewLink = null;
    this._shortLink = "";
    const cacheStr = Math.floor(new Date().getTime() / 1000) + (15 * 60); // start caching in 15 minutes
    const params = {
      protocol: this.getProtocol(isPreview),
      embedType: this._previewForm.controls['selectedEmbedType'].value,
      uiConfId: this._previewForm.controls['selectedPlayer'].value.id,
      width: this._previewForm.controls['selectedPlayer'].value.width,
      height: this._previewForm.controls['selectedPlayer'].value.height,
      entryMeta: this.getMediaMetadata(),
      includeSeoMetadata: this._previewForm.controls['seo'].value,
      playerId: 'kaltura_player_' + cacheStr,
      cacheSt: cacheStr,
      flashVars: this.getEmbedFlashVars(isPreview)
    };
    if (this.media instanceof KalturaMediaEntry){
      params['entryId'] = this.media.id;
    }
    return this.generator.getCode(params);
  }

  private getProtocol(isPreview: boolean){
    // if used for preview player - use host protocol
    if (isPreview){
      return location.protocol.substring(0, location.protocol.length - 1);
    }else{
      return this._previewForm.controls['secured'].value ? 'https' : 'http';
    }
  }

  private getMediaMetadata(): any{
    return {
      "name": this.media.name,
      "description": this.media.description,
      "thumbnailUrl": this.media.thumbnailUrl,
      "duration": this.media.duration,
      "uploadDate": this.media.createdAt.toISOString()
    }
  }

  private getEmbedFlashVars(isPreview: boolean): any{
    let flashVars =  {};
    try {
      if (isPreview) {
        flashVars['ks'] = this._appAuthentication.appUser.ks;
        if (this.media instanceof KalturaMediaEntry) {
          const sourceType = this.media.sourceType.toString();
          const isLive = (sourceType === KalturaSourceType.liveStream.toString() ||
          sourceType === KalturaSourceType.akamaiLive.toString() ||
          sourceType === KalturaSourceType.akamaiUniversalLive.toString() ||
          sourceType === KalturaSourceType.manualLiveStream.toString());
          if (isLive) {
            flashVars['disableEntryRedirect'] = true;
          }
        }
        flashVars['liveAnalytics'] = {
          "plugin": "false",                // prevent loading the liveAnalytics plugin in v2 players
          "relativeTo": "PlayerHolder",     // required to prevent v1 players from getting stuck
          "position": "after",              // required to prevent v1 players from getting stuck
          "loadingPolicy": "onDemand"       // prevent v1 players from trying to load this plugin
        };
      }
      if (this.media instanceof KalturaPlaylist) {
        flashVars['playlistAPI.kpl0Id'] = this.media.id;
      }
    } catch (e) {
      console.error("Preview & Embed::Error getting Flashvars: " + e.message);
      flashVars =  {};
    }
    return flashVars;
  }

  private flashVarsToUrl(flashVarsObject: any): string{
      let params = '';
      for( let i in flashVarsObject ){
        var curVal = typeof flashVarsObject[i] == 'object'? JSON.stringify( flashVarsObject[i] ): flashVarsObject[i];
        params+= '&' + 'flashvars[' + encodeURIComponent( i ) + ']=' + encodeURIComponent(curVal);
      }
      return params;
  }

  private createPreviewLink(isPreview: boolean):void{
      let url = '';
      try {
        url = this.getProtocol(isPreview) + '://' + serverConfig.kalturaServer.uri + '/index.php/extwidget/preview';
        url += '/partner_id/' + this._appAuthentication.appUser.partnerId;
        url += '/uiconf_id/' + this._previewForm.controls['selectedPlayer'].value.id;
        if (this.media instanceof KalturaMediaEntry) {
          url += '/entry_id/' + this.media.id;
        }
        url += '/embed/' + this._previewForm.controls['selectedEmbedType'].value;
        url += '?' + this.flashVarsToUrl(this.getEmbedFlashVars(isPreview));
        this._previewLink = url;
      } catch (e){
        console.log("could not generate valid URL for short link generation");
      }

      // create short link
      this._previewEmbedService.generateShortLink(url).pipe(cancelOnDestroy(this)).subscribe(
          (res: KalturaShortLink) => {
            this._shortLink = 'http://' + serverConfig.kalturaServer.uri + '/tiny/' + res.id;
          },
          error => {
            console.log("could not generate short link for preview");
          }
      );
  }

  private showPreview(){
    const style = '<style>html, body {margin: 0; padding: 0; width: 100%; height: 100%; } #framePlayerContainer {margin: 0 auto; padding-top: 20px; text-align: center; } object, div { margin: 0 auto; }</style>';
    let newDoc = this.previewIframe.nativeElement.contentDocument;
    newDoc.open();
    newDoc.write('<!doctype html><html><head>' + style + '</head><body><div id="framePlayerContainer">' + this._generatedPreviewCode + '</div></body></html>');
    newDoc.close();
  }

  public copyEmbedCode(el):void{
    this._browserService.copyElementToClipboard(el);
    this._browserService.showGrowlMessage({severity: 'success', detail: this._appLocalization.get('app.common.copySuccess')});
  }

  public toggleEmbedParams():void{
    this._showEmbedParams = !this._showEmbedParams;
  }

  public toggleAdvanced():void{
    this._showAdvanced = !this._showAdvanced;
  }

  public updatePlayersSort(sortBy: string):void{
    this._browserService.setInLocalStorage('previewEmbed.sortBy', sortBy);
    this.sortPlayers(sortBy);
  }

  public openLink(link: 'embedTypes' | 'deliveryProtocols'): void {
    switch (link) {
        case 'embedTypes':
            this._browserService.openLink(serverConfig.externalLinks.previewAndEmbed.embedTypes);
            break;
        case 'deliveryProtocols':
            this._browserService.openLink(serverConfig.externalLinks.previewAndEmbed.deliveryProtocols);
            break;
    }
  }

  public close(): void{
    this.closePopup.emit();
  }

  ngOnDestroy(){}
}
