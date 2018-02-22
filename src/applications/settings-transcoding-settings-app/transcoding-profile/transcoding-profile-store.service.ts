import { Host, Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { KalturaClient, KalturaTypesFactory } from 'kaltura-ngx-client';
import { TranscodingProfileWidgetsManager } from './transcoding-profile-widgets-manager';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { PageExitVerificationService } from 'app-shared/kmc-shell/page-exit-verification';
import { KalturaConversionProfile } from 'kaltura-ngx-client/api/types/KalturaConversionProfile';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

export enum ActionTypes {
  ProfileLoading,
  ProfileLoaded,
  ProfileLoadingFailed,
  ProfileSaving,
  ProfilePrepareSavingFailed,
  ProfileSavingFailed,
  ProfileDataIsInvalid,
  ActiveSectionBusy
}

export interface StatusArgs {
  action: ActionTypes;
  error?: Error;
}

@Injectable()
export class TranscodingProfileStore implements OnDestroy {
  private _loadProfileSubscription: ISubscription;
  private _sectionToRouteMapping: { [key: number]: string } = {};
  private _pageExitVerificationToken: string;
  private _saveProfileInvoked = false;
  private _profile = {
    data: new BehaviorSubject<KalturaConversionProfile>(null),
    state: new BehaviorSubject<StatusArgs>({ action: ActionTypes.ProfileLoading, error: null })
  };
  private _profileId: number;
  private _profileIsDirty: boolean;

  public get profileIsDirty(): boolean {
    return this._profileIsDirty;
  }

  public get profileId(): number {
    return this._profileId;
  }

  public readonly profile = {
    data$: this._profile.data.asObservable(),
    state$: this._profile.state.asObservable(),
    data: () => this._profile.data.value
  };

  constructor(@Host() private _widgetsManager: TranscodingProfileWidgetsManager,
              private _kalturaServerClient: KalturaClient,
              private _router: Router,
              private _browserService: BrowserService,
              private _profileRoute: ActivatedRoute,
              private _pageExitVerificationService: PageExitVerificationService,
              private _appLocalization: AppLocalization,
              private _logger: KalturaLogger) {


    this._widgetsManager.profileStore = this;

    this._mapSections();

    this._onSectionsStateChanges();
    this._onRouterEvents();

    // hard reload the entries upon navigating back from profile (by adding 'reloadEntriesListOnNavigateOut' to the queryParams)
    this._profileRoute.queryParams
      .cancelOnDestroy(this)
      .first()
      .subscribe(queryParams => {
        const reloadEntriesListOnNavigateOut = !!queryParams['reloadEntriesListOnNavigateOut']; // convert string to boolean
        if (reloadEntriesListOnNavigateOut) {
          this._saveProfileInvoked = reloadEntriesListOnNavigateOut;
        }
      });
  }

  private _onSectionsStateChanges(): void {
    this._widgetsManager.widgetsState$
      .cancelOnDestroy(this)
      .debounce(() => Observable.timer(500))
      .subscribe(
        sectionsState => {
          const newDirtyState = Object
            .keys(sectionsState)
            .reduce((result, sectionName) => result || sectionsState[sectionName].isDirty, false);

          if (this._profileIsDirty !== newDirtyState) {
            this._logger.info(`update profile is dirty state to ${newDirtyState}`);
            this._profileIsDirty = newDirtyState;

            this._updatePageExitVerification();

          }
        }
      );
  }

  private _updatePageExitVerification(): void {
    if (this._profileIsDirty) {
      this._pageExitVerificationToken = this._pageExitVerificationService.add();
    } else {
      if (this._pageExitVerificationToken) {
        this._pageExitVerificationService.remove(this._pageExitVerificationToken);
      }
      this._pageExitVerificationToken = null;
    }
  }

  ngOnDestroy() {
    if (this._loadProfileSubscription) {
      this._loadProfileSubscription.unsubscribe();
    }

    this._profile.data.complete();
    this._profile.state.complete();

    if (this._pageExitVerificationToken) {
      this._pageExitVerificationService.remove(this._pageExitVerificationToken);
    }

    if (this._saveProfileInvoked) {
      // this._entriesStore.reload();
    }
  }

  private _mapSections(): void {
    if (!this._profileRoute || !this._profileRoute.snapshot.data.profileRoute) {
      throw new Error('this service can be injected from component that is associated to the transcoding profile route');
    }

    this._profileRoute.snapshot.routeConfig.children.forEach(childRoute => {
      const routeSectionType = childRoute.data ? childRoute.data.sectionKey : null;

      if (routeSectionType !== null) {
        this._sectionToRouteMapping[routeSectionType] = childRoute.path;
      }
    });
  }

  private _onRouterEvents(): void {
    this._router.events
      .cancelOnDestroy(this)
      .subscribe(
        event => {
          if (event instanceof NavigationStart) {
          } else if (event instanceof NavigationEnd) {

            // we must defer the loadProfile to the next event cycle loop to allow components
            // to init them-selves when entering this module directly.
            setTimeout(() => {
              const currentProfileId = this._profileRoute.snapshot.params.id;
              const profile = this.profile.data();
              if (!profile || (profile && profile.id !== currentProfileId)) {
                this._loadProfile(currentProfileId);
              }
            });
          }
        }
      );
  }

  private _transmitSaveRequest(newProfile: KalturaConversionProfile) {
    this._profile.state.next({ action: ActionTypes.ProfileSaving });

    // const request = new KalturaMultiRequest(
    //   new BaseEntryUpdateAction({
    //     entryId: this.profileId,
    //     baseEntry: newProfile
    //   })
    // );
    //
    // this._widgetsManager.notifyDataSaving(newProfile, request, this.profile)
    //   .cancelOnDestroy(this)
    //   .tag('block-shell')
    //   .monitor('transcoding-profile store: prepare profile for save')
    //   .flatMap(
    //     prepareResponse => {
    //       if (prepareResponse.ready) {
    //         this._saveProfileInvoked = true;
    //
    //         return this._kalturaServerClient.multiRequest(request)
    //           .monitor('transcoding-profile store: save profile')
    //           .tag('block-shell')
    //           .map(
    //             saveResponse => {
    //               if (saveResponse.hasErrors()) {
    //                 this._profile.state.next({ action: ActionTypes.ProfileSavingFailed });
    //               } else {
    //                 this._loadProfile(this.profileId);
    //               }
    //
    //               return Observable.empty();
    //             }
    //           );
    //       } else {
    //         switch (prepareResponse.reason) {
    //           case OnDataSavingReasons.validationErrors:
    //             this._profile.state.next({ action: ActionTypes.ProfileDataIsInvalid });
    //             break;
    //           case OnDataSavingReasons.attachedWidgetBusy:
    //             this._profile.state.next({ action: ActionTypes.ActiveSectionBusy });
    //             break;
    //           case OnDataSavingReasons.buildRequestFailure:
    //             this._profile.state.next({ action: ActionTypes.ProfilePrepareSavingFailed });
    //             break;
    //         }
    //
    //         return Observable.empty();
    //       }
    //     }
    //   )
    //   .subscribe(
    //     response => {
    //       // do nothing - the service state is modified inside the map functions.
    //     },
    //     error => {
    //       // should not reach here, this is a fallback plan.
    //       this._profile.state.next({ action: ActionTypes.ProfileSavingFailed });
    //     }
    //   );
  }

  public saveProfile(): void {
    const newProfile = KalturaTypesFactory.createObject(this.profile.data());

    if (newProfile && newProfile instanceof KalturaConversionProfile) {
      this._transmitSaveRequest(newProfile);
    } else {
      console.error(new Error(`Failed to create a new instance of the profile type '${this.profile ? typeof this.profile : 'n/a'}`));
      this._profile.state.next({ action: ActionTypes.ProfilePrepareSavingFailed });
    }
  }

  public reloadProfile(): void {
    if (this.profileId) {
      this._loadProfile(this.profileId);
    }
  }

  private _loadProfile(profileId: number): void {
    if (this._loadProfileSubscription) {
      this._loadProfileSubscription.unsubscribe();
      this._loadProfileSubscription = null;
    }

    this._profileId = profileId;
    this._profileIsDirty = false;
    this._updatePageExitVerification();

    this._profile.state.next({ action: ActionTypes.ProfileLoading });
    this._widgetsManager.notifyDataLoading(profileId);

    this._loadProfileSubscription = this._getProfile(profileId)
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._profile.data.next(response);
          this._profileId = response.id;

          const dataLoadedResult = this._widgetsManager.notifyDataLoaded(response, { isNewData: false });
          if (dataLoadedResult.errors.length) {
            this._profile.state.next({
              action: ActionTypes.ProfileLoadingFailed,
              error: new Error(`one of the widgets failed while handling data loaded event`)
            });
          } else {
            this._profile.state.next({ action: ActionTypes.ProfileLoaded });
          }
        },
        error => {
          this._profile.state.next({ action: ActionTypes.ProfileLoadingFailed, error });

        }
      );
  }

  public openSection(sectionKey: string): void {
    const navigatePath = this._sectionToRouteMapping[sectionKey];

    if (navigatePath) {
      this._router.navigate([navigatePath], { relativeTo: this._profileRoute });
    }
  }

  private _getProfile(profileId: number): Observable<KalturaConversionProfile> {
    if (profileId) {
      // return this._kalturaServerClient.request(
      //   new BaseEntryGetAction({ entryId })
      // ).map(response => {
      //   if (response instanceof KalturaConversionProfile) {
      //     return response;
      //   } else {
      //     throw new Error(`invalid type provided, expected KalturaConversionProfile, got ${typeof response}`);
      //   }
      // });
    } else {
      return Observable.throw(new Error('missing profileId'));
    }
  }

  public openProfile(profileId: string): void {
    this.canLeave()
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          if (response.allowed) {
            this._router.navigate(['profile', profileId, 'metadata'], { relativeTo: this._profileRoute.parent });
          }
        }
      );
  }

  public canLeave(): Observable<{ allowed: boolean }> {
    return Observable.create(observer => {
      if (this._profileIsDirty) {
        this._browserService.confirm(
          {
            header: this._appLocalization.get('applications.settings.transcoding.profile.cancelEdit'),
            message: this._appLocalization.get('applications.settings.transcoding.profile.discard'),
            accept: () => {
              this._profileIsDirty = false;
              observer.next({ allowed: true });
              observer.complete();
            },
            reject: () => {
              observer.next({ allowed: false });
              observer.complete();
            }
          }
        );
      } else {
        observer.next({ allowed: true });
        observer.complete();
      }
    }).monitor('transcoding-profile store: check if can leave section without saving');
  }

  public returnToProfiles(): void {
    this._router.navigate(['settings/transcoding']);
  }
}
