import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

@Component({
    selector: 'kmc-player-preview',
    templateUrl: './player-preview.component.html',
    styleUrls: ['./player-preview.component.scss']
})
export class PlayerPreviewComponent implements OnInit {
    @Input() content: string;
    @ViewChild('previewIframe') previewIframe: ElementRef;

    ngOnInit() {
        const style = '<style>html, body {margin: 0; padding: 0; width: 100%; height: 100%; } #framePlayerContainer {margin: 0 auto; padding-top: 20px; text-align: center; } object, div { margin: 0 auto; }</style>';
        const newDoc = this.previewIframe.nativeElement.contentDocument;
        newDoc.open();
        newDoc.write('<!doctype html><html><head>' + style + '</head><body><div id="framePlayerContainer">' + this.content + '</div></body></html>');
        newDoc.close();
    }
}
