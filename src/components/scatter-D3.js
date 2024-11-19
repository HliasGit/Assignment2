import * as d3 from "d3";

class ScatterplotD3 {
    margin = { top: 100, right: 10, bottom: 50, left: 100 };
    defaultOpacity = 0.3;
    transitionDuration = 1000;
    circleRadius = 3;
    xScale;
    yScale;

    color1 = d3.rgb(252, 141, 89).clamp();
    color2 = d3.rgb(44,123,182).clamp();

    color3 = d3.rgb(216, 179, 101).clamp();
    color4 = d3.rgb(90, 245, 172).clamp();

    color5 = d3.rgb(215,25,28).clamp();
    color6 = d3.rgb(253,174,97).clamp();
    color7 = d3.rgb(171,221,164).clamp();
    color8 = d3.rgb(43,131,186).clamp();

    selectedData = [];

    constructor(el) {
        this.el = el;
    }

    create(config) {
        this.size = { width: config.size.width, height: config.size.height };
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // Create SVG
        this.matSvg = d3
            .select(this.el)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        // Axes Groups
        this.matSvg.append("g")
            .attr("class", "xAxisG")
            .attr("transform", `translate(0, ${this.height})`)
            .append("text")
            .attr("class", "xAxisLabel")
            .attr("x", this.width / 2)
            .attr("y", this.margin.bottom - 10)
            .attr("fill", "black")
            .style("font-size", "14px")
            .style("text-anchor", "middle");

        this.matSvg.append("g")
            .attr("class", "yAxisG")
            .append("text")
            .attr("class", "yAxisLabel")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -this.margin.left + 60)
            .attr("fill", "black")
            .style("font-size", "14px")
            .style("text-anchor", "middle");

        // Group for scatterplot dots
        this.all_G = this.matSvg.append("g").attr("class", "all_G");

        // Initialize Scales
        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.yScale = d3.scaleLinear().range([this.height, 0]);

        this.brush = d3.brush()
        this.matSvg.append("g").attr("class", "brush").call(this.brush);
    }

    addBrush(controllerMethods, xAttribute, yAttribute) {

        this.brush
        .extent([[0, 0], [this.width, this.height]])
            .on("end", (event) => {
                if (!event.selection) {
                    this.selectedData = [];
                    return;
                }
                const [[x0, y0], [x1, y1]] = event.selection;
                this.selectedData = [];
    
                this.matSvg.selectAll(".dotG").each((d) => {
                    const cx = this.xScale(d[xAttribute]);
                    const cy = this.yScale(d[yAttribute]);
                    if (x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1) {
                        this.selectedData.push(d);
                    }
                });
    
                controllerMethods.handleBrushEnd(this.selectedData);
            });
    this.matSvg.select(".brush").call(this.brush);
    }

    updateScales(visData, xAttribute, yAttribute) {
        const xExtent = d3.extent(visData, (d) => d[xAttribute]);
        const yExtent = d3.extent(visData, (d) => d[yAttribute]);

        this.xScale.domain(xAttribute === "Date" ? xExtent.map((d) => new Date(d)) : xExtent);
        this.yScale.domain(yAttribute === "Date" ? yExtent.map((d) => new Date(d)) : yExtent);

        this.matSvg.select(".xAxisG")
            .transition().duration(this.transitionDuration)
            .call(d3.axisBottom(this.xScale));

        this.matSvg.select(".yAxisG")
            .transition().duration(this.transitionDuration)
            .call(d3.axisLeft(this.yScale));

        this.matSvg.select(".xAxisLabel").text(xAttribute);
        this.matSvg.select(".yAxisLabel").text(yAttribute);
    }

    updateDots(selection, xAttribute, yAttribute) {
        selection.transition().duration(500)
            .attr("transform", (d) => `translate(${this.xScale(d[xAttribute])}, ${this.yScale(d[yAttribute])})`);
    }

    updateColorSeasons(season) {
        const colorMap = {
            Spring: this.color5,
            Summer: this.color6,
            Autumn: this.color7,
            Winter: this.color8
        };
        return colorMap[season] || null;
    }

    updateColorFunc(func) {
        return func === "Yes" ? this.color1 : this.color2;
    }

    updateColorHoliday(holiday) {
        return holiday === "Holiday" ? this.color3 : this.color4;
    }

    renderScatterplot(visData, xAttribute, yAttribute, catAggreg, controllerMethods, selectedItems) {
        this.updateScales(visData, xAttribute, yAttribute);
        this.addBrush(controllerMethods, xAttribute, yAttribute);

        const selectedSet = new Set(selectedItems.map((item) => item.index));
        const lineStyles = new Map(
            visData.map((d) => [
                d.index,
                {
                    fillColor: catAggreg === "FunctioningDay" ? this.updateColorFunc(d.FunctioningDay) : catAggreg === "Seasons" ? this.updateColorSeasons(d.Seasons) : this.updateColorHoliday(d.Holiday),
                    strokeColor: selectedSet.has(d.index) ? "black" : "none",
                    strokeWidth: selectedSet.has(d.index) ? 1 : "none",
                    opacity: selectedSet.has(d.index) ? 1.2 : 0.6,
                },
            ])
        );

        this.matSvg.select(".all_G")
            .selectAll(".dotG")
            .data(visData, (d) => d.index)
            .join(
                (enter) => {
                    const itemG = enter.append("g")
                        .attr("class", "dotG")
                        .style("opacity", this.defaultOpacity)
                        .on("click", (event, d) => controllerMethods.handleOnClick(d));

                    itemG.append("circle")
                        .attr("class", "dotCircle")
                        .attr("r", this.circleRadius)
                        .style("fill", (d) => lineStyles.get(d.index).fillColor)
                        .style("stroke", (d) => lineStyles.get(d.index).strokeColor)
                        .style("stroke-width", (d) => lineStyles.get(d.index).strokeWidth)
                        .style("opacity", (d) => lineStyles.get(d.index).opacity);

                    this.updateDots(itemG, xAttribute, yAttribute);
                },
                (update) => {
                    this.updateDots(update, xAttribute, yAttribute);

                    update.select(".dotCircle")
                        .style("fill", (d) => lineStyles.get(d.index).fillColor)
                        .style("stroke", (d) => lineStyles.get(d.index).strokeColor)
                        .style("stroke-width", (d) => lineStyles.get(d.index).strokeWidth)
                        .style("opacity", (d) => lineStyles.get(d.index).opacity);
                },
                (exit) => exit.remove()
            );
    }

    clear() {
        d3.select(this.el).selectAll("*").remove();
    }
}

export default ScatterplotD3;
