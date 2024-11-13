// selectedItemsSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const selectedItemsSlice = createSlice({
    name: 'selectedItems',
    initialState: [],
    reducers: {
        setSelectedItems: (state, action) => {
            return action.payload; // Overwrite state with new selection
        },
    },
});

export const { setSelectedItems } = selectedItemsSlice.actions;
export default selectedItemsSlice.reducer;
