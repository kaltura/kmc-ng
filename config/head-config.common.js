/**
 * Configuration for head elements added during the creation of index.html.
 *
 * All href attributes are added the publicPath (if exists) by default.
 * You can explicitly hint to prefix a publicPath by setting a boolean value to a key that has
 * the same name as the attribute you want to operate on, but prefix with =
 *
 */
module.exports = {
  link: [
    /** <link> tags for favicons **/
    { rel: "icon", type: "image/vnd.microsoft.icon",  href: "favicon.ico" },
    { rel: "stylesheet", type: "text/css",  href: "https://fonts.googleapis.com/css?family=Lato:400,700,900" }
  ],
  meta: [
    { name: "robots", content: "index, follow" },
    { name: "description", content: "Kaltura Management Console. Media Asset Management System. Video solutions for video streaming and video management. Kaltura - The Open Source Video Platform." },
    { name: "keywords", content: "production, shows, talent, discover, contribute, share, enhance, first open source video platform, video editing, media collaboration, online video, movie, wikimentaries, wiki" }
  ]
};
