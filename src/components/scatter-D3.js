import * as d3 from "d3";

class ScatterplotD3 {
    margin = { top: 100, right: 10, bottom: 50, left: 100 };
    defaultOpacity = 0.3;
    transitionDuration = 1000;
    circleRadius = 3;
    xScale;
    yScale;

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
    }

    addBrush(controllerMethods, xAttribute, yAttribute) {
        this.matSvg.selectAll(".brush").remove();

        const brush = d3.brush()
            .extent([[0, 0], [this.width, this.height]])
            .on("end", (event) => {
                if (!event.selection) return;

                const [[x0, y0], [x1, y1]] = event.selection;
                const selectedData = [];

                this.matSvg.selectAll(".dotG").each((d) => {
                    const cx = this.xScale(d[xAttribute]);
                    const cy = this.yScale(d[yAttribute]);
                    if (x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1) {
                        selectedData.push(d);
                    }
                });

                controllerMethods.handleBrushEnd(selectedData);
            });

        this.matSvg.append("g").attr("class", "brush").call(brush);
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

    updateColor(season) {
        const colorMap = {
            Spring: "green",
            Summer: "red",
            Autumn: "yellow",
            Winter: "blue",
        };
        return colorMap[season] || null;
    }

    renderScatterplot(visData, xAttribute, yAttribute, controllerMethods, selectedItems) {
        this.updateScales(visData, xAttribute, yAttribute);
        this.addBrush(controllerMethods, xAttribute, yAttribute);

        const selectedSet = new Set(selectedItems.map((item) => item.index));
        const lineStyles = new Map(
            visData.map((d) => [
                d.index,
                {
                    holiday: d.Holiday === "No Holiday" ? this.updateColor(d.Seasons) : "white",
                    strokeColor: this.updateColor(d.Seasons),
                    strokeWidth: selectedSet.has(d.index) ? 1.5 : 0.5,
                    opacity: selectedSet.has(d.index) ? 1 : this.defaultOpacity,
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
                        .style("fill", (d) => lineStyles.get(d.index).holiday)
                        .style("stroke", (d) => lineStyles.get(d.index).strokeColor)
                        .style("stroke-width", (d) => lineStyles.get(d.index).strokeWidth)
                        .style("opacity", (d) => lineStyles.get(d.index).opacity);

                    this.updateDots(itemG, xAttribute, yAttribute);
                },
                (update) => {
                    this.updateDots(update, xAttribute, yAttribute);

                    update.select(".dotCircle")
                        .style("fill", (d) => lineStyles.get(d.index).holiday)
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
