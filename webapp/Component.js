sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/Device", "zfiotelselkokpit/model/models"],
  function (e, t, i) {
    "use strict";
    return e.extend("zfiotelselkokpit.Component", {
      metadata: { manifest: "json", includes: ["css/style.css"] },
      init: function () {
        e.prototype.init.apply(this, arguments);
        this.getRouter().initialize();
        this.setModel(i.createDeviceModel(), "device");
      },

      exit: function () {
        // Component destroy edildiğinde view ve controllerlar da otomatik destroy edilir
        UIComponent.prototype.exit.apply(this, arguments);
      },
    });
  }
);
