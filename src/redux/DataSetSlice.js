import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Papa from "papaparse"

// get the data in asyncThunk
export const getSeoulBikeData = createAsyncThunk('seoulBikeData/fetchData', async () => {
    const response = await fetch('data/SeoulBikeData.csv');
    const responseText = await response.text();
    console.log("loaded file length:" + responseText.length);
    const responseJson = Papa.parse(responseText,{header:true, dynamicTyping:true});
    return responseJson.data.map((item,i)=>{let cacca = item.Date.split("/")
                                            let data = new Date(cacca[2], cacca[1]-1, cacca[0])
                                            return {...item,index:i,Date:data}});
    // when a result is returned, extraReducer below is triggered with the case setSeoulBikeData.fulfilled
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