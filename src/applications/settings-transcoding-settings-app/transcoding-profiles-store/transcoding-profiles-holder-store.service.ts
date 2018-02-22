import { Injectable, OnDestroy } from '@angular/core';
import { KalturaLiveParams } from 'kaltura-ngx-client/api/types/KalturaLiveParams';
import { FlavoursStore } from 'app-shared/kmc-shared';
import { Observable } from 'rxjs/Observable';
import { KalturaStorageProfile } from 'kaltura-ngx-client/api/types/KalturaStorageProfile';
import { StorageProfilesStore } from 'app-shared/kmc-shared/storage-profiles/storage-profiles-store.service';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { KalturaClient } from 'kaltura-ngx-client';

@Injectable()
export class TranscodingProfilesHolderStore implements OnDestroy {
  private _prepared = false;
  private _data = {
    remoteStorageProfiles: new BehaviorSubject<KalturaStorageProfile[]>([]),
    mediaFlavors: new BehaviorSubject<KalturaFlavorParams[]>([]),
    liveFlavors: new BehaviorSubject<KalturaLiveParams[]>([])
  };

  public readonly data = {
    remoteStorageProfiles: this._data.remoteStorageProfiles.asObservable(),
    mediaFlavors: this._data.mediaFlavors.asObservable(),
    liveFlavors: this._data.liveFlavors.asObservable(),
    rawData: () => ({
      remoteStorageProfiles: this._data.remoteStorageProfiles.getValue(),
      mediaFlavors: this._data.mediaFlavors.getValue(),
      liveFlavors: this._data.liveFlavors.getValue(),
    })
  };

  constructor(private _kalturaClient: KalturaClient,
              private _flavorsStore: FlavoursStore,
              private _storageProfilesStore: StorageProfilesStore) {
  }

  ngOnDestroy() {
    this._data.remoteStorageProfiles.complete();
    this._data.mediaFlavors.complete();
    this._data.liveFlavors.complete();
  }

  private _loadFlavors(): Observable<{ media: KalturaFlavorParams[], live: KalturaLiveParams[] }> {
    return this._flavorsStore.get()
      .cancelOnDestroy(this)
      .map(({ items }) => {
        const live = [];
        const media = [];
        items.forEach(flavor => {
          if (flavor instanceof KalturaLiveParams) {
            live.push(flavor);
          } else {
            media.push(flavor);
          }
        });

        return { media, live };
      })
      .catch((error) => {
        const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
        return Observable.throw(new Error(errorMessage));
      });
  }

  private _loadRemoteStorageProfiles(): Observable<KalturaStorageProfile[]> {
    const getEmptyRemoteStorageProfile = () => {
      const emptyProfile = new KalturaStorageProfile({ name: 'N/A' });
      (<any>emptyProfile).id = null;
      return emptyProfile;
    };

    return this._storageProfilesStore.get()
      .cancelOnDestroy(this)
      .map(({ items }) => [getEmptyRemoteStorageProfile(), ...items])
      .catch(() => Observable.of([getEmptyRemoteStorageProfile()]));
  }

  public prepare(): Observable<void> {
    if (this._prepared) { // skip if already prepared
      return Observable.empty();
    }

    return this._loadRemoteStorageProfiles()
      .switchMap(
        () => this._loadFlavors(),
        (remoteStorageProfiles, { media, live }) => ({ remoteStorageProfiles, media, live })
      )
      .do(({ remoteStorageProfiles, media, live }) => {
        this._data.remoteStorageProfiles.next(remoteStorageProfiles);
        this._data.mediaFlavors.next(media);
        this._data.liveFlavors.next(live);

        this._prepared = true;
      })
      .map(() => {
      });
  }
}
