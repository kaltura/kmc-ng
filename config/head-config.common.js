/**
 * Configuration for head elements added during the creation of index.html.
 *
 * All href attributes are added the publicPath (if exists) by default.
 * You can explicitly hint to prefix a publicPath by setting a boolean value to a key that has
 * the same name as the attribute you want to operate on, but prefix with =
 *
 * Example:
 * { name: "msapplication-TileImage", content: "/assets/icon/ms-icon-144x144.png", "=content": true },
 * Will prefix the publicPath to content.
 *
 * { rel: "apple-touch-icon", sizes: "57x57", href: "/assets/icon/apple-icon-57x57.png", "=href": false },
 * Will not prefix the publicPath on href (href attributes are added by default
 *
 */
module.exports = {
  link: [
    /** <link> tags for favicons **/
    { rel: "icon", type: "image/vnd.microsoft.icon",  href: "favicon.ico" }
  ],
  meta: [
    { name: "robots", content: "index, follow" },
    { name: "description", content: "Kaltura Management Console. Media Asset Management System. Video solutions for video streaming and video management. Kaltura - The Open Source Video Platform." },
    { name: "keywords", content: "production, shows, talent, discover, contribute, share, enhance, first open source video platform, video editing, media collaboration, online video, movie, wikimentaries, wiki" }
  ]
};
