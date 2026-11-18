// Returns the icon class (see _document-thumbnail.scss) for a document entry, derived from its name's file extension.
export function getDocumentThumbnailClass(name: string): string {
    let type = 'default';
    // try to get document type by file extension
    if (name && name.indexOf('.') > -1) {
        const arr = name.split('.');
        const extension = arr[arr.length - 1].toLowerCase(); // get the last array item
        type = ['doc','docx','odt','rtf','tex','txt','wpd'].indexOf(extension) > -1 ? 'document' : type;
        type = extension === 'pdf' ? 'pdf' : type;
        type = ['xls','xlsx','xlsm','ods','csv'].indexOf(extension) > -1 ? 'spreadsheet' : type;
        type = ['key','odp','pps','ppt','pptx'].indexOf(extension) > -1 ? 'presentation' : type;
        type = ['mp3', 'aif', 'cda', 'mid', 'mp3', 'mpa', 'ogg', 'wav', 'wma', 'wpl'].indexOf(extension) > -1 ? 'audio' : type;
        type = ['ai' ,'jpg', 'bmp', 'gif', 'ico', 'jpeg', 'png', 'ps' , 'psd', 'svg', 'tif'].indexOf(extension) > -1 ? 'image' : type;
        type = ['7z', 'arj', 'deb', 'pkg', 'rar', 'rpm', 'tar', 'gz', 'z', 'zip'].indexOf(extension) > -1 ? 'archive' : type;
        type = ['3g2', '3gp', 'avi', 'flv', 'h264', 'm4v', 'mkv', 'mov', 'mp4', 'mpg', 'rm', 'swf', 'vob' ,'wmv'].indexOf(extension) > -1 ? 'video' : type;
    }
    return type;
}
