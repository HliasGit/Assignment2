import './Scatterplot.css'
import { useEffect, useRef } from 'react';

import ScatterplotD3 from './scatter-D3';
import {useDispatch, useSelector} from 'react-redux';
import { setSelectedItems } from '../redux/SelectedItemSlice';

// TODO: import action methods from reducers

function ScatterplotContainer(){

    // Dispatcher
    const dispatch = useDispatch(); // Hook to dispatch actions

    // get matrixData from the redux store
    const csvData = useSelector(state =>state.dataSet)

    // Get the attribute you want to show
    const xAttribute= useSelector(state =>state.selection.dropdown1)
    const yAttribute= useSelector(state => state.selection.dropdown2)
    const catAggregation= useSelector(state => state.selection.dropdown5)

    //selector
    const selectedData = useSelector(state => state.selectedItems)

    //utils
    const divContainerRef=useRef(null);
    const scatterplotD3Ref = useRef(null)

    const getCharSize = function(){
        let width;// = 800;
        let height;// = 100;
        if(divContainerRef.current!==undefined){
            width=divContainerRef.current.offsetWidth/1.1;
            // width = '100%';
            height=divContainerRef.current.offsetHeight/1.1;
            // height = '100%';
        }
        return {width:width,height:height};
    }

    useEffect(()=>{
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({size:getCharSize()});
        scatterplotD3Ref.current = scatterplotD3;
            
        return ()=>{
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            const scatterplotD3 = scatterplotD3Ref.current;
            scatterplotD3.clear()
        }
    },[]);

    useEffect(()=>{
        console.log("ScatterplotContainer useEffect with dependency [matrixData,dispatch], called each time matrixData changes...");

          const handleBrushEnd = (selectedData) => {
            dispatch(setSelectedItems(selectedData)); // Dispatch selected items to Redux
        };

        const controllerMethods={
            handleBrushEnd
        }

        scatterplotD3Ref.current.renderScatterplot(csvData, xAttribute, yAttribute, catAggregation, controllerMethods, selectedData);

    },[csvData, dispatch, xAttribute, yAttribute, catAggregation, selectedData]);

    return(
        <div ref={divContainerRef} className="scatterplotDivContainer col2">

        </div>
    )
}

export default ScatterplotContainer;