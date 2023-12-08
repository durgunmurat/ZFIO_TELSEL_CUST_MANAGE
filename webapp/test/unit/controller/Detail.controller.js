sap.ui.define(["zfiotelselkokpit/controller/Detail.controller"], function (t) {
  "use strict";
  QUnit.module("Detail Controller");
  QUnit.test("I should test the Detail controller", function (e) {
    var l = new t();
    l.onInit();
    e.ok(l);
  });
});
