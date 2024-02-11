import * as Redux from "@reduxjs/toolkit";
import { ResultGroup } from "./SearchPage/ResultGroup";
import { MetadataResponse } from "./MetadataResponse";

export interface CounterState {
    value: number,
}

const initialState: GlobalState = {
    currentSearch: [],
    search: { results: [], groupedResults: [], metadataResponses: [] },
    hydrus: { apiKey: null }
}


export interface ImageViewerState {

}

export interface SearchState {
    results: Array<ResultGroup>;
    groupedResults: Array<ResultGroup>;
    metadataResponses: Array<MetadataResponse>;
    hashes?: Array<string>;
}

export interface GlobalState {
    currentSearch: string[],
    search: SearchState,
    hydrus: HydrusAPIState
}

export interface HydrusAPIState {
    apiKey: string | null
}


export const globalSlice = Redux.createSlice({
    name: 'global',
    initialState,
    reducers: {
        setCurrentSearch(state, action: Redux.PayloadAction<string[]>) {
            state.currentSearch = action.payload
        },
        setApiKey(state, action: Redux.PayloadAction<string>) {
            state.hydrus.apiKey = action.payload
        },
        setSearchState(state, action: Redux.PayloadAction<SearchState>) {
            state.search = action.payload
        }
    }
})

export const { setCurrentSearch, setApiKey, setSearchState } = globalSlice.actions

export default globalSlice.reducer