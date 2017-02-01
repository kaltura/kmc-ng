<a name="0.1.0-rc.1"></a>
# 0.1.0-rc.1 (2017-02-01)

## Features

**General -> KMCng theme**: Creation of KMCng theme based on the [style guide](https://projects.invisionapp.com/d/main#/projects/prototypes/9700090) provided by the UI/UX team.

**Entries list -> Entries Table**: A list of all entries with support for sorting, pagination, filtering, custom number of rows per page.

**Entries list -> Free text search**: Support free text entries search.

**Entries list -> Category Filters**: Support filtering entries by Categories. Support lazy loading for large categories data sets and special visualization for large amount of categories.

**Entries list -> Additional Filters**: Support additional filters.

**Entries list -> Metadata Filters**: Support metadata filters.

**Entries list -> Metadata Search**: Support free text search based on metadata profile values.

**Entries list -> Filters management**: Filters can be managed from within filter drop-downs as well as from filter tags list.

**Entries list -> Bulk Selection**: Multiple entries can be selected in the table exposing the Bulk operations menu and allowing bulk operation selection.



## Known Issues
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
