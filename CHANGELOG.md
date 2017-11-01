<a name="3.2.0"></a>
# [3.2.0](https://github.com/kaltura/kmc-ng/compare/v3.1.0...v3.2.0) (2017-11-01)


### Bug Fixes

* app failure during bootstrap due to missing Translate module in app module ([23c066a](https://github.com/kaltura/kmc-ng/commit/23c066a))
* deploy kmc-ng with optimization of production mode


### Features

* prevent getting cached translation file when upgrading to new version ([02d43b0](https://github.com/kaltura/kmc-ng/commit/02d43b0))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/kaltura/kmc-ng/compare/v3.0.1...v3.1.0) (2017-10-30)


### Bug Fixes

* add missing tooltip for categories ([4d72635](https://github.com/kaltura/kmc-ng/commit/4d72635))
* add tooltip to category selector ([ee63f7c](https://github.com/kaltura/kmc-ng/commit/ee63f7c))
* caterories-tree style ([01761be](https://github.com/kaltura/kmc-ng/commit/01761be))
* change changelog popup layout ([d899ea1](https://github.com/kaltura/kmc-ng/commit/d899ea1))
* fix area blocker layout to be centered on screen in table viewes ([ae61eac](https://github.com/kaltura/kmc-ng/commit/ae61eac))
* fix jumpto logic to adjust to the new scroll system ([72d2abd](https://github.com/kaltura/kmc-ng/commit/72d2abd))
* KMCNG-389 reload player after save operation ([dbe9626](https://github.com/kaltura/kmc-ng/commit/dbe9626))
* KMCNG-660 flavors table layout fixes ([ea8ea3e](https://github.com/kaltura/kmc-ng/commit/ea8ea3e))
* KMCNG-801 add space before parenthesis ([515bab0](https://github.com/kaltura/kmc-ng/commit/515bab0))
* KMCNG-824 allow short names for owners ([24c5247](https://github.com/kaltura/kmc-ng/commit/24c5247))
* KMCNG-825 set autocomplete input field width so show the entire prompt text ([1b6d101](https://github.com/kaltura/kmc-ng/commit/1b6d101))
* KMCNG-825 set autocomplete input field width so show the entire prompt text (bulk actions) ([4a2a6cd](https://github.com/kaltura/kmc-ng/commit/4a2a6cd))
* KMCNG-825 typo fix ([58dc3b6](https://github.com/kaltura/kmc-ng/commit/58dc3b6))
* KMCNG-830 - fix download popup width ([2a2a8f7](https://github.com/kaltura/kmc-ng/commit/2a2a8f7))
* layout fixes for universal live ([f9f5120](https://github.com/kaltura/kmc-ng/commit/f9f5120))
* login screen layout fix for small resolutions ([3826366](https://github.com/kaltura/kmc-ng/commit/3826366))
* max 2 lines per entry/playlist/category name in table + tooltip ([c865485](https://github.com/kaltura/kmc-ng/commit/c865485))
* prevent crash during call prop on undefined ([a8bb174](https://github.com/kaltura/kmc-ng/commit/a8bb174))
* re-enable upload for entry flavor and captions using the new upload management ([8d24703](https://github.com/kaltura/kmc-ng/commit/8d24703))
* remove default type value, don't let save entry without file type ([26dc5bf](https://github.com/kaltura/kmc-ng/commit/26dc5bf))
* remove fake files used for testing of new layout ([150c174](https://github.com/kaltura/kmc-ng/commit/150c174))
* scroll page to top upon data table pagination ([7a41fb7](https://github.com/kaltura/kmc-ng/commit/7a41fb7))
* **content-entry:** set focus on the name field when entry metadata screen loads ([cee8f20](https://github.com/kaltura/kmc-ng/commit/cee8f20))
* set min height for tables ([281061a](https://github.com/kaltura/kmc-ng/commit/281061a))
* show specific error message on bulk delete error ([90a99fc](https://github.com/kaltura/kmc-ng/commit/90a99fc))
* update color for changelog mark (red -> green) ([a615248](https://github.com/kaltura/kmc-ng/commit/a615248))
* updated text input style ([bb7f596](https://github.com/kaltura/kmc-ng/commit/bb7f596))
* upload control sticky scroll layout ([2ad999e](https://github.com/kaltura/kmc-ng/commit/2ad999e))
* **content-entry:** invoke arrows recalculation in tags component after categories data is loaded ([27861cb](https://github.com/kaltura/kmc-ng/commit/27861cb))
* use new api provided by widgets infrastructure ([248896e](https://github.com/kaltura/kmc-ng/commit/248896e))
* **content-entry:** add "http://" to landing page URL if missing from URL prefix ([b5ebd97](https://github.com/kaltura/kmc-ng/commit/b5ebd97))
* user settings layout and z-indexing fixes ([9d53f74](https://github.com/kaltura/kmc-ng/commit/9d53f74))
* **content-entries:** disable "apply" button when no tags are selected for removal ([64ef2fe](https://github.com/kaltura/kmc-ng/commit/64ef2fe))
* **content-entries:** fix bulk remove tags and categories layout break when handling long names ([d512e66](https://github.com/kaltura/kmc-ng/commit/d512e66))
* **content-entries:** fix styling for scheduling bulk window title ([f5acc99](https://github.com/kaltura/kmc-ng/commit/f5acc99))
* **content-entries:** reverse order of bulk operations ([d3e1e27](https://github.com/kaltura/kmc-ng/commit/d3e1e27))
* **content-entries:** set default access control profile to be the first in the dropdown list in bulk access control settings ([c0c9ff8](https://github.com/kaltura/kmc-ng/commit/c0c9ff8))
* validate flavor file before upload, show error if file size exceed ([#220](https://github.com/kaltura/kmc-ng/issues/220)) ([3ac96b9](https://github.com/kaltura/kmc-ng/commit/3ac96b9))
* **content-entries:** typo fix in bulk access control panel ([83a4c0b](https://github.com/kaltura/kmc-ng/commit/83a4c0b))
* **content-entries:** updated bulk delete confirmation message to use entry names instead of entry IDs ([998f0b3](https://github.com/kaltura/kmc-ng/commit/998f0b3))
* **content-entry:** "View DRM Details" action is optional for flavors in status Error ([1553464](https://github.com/kaltura/kmc-ng/commit/1553464))
* **content-entry:** display N/A for DRM flavors with no start or end dates ([62ac4e8](https://github.com/kaltura/kmc-ng/commit/62ac4e8))
* **content-entry:** fix dropdown during scroll in related files and upload list ([6a3b57f](https://github.com/kaltura/kmc-ng/commit/6a3b57f))
* **login:** keep login button disabled during login process ([4763b58](https://github.com/kaltura/kmc-ng/commit/4763b58))
* **login:** updated placeholder text for user name and password fields ([8a87d6d](https://github.com/kaltura/kmc-ng/commit/8a87d6d))
* **shell:** submenu configuration fix ([dc53e10](https://github.com/kaltura/kmc-ng/commit/dc53e10))

### Features

* new scroll system & layout supporting dynamic sticky elements
* drill-down page layout redesign
* **upload:** upload from desktop: support parralel uploads
* **upload:** upload control view (list of active uploads and upload progress)
* **shell:** add change account per partner ([82f3201](https://github.com/kaltura/kmc-ng/commit/82f3201))
* add release notes popup ([5ad76ba](https://github.com/kaltura/kmc-ng/commit/5ad76ba))
* **shell:** support chunked upload file (remove 2Gb file size limitation) ([0c1e904](https://github.com/kaltura/kmc-ng/commit/0c1e904))
* issue a message when using Internet Explorer lower than 11 and prevent login ([3329b2e](https://github.com/kaltura/kmc-ng/commit/3329b2e))
* **upload:** add high speed upload link to upload menu ([ec6228c](https://github.com/kaltura/kmc-ng/commit/ec6228c))
* add scroll to top button ([cc2faf1](https://github.com/kaltura/kmc-ng/commit/cc2faf1))


### Technical Features

* add app events to allow communication between applications ([08cd89a](https://github.com/kaltura/kmc-ng/commit/08cd89a))
* add isIE11 public function to browser service and use it where needed to detect IE11 ([82429c6](https://github.com/kaltura/kmc-ng/commit/82429c6))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/kaltura/kmc-ng/compare/v3.0.0...v3.0.1) (2017-09-26)



<a name="3.0.0"></a>
# [3.0.0](https://github.com/kaltura/kmc-ng/compare/v2.3.1...v3.0.0) (2017-09-25)


### Bug Fixes

* entry related files - detect file type upon selection ([25b9289](https://github.com/kaltura/kmc-ng/commit/25b9289))
* **administration:** update screens accorind to new design ([49df64d](https://github.com/kaltura/kmc-ng/commit/49df64d))
* center login screen vertically in all resolutions ([5e19ed8](https://github.com/kaltura/kmc-ng/commit/5e19ed8))
* **content-entries:** created on header should come from localization instead of being hard-coded ([5885399](https://github.com/kaltura/kmc-ng/commit/5885399))
* **content-entries:** don't confirm chunk operation on bulk delete ([ebceb15](https://github.com/kaltura/kmc-ng/commit/ebceb15))
* **content-entries:** fix bulk dropdown position ([4fb75d0](https://github.com/kaltura/kmc-ng/commit/4fb75d0))
* **content-entries:** fix bulk menu misplaced position ([68e5835](https://github.com/kaltura/kmc-ng/commit/68e5835))
* **content-entries:** fix chunk size environment constant to be 50 ([0e30ad2](https://github.com/kaltura/kmc-ng/commit/0e30ad2))
* **content-entries:** hook delete icon to delete operation ([418f7fc](https://github.com/kaltura/kmc-ng/commit/418f7fc))
* **content-entries:** replace loading spinner with designed spinner ([4896d04](https://github.com/kaltura/kmc-ng/commit/4896d04))
* **content-entries:** rpopup-widget style ([8ea88d1](https://github.com/kaltura/kmc-ng/commit/8ea88d1))
* **content-entries:** rpopup-widget style ([ba85b50](https://github.com/kaltura/kmc-ng/commit/ba85b50))
* **content-entries:** set preferences window close button onside the window ([8361ff6](https://github.com/kaltura/kmc-ng/commit/8361ff6))
* **content-entry:** add caption UI alignment ([3811409](https://github.com/kaltura/kmc-ng/commit/3811409))
* **content-entry:** default sort by thumbnail dimensions ([48d0006](https://github.com/kaltura/kmc-ng/commit/48d0006))
* **content-entry:** disable preview & Embed link for entries with status other than "ready" ([bb913a1](https://github.com/kaltura/kmc-ng/commit/bb913a1))
* **content-entry:** fix calendar style ([75b5231](https://github.com/kaltura/kmc-ng/commit/75b5231))
* **content-entry:** fix calendar style ([c5f3577](https://github.com/kaltura/kmc-ng/commit/c5f3577))
* **content-entry:** fix file types for flavour upload (video and audio) ([386dc4b](https://github.com/kaltura/kmc-ng/commit/386dc4b))
* move search icon to theme repository ([6009faf](https://github.com/kaltura/kmc-ng/commit/6009faf))
* **content-entry:** fix landing page link when containing {entryId} ([d7ac748](https://github.com/kaltura/kmc-ng/commit/d7ac748))
* allow more space for caption file name on caption upload ([b8e823e](https://github.com/kaltura/kmc-ng/commit/b8e823e))
* beter condition for entry instance checking ([d0f06bd](https://github.com/kaltura/kmc-ng/commit/d0f06bd))
* entries table style fix ([4ffdc2f](https://github.com/kaltura/kmc-ng/commit/4ffdc2f))
* entry captions - allow selecting DFXP files ([0752a25](https://github.com/kaltura/kmc-ng/commit/0752a25))
* entry scheduling - allow calendar popup to overflow the entry details component so it won't get cut in low resolutions ([97cc99f](https://github.com/kaltura/kmc-ng/commit/97cc99f))
* entry scheduling - allow editing of date and time. Allow overflow of calendar popup ([3617484](https://github.com/kaltura/kmc-ng/commit/3617484))
* entry scheduling - clear dates marks the form as dirty ([17aa1db](https://github.com/kaltura/kmc-ng/commit/17aa1db))
* entry scheduling - set time zone syntax fix ([28ce05e](https://github.com/kaltura/kmc-ng/commit/28ce05e))
* fix change owner popup layout (height, margins) in entry details and bulk operation. Fix bug causing a crash when adding tooltip to the selected owner. ([4681097](https://github.com/kaltura/kmc-ng/commit/4681097))
* fix compilation issues due to merge ([8c62d15](https://github.com/kaltura/kmc-ng/commit/8c62d15))
* fix IE11 entry details screen width issue (panel exceeds screen width) ([a042ae1](https://github.com/kaltura/kmc-ng/commit/a042ae1))
* fixed logic in get entry operation ([abc6099](https://github.com/kaltura/kmc-ng/commit/abc6099))
* fixed styles for flavors table ([00f492f](https://github.com/kaltura/kmc-ng/commit/00f492f))
* fixed styles for flavors tags using a pipe ([a047320](https://github.com/kaltura/kmc-ng/commit/a047320))
* prevent double confirmation when navigating between entries with unsaved data ([bbf27ba](https://github.com/kaltura/kmc-ng/commit/bbf27ba))
* prevent ExpressionChangedAfterItHasBeenCheckedError error when initializing the edit panel ([c3681c5](https://github.com/kaltura/kmc-ng/commit/c3681c5))
* redirect to login when navigating to the root ([118e688](https://github.com/kaltura/kmc-ng/commit/118e688))
* resolve symlink version for workspace development ([52cb29c](https://github.com/kaltura/kmc-ng/commit/52cb29c))
* runtime issue when navigating to default route ([789989b](https://github.com/kaltura/kmc-ng/commit/789989b))
* typescript trnaspile errors during deployment to production ([f937423](https://github.com/kaltura/kmc-ng/commit/f937423))
* typo in label ([9424aa5](https://github.com/kaltura/kmc-ng/commit/9424aa5))
* update label for upload button ([94d2442](https://github.com/kaltura/kmc-ng/commit/94d2442))
* use new api provided by kaltura-ui for the form-manager module ([5be9d46](https://github.com/kaltura/kmc-ng/commit/5be9d46))
* verify leave entry details when data is not saved ([a0bd1b1](https://github.com/kaltura/kmc-ng/commit/a0bd1b1))
* **content-entry:** prevent VOD playback of live entries when video broadcast is offline (entry preview panel) ([8f6d08b](https://github.com/kaltura/kmc-ng/commit/8f6d08b))
* **content-entry:** set preview panel tooltips placement to the left ([f29c15d](https://github.com/kaltura/kmc-ng/commit/f29c15d))
* **content-entry:** set preview panel tooltips placement to the left ([ab38a16](https://github.com/kaltura/kmc-ng/commit/ab38a16))
* **content-entry:** set the default access control profile to be the first option in the drop-down list ([abe88a2](https://github.com/kaltura/kmc-ng/commit/abe88a2))
* **content-entry:** support line breaks in access control profile description ([c9300f7](https://github.com/kaltura/kmc-ng/commit/c9300f7))
* **content-playlists:** display an alert when trying to create a rule-based playlist instead of using the area blocker message ([6615ea6](https://github.com/kaltura/kmc-ng/commit/6615ea6))
* **settings-account-settings:** fix form styles ([466a222](https://github.com/kaltura/kmc-ng/commit/466a222))
* **shell:** move sherad configuration outside of environments/environment ([48556d9](https://github.com/kaltura/kmc-ng/commit/48556d9))


### Code Refactoring

* use angular-cli during the deployment process ([a31dd05](https://github.com/kaltura/kmc-ng/commit/a31dd05))


### Features

* **administration-roles:** add roles list, role edit/add/duplicate/delete. missing roles permission modification ([bcc79e5](https://github.com/kaltura/kmc-ng/commit/bcc79e5))
* **content:** entries bulk operations for delete, change owner, remove from category, download, access control ([c386c3d](https://github.com/kaltura/kmc-ng/commit/c386c3d))
* **content:** support categories list actions like reload, pagination and sorting ([2a32ca2](https://github.com/kaltura/kmc-ng/commit/2a32ca2))
* **content-categories:** add category details view (layout & basic functionality only) ([966d178](https://github.com/kaltura/kmc-ng/commit/966d178))
* **content-categories:** show categories list with basic implementation ([c220a6a](https://github.com/kaltura/kmc-ng/commit/c220a6a))
* **content-entries:** placeholders for missing bulk actions (add to new category, add to new playlist) ([ec8864a](https://github.com/kaltura/kmc-ng/commit/ec8864a))
* **content-playlists:** add new playlist wizard (currently support only manual playlist) ([9cdd1a1](https://github.com/kaltura/kmc-ng/commit/9cdd1a1))
* **content-playlists:** add section list navigation panel, show playlist details and loading notifications ([40496cb](https://github.com/kaltura/kmc-ng/commit/40496cb))
* **content-playlists:** bulk delete of playlists ([25a877a](https://github.com/kaltura/kmc-ng/commit/25a877a))
* add categories app (currently without content) and adjust the application routing accordingly ([fb40452](https://github.com/kaltura/kmc-ng/commit/fb40452))
* add growl support as part of the app services ([cf7d8b5](https://github.com/kaltura/kmc-ng/commit/cf7d8b5))
* add high speed upload link and fix upload window text labels ([0524232](https://github.com/kaltura/kmc-ng/commit/0524232))
* add login form, forgot password form, password expired and invalid login hash views ([0b1368b](https://github.com/kaltura/kmc-ng/commit/0b1368b))
* add npm script to easily checkout to the latest standalone commit ([0ca67e1](https://github.com/kaltura/kmc-ng/commit/0ca67e1))
* add studio (load in production build only) ([67a0597](https://github.com/kaltura/kmc-ng/commit/67a0597))
* add tool to extract dependency licenses ([0ca3649](https://github.com/kaltura/kmc-ng/commit/0ca3649))
* allow app minification by removing constraints on function names ([e7051e5](https://github.com/kaltura/kmc-ng/commit/e7051e5))
* notify the user that caption language is used when caption label is set to empty ([ca18dcc](https://github.com/kaltura/kmc-ng/commit/ca18dcc))
* playlist navigation between sections and warn when leaving before changes were saved ([eb37e66](https://github.com/kaltura/kmc-ng/commit/eb37e66))
* show upload menu when user clicks on the upload button in the application header ([57b4a79](https://github.com/kaltura/kmc-ng/commit/57b4a79))
* support auto-complete color and tooltip for manually added items ([31ebf26](https://github.com/kaltura/kmc-ng/commit/31ebf26))
* support confirmation multi lines message ([f060a6d](https://github.com/kaltura/kmc-ng/commit/f060a6d))
* **content/playlists:** add playlist metadata section supporting data loading and saving ([79290b5](https://github.com/kaltura/kmc-ng/commit/79290b5))
* support external media entries ([7c8e1ea](https://github.com/kaltura/kmc-ng/commit/7c8e1ea))
* support language file hash to bypass browser cache upon application upgrade ([3b102dd](https://github.com/kaltura/kmc-ng/commit/3b102dd))
* upgrade PrimeNG to v4.1.0 ([7ca9be2](https://github.com/kaltura/kmc-ng/commit/7ca9be2))


### Performance Improvements

* import kaltura-typescript-client object explicitly to bundle only elements being used ([#163](https://github.com/kaltura/kmc-ng/issues/163)) ([9597b5e](https://github.com/kaltura/kmc-ng/commit/9597b5e))
* upgrade PrimeNG version to 4.1.3 to gain datagrid performances enhancements ([a459304](https://github.com/kaltura/kmc-ng/commit/a459304))


### BREAKING CHANGES

* To support the angular-cli process we performed some adjustments:
- kaltura ng libraries were renamed from `@kaltura-ng2` to `@kaltura-ng`.
- kaltura ng libraries build process uses ngc instead of tsc.
- kaltura typescript client lib `types/all` imports were changed to import types explicitly.
- kaltura theme was moved from the repo outside to a separated theme repo. previously imported theme from `~kmcng-theme/scss/variables`. use `app-styles/_variables.scss`instead.
- the configuration data was merged into angular-cli environment infrastructure and is now accessible by importing `environment` from `app-environment`
- kmc-shell was moved into `app-shared`
- css class `kUseKMCngIcons` was replaced with `kOverrideFAIcons`



<a name="2.3.1"></a>
## [2.3.1](https://github.com/kaltura/KMCng/compare/v2.3.0...v2.3.1) (2017-06-13)

### Bug Fixes

* **content-entries / entries:** fix tree height to show all nodes upon scroll down


<a name="2.3.0"></a>
# [2.3.0](https://github.com/kaltura/KMCng/compare/v2.2.2...v2.3.0) (2017-06-13)


### Bug Fixes

* **content-entries:** fix entries view > refine filter popup > schedule filter.
* prevent creation of multiple tooltip instances

### Features

* **content-entries / entry:** new layout for entry details view>metadata section>categories selector popup. ([5d0b84d](https://github.com/kaltura/KMCng/commit/5d0b84d))
* update style of auto-complete to match the new provided style.


### Performance Improvements

* **content-entries:** improved change detection of changes in the refine filters ([557b851](https://github.com/kaltura/KMCng/commit/557b851))
* **content-entries:** instantiate refine component only when showing the popup and destroy it once closed. remove heavy change detection of multiple tree components ([55c9afd](https://github.com/kaltura/KMCng/commit/55c9afd))



<a name="2.2.2"></a>
## [2.2.2](https://github.com/kaltura/KMCng/compare/v2.2.1...v2.2.2) (2017-06-12)


### Bug Fixes

* **content-entries:** make sure changes in entries are shown when returning from entry details view ([1268ed9](https://github.com/kaltura/KMCng/commit/1268ed9))



<a name="2.2.1"></a>
## [2.2.1](https://github.com/kaltura/KMCng/compare/v2.2.0...v2.2.1) (2017-06-11)


### Bug Fixes

* **content-entries:** fix out-of-sync issue in the categories tree when selecting a parent of already selected node. ([bb1a9da](https://github.com/kaltura/KMCng/commit/bb1a9da))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/kaltura/KMCng/compare/v2.1.0...v2.2.0) (2017-06-11)


### Bug Fixes

* **content-entries:** highlight metadata in sections list when it contains validation errors ([582f7e1](https://github.com/kaltura/KMCng/commit/582f7e1))
* **content-entries / entry:** disable page exit verification check when leaving entry details without saving ([e428d92](https://github.com/kaltura/KMCng/commit/e428d92))
* **content-entries:** restore active filters when returning from entry details (sort, pagination, selected categories and refine filters).
* **content-entries / entry**: Preview and Embed link (in Entry Details) is hidden for 'Media-Less' entries
* **content-entries / entry**: Remove popups when leaving the view they belong to ('jump to' floating in entry metadata)
* **content-entries / entry**: Allow user sorting of Thumbnail section table.
* **style**: various style issues


### Features

* upgrade Angular to version 4.x and any other library that depends on Angular (angular, prime, webpack, typescript) ([c6980dd](https://github.com/kaltura/KMCng/commit/c6980dd))
* **content-entries:** show partial selection state in categories/refine filters ([6a33f94](https://github.com/kaltura/KMCng/commit/6a33f94))
* **content-entries / entries:** show file sizes in various measurements (bytes, KB, MB, GB, TB, PB) in thumbnail and related sections ([226db93](https://github.com/kaltura/KMCng/commit/226db93))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/kaltura/KMCng/compare/v2.0.1...v2.1.0) (2017-05-28)


### Bug Fixes

* **content-entries:** change filters names in additional filters that are not listed as in the same order as in legacy KMC ([b7857dc](https://github.com/kaltura/KMCng/commit/b7857dc))
* **content-entries / entry:** style fixes for floaters ([9cce3f0](https://github.com/kaltura/KMCng/commit/9cce3f0))
* **content-entries / entry:** Universal live - set the section global validation status when validating bitrate changes ([7f9025e](https://github.com/kaltura/KMCng/commit/7f9025e))
* **content-entries / entry:** Universal live - set the section global validation status when validating bitrate changes ([71fe181](https://github.com/kaltura/KMCng/commit/71fe181))
* **content-entries:** fix creation filter tooltip in additional filters ("From" instead of "After", "Until" instead of "Before") ([971c50d](https://github.com/kaltura/KMCng/commit/971c50d))
* **content-entries:** make sure scheduling filter allows setting custom scheduling along with other scheduling filter types ([7396e59](https://github.com/kaltura/KMCng/commit/7396e59))
* **content-entries / entry:** fix metadata section custom metadata forms style ([a4c5160](https://github.com/kaltura/KMCng/commit/a4c5160))


### Features

* **content-entries / entry:** add last update field display in the entry preview panel ([e12477e](https://github.com/kaltura/KMCng/commit/e12477e))
* **content-entries / entry:** notify user before leaving entry details without saving changed data ([eb5a5a2](https://github.com/kaltura/KMCng/commit/eb5a5a2))
* **content-entries / entry:** use category selector popup to select/unselect entry categories in  entry metadata section ([8fd4035](https://github.com/kaltura/KMCng/commit/8fd4035))
* **content-entries / entry:** show linked entries component in entry metadata schema and allow delete/reorder of entries ([52ebefc](https://github.com/kaltura/KMCng/commit/52ebefc))
* **shell:** enable and disable page leave verification + custom message (for supporting browsers) ([706bd18](https://github.com/kaltura/KMCng/commit/706bd18))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/kaltura/KMCng/compare/v2.0.0...v2.0.1) (2017-05-16)


### Bug Fixes

* prevent users section from failing during save when adding publisher to a new entry ([d23b2a1](https://github.com/kaltura/KMCng/commit/d23b2a1))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/kaltura/KMCng/compare/v0.1.0-rc.4...v2.0.0) (2017-05-16)

## Features
- **Entry Details -> Entry details panel**: Entries navigation, data saving, error handling and recovering 
- **Entry Details -> Entry preview panel**: Entry preview and basic details listing
- **Entry Details -> Metadata**: Entry metadata management (basic and custom scheme)
- **Entry Details -> Thumbnails**: Entry thumbnails management
- **Entry Details -> Access control**: Access control management
- **Entry Details -> Scheduling**: Scheduling setup
- **Entry Details -> Flavors**: Entry flavors management
- **Entry Details -> Captions**: Entry captions management
- **Entry Details -> Related files**: Entry related files management
- **Entry Details -> Live**: Manual and Universal live details and setup
- **Entry Details -> Clips**: Entry clips summary
- **Entry Details -> Users**: Entry users management

<a name="0.1.0-rc.4"></a>
# [0.1.0-rc.4](https://github.com/kaltura/KMCng/compare/v0.1.0-rc.3...v0.1.0-rc.4) (2017-02-27)

## Features
- **Entries list -> Entries Table**: Add tooltips to media type column.
- **Entries list -> Category Filters**: Search for categories with auto-complete. Support both default mode when nodes are loaded upon initialize and when lazy loading tree nodes.
- **Entries list -> Refine filters**: Correct start/end date filter times (start dates are adjusted to 00:00:00, end dates are adjusted to 23:59:59). 

## Bugs
- **Entries list -> Entries Table**: Fix some quirks with the bulk selection.
- **Entries list -> Entries Table**: Fix default sort order.

---

<a name="0.1.0-rc.3"></a>
# [0.1.0-rc.3](https://github.com/kaltura/KMCng/compare/v0.1.0-rc.2...v0.1.0-rc.3) (2017-02-20)

## Features
- **General**: Update libraries version

---

<a name="0.1.0-rc.2"></a>
# [0.1.0-rc.2](https://github.com/kaltura/KMCng/compare/v0.1.0-rc.1...v0.1.0-rc.2) (2017-02-09)

### Features

- **Entries list -> Entries Table**: Implement entry status logic.

- **General -> logout**: The logout process was implemented with basic support. It will be handled as part of future delivry. At the moment, logout from the application will clear cache and reload the application.

- **DevOp**: Upgrade dev dependencies:
  - Upgrade webpack to 2.x and all its' loaders accordingly.
  - Upgrade typescript to 2.2.x.
  - Remove typings usage.
  - Add @Types dependencies.
 
- **DevOp**: Optimize build process and deployed package: 
  - Reduce javascript bundle sized.
  - Minify javascript code.
  - Lazy loading support for views.
  - Angular2 component template & styles support.
  - Theme bundling and assets re-organization.
  - Enable Angular runtime production mode.
  - Enable [angular debug tools](https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md).  
  
 
- **DevOp**: Print application version in console during app load.



### Bug Fixes

- **Login**: fix broken 'download user manual' link.

---

<a name="0.1.0-rc.1"></a>
# 0.1.0-rc.1 (2017-02-01)

### Features

- **General -> KMCng theme**: Creation of KMCng theme based on the [style guide](https://projects.invisionapp.com/d/main#/projects/prototypes/9700090) provided by the UI/UX team.

- **Entries list -> Entries Table**: A list of all entries with support for sorting, pagination, filtering, custom number of rows per page.

- **Entries list -> Free text search**: Support free text entries search.

- **Entries list -> Category Filters**: Support filtering entries by Categories. Support lazy loading for large categories data sets and special visualization for large amount of categories.

- **Entries list -> Additional Filters**: Support additional filters.

- **Entries list -> Metadata Filters**: Support metadata filters.

- **Entries list -> Metadata Search**: Support free text search based on metadata profile values.

- **Entries list -> Filters management**: Filters can be managed from within filter drop-downs as well as from filter tags list.

- **Entries list -> Bulk Selection**: Multiple entries can be selected in the table exposing the Bulk operations menu and allowing bulk operation selection.

### Known Issues
**Entries -> Search categories**: This feature is currently under development and will be released shortly.

**KMCng Login process**: The login process presents basic abilities needed to access the entries list. It lacks graphic design and addtional screens (register, forgot password etc.). It contains the following:
- A basic login form.
- Fetching minimal information about the user/partner required for the entries list.
- Log-out process (basic support only)

**Upper Menu Icons**: The upper menu icons are partially active. The Help menu opens a dropdown placeholder (not functional). The user icon opens a dropdown allowing logout. All other options in this menu are just placeholders.

**Localization**: The current version contains a localization mechanism. Currently, only English is available. Selecting other languages doesn't apply.

**Entries Permissions**: The permissions mechanism is currently under design and is not part of this release.

**Entry Drill-down**: Entry drill-down is not part of this drop. Clicking an entry name or selecting an action from the entry actions menu doesn't invoke drill-down.

**Bulk Operations**: Bulk operations are supported in the entries list screen. However, the actual operations cannot be invoked in this version.
