export const routingAliases = {
  content: {
    bulkList: ['/content/bulk'],

    playlists: ['/content/playlists'],
    playlist(id: string | number, section?: string): string[] {
      let route = '/content/playlists/playlist/';
      if (!id) {
        throw Error('Playlist id is not provided')
      }

      route += `${id}/`;

      if (section) {
        route += section;
      }

      return [route];
    },
    newPlaylist(section: string): string[] {
      return this.playlist('new', section);
    },

    entries: ['/content/entries'],
    entry(id: string | number, section?: string): string[] {
      let route = '/content/entries/entry/';
      if (!id) {
        throw Error('Entry id is not provided')
      }

      route += `${id}/`;

      if (section) {
        route += section;
      }

      return [route];
    },

    categories: ['/content/categories'],
    category(id: string | number, section?: string): string[] {
      let route = '/content/categories/category/';
      if (!id) {
        throw Error('Category id is not provided')
      }

      route += `${id}/`;

      if (section) {
        route += section;
      }

      return [route];
    },
    newCategory(section: string): string[] {
      return this.category('new', section);
    },
  }
};
