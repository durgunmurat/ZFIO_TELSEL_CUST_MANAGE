(function () {
  // Guard against sap not being defined
  if (typeof sap === 'undefined' || !sap.ui) {
    console.error('SAP UI5 is not loaded yet. Please ensure locate-reuse-libs.js is loaded after UI5 initialization.');
    return;
  }

  var e = sap;
  
  var t = function (e, t) {
    var n = [
      "sap.apf",
      "sap.base",
      "sap.chart",
      "sap.collaboration",
      "sap.f",
      "sap.fe",
      "sap.fileviewer",
      "sap.gantt",
      "sap.landvisz",
      "sap.m",
      "sap.ndc",
      "sap.ovp",
      "sap.rules",
      "sap.suite",
      "sap.tnt",
      "sap.ui",
      "sap.uiext",
      "sap.ushell",
      "sap.uxap",
      "sap.viz",
      "sap.webanalytics",
      "sap.zen",
    ];
    Object.keys(e).forEach(function (e) {
      if (
        !n.some(function (t) {
          return e === t || e.startsWith(t + ".");
        })
      ) {
        if (t.length > 0) {
          t = t + "," + e;
        } else {
          t = e;
        }
      }
    });
    return t;
  };
  var n = function (e) {
    var n = "";
    if (e) {
      if (e["sap.ui5"] && e["sap.ui5"].dependencies) {
        if (e["sap.ui5"].dependencies.libs) {
          n = t(e["sap.ui5"].dependencies.libs, n);
        }
        if (e["sap.ui5"].dependencies.components) {
          n = t(e["sap.ui5"].dependencies.components, n);
        }
      }
      if (e["sap.ui5"] && e["sap.ui5"].componentUsages) {
        n = t(e["sap.ui5"].componentUsages, n);
      }
    }
    return n;
  };
  var r = function (e) {
    var t = e;
    return new Promise(function (r, a) {
      if (typeof jQuery === 'undefined' || !jQuery.ajax) {
        a(new Error('jQuery is not available'));
        return;
      }
      jQuery.ajax(t)
        .done(function (e) {
          r(n(e));
        })
        .fail(function () {
          a(new Error("Could not fetch manifest at '" + e));
        });
    });
  };
  var a = function (e) {
    if (e) {
      Object.keys(e).forEach(function (t) {
        var n = e[t];
        if (n && n.dependencies) {
          n.dependencies.forEach(function (e) {
            if (e.url && e.url.length > 0 && e.type === "UI5LIB") {
              if (jQuery && jQuery.sap && jQuery.sap.log) {
                jQuery.sap.log.info(
                  "Registering Library " + e.componentId + " from server " + e.url
                );
              }
              if (jQuery && jQuery.sap && jQuery.sap.registerModulePath) {
                jQuery.sap.registerModulePath(e.componentId, e.url);
              }
            }
          });
        }
      });
    }
  };
  e.registerComponentDependencyPaths = function (e) {
    return r(e).then(function (e) {
      if (e && e.length > 0) {
        var t = "/sap/bc/ui2/app_index/ui5_app_info?id=" + e;
        var n = jQuery.sap && jQuery.sap.getUriParameters ? jQuery.sap.getUriParameters().get("sap-client") : null;
        if (n && n.length === 3) {
          t = t + "&sap-client=" + n;
        }
        return jQuery.ajax(t).done(a);
      }
    });
  };
})();

// Safe execution after UI5 is available
if (typeof sap !== 'undefined' && sap.ui && typeof jQuery !== 'undefined') {
  var scripts = document.getElementsByTagName("script");
  var currentScript = document.getElementById("locate-reuse-libs");
  if (!currentScript) {
    currentScript = document.currentScript;
  }
  
  if (currentScript) {
    var manifestUri = currentScript.getAttribute("data-sap-ui-manifest-uri");
    var componentName = currentScript.getAttribute("data-sap-ui-componentName");
    var useMockserver = currentScript.getAttribute("data-sap-ui-use-mockserver");
    
    var bundleResources = function () {
      if (jQuery.sap && jQuery.sap.require) {
        jQuery.sap.require("jquery.sap.resources");
        var e = sap.ui.getCore().getConfiguration().getLanguage();
        var t = jQuery.sap.resources({ url: "i18n/i18n.properties", locale: e });
        document.title = t.getText("appTitle");
      }
    };
    
    sap
      .registerComponentDependencyPaths(manifestUri)
      .catch(function (e) {
        if (jQuery.sap && jQuery.sap.log) {
          jQuery.sap.log.error(e);
        } else {
          console.error(e);
        }
      })
      .finally(function () {
        sap.ui.getCore().attachInit(bundleResources);
        if (componentName && componentName.length > 0) {
          if (useMockserver && useMockserver === "true") {
            sap.ui.getCore().attachInit(function () {
              sap.ui.require(
                [componentName.replace(/\./g, "/") + "/localService/mockserver"],
                function (e) {
                  e.init();
                  sap.ushell.Container.createRenderer().placeAt("content");
                }
              );
            });
          } else {
            sap.ui.require(["sap/ui/core/ComponentSupport"]);
            sap.ui.getCore().attachInit(bundleResources);
          }
        } else {
          sap.ui.getCore().attachInit(function () {
            sap.ushell.Container.createRenderer().placeAt("content");
          });
        }
      });
  }
}
