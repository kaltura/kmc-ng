import { Injectable } from '@angular/core';
import { KalturaFilterPager } from 'kaltura-ngx-client';
import { KalturaClient } from 'kaltura-ngx-client';
import { Observable } from 'rxjs';
import { UiConfListAction } from 'kaltura-ngx-client';
import { KalturaUiConfFilter } from 'kaltura-ngx-client';
import { KalturaUiConfListResponse } from 'kaltura-ngx-client';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client';
import { KalturaResponseProfileType } from 'kaltura-ngx-client';
import { ShortLinkAddAction } from 'kaltura-ngx-client';
import { KalturaShortLink } from 'kaltura-ngx-client';

export type EmbedConfig = {
    embedType: string;
    entryId: string;
    ks: string;
    uiConfId: string;
    width: number;
    height: number;
    pid: number;
    serverUri: string;
    playerConfig: string;
    isPlaylist?: boolean;
}

export type EmbedParams = {
    playerVersion: number;
    embedType: string;
    scriptUrl?: string;
    htmlContent?: string;
    embedParameters?: any;
    isPlaylist?: boolean;
}

@Injectable()
export class PreviewEmbedService {

	constructor(private _kalturaClient: KalturaClient) {
	}

	listPlayers(isPlaylist: boolean = false): Observable<KalturaUiConfListResponse>{

		const tags = isPlaylist ? 'playlist,kalturaPlayerJs' : 'player';

		const filter = new KalturaUiConfFilter({
			'tagsMultiLikeOr': tags,
			'orderBy': '-updatedAt',
			'objTypeIn': '1,8,22,23',
			'creationModeEqual': 2
		});

		const pager = new KalturaFilterPager({
			'pageIndex': 1,
			'pageSize': 500
		});

		let responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
			type: KalturaResponseProfileType.includeFields,
			fields: 'id,name,html5Url,createdAt,updatedAt,width,height,tags,objType'
		});

		return this._kalturaClient.request(new UiConfListAction({filter, pager}).setRequestOptions({
            responseProfile
        }));
	}

	generateShortLink(url: string): Observable<KalturaShortLink>{

		let shortLink: KalturaShortLink = new KalturaShortLink();
		shortLink.systemName = "KMC-PREVIEW";
		shortLink.fullUrl = url;

		return this._kalturaClient.request(new ShortLinkAddAction({shortLink}));
	}

    generateV2EmbedCode(config: any, isPreview = false): string | EmbedParams {
        if (isPreview) {
            let scriptUrl = null;
            let htmlContent = null;
            let embedParameters = null;
            switch (config.embedType) {
                case 'dynamic':
                    scriptUrl = `${config.serverUri}/p/${config.pid}/sp/${config.pid}00/embedIframeJs/uiconf_id/${config.uiConfId}/partner_id/${config.pid}`;
                    htmlContent = `<div id="${config.playerId}" style="width: ${config.width}px; height: ${config.height}px;"${config.videoMeta}>${config.entryMeta}</div>`;
                    embedParameters = {targetId: config.playerId, wid: "_"+config.pid, uiconf_id: config.uiConfId, flashvars: JSON.parse(config.flashVars), cache_st: config.cacheSt, entry_id: config.entryId};
                    break;
                case 'iframe':
                    const iframeEntryId = config.entryId.length ? `&entry_id=${config.entryId}` : '';
                    htmlContent = `<iframe id="${config.playerId}" src="${config.serverUri}/p/${config.pid}/sp/${config.pid}00/embedIframeJs/uiconf_id/${config.uiConfId}/partner_id/${config.pid}?iframeembed=true&playerId=${config.playerId}${iframeEntryId}${config.flashVarsUrl}" width="${config.width}" height="${config.height}" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *" frameborder="0"${config.videoMeta}>${config.entryMeta}</iframe>`
                    break;
                case 'auto':
                    const autoEntryId = config.entryId.length ? `&entry_id=${config.entryId}` : '';
                    scriptUrl = `${config.serverUri}/p/${config.pid}/sp/${config.pid}100/embedIframeJs/uiconf_id/${config.uiConfId}/partner_id/${config.pid}?autoembed=true${autoEntryId}&playerId=${config.playerId}&cache_st=${config.cacheSt}&width=${config.width}&height=${config.height}${config.flashVarsUrl}`;
                    if (config.includeSeoMetadata) {
                        htmlContent = `<div id="${config.playerId}" style="width: ${config.width}px; height: ${config.height}px;"${config.videoMeta}>${config.entryMeta}</div>`;
                    }
                    break;
                case 'thumb':
                    scriptUrl = `${config.serverUri}/p/${config.pid}/sp/${config.pid}00/embedIframeJs/uiconf_id/${config.uiConfId}/partner_id/${config.pid}`;
                    htmlContent = `<div id="${config.playerId}" style="width: ${config.width}px; height: ${config.height}px;"${config.videoMeta}>${config.entryMeta}</div>`;
                    embedParameters = {targetId: config.playerId, wid: "_"+config.pid, uiconf_id: config.uiConfId, flashvars: JSON.parse(config.flashVars), cache_st: config.cacheSt, entry_id: config.entryId};
                    break;
            }
            return {
                playerVersion: 2,
                embedType: config.embedType,
                scriptUrl,
                htmlContent,
                embedParameters
            }
        } else {
            let code = '';
            switch (config.embedType) {
                case 'dynamic':
                    const dynamicEntryId = !config.entryId.length ? '' : `,
  "entry_id": "${config.entryId}"`;
                    code = `<script src="${config.serverUri}/p/${config.pid}/sp/${config.pid}00/embedIframeJs/uiconf_id/${config.uiConfId}/partner_id/${config.pid}"></script>
<div id="${config.playerId}" style="width: ${config.width}px; height: ${config.height}px;"${config.videoMeta}>${config.entryMeta}</div>
<script>
kWidget.embed({
  "targetId": "${config.playerId}",
  "wid": "_${config.pid}",
  "uiconf_id": ${config.uiConfId},
  "flashvars": ${config.flashVars},
  "cache_st": ${config.cacheSt}${dynamicEntryId}
});
</script>`
                    break;
                case 'iframe':
                    const iframeEntryId = config.entryId.length ? `&entry_id=${config.entryId}` : '';
                    code = `<iframe id="${config.playerId}" src="${config.serverUri}/p/${config.pid}/sp/${config.pid}00/embedIframeJs/uiconf_id/${config.uiConfId}/partner_id/${config.pid}?iframeembed=true&playerId=${config.playerId}${iframeEntryId}${config.flashVarsUrl}" width="${config.width}" height="${config.height}" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *" frameborder="0"${config.videoMeta}>${config.entryMeta}</iframe>`
                    break;
                case 'auto':
                    const autoEntryId = config.entryId.length ? `&entry_id=${config.entryId}` : '';
                    code = `<script src="${config.serverUri}/p/${config.pid}/sp/${config.pid}100/embedIframeJs/uiconf_id/${config.uiConfId}/partner_id/${config.pid}?autoembed=true${autoEntryId}&playerId=${config.playerId}&cache_st=${config.cacheSt}&width=${config.width}&height=${config.height}${config.flashVarsUrl}"></script>`
                    if (config.includeSeoMetadata) {
                        code = `<div id="${config.playerId}" style="width: ${config.width}px; height: ${config.height}px;"${config.videoMeta}>${config.entryMeta}</div>
` + code;
                    }
                    break;
                case 'thumb':
                    code = `<script src="${config.serverUri}/p/${config.pid}/sp/${config.pid}00/embedIframeJs/uiconf_id/${config.uiConfId}/partner_id/${config.pid}"></script>
<div id="${config.playerId}" style="width: ${config.width}px; height: ${config.height}px;"${config.videoMeta}>${config.entryMeta}</div>
<script>
kWidget.thumbEmbed({
  "targetId": "${config.playerId}",
  "wid": "_${config.pid}",
  "uiconf_id": ${config.uiConfId},
  "flashvars": ${config.flashVars},
  "cache_st": ${config.cacheSt},
  "entry_id": "${config.entryId}"
});
</script>`;
                    break;
            }
            return code;
        }
    }

	generateV3EmbedCode(config: any, isPreview: boolean, poster = ''): string | EmbedParams {
        const rnd = Math.floor(Math.random() * 1000000000);
        if (isPreview) {
            let scriptUrl = null;
            let htmlContent = null;
            let embedParameters = null;
            switch (config.embedType) {
                case 'dynamic':
                case 'thumb':
                    scriptUrl = `${config.serverUri}/p/${config.pid}/embedPlaykitJs/uiconf_id/${config.uiConfId}`;
                    htmlContent = `<div id="kaltura_player_${rnd}" style="width: ${config.width}px;height: ${config.height}px"></div>`;
                    embedParameters = {targetId: `kaltura_player_${rnd}`, partnerId: config.pid, uiconf_id: config.uiConfId, entry_id: config.entryId, poster, playerConfig: config.playerConfig};
                    break;
                case 'iframe':
                    htmlContent = config.isPlaylist ? `<iframe type="text/javascript" src='${config.serverUri}/p/${config.pid}/embedPlaykitJs/uiconf_id/${config.uiConfId}?iframeembed=true&playlist_id=${config.entryId}${config.playerConfig}' style="width: ${config.width}px; height: ${config.height}px" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *" frameborder="0"></iframe>` :
                        `<iframe type="text/javascript" src='${config.serverUri}/p/${config.pid}/embedPlaykitJs/uiconf_id/${config.uiConfId}?iframeembed=true&entry_id=${config.entryId}${config.playerConfig}' style="width: ${config.width}px; height: ${config.height}px" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *" frameborder="0"></iframe>`;
                    break;
                case 'auto':
                    scriptUrl = config.isPlaylist ? `${config.serverUri}/p/${config.pid}/embedPlaykitJs/uiconf_id/${config.uiConfId}?autoembed=true&targetId=kaltura_player_${rnd}&playlist_id=${config.entryId}${config.playerConfig}` :
                        `${config.serverUri}/p/${config.pid}/embedPlaykitJs/uiconf_id/${config.uiConfId}?autoembed=true&targetId=kaltura_player_${rnd}&entry_id=${config.entryId}${config.playerConfig}`;
                    htmlContent = `<div id="kaltura_player_${rnd}" style="width: ${config.width}px;height: ${config.height}px"></div>`;
                    break;
            }
            return {
                playerVersion: 7,
                embedType: config.embedType,
                isPlaylist: config.isPlaylist,
                scriptUrl,
                htmlContent,
                embedParameters
            }
        } else {
            let code = '';
            switch (config.embedType) {
                case 'dynamic':
                    code = config.isPlaylist ? `<div id="kaltura_player_${rnd}" style="width: ${config.width}px;height: ${config.height}px"></div>
                    <script type="text/javascript" src="${config.serverUri}/p/${config.pid}/embedPlaykitJs/uiconf_id/${config.uiConfId}"></script>
                    <script type="text/javascript">
                    try {
                      var kalturaPlayer = KalturaPlayer.setup({
                        targetId: "kaltura_player_${rnd}",
                        provider: {
                          partnerId: ${config.pid},
                          uiConfId: ${config.uiConfId}
                        }
                      });
                      kalturaPlayer.loadPlaylist({playlistId: '${config.entryId}'});
                    } catch (e) {
                      console.error(e.message)
                    }
                  </script>`:
                    `<div id="kaltura_player_${rnd}" style="width: ${config.width}px;height: ${config.height}px"></div>
                    <script type="text/javascript" src="${config.serverUri}/p/${config.pid}/embedPlaykitJs/uiconf_id/${config.uiConfId}"></script>
                    <script type="text/javascript">
                    try {
                      var kalturaPlayer = KalturaPlayer.setup({
                        targetId: "kaltura_player_${rnd}",
                        provider: {
                          partnerId: ${config.pid},
                          uiConfId: ${config.uiConfId}
                        }
                      });
                      kalturaPlayer.loadMedia({entryId: '${config.entryId}'});
                    } catch (e) {
                      console.error(e.message)
                    }
                  </script>`;
                    break;
                case 'thumb':
                    code = `<div id="kaltura_player_${rnd}" style="width: ${config.width}px;height: ${config.height}px"></div>
                    <script type="text/javascript" src="${config.serverUri}/p/${config.pid}/embedPlaykitJs/uiconf_id/${config.uiConfId}"></script>
                    <script src="https://static.kaltura.com/content/static/player-scripts/thumbnail-embed.js"></script>
                    <script type="text/javascript">
                    try {
                      __thumbnailEmbed({
                        config:  {
                            provider: {
                              partnerId: ${config.pid},
                              uiConfId: ${config.uiConfId}
                            },
                            targetId: "kaltura_player_${rnd}"
                        },
                        mediaInfo: {entryId: '${config.entryId}'}
                      });
                    } catch (e) {
                      console.error(e.message)
                    }
                  </script>`;
                    break;
                case 'iframe':
                    code = config.isPlaylist ? `<iframe type="text/javascript" src='${config.serverUri}/p/${config.pid}/embedPlaykitJs/uiconf_id/${config.uiConfId}?iframeembed=true&playlist_id=${config.entryId}${config.playerConfig}' style="width: ${config.width}px; height: ${config.height}px" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *" frameborder="0"></iframe>` :
                        `<iframe type="text/javascript" src='${config.serverUri}/p/${config.pid}/embedPlaykitJs/uiconf_id/${config.uiConfId}?iframeembed=true&entry_id=${config.entryId}${config.playerConfig}' style="width: ${config.width}px; height: ${config.height}px" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *" frameborder="0"></iframe>`;
                    break;
                case 'auto':
                    code = config.isPlaylist ? `<div id="kaltura_player_${rnd}" style="width: ${config.width}px;height: ${config.height}px"></div>
<script type="text/javascript" src='${config.serverUri}/p/${config.pid}/embedPlaykitJs/uiconf_id/${config.uiConfId}?autoembed=true&targetId=kaltura_player_${rnd}&playlist_id=${config.entryId}${config.playerConfig}'></script>` :
                        `<div id="kaltura_player_${rnd}" style="width: ${config.width}px;height: ${config.height}px"></div>
<script type="text/javascript" src='${config.serverUri}/p/${config.pid}/embedPlaykitJs/uiconf_id/${config.uiConfId}?autoembed=true&targetId=kaltura_player_${rnd}&entry_id=${config.entryId}${config.playerConfig}'></script>`
                    break;
                default:
                    break;
            }
            return code;
        }
    }

}

