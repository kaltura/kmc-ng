

export class KalturaAPIException{
    code : string;
    message : string;

    static isMatch(response : any) : boolean
    {
        return response && response.objectType === "KalturaAPIException";
    }

    static create(response : any) : KalturaAPIException{
        let result : KalturaAPIException = null;
        if (KalturaAPIException.isMatch(response)){
            result = new KalturaAPIException();
            result.code = response.code;
            result.message = response.message;
        }

        return result;
    }
}