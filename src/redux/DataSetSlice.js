import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Papa from "papaparse"

// get the data in asyncThunk
export const getSeoulBikeData = createAsyncThunk('seoulBikeData/fetchData', async () => {
    const response = await fetch('data/SeoulBikeData.csv');
    const responseText = await response.text();
    console.log("loaded file length:" + responseText.length);
    const responseJson = Papa.parse(responseText,{header:true, dynamicTyping:true});
    
    const string_to_iso = (date_str) => {
      const [day, month, year] = date_str.split('/').map(Number);
      return new Date(year, month - 1, day).getTime();
    }

    return responseJson.data.map((item, i) => ({
      ...item,
      Date: string_to_iso(item.Date),
      index: i
    }));
})

export const dataSetSlice = createSlice({
  name: 'dataSet',
  initialState: [],
  reducers: {
  },
  extraReducers: builder => {
    builder.addCase(getSeoulBikeData.fulfilled, (state, action) => {
      return action.payload
    })
  }
})

// Action creators are generated for each case reducer function
export const { updateSelectedItem } = dataSetSlice.actions

export default dataSetSlice.reducer