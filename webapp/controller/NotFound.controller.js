sap.ui.define(["./BaseController"], function (e) {
  "use strict";
  return e.extend("zfiotelselkokpit.controller.NotFound", {
    onLinkPressed: function () {
      this.getRouter().navTo("worklist");
    },
  });
});
