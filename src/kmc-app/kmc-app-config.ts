import { KmcRouteViews } from 'app-shared/kmc-shared/kmc-views/kmc-route-views';

export interface KMCAppMenuItem {
    id: string | KmcRouteViews;
    routePath: string;
    titleToken: string;
    icon?: string;
    position?: string;
    children?: KMCAppMenuItem[];
    showSubMenu: boolean;
}

export interface KmcAppConfig {
  storageNamespace: string;
  kalturaServer: {
      expiry: number;
      privileges: string;
  },
  routing: {
    errorRoute: string;
    loginRoute: string;
  },
  menuItems: KMCAppMenuItem[];
  locales: {
    id: string;
    label: string;
  }[];
}


export const kmcAppConfig: KmcAppConfig = {
  'storageNamespace': 'kmc-ng',
  'kalturaServer': {
      "expiry": 86400,
      "privileges": "disableentitlement"
  },
  'routing': {
    'errorRoute': '/error',
    'loginRoute': '/login',
  },
  'menuItems': [],
  'locales': [
    {
      'id': 'en',
      'label': 'English'
    },
    {
      'id': 'de',
      'label': 'Deutsch'
    },
    {
      'id': 'es',
      'label': 'Español'
    },
    {
      'id': 'fr',
      'label': 'Français'
    },
    {
      'id': 'ja',
      'label': '日本語'
    }
  ]
};
