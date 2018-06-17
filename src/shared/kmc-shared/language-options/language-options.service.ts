import { Injectable } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaLanguage } from 'kaltura-ngx-client';

@Injectable()
export class LanguageOptionsService {
    private _options: { value: string, label: string }[] = [];

    constructor(private _appLocalization: AppLocalization) {
        this._prepare();
    }

    private _prepare(): void {
        // load all supported languages
        this._options = [];
        const excludedLanguages = ['he', 'id', 'yi']; // duplicated languages TODO [KMCNG] - should be checked with backend
        for (const lang in KalturaLanguage) {
            if (lang !== 'en' && excludedLanguages.indexOf(lang) === -1) { // we push English to the top of the array after sorting
                const value = lang.toUpperCase();
                const label = this._appLocalization.get(`languages.${value}`);
                const hasTranslation = label.indexOf('languages.') === -1;
                if (hasTranslation) {
                    this._options.push({ value, label});
                }
            }
        }
        // sort the language array by language alphabetically
        this._options.sort((a, b) => {
            const x = a['label'];
            const y = b['label'];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        // put English on top
        this._options.unshift({ label: this._appLocalization.get('languages.EN'), value: 'EN' });
    }

    public get (): { value: string, label: string }[] {
        return this._options;
    }
}
