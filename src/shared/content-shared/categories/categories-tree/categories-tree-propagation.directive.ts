import {
    Directive, OnInit, DoCheck, IterableDiffer, IterableDiffers,
    ChangeDetectorRef, IterableChanges, Input, OnChanges
} from '@angular/core';
import { Tree } from 'primeng/tree';
import { CategoriesTreeNode } from './categories-tree-node';

@Directive({
    selector: 'p-tree[kCategoriesTreePropagation]',
})
export class CategoriesTreePropagationDirective implements OnInit, DoCheck, OnChanges {

    _selectionDiffer : IterableDiffer<CategoriesTreeNode>;

    @Input()
    propagateDownMode : 'default' | 'none' | 'preventNested' = 'default';

    @Input()
    propagateUpMode : 'default' | 'none' | 'visualOnly' = 'default';


    constructor(private _treeComponent : Tree, private _differs : IterableDiffers, private _cdr : ChangeDetectorRef)
    {

    }

    ngOnChanges(changes)
    {

    }


    public resetNodesState(): void{
        if (this._treeComponent.value){
            this._treeComponent.value.forEach(item =>
            {
                if (item instanceof CategoriesTreeNode) {
                    this._resetNodeState(item);
                }
            });
        }
    }

    private _resetNodeState(item: CategoriesTreeNode): void{
        if (item instanceof CategoriesTreeNode) {
            item.selectable = true;
            item.partialSelected = false;

            if (item.children) {
                item.children.forEach(child => {
                    this._resetNodeState(child);
                });
            }
        }
    }

    ngOnInit()
    {
        this._treeComponent.selectionMode = 'checkbox';
        this._treeComponent.propagateSelectionUp = false;
        this._treeComponent.propagateSelectionDown = false;

        if (!this._selectionDiffer) {
            this._createSelectionDiffer();
        }
    }

    ngDoCheck(): void {
        if (this._selectionDiffer && (this.propagateDownMode !== 'none' || this.propagateUpMode !== 'none')) {
            const changes = this._selectionDiffer.diff(this._treeComponent.selection);
            if (changes) {
                this._applyChanges(changes);
            }
        }
    }

    public updateNodeState(node : CategoriesTreeNode, addToSelection : boolean = false)
    {
        if (node)
        {
            let isNodeSelected = this._treeComponent.isSelected(node);
            const hasParentThatIsSelected = this._hasParentThatIsSelected(node);

            if (!isNodeSelected && addToSelection)
            {
                if (hasParentThatIsSelected && this.propagateDownMode === 'preventNested')
                {
                    console.warn('[kmcng] cannot select the requested node since a parent of that node is already selected');
                }else
                {
                    this._treeComponent.selection = [...this._treeComponent.selection, node];
                    isNodeSelected = true;
                }
            }

            const nodeIsSelectable = this.propagateDownMode === 'preventNested' ? (isNodeSelected || !hasParentThatIsSelected) : true;
            const nodeChildrenAreSelectable = this.propagateDownMode === 'preventNested' ? (!isNodeSelected && !hasParentThatIsSelected) : true;
            this._updateNodeState(node, { nodeIsSelectable, nodeChildrenAreSelectable });

            switch (this.propagateUpMode)
            {
                case 'visualOnly':
                    this._propagateUpForVisualMode(node,isNodeSelected,[]);
                    break;
                case 'none' :
                    let parent = node.parent;

                    while(parent)
                    {
                        parent.partialSelected = false;
                        parent = parent.parent;
                    }
                    break;
                case 'default':
                    this._propagateUpForDefaultMode(node, nodeIsSelectable,[]);
                    break;
            }
        }
    }


    private _updateNodeState(node : CategoriesTreeNode, { nodeIsSelectable, nodeChildrenAreSelectable } : { nodeIsSelectable : boolean, nodeChildrenAreSelectable : boolean }) : void {

        node.selectable = nodeIsSelectable;

        const childrenCount = node.children ? node.children.length : 0;
        if (childrenCount > 0) {

            let selectedCount: number = 0;
            let childPartialSelected: boolean = false;

            // update node children
            (node.children || []).forEach(childNode => {
                this._updateNodeState(childNode, {
                    nodeIsSelectable: nodeChildrenAreSelectable,
                    nodeChildrenAreSelectable: nodeChildrenAreSelectable
                });

                if (childNode.partialSelected) {
                    childPartialSelected = true;
                }

                if (this._treeComponent.isSelected(childNode)) {
                    selectedCount++;
                }

            });

            const nodeSelected = this._treeComponent.isSelected(node);
            node.partialSelected = !nodeSelected && (!childPartialSelected || selectedCount < childrenCount);
        }
        else {
            node.partialSelected = false;
        }
    }

    private _createSelectionDiffer() {
        const hasActiveDiffer = !!this._selectionDiffer;

        this._selectionDiffer = this._differs.find([]).create<CategoriesTreeNode>((index, item) => {
            return item ? item.value  : null;
        });

        if (hasActiveDiffer) {
            this._selectionDiffer.diff(this._treeComponent.selection);
        }
    }

    private _hasParentThatIsSelected(node : CategoriesTreeNode) : boolean {

        let result = false;

        if (node && node.parent) {
            let parent = node.parent;

            while (parent && !result) {
                result = this._treeComponent.isSelected(parent);
                parent = parent.parent;
            }
        }

        return result;
    }

    private _applyChanges(changes: IterableChanges<CategoriesTreeNode>) {
        const handledNodesByPropagateUp = [];
        const handledNodesByPropagateDown = [];
        let selectionChanged = false;

        changes.forEachRemovedItem(record =>
        {
            if (this.propagateUpMode === 'visualOnly') {
                this._propagateUpForVisualMode(record.item, false, handledNodesByPropagateUp);
            }else if (this.propagateUpMode === 'default') {
                if (this._propagateUpForDefaultMode(record.item,false, handledNodesByPropagateUp).selectionChanged)
                {
                    selectionChanged = true;
                }
            }

            if (this.propagateDownMode === 'preventNested') {
                if (record.item.children)
                {
                    const hasParentThatIsSelected = this._hasParentThatIsSelected(record.item);

                    record.item.children.forEach(childNode =>
                    {
                        this._propagateDownForPreventNestedMode(childNode, !hasParentThatIsSelected, handledNodesByPropagateDown);
                    });
                }

            }else if (this.propagateDownMode === 'default') {
                if (this._propagateDownDefaultMode(record.item,false, handledNodesByPropagateDown).selectionChanged)
                {
                    selectionChanged = true;
                }
            }
        });

        changes.forEachAddedItem(record =>
        {
            if (this.propagateUpMode === 'visualOnly') {
                this._propagateUpForVisualMode(record.item, true, handledNodesByPropagateUp);
            }else if (this.propagateUpMode === 'default') {
                if (this._propagateUpForDefaultMode(record.item,true, handledNodesByPropagateUp).selectionChanged)
                {
                    selectionChanged = true;
                }
            }

            if (this.propagateDownMode === 'preventNested') {
                if (record.item.children)
                {
                    record.item.children.forEach(childNode =>
                    {
                        this._propagateDownForPreventNestedMode(childNode, false, handledNodesByPropagateDown);
                    });
                }
            }else if (this.propagateDownMode === 'default') {
                if (this._propagateDownDefaultMode(record.item,true, handledNodesByPropagateDown).selectionChanged)
                {
                    selectionChanged = true;
                }
            }
        });

        if (selectionChanged)
        {
            setTimeout(() =>
            {
                this._treeComponent.selectionChange.emit(this._treeComponent.selection);
            },200);
        }
    }

    private _propagateUpForDefaultMode(node: CategoriesTreeNode, select: boolean, handledList : CategoriesTreeNode[]) : { selectionChanged : boolean} {

        const result = { selectionChanged : false };

        if (handledList.indexOf(node) !== -1)
        {
            return result;
        }

        handledList.push(node);

        if(node.children && node.children.length) {
            let selectedCount: number = 0;
            let childPartialSelected: boolean = false;
            for(let child of node.children) {
                if(this._treeComponent.isSelected(child)) {
                    selectedCount++;
                }
                else if(child.partialSelected) {
                    childPartialSelected = true;
                }
            }

            if(select && selectedCount == node.children.length) {
                if (!this._treeComponent.isSelected(node)) {
                    this._treeComponent.selection = [...this._treeComponent.selection || [], node];
                    result.selectionChanged = true;
                    node.partialSelected = false;
                }
            }
            else {
                if(!select) {
                    let index = this._treeComponent.findIndexInSelection(node);
                    if(index >= 0) {
                        this._treeComponent.selection = this._treeComponent.selection.filter((val,i) => i!=index);
                        result.selectionChanged = true;
                    }
                }

                if(childPartialSelected || selectedCount > 0 && selectedCount != node.children.length)
                    node.partialSelected = true;
                else
                    node.partialSelected = false;
            }
        }

        let parent = node.parent;
        if(parent) {
            if (this._propagateUpForDefaultMode(parent, select, handledList).selectionChanged) {
                result.selectionChanged = true;
            }
        }

        return result;
    }

    private _propagateDownDefaultMode(node: CategoriesTreeNode, select: boolean, handledList : CategoriesTreeNode[]) : { selectionChanged : boolean} {
        const result = {selectionChanged: false};

        if (handledList.indexOf(node) !== -1) {
            return result;
        }

        handledList.push(node);

        let index = this._treeComponent.findIndexInSelection(node);

        if (select && index == -1) {
            this._treeComponent.selection = [...this._treeComponent.selection || [], node];
            result.selectionChanged = true;
        }
        else if (!select && index > -1) {
            this._treeComponent.selection = this._treeComponent.selection.filter((val, i) => i != index);
            result.selectionChanged = true;
        }

        const childrenCount = node.children ? node.children.length : 0;

        if (childrenCount > 0) {
            let allChildrenSelected = false;
            let partialChildrenSelected = false;

            if (!select) {
                // for performance improvement - check if all children selected only if going to un-select them.
                let selectedCount: number = 0;
                for (let child of node.children) {
                    if (this._treeComponent.isSelected(child)) {
                        selectedCount++;
                    }
                }

                allChildrenSelected = childrenCount === selectedCount;
                partialChildrenSelected = !allChildrenSelected && selectedCount > 0;
            }

            node.partialSelected = !select && partialChildrenSelected;

            if (select || allChildrenSelected) {
                // the condition above allow removing children only if all of them are currently selected
                for (let child of node.children) {
                    if (this._propagateDownDefaultMode(child, select, handledList).selectionChanged) {
                        result.selectionChanged = true;
                    }
                }
            }
        }

        return result;
    }

    private _propagateDownForPreventNestedMode(node: CategoriesTreeNode, select: boolean, handledList : CategoriesTreeNode[])  : { selectionChanged : boolean} {
        const result = {selectionChanged: false};

        if (handledList.indexOf(node) !== -1) {
            return result;
        }

        handledList.push(node);

        // update selectable mode if needed
        if (node.selectable !== select) {
            node.selectable = select;

            // make sure the node is removed from node selection (if relevant)
            if (!node.selectable) {
                let index = this._treeComponent.findIndexInSelection(node);
                if(index >= 0) {
                    this._treeComponent.selection = this._treeComponent.selection.filter((val,i) => i!=index);
                    result.selectionChanged = true;
                }
            }

            if (node.children) {
                for (let child of node.children) {
                    if (this._propagateDownForPreventNestedMode(child, select, handledList).selectionChanged) {
                        result.selectionChanged = true;
                    }
                }
            }
        }

        return result;
    }

    private _propagateUpForVisualMode(node: CategoriesTreeNode, select: boolean, handledList : CategoriesTreeNode[]) {
        if (handledList.indexOf(node) !== -1)
        {
            return;
        }

        handledList.push(node);

        if(node.children && node.children.length) {
            let selectedCount: number = 0;
            let childPartialSelected: boolean = false;
            for(let child of node.children) {
                if(this._treeComponent.isSelected(child)) {
                    selectedCount++;
                }
                else if(child.partialSelected) {
                    childPartialSelected = true;
                }
            }

            if(select && selectedCount == node.children.length) {
                if (!this._treeComponent.isSelected(node)) {
                    node.partialSelected = true;
                }
            }
            else {
                if(childPartialSelected || selectedCount > 0 && selectedCount != node.children.length)
                    node.partialSelected = true;
                else
                    node.partialSelected = false;
            }
        }

        let parent = node.parent;
        if(parent) {
            this._propagateUpForVisualMode(parent, select, handledList);
        }
    }
}
