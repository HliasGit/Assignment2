import * as d3 from 'd3';

class ParallelCoordinatesD3 {
    margin = {top: 100, right: 10, bottom: 50, left: 100};
    size;
    height;
    width;
    svg;
    yScale;

    constructor(el) {
        this.el = el;
    }

    updateColor(season) {
        switch (season){
            case "Spring":
                return "green";
            case "Summer":
                return "red";
            case "Autumn":
                return "yellow";
            case "Winter":
                return "blue";
            default:
                return null;
        }
    }

    create(config) {
        this.size = {width: config.size.width, height: config.size.height};

        // get the effect size of the view by subtracting the margin
        this.width = (this.size.width - this.margin.left - this.margin.right)/2.2;
        this.height = (this.size.height - this.margin.top - this.margin.bottom)*2;
        this.leftWidth = this.width-60;
        this.rightWidth = this.width;

        // Initialize SVG element
        this.svg = d3.select(this.el)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
        
        console.log("SVG created with 2/3 width on the left and 1/3 width on the right.");

        // Append the left axis (xAttribute)
        this.leftAxis = this.svg.append("g")
            .attr("id", "left-axis")
            .attr("transform", `translate(0, 0)`);

        this.leftAxis.append("text")
            .attr("class", "leftAxisLabel")
            .attr("transform", `rotate(-90) translate(${this.height / -2}, -50)`)  // Adjust -40 as needed
            .attr("fill", "black")
            .style("font-size", "14px")
            .style("text-anchor", "middle")
        
        // Append the right axis (yAttribute)
        this.rightAxis = this.svg.append("g")
            .attr("id", "right-axis")
            .attr("transform", `translate(${this.leftWidth}, 0)`);

        this.rightAxis.append("text")
            .attr("class", "rightAxisLabel")
            .attr("transform", `rotate(90) translate(${this.height / +2}, -50)`)
            .attr("fill", "black")
            .style("font-size", "14px")
            .style("text-anchor", "middle");
    }

    updateAxis(visData, xAttribute, yAttribute) {
        if (xAttribute !== "Date" && yAttribute === "Date") {
            this.yScale = {
                [xAttribute]: d3.scaleLinear().range([this.height, 0])
                    .domain(d3.extent(visData, d => d[xAttribute])),
                [yAttribute]: d3.scaleTime().range([this.height, 0])
                    .domain([new Date(d3.min(visData.map(item => item["Date"]))), new Date(d3.max(visData.map(item => item["Date"])))])
            };
        }
        else if (xAttribute === "Date" && yAttribute !== "Date") {
            this.yScale = {
                [xAttribute]: d3.scaleTime().range([this.height, 0])
                .domain([new Date(d3.min(visData.map(item => item["Date"]))), new Date(d3.max(visData.map(item => item["Date"])))]),
                [yAttribute]: d3.scaleLinear().range([this.height, 0])
                    .domain(d3.extent(visData, d => d[yAttribute]))
            };
        }
        else if (xAttribute === "Date"  && yAttribute === "Date") {
            this.yScale = {
                [xAttribute]: d3.scaleTime().range([this.height, 0])
                    .domain([new Date(d3.min(visData.map(item => item["Date"]))), new Date(d3.max(visData.map(item => item["Date"])))]),
                [yAttribute]: d3.scaleTime().range([this.height, 0])
                    .domain([new Date(d3.min(visData.map(item => item["Date"]))), new Date(d3.max(visData.map(item => item["Date"])))])
            };
        } else {
            this.yScale = {
                [xAttribute]: d3.scaleLinear().range([this.height, 0])
                    .domain(d3.extent(visData, d => d[xAttribute])),
                [yAttribute]: d3.scaleLinear().range([this.height, 0])
                    .domain(d3.extent(visData, d => d[yAttribute]))
            }
        }
    
        // Update left axis (xAttribute)
        this.leftAxis
            .transition().duration(this.transitionDuration || 500)
            .call(d3.axisLeft(this.yScale[xAttribute]));
    
        // Update right axis (yAttribute)
        this.rightAxis
            .transition().duration(this.transitionDuration || 500)
            .call(d3.axisRight(this.yScale[yAttribute]));
    
        // Update axis labels
        this.svg.select(".leftAxisLabel").text(xAttribute);
        this.svg.select(".rightAxisLabel").text(yAttribute);
    }
    
    updateLines(selection, xAttribute, yAttribute) {
        selection.transition().duration(500)
            .attr("y1", d => this.yScale[xAttribute](d[xAttribute]))
            .attr("y2", d => this.yScale[yAttribute](d[yAttribute]));
    }

    leftBrushSelection = null;
    rightBrushSelection = null;
    
    // Modify addBrushes method
    addBrushes(controllerMethods, zAttribute, wAttribute) {
        // Remove any existing brushes
        this.svg.selectAll(".brush").remove();
    
        // Define left brush
        const leftBrush = d3.brushY()
            .extent([[-50, 0], [0, this.height]])
            .on("end", (event) => {
                if (!event.selection) return;
                this.leftBrushSelection = event.selection;
                this.storeBrushIntersection(controllerMethods, zAttribute, wAttribute);
            });
    
        // Define right brush
        const rightBrush = d3.brushY()
            .extent([[0, 0], [0 + 50, this.height]])
            .on("end", (event) => {
                if (!event.selection) return;
                this.rightBrushSelection = event.selection;
                this.storeBrushIntersection(controllerMethods, zAttribute, wAttribute);
            });
    
        // Add left brush to the left axis
        this.svg.append("g")
            .attr("class", "brush left-brush")
            .call(leftBrush);
    
        // Add right brush to the right axis
        this.svg.append("g")
            .attr("class", "brush right-brush")
            .call(rightBrush)
            .attr("transform", `translate(${this.leftWidth}, 0)`);
    }
    
    // Method to store only data from the intersection of both brushes
    storeBrushIntersection(controllerMethods, zAttribute, wAttribute) {
        if (!this.leftBrushSelection || !this.rightBrushSelection) return;
    
        const [leftY0, leftY1] = this.leftBrushSelection;
        const [rightY0, rightY1] = this.rightBrushSelection;
    
        const intersectedData = this.data.filter(d => {
            const leftY = this.yScale[zAttribute](d[zAttribute]);
            const rightY = this.yScale[wAttribute](d[wAttribute]);
    
            // Check if the data point falls within both brushes
            return leftY >= leftY0 && leftY <= leftY1 && rightY >= rightY0 && rightY <= rightY1;
        });
    
        // Pass the intersected data to the controller method
        controllerMethods.handleBrushIntersection(intersectedData);
    }

    getSelectedData(y0, y1, attribute, axis) {
        // Select items within the brush range for the specified axis
        return this.data.filter(d => {
            const value = this.yScale[attribute](d[attribute]);
            return y0 <= value && value <= y1;
        });
    }

    renderParallel(data, zAttribute, wAttribute, selectedItems, controllerMethods) {
        this.data = data;  // Store data for brush access
        this.updateAxis(data, zAttribute, wAttribute);
        this.addBrushes(controllerMethods, zAttribute, wAttribute);

        const selectedSet = new Set(selectedItems.map(item => item.index));
        const lineStyles = data.map(d => ({
            index: d.index,
            strokeColor: selectedSet.has(d.index) ? this.updateColor(d.Seasons) : this.updateColor(d.Seasons),
            strokeWidth: selectedSet.has(d.index) ? 1.3 : 0.5,
            opacity: selectedSet.has(d.index) ? 0.8 : 0.05
        }));

        this.svg.selectAll(".data-line").data(data, (d) => d.index).join(
            enter => {
                enter.append("line")
                    .attr("class", "data-line")
                    .attr("x1", 0)
                    .attr("x2", this.leftWidth)
                    .attr("y1", d => this.yScale[zAttribute](d[zAttribute]))
                    .attr("y2", d => this.yScale[wAttribute](d[wAttribute]))
                    .style("stroke", d => lineStyles.find(s => s.index === d.index).strokeColor)
                    .style("stroke-width", d => lineStyles.find(s => s.index === d.index).strokeWidth)
                    .style("opacity", d => lineStyles.find(s => s.index === d.index).opacity);
            },
            update => {
                update.transition().duration(500)
                    .attr("y1", d => this.yScale[zAttribute](d[zAttribute]))
                    .attr("y2", d => this.yScale[wAttribute](d[wAttribute]))
                    .style("stroke", d => lineStyles.find(s => s.index === d.index).strokeColor)
                    .style("stroke-width", d => lineStyles.find(s => s.index === d.index).strokeWidth)
                    .style("opacity", d => lineStyles.find(s => s.index === d.index).opacity);
            },
            exit => exit.remove()
        );
    }

    clear() {
        d3.select(this.el).selectAll("*").remove();
    }
}

export default ParallelCoordinatesD3;
