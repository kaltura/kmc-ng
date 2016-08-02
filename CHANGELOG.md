# Changelog

## 2 Aug 2016

- Initial KMC-ng shell. Angular2(.rc4) based technology. 
- webpack based module loader
- KMC-ng bootstrap vanilla theme support (using scss version)
- Kaltura projects licensing AGPL3
- The 'dashboard' and 'content' kmc-apps show stub layout
- The 'studio' kmc-app
  - Demonstrates an hosted application 
  - Expects nginx configuration to proxy any calls for 'player-studio' to local repository of [player-studio](https://github.com/kaltura/player-studio).     

### Known issues
- The upper menu content is static and not loaded dynamically from a dedicated file.
- The 'studio' kmc-app gets a mock data from the kmc-ng shell including expired ks. To make it work you need to provide valid KS by modifying file `src/app/kmc-apps/studio-app/universal-studio/universal-studio.component.ts`.
