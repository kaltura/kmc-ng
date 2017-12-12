import { SimpleTypeAdapterBase } from './simple-type-base';


export class StringTypeAdapter extends SimpleTypeAdapterBase<string> {
    protected _validateType(value: any) {
        if (value !== null && !(typeof value === 'string')) {
            throw new Error('invalid value type. expected value of type string');
        }
    }
}