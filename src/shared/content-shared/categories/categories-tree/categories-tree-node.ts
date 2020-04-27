import { TreeNode } from "primeng/api";

export enum NodeChildrenStatuses
{
    missing,
    loading,
    error,
    loaded
}

export class CategoriesTreeNode implements TreeNode{

    // list of properties required by the interface which were not altered by CategoriesTreeNode
    public icon?: any;
    public expandedIcon?: any;
    public collapsedIcon?: any;
    public expanded?: boolean;
    public type?: string;
    public parent?: CategoriesTreeNode;
    public partialSelected?: boolean;

    // CategoriesTreeNode properties
    private _children : CategoriesTreeNode[] = null;
    private _childrenCount : number = null;
    private _childrenStatus: NodeChildrenStatuses = NodeChildrenStatuses.missing;
    public _childrenLoadError : string;
    public selectable : boolean = true;

    public get hasChildren() : boolean
    {
        return this._childrenCount != null && this._childrenCount > 0;
    }

    public expand() : void
    {
        // expand tree to show selected node
        let nodeParent= this.parent;
        while(nodeParent != null)
        {
            nodeParent.expanded = true;
            nodeParent = nodeParent.parent;
        }
    }

    constructor(public value: number, public label: string,  children : CategoriesTreeNode[] | number = null, public origin : any) {
        if (children !== null) {
            if (!isNaN(<any>children) && isFinite(<any>children)) {
                this.setChildrenCount(<number>children);
            } else {
                this.setChildren(<CategoriesTreeNode[]>children);
            }
        }
    }

    public get childrenStatus() : NodeChildrenStatuses
    {
        return this._childrenStatus;
    }

    public get childrenLoadError() : string
    {
        return this._childrenLoadError;
    }

    public get leaf() : boolean
    {
        return this._children !== null ? (this._children.length === 0) : (this._childrenCount == null || this._childrenCount === 0);
    }

    public get childrenCount() : number
    {
        return this._childrenCount !== null ? this._childrenCount : this._children ? this._children.length : 0;
    }

    public setChildrenLoadStatus(status : NodeChildrenStatuses, errorMessage? : string)
    {
        this._childrenStatus = status;
        this._childrenLoadError = errorMessage;
    }

    public setChildrenCount(value : number)
    {
        this._childrenCount = value;
        this._children = null;
        this.setChildrenLoadStatus(NodeChildrenStatuses.missing);
    }

    public setChildren(value :  CategoriesTreeNode[])
    {
        this._childrenCount = null;
        this._children = value;
        this.setChildrenLoadStatus(NodeChildrenStatuses.loaded);
    }

    public get children() : CategoriesTreeNode[]
    {
        return this._children;
    }



}
