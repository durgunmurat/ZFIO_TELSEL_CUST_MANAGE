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
      
      /**
       * Clean up component resources when destroyed
       * @public
       */
      exit: function () {
        // Destroy device model
        var deviceModel = this.getModel("device");
        if (deviceModel) {
          deviceModel.destroy();
        }
        
        // Destroy router
        var router = this.getRouter();
        if (router) {
          router.destroy();
        }
        
        // Call parent exit
        if (e.prototype.exit) {
          e.prototype.exit.apply(this, arguments);
        }
      },
    });
  }
);
