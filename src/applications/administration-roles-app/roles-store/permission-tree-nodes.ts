import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions/kmc-permissions';

export interface PermissionTreeNode {
  value: KMCPermissions;
  name?: string; // the name will be added by the service
  label: string;
  isAdvancedGroup?: boolean;
  items?: PermissionTreeNode[];
  noChildren?: boolean;
}

export const PermissionTreeNodes: PermissionTreeNode[] = [
  {
    value: KMCPermissions.CONTENT_INGEST_BASE,
    label: 'Content Ingestion',
    isAdvancedGroup: false,
    items: [
        {
            value: KMCPermissions.CONTENT_INGEST_UPLOAD,
            label: 'Upload from Desktop'
        },
      {
        value: KMCPermissions.CONTENT_INGEST_BULK_UPLOAD,
        label: 'Import Files & Bulk Upload'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_REMOTE_STORAGE,
        label: 'Set Link to Files on Remote Storage'
      },
      {
        value: KMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_MATCH,
        label: 'Match Media Files from Drop Folder'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_EXTERNAL_SEARCH,
        label: 'Import from Web',
      },
      {
        value: KMCPermissions.CONTENT_INGEST_WEBCAM,
        label: 'Record from Webcam',
      },
      {
        value: KMCPermissions.CONTENT_INGEST_ORPHAN_VIDEO,
        label: 'Prepare Video Entry',
      },
      {
        value: KMCPermissions.CONTENT_INGEST_ORPHAN_AUDIO,
        label: 'Prepare Audio Entry',
      },
      {
        value: KMCPermissions.LIVE_STREAM_ADD,
        label: 'Prepare Live Stream Entry'
      },
    ]
  },
  {
    value: KMCPermissions.CONTENT_MANAGE_BASE,
    label: 'Content Management',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.CONTENT_MANAGE_METADATA,
        label: 'Modify Metadata'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_REFERENCE_MODIFY,
        label: 'View / Modify Reference name'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_ASSIGN_CATEGORIES,
        label: 'Modify Entry\'s Category'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_THUMBNAIL,
        label: 'Modify Thumbnail'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_SCHEDULE,
        label: 'Modify Scheduling'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_ACCESS_CONTROL,
        label: 'Modify Access Control'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_CUSTOM_DATA,
        label: 'Modify Custom Data'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_ENTRY_USERS,
        label: 'Modify Entry\'s User Settings'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_DELETE,
        label: 'Delete Content'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_EMBED_CODE,
        label: 'Grab Embed Code'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_INTO_ORPHAN,
        label: 'Add Media to an Entry'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_INTO_READY,
        label: 'Replace Entry\'s Media'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_REPLACE,
        label: 'Approve Media Replacement'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_RECONVERT,
        label: 'Manage Flavors'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_CLIP_MEDIA,
        label: 'Clipping'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_EDIT_CATEGORIES,
        label: 'Edit Categories'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_CATEGORY_USERS,
        label: 'Edit Category\'s Entitlement Settings'
      },
      {
        value: KMCPermissions.LIVE_STREAM_UPDATE,
        label: 'Update Live Stream'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_DOWNLOAD,
        label: 'Download Files'
      },
      {
        value: KMCPermissions.CUEPOINT_MANAGE,
        label: 'Edit Entry Advertisement'
      },
      {
        value: KMCPermissions.CAPTION_MODIFY,
        label: 'Edit Entry Captions'
      },
      {
        value: KMCPermissions.ATTACHMENT_MODIFY,
        label: 'Edit Related Files'
      }
    ]
  },
  {
    value: KMCPermissions.BULK_LOG_BASE,
    label: 'Bulk Upload Log',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.BULK_LOG_DOWNLOAD,
        label: 'Download Bulk Upload Files'
      },
      {
        value: KMCPermissions.BULK_LOG_DELETE,
        label: 'Delete Bulk Upload Items'
      }
    ]
  },
  {
    value: KMCPermissions.CONTENT_MODERATE_BASE,
    label: 'Content Moderation',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.CONTENT_MODERATE_APPROVE_REJECT,
        label: 'Approve/Reject Content'
      },
      {
        value: KMCPermissions.CONTENT_MODERATE_METADATA,
        label: 'Moderate Metadata'
      },
      {
        value: KMCPermissions.CONTENT_MODERATE_CUSTOM_DATA,
        label: 'Moderate Custom Metadata'
      }
    ]
  },
  {
    value: KMCPermissions.PLAYLIST_BASE,
    label: 'Playlist Management',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.PLAYLIST_ADD,
        label: 'Create Playlists'
      },
      {
        value: KMCPermissions.PLAYLIST_UPDATE,
        label: 'Modify Playlists'
      },
      {
        value: KMCPermissions.PLAYLIST_DELETE,
        label: 'Delete Playlists'
      },
      {
        value: KMCPermissions.PLAYLIST_EMBED_CODE,
        label: 'Grab Playlist Embed Code'
      }
    ]
  },
  {
    value: KMCPermissions.SYNDICATION_BASE,
    label: 'Syndication Management',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.SYNDICATION_ADD,
        label: 'Create Syndication Feeds'
      },
      {
        value: KMCPermissions.SYNDICATION_UPDATE,
        label: 'Modify Syndication Feeds'
      },
      {
        value: KMCPermissions.SYNDICATION_DELETE,
        label: 'Delete Syndication Feeds'
      }
    ]
  },
  {
    value: KMCPermissions.CONTENT_MANAGE_DISTRIBUTION_BASE,
    label: 'Content Distribution',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.CONTENT_MANAGE_DISTRIBUTION_WHERE,
        label: 'Select Distribution Points'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_DISTRIBUTION_SEND,
        label: 'Distribute'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_DISTRIBUTION_REMOVE,
        label: 'Remove Distributed Content'
      }
    ]
  },
  {
    value: KMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_BASE,
    label: 'Drop Folders Control',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_DELETE,
        label: 'Delete Files'
      }
    ]
  },
  {
    value: KMCPermissions.STUDIO_BASE,
    label: 'Studio',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.STUDIO_ADD_UICONF,
        label: 'Create Players'
      },
      {
        value: KMCPermissions.STUDIO_UPDATE_UICONF,
        label: 'Modify Players'
      },
      {
        value: KMCPermissions.STUDIO_DELETE_UICONF,
        label: 'Delete Players'
      },
      {
        value: KMCPermissions.STUDIO_SELECT_CONTENT,
        label: 'Select Player Content'
      }
    ]
  },
  {
    value: KMCPermissions.ADVERTISING_UPDATE_SETTINGS,
    label: 'Set Advertising Settings',
    noChildren: true
  },
  {
    value: KMCPermissions.ANALYTICS_BASE,
    label: 'Video Analytics',
    noChildren: true
  },
  {
    value: KMCPermissions.ACCOUNT_BASE,
    label: 'Account Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.ACCOUNT_UPDATE_SETTINGS,
        label: 'Modify Account Settings'
      }
    ]
  },
  {
    value: KMCPermissions.INTEGRATION_BASE,
    label: 'Integration Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.INTEGRATION_UPDATE_SETTINGS,
        label: 'Modify Integration Settings'
      }
    ]
  },
  {
    value: KMCPermissions.ACCESS_CONTROL_BASE,
    label: 'Access Control Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.ACCESS_CONTROL_ADD,
        label: 'Create Access Control Profiles'
      },
      {
        value: KMCPermissions.ACCESS_CONTROL_UPDATE,
        label: 'Modify Access Control Profiles'
      },
      {
        value: KMCPermissions.ACCESS_CONTROL_DELETE,
        label: 'Delete Access Control Profiles'
      }
    ]
  },
  {
    value: KMCPermissions.TRANSCODING_BASE,
    label: 'Transcoding Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.TRANSCODING_ADD,
        label: 'Create Transcoding Profiles'
      },
      {
        value: KMCPermissions.TRANSCODING_UPDATE,
        label: 'Modify Transcoding Profiles'
      },
      {
        value: KMCPermissions.TRANSCODING_DELETE,
        label: 'Delete Transcoding Profiles'
      }
    ]
  },
  {
    value: KMCPermissions.CUSTOM_DATA_PROFILE_BASE,
    label: 'Custom Metadata Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.CUSTOM_DATA_PROFILE_ADD,
        label: 'Add Custom Metadata Schemas'
      },
      {
        value: KMCPermissions.CUSTOM_DATA_PROFILE_UPDATE,
        label: 'Modify Custom Metadata Schemas'
      },
      {
        value: KMCPermissions.CUSTOM_DATA_PROFILE_DELETE,
        label: 'Delete Custom Metadata Schemas'
      }
    ]
  },
    {
        value: KMCPermissions.APP_TOKEN_BASE,
        label: 'Application Token',
        isAdvancedGroup: true,
        items: [
            {
                value: KMCPermissions.APP_TOKEN_ADD,
                label: 'Create Token'
            },
            {
                value: KMCPermissions.APP_TOKEN_UPDATE,
                label: 'Modify Token'
            },
            {
                value: KMCPermissions.APP_TOKEN_DELETE,
                label: 'Delete Token'
            }
        ]
    },
    {
        value: KMCPermissions.ADMIN_BASE,
        label: 'Administration',
        isAdvancedGroup: true,
        items: [
            {
                value: KMCPermissions.ADMIN_USER_ADD,
                label: 'Create Users'
            },
            {
                value: KMCPermissions.ADMIN_USER_UPDATE,
                label: 'Modify Users'
            },
            {
                value: KMCPermissions.ADMIN_USER_DELETE,
                label: 'Delete Users'
            },
            {
                value: KMCPermissions.ADMIN_ROLE_ADD,
                label: 'Create Roles'
            },
            {
                value: KMCPermissions.ADMIN_ROLE_UPDATE,
                label: 'Modify Roles'
            },
            {
                value: KMCPermissions.ADMIN_ROLE_DELETE,
                label: 'Delete Roles'
            },
            {
                value: KMCPermissions.ADMIN_USER_BULK,
                label: 'End-User Bulk Upload'
            }
        ]
    },
    {
        value: KMCPermissions.KMC_ACCESS,
        label: 'KMC Access',
        noChildren: true
    },
    {
        value: KMCPermissions.FEATURE_MEDIA_REPURPOSING_NG_PERMISSION,
        label: 'Automation Manager',
        noChildren: true
    }
];
