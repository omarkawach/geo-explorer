import Templated from '../../components/templated.js';
import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Requests from '../../tools/requests.js';
import Colors from './colors.js';
import StylerBreak from './styler-break.js';

/**
 * Styler widget module
 * @module widgets/styler/styler
 * @extends Templated
 */
export default Core.Templatable("App.Widgets.Styler", class Styler extends Templated {

	/**
	 * Return text for styler widget in both languages
	 * @returns {object.<string, string>} Styler widget text for each language
	 */		
	static Nls(nls) {
		nls.Add("Styler_Title", "en", "Change map style");
		nls.Add("Styler_Title", "fr", "Modifier le style de la carte");
		nls.Add("Styler_Instructions_1", "en", "Use the options below to change how to render the indicator on the map. To confirm your changes, click 'Apply' at the end of the form.");
		nls.Add("Styler_Instructions_1", "fr", "Utiliser les options ci-dessous pour changer la façon dont l’indicateur apparaît sur la carte. Pour confirmer les changements, cliquer sur « Appliquer » en bas du formulaire.");
		nls.Add("Styler_Instructions_3", "en", "* Geographies with no data or that do not fit in the ranges below are transparent on the map but still interactive.");
		nls.Add("Styler_Instructions_3", "fr", "* Les régions géographiques n’ayant pas de données ou ne tenant pas dans les plages ci-dessous apparaissent en transparence sur la carte, mais sont toujours interactives.");
		nls.Add("Styler_Method", "en", "Classification method");
		nls.Add("Styler_Method", "fr", "Méthode de classification");
		nls.Add("Styler_Color_Scheme", "en", "Color Schemes");
		nls.Add("Styler_Color_Scheme", "fr", "Gamme de schèmas");
		nls.Add("Styler_Breaks", "en", "Number of breaks (3 to 8)");
		nls.Add("Styler_Breaks", "fr", "Nombre de bornes (3 à 8)");
		nls.Add("Styler_Style", "en", "Map style");
		nls.Add("Styler_Style", "fr", "Style de la carte");
		nls.Add("Styler_Method_Equal", "en", "Equal intervals");
		nls.Add("Styler_Method_Equal", "fr", "Intervalles égaux");
		nls.Add("Styler_Method_Natural", "en", "Natural breaks");
		nls.Add("Styler_Method_Natural", "fr", "Bornes naturelles");
		nls.Add("Styler_Method_Quantile", "en", "Quantiles");
		nls.Add("Styler_Method_Quantile", "fr", "Quantiles");
		nls.Add("Styler_Scheme_Divergent", "en", "Divergent");
		nls.Add("Styler_Scheme_Divergent", "fr", "Divergente");
		nls.Add("Styler_Scheme_Sequential", "en", "Sequential");
		nls.Add("Styler_Scheme_Sequential", "fr", "Séquentielle");
		nls.Add("Styler_Scheme_Categorical", "en", "Categorical");
		nls.Add("Styler_Scheme_Categorical", "fr", "Catégorique");
		nls.Add("Styler_Max_Lt_Min", "en", "New maximum value is less than the current minimum value for the layer. Input a higher value.");
		nls.Add("Styler_Max_Lt_Min", "fr", "La nouvelle valeur maximale est inférieure à la valeur minimale actuelle pour la couche. Saisir une valeur plus élevée.");
		nls.Add("Styler_Max_Gt_Next", "en", "New maximum value exceeds the next range's maximum value. Input a lower value or increase the next range first.");
		nls.Add("Styler_Max_Gt_Next", "fr", "La nouvelle valeur maximale dépasse la valeur maximale de la plage suivante. Saisir une valeur inférieure ou augmenter d’abord la plage suivante.");
		nls.Add("Styler_Button_Apply", "en", "Apply");
		nls.Add("Styler_Button_Apply", "fr", "Appliquer");		
		nls.Add("Styler_Button_Close", "en", "Cancel");
		nls.Add("Styler_Button_Close", "fr", "Annuler");
	}

	/**
	 * Call constructor of base class (Templated) and initialize styler widget
	 * @param {object} container - div styler container and properties
	 * @param {object} options - any additional options to assign to the widget (not typically used)	  
	 * @returns {void}
	 */	
	constructor(container, options) {
		super(container, options);

		this.metadata = null;
		this.breaks = null;

		this.Elem('sMethod').Add(this.Nls("Styler_Method_Equal"), null, { id:1, algo:"esriClassifyEqualInterval" });
		this.Elem('sMethod').Add(this.Nls("Styler_Method_Natural"), null, { id:2, algo:"esriClassifyNaturalBreaks" });
		this.Elem('sMethod').Add(this.Nls("Styler_Method_Quantile"), null, { id:3, algo:"esriClassifyQuantile" });

		var handler = function(ev) { this.onIBreaks_Change(ev); }.bind(this);

		this.Node('iBreaks').On("change", Core.Debounce(handler, 350));
		this.Node('sMethod').On("Change", this.onMethod_Change.bind(this));

		this.Node("bApply").On("click", this.OnApply_Click.bind(this));
		this.Node("bClose").On("click", this.OnClose_Click.bind(this));

		this.addListenersToScheme();
	}

	addListenersToScheme() {
		// Get a collection of the collapsibles
		this.colls = this.Node("collapsibles")._elem.getElementsByClassName("collapsible");

		// Set the first collapsible as active and show its content
		this.colls[0].classList.toggle("active");
		let content = this.colls[0].nextElementSibling;
		content.style.maxHeight = "100px";

		// Add an event listener to each collapsible
		for (let i = 0; i < this.colls.length; i++) {
			this.colls[i].addEventListener("click", function (ev) {
				this.onCollapsibleClick(ev)
			}.bind(this));
		}
	}

	onCollapsibleClick(ev) {
		for (let j = 0; j < this.colls.length; j++) {
			// For opening or closing the clicked collapsible 
			if (this.colls[j] == ev.target) {
				if (this.colls[j].classList.contains('active')) {
					this.colls[j].classList.remove('active');
				} else {
					this.colls[j].classList.toggle("active");
				}
				this.ToggleContent(this.colls[j].nextElementSibling);
			} 
			// For ensuring the non clicked collapsibles stay closed
			else {
				if (this.colls[j].classList.contains('active')) {
					this.colls[j].classList.remove('active');
					this.ToggleContent(this.colls[j].nextElementSibling);
				}
			}
		}
	}

	ToggleContent(content) {
		if (content.style.maxHeight) {
			content.style.maxHeight = null;
		} else {
			content.style.maxHeight = content.scrollHeight + 'px';
		}
	}

	/**
	 * Load class method, breaks, stard and end colours to styler widget
	 * @param {object} context - Context object
	 * @returns {void}
	 */	
	Update(context) {
		this.context = context;

		var n = context.sublayer.renderer.classBreakInfos.length;

		var idx = this.Elem('sMethod').FindIndex(i => i.algo === context.metadata.breaks.algo);

		this.Elem("sMethod").value = idx;
		this.Elem("iBreaks").value = n;

		this.LoadClassBreaks(context.sublayer.renderer.classBreakInfos);

		if(this.currentScheme == null) {
			this.addColorPalettesToStyler();
		}
	}

	addColorPalettesToStyler() {
		this.colorPaletteAdder(this.Node("divergent").elem, Colors.DivergingColors());
		this.colorPaletteAdder(this.Node("sequential").elem, Colors.SequentialColors());
		this.colorPaletteAdder(this.Node("categorical").elem, Colors.CategoricalColors());
	}

	colorPaletteAdder(dom, colorScheme) {
		for (let index = 0; index < colorScheme.length; index++) {

			// Create color palette 
			let palette = document.createElement('span');
			palette.className = "palette";
			// Tell the user the color
			palette.addEventListener("click", () => {
				this.context.metadata.colors.palette = colorScheme[index][parseInt(this.Elem("iBreaks").value)];
				this.currentScheme = colorScheme[index];

				this.Refresh();
			})

			// Add 5 swatches to the palette
			const elem = colorScheme[index][5];

			for (let index = 0; index < elem.length; index++) {
				const color = elem[index];
				let swatch = document.createElement('span');
				swatch.className = "swatch";
				swatch.style.backgroundColor = color;
	
				palette.appendChild(swatch);
				
			}
			dom.appendChild(palette);
		}
	}

	/**
	 * Remove class break
	 * @param {number} i - Index number to remove from class breaks
	 * @returns {void}
	 */
	Remove(i) {
		var brk = this.breaks[i];
		var prev = this.breaks[i-1];
		var next = this.breaks[i+1];
		
		if (next && prev) next.Min = prev.Max;

		// TODO: implement this in DOM (eventually?)
		this.Elem('breaks').removeChild(brk.Elem('container'));
		this.breaks.splice(i,1);
						
		this.Elem("iBreaks").value = this.breaks.length;
	}

	/**
	 * Create break object from class break info
	 * @param {object[]} classBreakInfos - Object describing class breaks
	 * @returns {void}
	 */	
	LoadClassBreaks(classBreakInfos) {
		Dom.Empty(this.Elem("breaks"));

		this.breaks = classBreakInfos.map((c, i) => {
			var brk = new StylerBreak(this.Elem('breaks'), c);

			brk.On("apply", this.OnBreak_Apply.bind(this, i));

			brk.On("remove", this.OnBreak_Remove.bind(this, i));

			return brk;
		});
	}

	/**
	 * Apply new break value when checkmark next to break is clicked
	 * @param {number} i - Index number of break value to change
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnBreak_Apply(i, ev) {
		var curr = this.breaks[i];
		var next = this.breaks[i + 1];

		if (next && ev.value > next.Max) alert(this.Nls("Styler_Max_Gt_Next"));

		else if (ev.value < curr.Min) alert(this.Nls("Styler_Max_Lt_Min"));

		else {
			ev.target.Save();
			ev.target.StopEdit();

			next.Min = curr.Max;
		}
	}

	/**
	 * Make a call to remove a class break if there is more than one
	 * @param {number} i - Index number to remove
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	OnBreak_Remove(i, ev) {
		// Last break cannot be removed
		if (this.breaks.length == 1) return;
		
		var i = this.breaks.indexOf(ev.target);
		
		this.Remove(i);
	}

	/**
	 * Change number of breaks when up or down arrows are clicked or new number is entered
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	onIBreaks_Change(ev) {
		this.context.metadata.breaks.n = ev.target.value;

		this.context.metadata.colors.palette = this.currentScheme[parseInt(this.Elem("iBreaks").value)];

		this.Refresh();
	}

	/**
	 * Change classification method
	 * @param {object} ev - Event object
	 * @returns {void}
	 */
	onMethod_Change(ev) {
		this.context.metadata.breaks.algo = ev.target.selected.algo;

		this.Refresh();
	}

	/**
	 * Update map when apply button is clicked on styler widget
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	OnApply_Click(ev) {
		this.context.Commit();

		var json = this.context.sublayer.renderer.toJSON();

		json.min = this.breaks[0].min;

		var symbol = this.context.sublayer.renderer.classBreakInfos[0].symbol;

		var breaks = this.breaks.map(b => {
			json.classBreakInfos = this.breaks.map(b => {
				symbol.color = b.Color;

				return {
					description : "",
					label : `${b.Min} - ${b.Max}`,
					classMaxValue: b.Max,
					symbol: symbol.toJSON()
				}
			});
		});

		var renderer = ESRI.renderers.support.jsonUtils.fromJSON(json);

		this.Emit("Change", { renderer:renderer });
	}

	/**
	 * Close styler widget when Cancel button is clicked
	 * @param {object} ev - Mouse event
	 * @returns {void}
	 */
	OnClose_Click(ev) {
		this.context.Revert();

		this.Emit("Close");

		this.Update(this.context);
	}

	/**
	 * Emits error when there is a problem loading class breaks
	 * @param {object} error - Error object
	 * @returns {void}
	 */
	OnRequests_Error (error) {
		this.Emit("Error", { error:error });
	}

	/**
	 * Refresh class breaks based on currently selected options
	 * @returns {void}
	 */
	Refresh() {
		this.Emit("Busy");

		Requests.Renderer(this.context).then(sublayer => {
			this.Emit("Idle");

			this.LoadClassBreaks(sublayer.renderer.classBreakInfos);
		}, error => this.OnRequests_Error(error));
	}

	/**
	 * Create HTML for this widget
	 * @returns {string} HTML for styler widget
	 */	
	Template() {
		return	"<p>nls(Styler_Instructions_1)</p>" +
				"<label>nls(Styler_Method)</label>" +
				"<div handle='sMethod' widget='Basic.Components.Select'></div>" +
				"<label>nls(Styler_Breaks)</label>" +
				"<input handle='iBreaks' type='number' min='3' max='8' />" +
				// New color style (divergent, sequential, categorical)
				"<label>nls(Styler_Color_Scheme)</label>" +
				"<div class='collapsibles' handle='collapsibles'>" +
					"<button class='collapsible'>nls(Styler_Scheme_Divergent)</button>" +
						"<div handle='divergent' class='content'></div>" +
					"<button class='collapsible'>nls(Styler_Scheme_Sequential)</button>" +
						"<div  handle='sequential' class='content'></div>" +
					"<button class='collapsible'>nls(Styler_Scheme_Categorical)</button>" +
						"<div handle='categorical' class='content'></div>" +
				"</div>"+
				"<label>nls(Styler_Style)</label>" +
				"<table handle='breaks' class='breaks-container'>" +
					// Class breaks go here, dynamically created
				"</table>" +
				"<p>nls(Styler_Instructions_3)</p>" +
				"<div class='button-container'>" +
				   "<button handle='bApply' class='button-label button-apply'>nls(Styler_Button_Apply)</button>" +
				   "<button handle='bClose' class='button-label button-close'>nls(Styler_Button_Close)</button>" +
				"</div>";
	}
})
