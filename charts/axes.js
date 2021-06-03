/**
 * Axes module
 * @module charts/axes
 * @description 
 * Please refer to the the README in the charts folder for 
 * more information on the D3 concepts presented in this code.
 * @todo For all relevant functions, consider having domain and range as parameters to function
 * For example, what happens if you have a scale that should go in the negatives?
 */
export default class Axes { 

    /**
     * @description
     * Create a new band scale for the x-axis with a domain composed of titles. 
     * @param {Object} data - The entire dataset for the chart 
     * @param {number} width - The extent to which the bands will be spread / mapped
     * @returns A d3.scaleBand() function
     */
    static CreateBandXScale(data, width){
        return d3.scaleBand()
            // Map values into correct pixel positions
            .domain(data.map(d => d.label))
            // Map values from start of data array to end of data array
            .range([0, width])
            .padding(0.1)
    }

    /**
     * @todo
     * Update the domain later when a better dataset is available.
     * @description
     * Create a new linear scale for the x-axis.
     * @param {Object} data - The entire dataset for the chart 
     * @param {number} width - The extent to which parts of the domain will be spread / mapped
     * @returns A d3.scaleLinear() function
     */
    static CreateLinearXScale(data, width){
        return d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([0, width])
    }

    /**
     * @description
     * Create a new linear scale for the y-axis with a domain composed of values.
     * @param {Object} data - The entire dataset for the chart 
     * @param {number} height - The extent to which the bands will be spread / mapped
     * @returns A d3.scaleLinear() function
     */
    static CreateLinearYScale(data, height){
        let max = (d3.max(data, d => d.value) == 0) ? 1 : d3.max(data, d => d.value);

        return d3.scaleLinear()
            // Could also use .domain(d3.extent(data, (d) => d.value )) in some cases
            // max at the top of the y-axis
            // 0 at the bottom of the y-axis
            .domain([max, 0])
            // 0 on bottom of y-axis
            // max at top of y-axis
            .range([0, height])
            // .nice() rounds the domain to nice values
            .nice()
    }

    /**
     * @description
     * Create a function for the Left vertical axis on a chart. 
     * The function will be used to build the horizontal grid 
     * lines from the y-axis tick marks.
     * @param {*} yScale - The linear scale for the vertical axis
     * @param {*} width - The extent of the chart by width
     * @returns A d3.axisLeft() function
     */
    static GridLineHorizontal(yScale, width) {
        return d3.axisLeft(yScale)
        // left axis should have same number of ticks 
        .tickSize(-width).ticks()
        .tickFormat("")
    }
    
    /**
     * @description
     * Create a function for the bottom horizontal axis on a chart. 
     * The function will be used to build the vertical grid 
     * lines from the x-axis tick marks.
     * @param {*} xScale - The linear scale for the horizontal axis
     * @param {*} height - The extent of the chart by height
     * @returns A d3.axisBottom() function
     */
    static GridLineVertical(xScale, height) {
        return d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat("")
    }
}
