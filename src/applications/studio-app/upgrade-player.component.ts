import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { UpgradePlayerMainViewService } from "app-shared/kmc-shared/kmc-views";
import { AppAuthentication, AppBootstrap } from "app-shared/kmc-shell";
import { cancelOnDestroy } from "@kaltura-ng/kaltura-common";
import { serverConfig } from "config/server";
import { globalConfig } from "config/global";

@Component({
    selector: "kUpgradePlayer",
    templateUrl: "./upgrade-player.component.html",
    styleUrls: ["./upgrade-player.component.scss"],
})
export class UpgradePlayerComponent implements OnInit, OnDestroy {
    private unisphereModuleRuntime: any;

    constructor(
        private _upgradePlayerMainViewService: UpgradePlayerMainViewService,
        private _bootstrapService: AppBootstrap,
        private _appAuthentication: AppAuthentication
    ) {}

    ngOnInit() {
        if (this._upgradePlayerMainViewService.viewEntered()) {
            this._bootstrapService.unisphereWorkspace$
                .pipe(cancelOnDestroy(this))
                .subscribe((unisphereWorkspace) => {
                    if (unisphereWorkspace) {
                        const runtimeSettings = {
                            ks: this._appAuthentication.appUser.ks,
                            kalturaServerURI:
                                "https://" + serverConfig.kalturaServer.uri,
                            analyticsServerURI:
                                serverConfig.analyticsServer.uri,
                            hostAppName: "kmc",
                            hostAppVersion: globalConfig.client.appVersion,
                            pid: this._appAuthentication.appUser.partnerId.toString(),
                        };
                        if (!this.unisphereModuleRuntime) {
                            unisphereWorkspace
                                .loadRuntime(
                                    "unisphere.widget.upgrade-player",
                                    "application",
                                    runtimeSettings
                                )
                                .then((data) => {
                                    this.unisphereModuleRuntime = data.runtime;
                                    this.unisphereModuleRuntime.mountVisual({
                                        type: "default",
                                        target: "upgradePlayerApp",
                                        settings: {},
                                    });
                                })
                                .catch((error) => {
                                    console.error(
                                        "failed to load unisphere upgrade player: " +
                                            error.message
                                    );
                                });
                        }
                    }
                });
        }
    }

    ngOnDestroy() {}
}
