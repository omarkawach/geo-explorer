import Widget from '../../geo-explorer-api/components/base/widget.js';
import Core from "../../geo-explorer-api/tools/core.js";
import BarChart from "../charts/barChart.js";
import PieChart from "../charts/pieChart.js";
import LineChart from "../charts/lineChart.js";
import ScatterPlot from "../charts/scatterPlot.js";

/**
 * Chart widget module
 * @module widgets/wChart
 * @extends Widget
 * @description Chart widget where a chart is selected and built onto the UI
 * @todo Handle product changes in Application.js?
 */
export default Core.Templatable("App.Widgets.WChart", class wChart extends Widget {

	/** 
	 * Get the widgets title
	*/	
	get title() { return this.Nls("Chart_Title"); }

	/**
	 * Get / set the widgets title with a link
	 */
	get linkTitle() { return this._linkTitle; }

	set linkTitle(link) {
		this._linkTitle = this.Nls('Chart_Title_Link', link);
	}

	/**
	 * Get / Set data label, value, and uom
	 */
	get data() { return this.chart.data; }

    set data(value) {
		var data = value.items.map(item => {
			let label = item["attributes"][this.config.field];
			let value = item["attributes"]["Value"] == null ? 0 : item["attributes"]["Value"];
			let uom = item["attributes"][this.config.uom];
			
			return { label: label, value: value, uom: uom };
		});

		this.DrawChart(data);
    }
	
	/**
	 * Get / set the description of the chart 
	 */
	get description() { return this._description; }

	set description(value) { 
		this.Elem("ChartDescription").innerText = value;

		this._description = value; 
	}

	/**
	 * Get / set the chart type
	 */
	get chartType() { return this._chartType; }

	set chartType(value) {
		this.BuildChart(value);

		this._chartType = value;
	}

	/**
	 * Set up chart widget
	 * @param {object} container - Div chart container and properties
	 * @param {object} options - Any additional options to assign to the widget
	 * @returns {void}
	 */
    constructor(...config) {
		super(...config);

		this.chart = null;
		this.chartType = "BarChart";	// default is bar chart

		this.BuildChart();
    }
	
	/**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Chart_Title", "en", "View chart");
		nls.Add("Chart_Title", "fr", "Type de Diagramme");
		nls.Add("Chart_Title_Link", "en", "Selected data from table <a href='{0}' target='_blank'>{1}</a>");
		nls.Add("Chart_Title_Link", "fr", "Données sélectionnées du tableau <a href='{0}' target='_blank'>{1}</a>");
	}
	
	/**
	 * Configures the widget from a json object
	 * @param {object} config - Configuration parameters of the widget as a json object
	 * @returns {void}
	 */
	Configure(config) {
		this.config.field = config.field[Core.locale];
		this.config.uom = config.uom[Core.locale];
	}
	
    /**
     * @description
     * Here the chart is created based on type selection.
     * @todo 
     * Chart type selection based on JSON.
     */
    BuildChart() {
		// Chart container element
		let element = this.Node("ChartsContainer").elem;

		// Bar Chart by default
		if (this.chartType == "BarChart") {
			this.chart = new BarChart({ element:element });
		} 
		
		else if (this.chartType == "PieChart") {
		  this.chart = new PieChart({ element:element });
		} 
		
		else if (this.chartType == "LineChart") {
		  this.chart = new LineChart({ element:element });
		} 
		
		else if (this.chartType == "ScatterPlot") {
		  this.chart = new ScatterPlot({ element:element });
		}

		this.HideChart();
    }

    /**
     * Update data on the chart, or hide the chart widget if there is no data.
	 * @param {object[]} data - Array of objects containing data values, labels, and uom
	 * @returns {void}
     */
    DrawChart(data) {
		if (data.length == 0) this.HideChart();

		else {
			this.chart.data = data;
			this.chart.Draw();
			this.ShowChart();
		}
    }

	/**
	 * Hide the svg elements in the chart container
	 * @returns {void}
	 */
    HideChart(){
		d3.select(this.Elem("ChartsContainer"))
		  .selectAll("svg")
		  .attr("visibility", "hidden");
    }

	/**
	 * Show the svg elements in the chart container
	 * @returns {void}
	 */	
    ShowChart(){
		d3.select(this.Elem("ChartsContainer"))
		  .selectAll("svg")
		  .attr("visibility", "visible");
    }

    /**
     * Removes the SVG from the charts container and destroys the current chart 
	 * @returns {void}
     */
    ClearChart() {
		var elem = d3.select(this.Elem("ChartsContainer"));
		
		elem.selectAll("svg").remove();
		
		this.chart = null;
    }

	/**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */	
    HTML() {
      return "<div handle='ChartDescription'></div>" +
	  		 "<div handle='ChartsContainer' width='400' height='300'></div>";
    }
  }
);
