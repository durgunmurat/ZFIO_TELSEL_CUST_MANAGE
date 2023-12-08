sap.ui.define(
  [
    "zfiotelselkokpit/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
  ],
  function (e, t, o) {
    "use strict";
    return e.extend("zfiotelselkokpit.controller.App", {
      onInit: function () {
        var e = new sap.ui.model.json.JSONModel();
        e.setData(o);
        sap.ui.getCore().setModel(e, "device");
        var a,
          n,
          s = this.getOwnerComponent().oListSelector,
          l = this.getView().getBusyIndicatorDelay();
        a = new t({ busy: true, delay: 0 });
        this.setModel(a, "appView");
        n = function () {
          a.setProperty("/busy", false);
          a.setProperty("/delay", l);
        };
        this.getOwnerComponent().getModel().metadataLoaded().then(n);
        this.getOwnerComponent().getModel().attachMetadataFailed(n);
      },
    });
  }
);
