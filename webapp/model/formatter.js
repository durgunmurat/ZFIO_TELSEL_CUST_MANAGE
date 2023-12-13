sap.ui.define([], function () {
  "use strict";
  return { 
    numberUnit: function (e) {
      if (!e) {
        return "";
      }
      return parseFloat(e).toFixed(0);
    },
    convertCurr : function (value) {

      try {
      
      value = value.replace(",",".");
      
      return(value);
      
      } catch (e) {
      
      // TODO: handle exception
      
      }
      
      },
    showErrorStatu: function (e, r, n, t, i) {
      var u;
      if (i === "sd") {
        u = e;
      } else if (i === "mm") {
        u = r;
      }
      if (!t) {
        return "None";
      } else if (t === "Y" && parseInt(u) !== parseInt(n)) {
        return "Error";
      } else {
        return "None";
      }
    },
    visibleTableRow1: function (e, r, n) {
      if (n > r) {
        return e % 2 === 1;
      } else {
        return e <= r;
      }
    },
    visibleTableRow2: function (e, r, n) {
      if (n > r) {
        return e % 2 === 0;
      } else {
        return false;
      }
    },
  };
});
