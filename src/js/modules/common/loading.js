ptc.module("Common", function(Mod, App, Backbone, Marionette){
	
	Mod.Loading = Backbone.View.extend({
		template: "#loading",
		serializeData: function() {
			return {
				message: this.options.message || "loading..."
			}
		}
	});
	
	
});