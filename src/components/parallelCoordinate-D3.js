import * as d3 from 'd3';

class ParallelCoordinatesD3 {
    margin = {top: 100, right: 10, bottom: 50, left: 100};
    size;
    height;
    width;
    svg;

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
        this.width = (this.size.width - this.margin.left - this.margin.right)/2.1;
        this.height = (this.size.height - this.margin.top - this.margin.bottom)*2;
        this.leftWidth = this.width;
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
        this.svg.append("g")
            .attr("id", "left-axis")
            .attr("transform", `translate(0, 0)`);

        // Append the right axis (yAttribute) at 2/3 width
        this.svg.append("g")
            .attr("id", "right-axis")
            .attr("transform", `translate(${this.leftWidth}, 0)`);
    }

    renderParallel(data, xAttribute, yAttribute, selectedItems) {
        console.log("Updating axes for xAttribute:", xAttribute, "and yAttribute:", yAttribute);

        // Set up y-scales for each axis based on data range
        const yScales = {
            [xAttribute]: d3.scaleLinear()
                .domain(d3.extent(data, d => d[xAttribute]))
                .range([this.height, 0]),
            [yAttribute]: d3.scaleLinear()
                .domain(d3.extent(data, d => d[yAttribute]))
                .range([this.height, 0])
        };

        // Update the left axis with xAttribute scale
        const leftAxis = d3.select("#left-axis");
        leftAxis.transition().duration(500).call(d3.axisLeft(yScales[xAttribute]));

        // Update or set the label for the left axis
        leftAxis.selectAll(".axis-label").remove();
        leftAxis.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("y", -10)
            .attr("x", 0)
            .text(xAttribute)
            .style("font-size", "12px")
            .style("font-weight", "bold");

        // Update the right axis with yAttribute scale
        const rightAxis = d3.select("#right-axis");
        rightAxis.transition().duration(500).call(d3.axisRight(yScales[yAttribute]));

        // Update or set the label for the right axis
        rightAxis.selectAll(".axis-label").remove();
        rightAxis.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("y", -10)
            .attr("x", 0)
            .text(yAttribute)
            .style("font-size", "12px")
            .style("font-weight", "bold");

            const selectedSet = new Set(selectedItems.map(item => item.index)); // Use the unique key in your data

        // Draw lines connecting xAttribute and yAttribute for each data point
        this.svg.selectAll(".data-line").remove(); // Clear any previous lines
        this.svg.selectAll(".data-line")
            .data(data)
            .join("line")
            .attr("class", "data-line")
            .attr("x1", 0) // Start at the left axis (xAttribute)
            .attr("y1", d => yScales[xAttribute](d[xAttribute]))
            .attr("x2", this.leftWidth) // End at the right axis (yAttribute)
            .attr("y2", d => yScales[yAttribute](d[yAttribute]))
            .style("stroke", d => {
                const isSelected = selectedSet.has(d.index); 
                return isSelected ? this.updateColor(d.Seasons) : "gray";
            })
            .style("stroke-width", d => selectedSet.has(d.index) ? 1.3 : 1) // Thicker line for selected
            .style("opacity", d => selectedSet.has(d.index) ? 0.8 : 0.08); // Full opacity for selected, lower for others
    }

    clear() {
        d3.select(this.el).selectAll("*").remove();
    }
}

export default ParallelCoordinatesD3;
