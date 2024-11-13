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

    // every time the component re-render
    useEffect(()=>{
        console.log("ScatterplotContainer useEffect (called each time matrix re-renders)");
    }); // if no dependencies, useEffect is called at each re-render

    const divContainerRef=useRef(null);
    const scatterplotD3Ref = useRef(null)

    const getCharSize = function(){
        // fixed size
        // return {width:900, height:900};
        // getting size from parent item
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

    // did mount called once the component did mount
    useEffect(()=>{
        console.log("ScatterplotContainer useEffect [] called once the component did mount");
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({size:getCharSize()});
        scatterplotD3Ref.current = scatterplotD3;

            
        return ()=>{
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("ScatterplotContainer useEffect [] return function, called when the component did unmount...");
            const scatterplotD3 = scatterplotD3Ref.current;
            scatterplotD3.clear()
        }
    },[]);// if empty array, useEffect is called after the component did mount (has been created)

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(()=>{
        console.log("ScatterplotContainer useEffect with dependency [matrixData,dispatch], called each time matrixData changes...");

        const handleOnClick = function(cellData){
            console.log("Scatterplot item clicked:", cellData);
            // Dispatch action to update selected item in the matrix data slice
            //dispatch(updateSelectedItem(cellData));
        }

        const handleOnMouseEnter = (cellData) => {
            console.log("Mouse entered cell:", cellData);
            // Dispatch action to update hovered cell in the matrix sync slice
            //dispatch(updateHoveredCell(cellData));
          };
        
        const handleOnMouseLeave = () => {
            console.log("Mouse left the cell");
            // You could dispatch to reset hovered cell, if needed
            //dispatch(updateHoveredCell({}));
          };

          const handleBrushEnd = (selectedData) => {
            dispatch(setSelectedItems(selectedData)); // Dispatch selected items to Redux
        };

        const controllerMethods={
            handleBrushEnd,
            handleOnClick,
            handleOnMouseEnter,
            handleOnMouseLeave
        }

        
        scatterplotD3Ref.current.renderScatterplot(csvData, xAttribute, yAttribute, controllerMethods);
        // get the current instance of scatterplotD3 from the Ref...
        // call renderScatterplot of ScatterplotD3...;

    },[csvData, dispatch, xAttribute, yAttribute]);// if dependencies, useEffect is called after each data update, in our case only matrixData changes.

    return(
        <div ref={divContainerRef} className="scatterplotDivContainer col2">

        </div>
    )
}

export default ScatterplotContainer;