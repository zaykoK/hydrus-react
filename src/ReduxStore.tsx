import * as Redux from "@reduxjs/toolkit" ;
import globalSlice from "./ReduxSlicer";

export const store = Redux.configureStore({
    reducer:{
        currentHashes:globalSlice
    }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

