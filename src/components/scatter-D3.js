import * as d3 from 'd3'
import { getDefaultFontSize } from '../utils/helper';

class ScatterplotD3 {
    margin = {top: 100, right: 10, bottom: 50, left: 100};
    size;
    height;
    width;
    matSvg;
    // add specific class properties used for the vis render/updates
    defaultOpacity=0.3;
    transitionDuration=1000;
    circleRadius = 3;
    xScale;
    yScale;


    constructor(el){
        this.el=el;
    };

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        // get the effect size of the view by subtracting the margin
        this.width = (this.size.width - this.margin.left - this.margin.right);
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // initialize the svg and keep it in a class property to reuse it in renderMatrix()
        this.matSvg=d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class","matSvgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        ;

        this.xScale = d3.scaleLinear().range([0,this.width]);
        this.yScale = d3.scaleLinear().range([this.height,0]);

        // build xAxisG
        this.matSvg.append("g")
            .attr("class","xAxisG")
            .attr("transform","translate(0,"+this.height+")")
        ;
        this.matSvg.append("g")
            .attr("class","yAxisG")
        ;

    }

    // Inside ScatterplotD3 class
    addBrush(controllerMethods, xAttribute, yAttribute) {
        const brush = d3.brush()
            .extent([[0, 0], [this.width, this.height]])
            .on("end", (event) => {
                if (!event.selection) return; // Ignore if there's no selection

                const [[x0, y0], [x1, y1]] = event.selection;
                const selectedData = [];

                this.matSvg.selectAll(".dotG")
                    .each((d) => {
                        const cx = this.xScale(d[xAttribute]);
                        const cy = this.yScale(d[yAttribute]);
                        if (x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1) {
                            selectedData.push(d); // Add selected data to array
                        }
                    });

                controllerMethods.handleBrushEnd(selectedData); // Pass selected data to controller
            });

        this.matSvg.append("g")
        .attr("class", "brush")
        .call(brush);
    }


    changeBorderAndOpacity(selection){
        selection.style("opacity", (item)=>{
            return item.selected?1:this.defaultOpacity;
        })
        ;

        selection.select(".dotCircle")
            .attr("stroke-width",(item)=>{
                return item.selected?2:0;
            })
        ;
    }

    updateDots(selection, xAttribute, yAttribute) {
        selection.transition().duration(500)
            .attr("transform", (itemData) => {
                // Use xScale and yScale to translate data values into positions
                const xPos = this.xScale(itemData[xAttribute]);  // Use the xAttribute to access the data for the x-axis
                const yPos = this.yScale(itemData[yAttribute]);  // Use the yAttribute to access the data for the y-axis
    
                // Return the translation for each dot's position
                return `translate(${xPos}, ${yPos})`;
            });
    }
    
    highlightSelectedItems(selectedItems){
        // this.changeBorderAndOpacity(updateSelection);
        this.matSvg.selectAll(".dotG")
            // all elements with the class .cellG (empty the first time)
            .data(selectedItems,(itemData)=>itemData.index)
            .join(
                enter=>enter,
                update=>{
                    this.changeBorderAndOpacity(update);
                },
                exit => exit
            )
        ;
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

    updateAxis = function(visData,xAttribute,yAttribute){
        // compute min max using d3.min/max(item=>item.attribute)
        this.xScale.domain([d3.min(visData, d => d[xAttribute]), d3.max(visData, d => d[xAttribute])]);
        this.yScale.domain([d3.min(visData, d => d[yAttribute]), d3.max(visData, d => d[yAttribute])]);

        // create axis with computed scales
        this.matSvg.select(".xAxisG")
        .transition().duration(500)
        .call(d3.axisBottom(this.xScale));

        this.matSvg.select(".yAxisG")
        .transition().duration(500)
        .call(d3.axisLeft(this.yScale));

    }


    renderScatterplot = function (visData, xAttribute, yAttribute, controllerMethods){
        // build the size scales and x,y axis
        this.updateAxis(visData,xAttribute,yAttribute);
        this.addBrush(controllerMethods, xAttribute, yAttribute);

        this.matSvg.selectAll(".dotG")
            // all elements with the class .cellG (empty the first time)
            .data(visData, (itemData) => itemData.index)
            .join(
                enter => {
                    const itemG = enter.append("g")
                        .attr("class", "dotG")
                        .style("opacity", this.defaultOpacity)
                        .on("click", (event, itemData) => {
                            controllerMethods.handleOnClick(itemData);
                        });
    
                    // render element as child of each element "g"
                    itemG.append("circle")
                        .attr("class", "dotCircle")
                        .attr("r", this.circleRadius)
                        .attr("stroke", item => this.updateColor(item.Seasons)) // Use itemData.season here
                        .attr("fill", item => this.updateColor(item.Seasons));
                    
                    this.updateDots(itemG, xAttribute, yAttribute);
                },
                update => {
                    this.updateDots(update, xAttribute, yAttribute);
                    update.select(".dotCircle")
                    .attr("stroke", itemData => this.updateColor(itemData.Seasons)) // Use itemData.season here
                    .attr("fill", itemData => this.updateColor(itemData.Seasons));
                    
                },
                exit => exit.remove()
            );
    }
    

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default ScatterplotD3;