
export interface KmcAppConfig {
  storageNamespace: string;
  kalturaServer: {
      expiry: number;
      privileges: string;
  },
  routing: {
    errorRoute: string;
    loginRoute: string;
    defaultRoute: string;
  },
  locales: {
    id: string;
    label: string;
  }[];
}


export const kmcAppConfig: KmcAppConfig = {
  'storageNamespace': 'kmc-ng',
  'kalturaServer': {
      "expiry": 86400,
      "privileges": "disableentitlement,appid:kmc"
  },
  'routing': {
    'errorRoute': '/error',
    'loginRoute': '/login',
    'defaultRoute': '/',
  },
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
