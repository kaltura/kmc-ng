# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.2.0"></a>
# [2.2.0](https://github.com/kaltura/KMCng/compare/v2.1.0...v2.2.0) (2017-06-11)


### Bug Fixes

* **content-entries:** highlight metadata in sections list when it contains validation errors ([582f7e1](https://github.com/kaltura/KMCng/commit/582f7e1))
* **content-entries / entry:** disable page exit verification check when leaving entry details without saving ([e428d92](https://github.com/kaltura/KMCng/commit/e428d92))


### Features

* upgrade Angular to version 4.x and any other library that depends on Angular (angular, prime, webpack, typescript) ([c6980dd](https://github.com/kaltura/KMCng/commit/c6980dd))
* **content-entries:** show partial selection state in categories/refine filters ([6a33f94](https://github.com/kaltura/KMCng/commit/6a33f94))
* **content-entries / entries:** show file sizes in various measurements (bytes, KB, MB, GB, TB, PB) in thumbnail and related sections ([226db93](https://github.com/kaltura/KMCng/commit/226db93))
* **content-playlists:** add playlists tab and update the upper menu ([877d8bd](https://github.com/kaltura/KMCng/commit/877d8bd))



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
