

export abstract class AppEvent{

    private _name: string;

    constructor(name: string)
    {
        if (!name)
        {
            throw new Error('[AppEvent]: an event name is required');
        }

        this._name = name;
    }

    get name():string{
        return this._name;
    }
}