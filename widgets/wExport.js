import Widget from '../../geo-explorer-api/components/base/widget.js';
import Core from "../../geo-explorer-api/tools/core.js";
import Select from '../../geo-explorer-api/ui/select.js';

/**
 * Export widget module
 * @module widgets/Export
 * @extends Widget
 */

export default Core.Templatable("App.Widgets.Export", class Export extends Widget { 
    /** 
	 * Get the widgets title
	*/	
	get title() { return this.Nls("Export_Title"); }

    /**
	 * Add specified language strings to the nls object
	 * @param {object} nls - Existing nls object
	 * @returns {void}
	 */
	Localize(nls) {
		nls.Add("Export_Title", "en", "Export Content");
		nls.Add("Export_Title", "fr", "Exporter le Contenu");
        nls.Add("Export_Map", "en", "Map (PDF)");
		nls.Add("Export_Map", "fr", "Carte (PDF)");
        nls.Add("Export_Map_Layout", "en", "Select Layout");
		nls.Add("Export_Map_Layout", "fr", "Sélectionner une mise en page");
        nls.Add("Export_Map_Layout_Type_1", "en", "Landscape 11 x 7");
		nls.Add("Export_Map_Layout_Type_1", "fr", "Portrait 11 x 7");
        nls.Add("Export_Map_Layout_Type_2", "en", "Landscape 8.5 x 11");
		nls.Add("Export_Map_Layout_Type_2", "fr", "Portrait 8.5 x 11");
        nls.Add("Export_Map_MapScale", "en", "Map Scale");
		nls.Add("Export_Map_MapScale", "fr", "Échelle de la carte");
        nls.Add("Export_Data", "en", "Vector Data");
		nls.Add("Export_Data", "fr", "Données vectorielles");
        nls.Add("Export_Data_Type", "en", "Format");
		nls.Add("Export_Data_Type", "fr", "Format");
        nls.Add("Export_Data_Type_CSV", "en", "CSV (no geometries)");
		nls.Add("Export_Data_Type_CSV", "fr", "CSV (sans géométries)");
        nls.Add("Export_Button_Export", "en", "Export");
		nls.Add("Export_Button_Export", "fr", "Exportation");		
		nls.Add("Export_Button_Close", "en", "Cancel");
		nls.Add("Export_Button_Close", "fr", "Annuler");
	}
	
    /**
	 * Set up Export widget
	 * @param {object} container - div container and properties
	 * @returns {void}
	 */
	constructor(container) {	
		super(container);

        this.sliders = [
            {selectors: [
                this.Elem('sLayout'),
                this.Elem('sMapScale')
            ]},
            {selectors: []},
            {selectors: [
                this.Elem('sLayer')
            ]}
        ];

        this.SetupMapSelectors();

        this.SetupLayerSelectors();

        this.Node("bExport").On("click", this.OnExport_Click.bind(this));

		var id_1 = Core.NextId();
		var id_2 = Core.NextId();
		
		this.Elem("section_1").querySelector("label").htmlFor = id_1;
		this.Elem("section_2").querySelector("label").htmlFor = id_2;
		this.Elem("section_1").querySelector("input").id = id_1;
		this.Elem("section_2").querySelector("input").id = id_2;
	}

    /**
     * Set up selectors for printing the PDF map
     * @returns {void}
     */
    SetupMapSelectors() {
        let layoutItems = [
            {label: this.Nls("Export_Map_Layout_Type_1"), description: null},
            {label: this.Nls("Export_Map_Layout_Type_2"), description: null}
        ];

        let mapScaleItems = [
            {label: "1:30,000", description: null},
            {label: "1:100,000", description: null}
        ];
        
        this.LoadDropDown(this.Elem('sLayout'), layoutItems);
        this.LoadDropDown(this.Elem('sMapScale'), mapScaleItems);

        this.Elem('sLayout').roots[0].style.padding = 0; 
        this.Elem('sLayout').roots[0].style.verticalAlign = "text-top";
        this.Elem('sMapScale').roots[0].style.padding = 0; 
        this.Elem('sMapScale').roots[0].style.verticalAlign = "text-top";
    }

    /**
     * Set up selectors for saving the vector data
     * @returns {void}
     */
    SetupLayerSelectors() {
        let layerItems = [
            {label: "GeoJSON", description: null},
            {label: "Shapefile", description: null},
            {label: this.Nls("Export_Data_Type_CSV"), description: null}
        ];

        this.LoadDropDown(this.Elem('sLayer'), layerItems);

        this.Elem('sLayer').roots[0].style.padding = 0; 
        this.Elem('sLayer').roots[0].style.verticalAlign = "text-top";
    }

    /**
	 * Load select element with list of items and enable
	 * @param {object} select - Select element
	 * @param {Object[]} items - List of objects with ids and labels to be added to select element
	 * @returns {void}
	 */
	LoadDropDown(select, items) {
		items.forEach(item => select.Add(item.label, item.description, item));
	}

    /**
	 * Check which content should be exported and their selections (if any)
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
    OnExport_Click(ev) {
        let value, radios = this.container.firstElementChild.getElementsByTagName('input');
        for (var index = 0; index < radios.length; index++) {
            if (radios[index].checked) {
                // The selected radio button
                value = radios[index].value;
                //console.log(this.sliders[value].selectors)
            }
        }
    }

    /**
	 * Create a div for this widget
	 * @returns {string} HTML with custom div
	 */	
     HTML() {
        return 	"<div handle='export'>" +
					"<div class='export-section'>" +
						"<div handle='section_1' class='export-row'>" +
							"<input type='radio' name='radios' value='1' checked/>" +
							"<label class='export-section-label'>nls(Export_Data)</label>" +
						"</div>" +

						"<div class='export-row'>" +
							"<label>nls(Export_Data_Type)" +
								"<div handle='sLayer' widget='Api.Components.Select'></div>" +
							"</label>" +
						"</div>" +
					"</div>" +
					"<hr>" +
					
					"<div class='export-section'>" + 
						"<div handle='section_2' class='export-row'>" +
							"<input type='radio' name='radios' value='2'>" +
							"<label class='export-section-label'>nls(Export_Map)</label>" +
						"</div>" +

						"<div class='export-row'>" +
							"<label>nls(Export_Map_Layout)" +
								"<div handle='sLayout' widget='Api.Components.Select'></div>" +
							"</label>" +
						"</div>" +
							
						"<div class='export-row'>" +
							"<label>nls(Export_Map_MapScale)" +
								"<div handle='sMapScale' widget='Api.Components.Select'></div>" +
							"</label>" +
						"</div>" +
					"</div>" +
				"</div>" +

                "<div class='button-container'>" +
                    "<button handle='bExport' class='button-label button-apply'>nls(Export_Button_Export)</button>" +
                "</div>";
      }
})