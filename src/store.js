import { configureStore } from '@reduxjs/toolkit'
import dataSetReducer from './redux/DataSetSlice'
import selectionReducer from './redux/SelectionSlice'
import selectedItemsReducer from './redux/SelectedItemSlice';

export default configureStore({
  reducer: {
    dataSet: dataSetReducer,
    selection: selectionReducer,
    selectedItems: selectedItemsReducer,
    }
})