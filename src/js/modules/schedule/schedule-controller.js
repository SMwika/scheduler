ptc.module("Schedule", function(Mod, App){

	Mod.Controller = {
		showSchedule: function() {
			var data = new Mod.ApptCollection(App.Data.Config.schedule);
			var scheduleView = new Mod.View.ApptList({
				collection: data
			});
			// show view in schedule region
			App.scheduleRegion.show(scheduleView);
		},
		deleteAppt: function(appt) {
			// get the ID from the passed model
			var reservationID = appt.get("ID");

			$().SPServices({
				operation: "UpdateListItems",
				async: true,
				webURL: App.Config.Settings.reservationLists.HS.webURL,
				listName: App.Config.Settings.reservationLists.HS.listName,
				batchCmd: "Delete",
				ID: reservationID,
				completefunc: function(xData, Status) {
					App.trigger("user:message", "reservation deleted");
				}
			});
		}
	};
	
});