import React, { useEffect, useRef } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import ParallelCoordinatesD3 from './parallelCoordinate-D3';
import { setSelectedItems } from '../redux/SelectedItemSlice';


function ParallelCoordinatesContainer() {
    const divContainerRef = useRef(null);
    const parallelCoordsD3Ref = useRef(null);

    // Dispatch
    const dispatch = useDispatch(); // Hook to dispatch actions

    // Sample data and attributes
    const csvData = useSelector(state => state.dataSet);
    const zAttribute = useSelector(state => state.selection.dropdown3);
    const wAttribute = useSelector(state => state.selection.dropdown4);
    const selectedData = useSelector(state => state.selectedItems)

    const getContainerSize = () => {
        let width = divContainerRef.current.offsetWidth;
        let height = divContainerRef.current.offsetHeight;
        return { width, height };
    };

    useEffect(() => {

        const size = getContainerSize();
        parallelCoordsD3Ref.current = new ParallelCoordinatesD3(divContainerRef.current);
        parallelCoordsD3Ref.current.create({ size });
        //parallelCoordsD3Ref.current.renderParallel(csvData, "Rainfall", "Date", selectedData);

    }, []);

    useEffect(() => {

        const handleBrushIntersection = (selectedData) => {
            dispatch(setSelectedItems(selectedData)); // Dispatch selected items to Redux
        };

        const controllerMethods={
            handleBrushIntersection
        }

        if (divContainerRef.current) {
            parallelCoordsD3Ref.current.renderParallel(csvData, zAttribute, wAttribute, selectedData, controllerMethods);
        }

    }, [csvData, zAttribute, wAttribute, selectedData, dispatch]);

    return (
        <div ref={divContainerRef} style={{ width: "100%", height: "400px" }}>
            {/* The parallel coordinates axes will render here */}
        </div>
    );
}

export default ParallelCoordinatesContainer;
