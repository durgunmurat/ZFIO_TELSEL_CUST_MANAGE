sap.ui.define(
  [
    "zfiotelselkokpit/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "zfiotelselkokpit/model/formatter",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/Toolbar",
  ],
  function (t, a, i, o, r, l, s, n, d, u, p, g) {
    "use strict";
    return t.extend("zfiotelselkokpit.controller.Detail", {
      formatter: i,
      onInit: function () {
        var e = this;
        this.oBundle = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();
        this.date = new Date();
        this.date.setDate(this.date.getDate());
        this.onSetSelectionModel();
        this.onSetDetailModel();
      },
      onSetSelectionModel: function () {
        this.selectionModel = new sap.ui.model.json.JSONModel({
          // cari hesap bilgileri
          ToplamBakiye: "",
          Email: "",
          Tel: "",
          UrunGrp: "",
          UrunGrpTxt: "",
          FirstDay: "",
          SecondDay: "",
          ThirdDay: "",
          SevkiyatDay: "",
          Kunnr: "",
          Name: "",
          // Token:"",
          Net: "",
          Kdv: "",
          Currency: "TRY",
          Uom: "KG",
          Agirlik: "",
          Aciklama:"",
          BelgeAciklama:"",
          BelAcik1:" no'lu sipariş ",
          BelAcik2:" onayı ",
          BelAcik3:" tarafından alınmıştır.",
          SyUname: sap.ushell.Container.getService("UserInfo").getId(),
          SelectionScreenPanelExpanded: true,
          UrunPanelExpanded: false,
          UrunPanelVisible: false,
          Enabled: false,
          AgEnabled: false,
        });
        this.getView().setModel(this.selectionModel, "selectionModel");
      },
      onSetDetailModel: function () {
        var e = new a({
          UrunGrp: "",
          Matnr: "",
          Maktx: "",
          Menge: "",
          Meins: "",
          Ntgew: "",
          Gewei: "",
        });
        this.getView().setModel(e, "detailModel");
      },
      onPressMalzemeListesi: function (e) {
        var a = true;
        if (this.selectionModel.oData.Kunnr == "") {
          var i = "Müşteri giriniz";
          sap.m.MessageToast.show(i);
          sap.ui.core.BusyIndicator.hide(0);
        }
        else {
          var o = this;
          var r = this.byId("lineItemsList").getBinding("items");
          var p = this.byId("_IDGenList2").getBinding("items");
          var s = this.byId("_IDGenList3").getBinding("items");

          var l = this.getModel("selectionModel");
          l.setProperty("/Enabled", false);

          var n = [];

          var cari = o.getView().byId("_id6").getValue();

          // var ugrp = this.getView().byId('_IDGenComboBox2').getSelectedItem().getKey();
          // n.push(
          //   new sap.ui.model.Filter(
          //     "UrunGrp",
          //     sap.ui.model.FilterOperator.EQ,
          //     ugrp
          //   )
          // ); 
          n.push(
            new sap.ui.model.Filter(
              "idMusteri",
              sap.ui.model.FilterOperator.EQ,
              cari
            )
          );

          // var sUrl = "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV/";
          var oModel = new sap.ui.model.odata.v2.ODataModel(
            "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV/",
            true
          );
          r.filter(new sap.ui.model.Filter(n, true));
          p.filter(new sap.ui.model.Filter(n, true));
          s.filter(new sap.ui.model.Filter(n, true));
          oModel.read("/CariSet('" + cari + "')", {
            success: function (oData, oResponse) {
              l.setProperty("/ToplamBakiye", oData.ToplamBakiye);
              l.setProperty("/Email", oData.Email);
              l.setProperty("/Telefon", oData.Telefon);
            },
            error: function (err) {
              alert("Error!");
            }
          });
          sap.ui.core.BusyIndicator.show(0);
          r.refresh();
          p.refresh();
          s.refresh();

          l.setProperty("/UrunPanelExpanded", true);
          l.setProperty("/UrunPanelVisible", true);
          l.setProperty("/SelectionScreenPanelExpanded", false);

          jQuery.sap.delayedCall(1000, this, function () {
            var updR = this.byId("lineItemsList").getItems();
            for (var o = 0; o < updR.length; o++) {
              var updR2 = updR[o];
              var updR3 = updR2.getBindingContext();
              var updR4 = updR3.getProperty(null, l);

              l.setProperty("/FirstDay", updR4.FirstDay);
              l.setProperty("/SecondDay", updR4.SecondDay);
              l.setProperty("/ThirdDay", updR4.ThirdDay);
              break;

            }
          });


          sap.ui.core.BusyIndicator.hide(0);
        }
      },
      setInitialFocus: function (e) {
        this.getView().addEventDelegate(
          {
            onAfterShow: function () {
              setTimeout(
                function () {
                  e.focus();
                }.bind(this),
                0
              );
            },
          },
          this
        );
      },
      saveInput: function () {
        var that = this;
        sap.m.MessageBox.confirm("Sipariş yaratılıyor, emin misiniz?", {
          title:"Bilgilendirme",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          styleClass: "messageBoxError",
          onClose: function (e) {
            if (e === sap.m.MessageBox.Action.YES) {

              
              var oModel = that.getView().getModel();
              var oTable = that.byId("lineItemsList");
              // var idMusteri = that.byId("_id6").getText();
              var idMusteri = that.selectionModel.oData.Kunnr;

              var siparisItem = [];
              var data = {};

              for (var i = 0; i < oTable.getItems().length; i++) {
                var material = oTable.getItems()[i].getCells()[0].getText();
                var adet = parseFloat(
                  oTable.getItems()[i].getCells()[6].getValue()
                ).toFixed(2);
                var birim = oTable.getItems()[i].getCells()[8].getText();

                var siparisResult = {};
                siparisResult.idMusteri = idMusteri;
                siparisResult.Matnr = material.toString();
                siparisResult.Menge = adet;
                siparisResult.Meins = birim;
                siparisResult.SiparisTutar = "0";
                siparisResult.Kdv = "0";

                siparisItem.push(siparisResult);
              }

              data.idMusteri = idMusteri; 
              data.musteriToSiparis   = siparisItem;

              oModel.create("/MusteriSet", data, {
                success: function(oData, oResponse) {
                  // that.clearInputs();
                  // sap.m.MessageToast.show(oResponse.data.Mesaj);

                  sap.m.MessageBox.information(oResponse.data.Mesaj, {
                    title: "Bilgilendirme",
                    id: "messageBoxId1",
                    details: "<p><strong>This can happen if:</strong></p>" +
                    "<ul>" +
                    "<li>You are not connected to the internet</li>" +
                    "<li>a backend component is not <em>available</em></li>" +
                    "<li>or an underlying system is down</li>" +
                    "</ul>" +
                    "<p>Get more help <a href='//www.sap.com' target='_top'>here</a>.",
                    contentWidth: "100px"
                  });
                  // var oModelRefresh = that.getView().getModel();
                  var oTableRefresh = that.byId("lineItemsList");
                  for (var i = 0; i < oTableRefresh.getItems().length; i++) {
                    oTableRefresh.getItems()[i].getCells()[6].setValue("0");
                  }
                  sap.ui.core.BusyIndicator.hide(0);
                  // MessageToast.show("Sipariş Başarıyla Yaratıldı");
                },
                error: function(err) {
                  // this._showServiceError($(err.response.responseText).find("message").first().text());
                  // var message = $(err.responseText).find('message').first().text();
                  var errorObj1 = JSON.parse(err.responseText);
                  // sap.m.MessageBox.error(errorObj1.error.message.value,  {
                  sap.m.MessageBox.error(errorObj1.error.innererror.errordetails[0].message,  {
                    title: "HATA",
                    id: "messageBoxId2",
                    contentWidth: "100px"
                  }); 
                }
              });

            } else {
              sap.m.MessageToast.show("Sipariş kaydedilmedi!");
            }
          },
        });

        sap.ui.core.BusyIndicator.hide(0);



      },

       doSimulation: function () {
        var that = this;
        sap.m.MessageBox.confirm("Fiyat hesaplaması yapılacak, emin misiniz?", {
          title:"Bilgilendirme",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          styleClass: "messageBoxError",
          onClose: function (e) {
            if (e === sap.m.MessageBox.Action.YES) {

              
              var oModel = that.getView().getModel();
              var oTable = that.byId("lineItemsList");
              // var idMusteri = that.byId("_id6").getText();
              var idMusteri = that.selectionModel.oData.Kunnr;

              var siparisItem = [];
              var data = {};

              for (var i = 0; i < oTable.getItems().length; i++) {
                var material = oTable.getItems()[i].getCells()[0].getText();
                var adet = parseFloat(
                  oTable.getItems()[i].getCells()[6].getValue()
                ).toFixed(2);
                var birim = oTable.getItems()[i].getCells()[8].getText();

                var siparisResult = {};
                siparisResult.idMusteri = idMusteri;
                siparisResult.Matnr = material.toString();
                siparisResult.Menge = adet;
                siparisResult.Meins = birim;
                siparisResult.SiparisTutar = "1";
                siparisResult.Kdv = "0";

                siparisItem.push(siparisResult);
              }

              data.idMusteri = idMusteri; 
              data.musteriToSiparis   = siparisItem;

              oModel.create("/MusteriSet", data, {
                success: function(oData, oResponse) {
                  var oTableRefresh = that.byId("lineItemsList");
                  for(var y = 0; y < oData.musteriToSiparis.results.length; y++){
                    var material2 = oData.musteriToSiparis.results[y].Matnr;
                    var mengeout = oData.musteriToSiparis.results[y].Menge;

                    if(mengeout > 0){
                      for (var i = 0; i < oTableRefresh.getItems().length; i++) {
                        var material = oTableRefresh.getItems()[i].getCells()[0].getText();
  
                        if(material == material2){ 
                          var siptutar = oData.musteriToSiparis.results[y].SiparisTutar;
                          var kdvtutar = oData.musteriToSiparis.results[y].Kdv;  
                          oTableRefresh.getItems()[i].getCells()[9].setText(siptutar);  
                          break;
                        }
  
                      }
                    } 
                  }
                  sap.ui.core.BusyIndicator.hide(0);
                  // MessageToast.show("Sipariş Başarıyla Yaratıldı");
                },
                error: function(err) {
                  // this._showServiceError($(err.response.responseText).find("message").first().text());
                  // var message = $(err.responseText).find('message').first().text();
                  var errorObj1 = JSON.parse(err.responseText);
                  // sap.m.MessageBox.error(errorObj1.error.message.value,  {
                  sap.m.MessageBox.error(errorObj1.error.innererror.errordetails[0].message,  {
                    title: "HATA",
                    id: "messageBoxId2",
                    contentWidth: "100px"
                  }); 
                }
              });

            } else {
              sap.m.MessageToast.show("Sipariş kaydedilmedi!");
            }
          },
        });

        sap.ui.core.BusyIndicator.hide(0);



      },


      onHelpRequestedKunnr: function (e) {
        var t = this.getModel("selectionModel");
        if (!this._valueHelpDialogKunnr) {
          this._valueHelpDialogKunnr = sap.ui.xmlfragment(
            "zfiotelselkokpit.fragment.Kunnr",
            this
          );
          this.getView().addDependent(this._valueHelpDialogKunnr);
        }
        var a = [];
        this._valueHelpDialogKunnr.getBinding("items").filter(a);
        this._valueHelpDialogKunnr.open();
      },
      onValueHelpSearchKunnr: function (e) {
        var t = this.getModel("selectionModel");
        var a = e.getParameter("value");
        var i = [];
        i.push(
          new sap.ui.model.Filter(
            "Name",
            sap.ui.model.FilterOperator.Contains,
            a
          )
        );
        e.getSource().getBinding("items").filter(i);
      },
      onValueHelpCloseKunnr: function (e) {
        var t = e.getParameter("selectedItem"),
          a = this.getModel("selectionModel");
        if (t) {
          a.setProperty("/AgEnabled", true);
          a.setProperty("/Kunnr", t.getBindingContext().getProperty("idMusteri"));
          a.setProperty(
            "/Name",
            t.getBindingContext().getProperty("Name")
          );
          // a.setProperty(
          //   "/ToplamBakiye",
          //   t.getBindingContext().getProperty("ToplamBakiye")
          // );
          // a.setProperty(
          //   "/Email",
          //   t.getBindingContext().getProperty("Email")
          // );
          // a.setProperty(
          //   "/Tel",
          //   t.getBindingContext().getProperty("Telefon")
          // ); 
          // a.setProperty(
          //   "/FirstDay",
          //   t.getBindingContext().getProperty("FirstDay")
          // ); 
          // a.setProperty(
          //   "/SecondDay",
          //   t.getBindingContext().getProperty("SecondDay")
          // ); 
          // a.setProperty(
          //   "/ThirdDay",
          //   t.getBindingContext().getProperty("ThirdDay")
          // ); 
          // a.setProperty(
          //   "/SevkiyatDay",
          //   t.getBindingContext().getProperty("SevkiyatDay")
          // ); 
        }
        e.getSource().getBinding("items").filter([]);
      },


      onPressFiltreleriTemizle: function (e) {
        this.onSetSelectionModel();
        this.onSetDetailModel();
      },

      onMessagePopoverPress: function (e) {
        this._getMessagePopover().openBy(e.getSource());
      },
      onFilterPosts: function (e) {

        // build filter array
        var aFilter = [];
        var sQuery = e.getParameter("query");
        if (sQuery) {
          aFilter.push(new sap.ui.model.Filter("Search", sap.ui.model.FilterOperator.Contains, sQuery));
        }
        // var ugrp = this.getView().byId('_IDGenComboBox2').getSelectedItem().getKey();
        // aFilter.push(
        //   new sap.ui.model.Filter(
        //     "UrunGrp",
        //     sap.ui.model.FilterOperator.EQ,
        //     ugrp
        //   )
        // );
        // filter binding
        var oTable = this.byId("lineItemsList");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(aFilter);
      },
      _getMessagePopover: function () {
        if (!this._oMessagePopover) {
          this._oMessagePopover = sap.ui.xmlfragment(
            this.getView().getId(),
            "zfiotelselkokpit.fragment.MessagePopover",
            this
          );
          this.getView().addDependent(this._oMessagePopover);
        }
        return this._oMessagePopover;
      },
      _fixUtcProblem: function (t) {
        if (t) {
          return new Date(e.getTime() - e.getTimezoneOffset() * 60 * 1e3);
        } else {
          return t;
        }
      },
    });
  }
);
