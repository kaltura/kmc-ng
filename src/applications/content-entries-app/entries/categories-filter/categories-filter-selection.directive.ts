import { Directive, Input, AfterContentInit, Self, Output, EventEmitter } from '@angular/core';
import { Tree, TreeNode } from 'primeng/primeng';
import { PrimeTreeNode } from '@kaltura-ng2/kaltura-primeng-ui';


import * as $ from 'jquery'

/**
 * List of supported modes by the TreeSelection directive.
 */
export enum TreeSelectionModes
{
    Self = 0,
    SelfAndChildren = 1,
    PrimeDefault = 2
}

/**
 * List of origins that can trigger a selection change.
 */
export enum TreeSelectionChangedOrigins
{
    SelectItems,
    UnselectItems,
    UnselectAll,
    UserSelection
}

/**
 * Context to be provided by the 'onTreeSelectionChanged' event.
 */
export interface OnSelectionChangedArgs
{
    added: PrimeTreeNode[];
    removed: PrimeTreeNode[];
    origin : TreeSelectionChangedOrigins;
};

@Directive({
    selector: 'p-tree[kCategoriesFilterSelection]',
})
export class CategoriesFilterSelection implements AfterContentInit {

    /**
     * An optional context to be attached to the tree selection directive
     * @type {any}
     */
    @Input() treeSelectionContext : any = "";

    /**
     * The mode to be used by this tree selection directive
     * @type {TreeSelectionModes}
     */
    @Input()  treeSelectionMode : TreeSelectionModes = TreeSelectionModes.Self;

    /**
     * Event to be emitted when the tree selection items were changed.
     * @type {EventEmitter<OnSelectionChangedArgs>}
     */
    @Output() onTreeSelectionChanged: EventEmitter<OnSelectionChangedArgs> = new EventEmitter<OnSelectionChangedArgs>();

    constructor(@Self() private _tree: Tree) {
    }

    ngAfterContentInit() {
        if (this._tree) {
            this._tree.selectionMode = "checkbox";
            this._tree.propagateSelectionDown = false;
            this._tree.propagateSelectionUp = false;
            this._overrideTreeFunctions();
        }
    }

    /**
     * Select items that are matching the provided tree nodes
     * @param items
     */
    public selectItems(items: PrimeTreeNode[]): void {
        this._selectItems(items);
    }

    /**
     * Unselect items that are matching the provided tree nodes
     * @param items
     */
    public unselectItems(items: PrimeTreeNode[]): void {
        this._unselectItems(items,TreeSelectionChangedOrigins.UnselectItems);
    }

    /**
     * Unselect all items currently selected for that tree
     */
    public unselectAll() : void{
        if (this._tree.selection) {
            this._unselectItems(this._tree.selection, TreeSelectionChangedOrigins.UnselectAll);
        }
    }

    /**
     * Get all the items currently selected for that tree
     * @returns {[any]|Array}
     */
    public getSelections() : PrimeTreeNode[]
    {
        return this._tree.selection ? [...this._tree.selection] : [];
    }

    /**
     * Select items that are matching the provided tree nodes and emit 'onTreeSelectionChanged' event if needed
     * @param items
     * @private
     */
    private _selectItems(items: PrimeTreeNode[]): void {
        if (items) {

            let itemsToAdd :  PrimeTreeNode[] = null;
            // get a list of all the items that are currently unselected
            // it is important to get that list before performing the actual selection list changes
            // since some items might has side-effects that can remove other items as well that should be addressed.
            // testable scenario: 1. select 'Media Types' (will cause to selection of all children. 2. press 'Clear All' -> will not
            // remove the children if this code will not be in use.
            if (this._tree.selection && this._tree.selection.length > 0)
            {
                itemsToAdd = items.filter(item =>
                {
                    return this._isNodePartOfTree(item) && (this._tree.selection.indexOf(item) === -1);
                });
            }else
            {
                // all items should be selected
                itemsToAdd = items;
            }

            if (itemsToAdd && itemsToAdd.length > 0)
            {
                // make sure the selection list is not null.
                this._tree.selection = this._tree.selection || [];
            }

            itemsToAdd.forEach((item: PrimeTreeNode) => {
                // we must re-check if the item exists in the selections because as explained above there
                // are scenarios when removing when item can cause to removal of others.
                if (this._tree.selection && this._tree.selection.indexOf(item) === -1) {
                    this._tree.selection.push(item);

                    // propagate selection on the tree to make sure it updates all relevant nodes
                    // TODO [kmcng] refactor
                    //this._tree.propagateSelectionDown(item, true);
                    if ((<any>item).parent) {
                        // TODO [kmcng] refactor
                        //this._tree.propagateSelectionUp((<any>item).parent, true);
                    }
                }
            });

            if (itemsToAdd && itemsToAdd.length > 0) {
                this.onTreeSelectionChanged.emit({origin: TreeSelectionChangedOrigins.SelectItems, added: itemsToAdd, removed: []});
            }
        }

    }

    /**
     * Unselect items that are matching the provided tree nodes and emit 'onTreeSelectionChanged' event if needed
     * @param items
     * @param origin
     * @private
     */
    private _unselectItems(items: PrimeTreeNode[],  origin : TreeSelectionChangedOrigins): void {

        if (items) {

            let itemsToRemove :  PrimeTreeNode[] = [];
            if (this._tree.selection && this._tree.selection.length > 0)
            {
                // get a list of all the items that currently selected and should be removed
                // it is important to get that list before performing the actual selection list changes
                // since some items has side-effects that can remove other items as well that should be addressed.
                // testable scenario: 1. select 'Media Types' (will cause to selection of all children. 2. press 'Clear All' -> will not
                // remove the children if this code will not be in use.
                itemsToRemove = items.filter(item =>
                {
                    return (this._tree.selection.indexOf(item) > -1);
                });
            }else
            {
                // handle scenario when the tree has no selections so none of the requested items will
                // affect selections list.
                return;
            }

            itemsToRemove.forEach(item => {
                // we must re-check if the item exists in the selections because as explained above there
                // are scenarios when removing when item can cause to removal of others.
                const indexOfItem = this._tree.selection ? this._tree.selection.indexOf(item) : -1;
                if (indexOfItem >= 0) {
                    this._tree.selection.splice(indexOfItem, 1);

                    // propogate selection on the tree to make sure it updates all relevant nodes
                    // TODO [kmcng] refactor
                    // this._tree.propagateSelectionDown(item, false);
                    if ((<any>item).parent) {
                        // TODO [kmcng] refactor
                        // this._tree.propagateSelectionUp((<any>item).parent, false);
                    }
                }
            });

            if (itemsToRemove && itemsToRemove.length > 0) {
                this.onTreeSelectionChanged.emit({origin: origin, added: [], removed: itemsToRemove});
            }
        }

    }

    /**
     * Simulate user click on the selected node. This will trigger change events.
     * Use this function if you want to select an item from code (for example from separated
     * auto-complete component
     *
     * @param node
     * @constructor
     */
    public simulateUserInteraction(node : PrimeTreeNode)
    {
        if (node && this._isNodePartOfTree(node))
        {
            // NOTE - simulate event of empty 'div', since event.target is consumed by the original tree.
            this._tree.onNodeClick(<any>{target : $('<div>')},node);
        }
    }

    private _isNodePartOfTree(node)
    {
        // get node root to compare
        let nodeRoot = node;
        while(nodeRoot && nodeRoot.parent)
        {
            nodeRoot = nodeRoot.parent;
        }

        // check if node root is part of the tree roots
        return this._tree && this._tree.value && this._tree.value.find(nodeToCompare => nodeRoot.data === nodeToCompare.data);
    }

    private _updateNodeChildrenState(selectable : boolean, node : PrimeTreeNode, originalEvent : Event) {
        if (this.treeSelectionMode === TreeSelectionModes.SelfAndChildren) {
            if (node && node.children) {
                node.children.forEach(child => {

                    let childIndexInSelection = this._tree.findIndexInSelection(child);
                    let childSelected = (childIndexInSelection >= 0);

                    if (!selectable && childSelected) {
                        this._tree.selection = this._tree.selection.filter((val, i) => i != childIndexInSelection);
                        this._tree.selectionChange.emit(this._tree.selection);
                    }

                    if (child.selectable !== selectable) {
                        child.selectable = selectable;

                        if (child.children && child.children.length) {
                            this._updateNodeChildrenState(selectable, child, originalEvent);
                        }
                    }

                });
            }
        }
    }

    /**
     * Override tree functions with specific ones that handle the required selection modes
     * @private
     */
    private _overrideTreeFunctions() : void{

        this._tree.onNodeSelect.subscribe(
            item =>
            {
                // disable children selection (if tree selection enforce it)
                this._updateNodeChildrenState(false,item.node, item.originalEvent);
            }
        );

        this._tree.onNodeUnselect.subscribe(
            item =>
            {
                if (this.treeSelectionMode === TreeSelectionModes.SelfAndChildren) {
                    // allow children selection (if tree selection enforce it)
                    this._updateNodeChildrenState(true,item.node, item.originalEvent);
                }
            }
        );
        //
        // // In order to override inner functions while keeping their 'this' context
        // // We use regular functions and not arrow functions
        // const _this = this;
        // let changes : OnSelectionChangedArgs = null;
        //
        // const originalOnNodeClickFunctions = this._tree.onNodeClick;
        //
        // this._tree.onNodeClick = function(event: MouseEvent, node: TreeNode) {
        //   if (_this.treeSelectionMode === TreeSelectionModes.SelfAndChildren) {
        //     if (node instanceof PrimeTreeNode && node.isDisabled) {
        //       // don't allow user to modify selected if entry is disabled
        //       return;
        //     }
        //   }
        //
        //   changes = { origin : TreeSelectionChangedOrigins.UserSelection, added : [], removed : []};
        //
        //   // invoke the original handler.
        //
        //   originalOnNodeClickFunctions.call(this,event,node);
        //
        //     // check if changes were added to the arrays by functions 'propagateSelectionDown' and 'propagateSelectionUp' that were overriden in this directive
        //     if (changes.added.length || changes.removed.length) {
        //
        //       _this.onTreeSelectionChanged.emit(changes);
        //     }
        //
        //     changes = null;
        // };
        //
        // this._tree.isSelected = function(node : TreeNode)
        // {
        //   if (node instanceof PrimeTreeNode)
        //     {
        //         return (node.isDisabled || (this.selection && this.selection.indexOf(node) !== -1));
        //     }
        //
        //     return false;
        // };

        // TODO [kmcng] refactor
        // this._tree.propagateSelectionDown = function (node: PrimeTreeNode, select: boolean, disableNode : boolean = false) {
        //   let index = this.findIndexInSelection(node);
        //   let disableChildren : boolean = disableNode;
        //
        //   if (_this.treeSelectionMode === TreeSelectionModes.SelfAndChildren) {
        //     // in exact block children mode all children are removed from selection list and cannot
        //     // be selected by the user
        //     if (disableNode) {
        //       select = false;
        //       node.isDisabled = true;
        //       disableChildren = true;
        //     } else {
        //       node.isDisabled = false;
        //       disableChildren = select; // disable children if i'm selected
        //     }
        //   }
        //
        //   if (select && index == -1) {
        //     // update changes list if we are currently tracking for changes
        //     if (changes && node instanceof PrimeTreeNode) {
        //       changes.added.push(node);
        //     }
        //
        //     this.selection = this.selection || [];
        //     this.selection.push(node);
        //   }
        //   else if (!select && index > -1) {
        //     // update changes list if we are currently tracking for changes
        //     if (changes && node instanceof PrimeTreeNode) {
        //       changes.removed.push(this.selection[index]);
        //     }
        //
        //     this.selection.splice(index, 1);
        //   }
        //
        //   node.partialSelected = false;
        //
        //
        //
        //   if (_this.treeSelectionMode !== TreeSelectionModes.Self && node.children && node.children.length) {
        //     // in exact mode, only the selected node status changes, we should not propagate selection down
        //     for (let child of node.children) {
        //       this.propagateSelectionDown(child, select, disableChildren);
        //     }
        //   }
        // };

        // TODO [kmcng] refactor
        // this._tree.propagateSelectionUp = function (node: TreeNode, select: boolean) {
        //
        //   if (_this.treeSelectionMode === TreeSelectionModes.Self)
        //   {
        //     // in exact mode, only the selected node status changes, we should not propagate selection up
        //     return;
        //   }
        //
        //   if(node.children && node.children.length) {
        //
        //     if (_this.treeSelectionMode === TreeSelectionModes.SelfAndChildren) {
        //       let hasSelectedChildren = false;
        //       for (let i = 0, length = node.children.length; i < length && !hasSelectedChildren; i++) {
        //         const child = node.children[i];
        //
        //         if (child.partialSelected || this.selection.indexOf(child) !== -1) {
        //           // find if one of the deep level nesteed children is selected then stop searching
        //           hasSelectedChildren = true;
        //         }
        //       }
        //
        //       // we should mark the parent as partial selected if one or more of its' deep level nested children is selected
        //       if (hasSelectedChildren) {
        //         node.partialSelected = true;
        //       }
        //       else {
        //         node.partialSelected = false;
        //       }
        //     }else if (_this.treeSelectionMode === TreeSelectionModes.PrimeDefault)
        //     {
        //       let selectedCount: number = 0;
        //       let childPartialSelected: boolean = false;
        //       for(let child of node.children) {
        //         if(this.isSelected(child)) {
        //           selectedCount++;
        //         }
        //         else if(child.partialSelected) {
        //           childPartialSelected = true;
        //         }
        //       }
        //
        //       if(select && selectedCount == node.children.length) {
        //
        //         // update changes list if we are currently tracking for changes
        //         if (changes && node instanceof PrimeTreeNode) {
        //           changes.added.push(node);
        //         }
        //
        //         this.selection = this.selection||[];
        //         this.selection.push(node);
        //         node.partialSelected = false;
        //       }
        //       else {
        //         if(!select) {
        //           let index = this.findIndexInSelection(node);
        //           if(index >= 0) {
        //
        //             // update changes list if we are currently tracking for changes
        //             if (changes && node instanceof PrimeTreeNode) {
        //               changes.removed.push(this.selection[index]);
        //             }
        //
        //             this.selection.splice(index, 1);
        //           }
        //         }
        //
        //         if(childPartialSelected || selectedCount > 0 && selectedCount != node.children.length)
        //           node.partialSelected = true;
        //         else
        //           node.partialSelected = false;
        //       }
        //     }
        //   }
        //
        //   let parent = node.parent;
        //   if(parent) {
        //     this.propagateSelectionUp(parent, select);
        //   }
        // }
    }
}
