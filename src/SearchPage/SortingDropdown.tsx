import { useState } from "react";
import { FileSortType } from "../hydrus-backend";
import * as API from '../hydrus-backend'


import './SortingDropdown.css'
import { getSortType } from "../StorageUtils";

interface DropdownSortingProps {
    options:Array<string | FileSortType>;
    clickFunction:Function;
}

function DropdownSorting (props:DropdownSortingProps) {
    const [current,setCurrent] = useState<number>(getSortType())
    const [expanded, setExpanded] = useState(false)

    function createDropdownSelectionList() {
        let finalComponent = []
        for (let option in props.options) {
            finalComponent.push(
                <div className='dropdownMenuOption' onClick={() => {setCurrent(parseInt(option));setExpanded(false);props.clickFunction(parseInt(option))}}>
                    <span>{props.options[option]}</span>
                </div>
            )
        }
        return finalComponent
    }

    function getMenuStyle() {
        let style = 'dropdownMenu'
        if (expanded) {style += ' expanded'}
        return style
    }

    function getOptionsStyle() {
        let style = 'dropdownMenuOptions'
        if (expanded) {style += ' expanded'}
        return style
    }

    function expandElement() {
        setExpanded(!expanded)
    }

    return <div className={getMenuStyle()}>
        <div className='dropdownMenuCurrent' onClick={expandElement}>
                <span>{API.FileSortType[current]}</span>
        </div>
        <div className={getOptionsStyle()}>
                {createDropdownSelectionList()}
            </div>
    </div>
}

export default DropdownSorting