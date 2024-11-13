import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ParallelCoordinatesD3 from './parallelCoordinate-D3';

function ParallelCoordinatesContainer() {
    const divContainerRef = useRef(null);
    const parallelCoordsD3Ref = useRef(null);

    // Sample data and attributes
    const csvData = useSelector(state => state.dataSet);
    const zAttribute = useSelector(state => state.selection.dropdown3);
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
        parallelCoordsD3Ref.current.renderParallel(csvData, "Rainfall", "Date", selectedData);

    }, []);

    useEffect(() => {
        // Create the ParallelCoordinatesD3 instance and render axes

        console.log("ISEBILB")
        console.log(selectedData)

        if (divContainerRef.current) {
            parallelCoordsD3Ref.current.renderParallel(csvData, zAttribute,"Date", selectedData);
        }
    }, [csvData, zAttribute, selectedData]);

    return (
        <div ref={divContainerRef} style={{ width: "100%", height: "400px" }}>
            {/* The parallel coordinates axes will render here */}
        </div>
    );
}

export default ParallelCoordinatesContainer;
