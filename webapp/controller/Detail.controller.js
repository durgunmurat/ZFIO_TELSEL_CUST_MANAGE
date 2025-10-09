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
    var oController;

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

        var complete_url = window.location.href;
        // var complete_url = "https://sapfioridev.sutas.com.tr:8443/sap/bc/ui2/flp#ztelselkokpit-display?108472";
        var idMusteri = "";
        var idMusteriTmp = "";
        var pieces = complete_url.split("?");
        for (var i = 0; i < pieces.length; i++) {
          idMusteriTmp = complete_url.split("?")[i];
          if (isNaN(idMusteriTmp)) {
          } else {
            idMusteri = idMusteriTmp;
            break;
          }
        }
        this.byId("_idMusteri").setValue(idMusteri);
        this.getMusteri();
      },
      _onRouteMatched: function (oEvent) {
        oController = this;
      },
      onBeforeRendering: function () {
        var that = this;
        var SAPoData = new sap.ui.model.odata.v2.ODataModel(
          "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV_01/",
          true
        );

        sap.ui.core.BusyIndicator.show(0);
        var jsonData = new sap.ui.model.json.JSONModel();
        SAPoData.read("/UrunGrupSet", {
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide(0);
            if (oData.results && oData.results.length > 0) {
              jsonData.setData(oData);
              that.getView().setModel(jsonData, "UrunGrpList");
            } else {
              jsonData.setData([]);
              that.getView().setModel(jsonData, "UrunGrpList");
            }
          },
          error: function (oError) {
            try {
              var errMessage = JSON.parse(oError.responseText);
              errMessage = errMessage.error.message.value;
            } catch (e) {
              errMessage = oError.message;
            }
            sap.m.MessageBox.alert(errMessage, {
              icon: sap.m.MessageBox.Icon.ERROR,
              title: this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("hataUyari"),
            });
            sap.ui.core.BusyIndicator.hide(0);
          },
        });
      },

      onAfterRendering: function () {
        oController = this;
      },
      getMusteri: function () {
        var cari = this.getView().byId("_idMusteri").getValue();
        var newKunnr = cari.replace(/^0+/, "");
        var oButton = this.byId("_idBtnListNew");
        var that = this;
        var SAPoData = new sap.ui.model.odata.v2.ODataModel(
          "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV_01/",
          true
        );

        var l = this.getModel("selectionModel");
        sap.ui.core.BusyIndicator.show(0);
        var jsonData = new sap.ui.model.json.JSONModel();
        //jsonData.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
        jsonData.setSizeLimit("10000000");
        SAPoData.read("/MusteriSet('" + cari + "')", {
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide(0);
            if (oData.Name !== "") {
              l.setProperty("/AgEnabled", true);
              l.setProperty("/Kunnr", newKunnr);
              l.setProperty("/Name", oData.Name);
              l.setProperty("/SicilId", oData.idTemsilci);
              l.setProperty("/SicilAd", oData.TemsilciAdi);
              if (oData.SevkiyatDay == "X") {
                l.setProperty("/OPVisible", true);
                l.setProperty("/OPMusSip", "Müşteri Sip.");
                l.setProperty("/Panel6", true);
              }

              l.setProperty("/SevkiyatVisible", oData.SevkiyatVisible);
              if (oData.SevkiyatVisible == true) {
                l.setProperty("/OPSevkText", "Dist.Sevk.Günleri");
              }
              var button = sap.ui.getCore().byId(that.createId("idRBMus")); //find the button
              sap.ui
                .getCore()
                .byId(that.createId("rbGMain"))
                .setSelectedButton(button);
              l.setProperty("/SicilVisible", false);
              l.setProperty("/MusteriVisible", true);

              oButton.firePress();
            } else if (oData.TemsilciAdi !== "") {
              l.setProperty("/SicilId", oData.idTemsilci);
              l.setProperty("/SicilAd", oData.TemsilciAdi);
              if (oData.SevkiyatDay == "X") {
                l.setProperty("/OPVisible", true);
                l.setProperty("/OPMusSip", "Müşteri Sip.");
                l.setProperty("/Panel6", true);
              }
              l.setProperty("/SevkiyatVisible", oData.SevkiyatVisible);
              if (oData.SevkiyatVisible == true) {
                l.setProperty("/OPSevkText", "Dist.Sevk.Günleri");
              }
              button = sap.ui.getCore().byId(that.createId("idRBMus")); //find the button
              sap.ui
                .getCore()
                .byId(that.createId("rbGMain"))
                .setSelectedButton(button);
              l.setProperty("/SicilVisible", false);
              l.setProperty("/MusteriVisible", true);
            }
          },
          error: function (oError) {
            sap.ui.core.BusyIndicator.hide(0);
          },
        });
      }, 

       onPressMalzemeListesiNew: function (e) {
        var l = this.getModel("selectionModel");

        var jsonRefresh = new sap.ui.model.json.JSONModel();
        jsonRefresh.setData([]);
        this.getView().setModel(jsonRefresh, "OzetList");

        this.byId("_id22").setValue("0");
        this.byId("_id24").setValue("0");
        this.byId("_id26").setValue("0");
        this.byId("_IDGenFeedInput1").setValue("");

        this.byId("_IDGenComboBox3").setSelectedKey("");
        // this.byId("multiComboBox1").clearSelection("");
        // this.byId("multiComboBox2").clearSelection("");
        // this.byId("multiComboBox3").clearSelection("");
        // this.byId("multiComboBox4").clearSelection("");

        l.setProperty("/Enabled", false);
        l.setProperty("/TelPaym", "");
        l.setProperty("/MailPaym", "");

        var cari = this.getView().byId("_idMusteri").getValue();
        var that = this;
        var SAPoData = new sap.ui.model.odata.v2.ODataModel(
          "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV_01/",
          true
        );

        sap.ui.core.BusyIndicator.show(0);
        var jsonData = new sap.ui.model.json.JSONModel();
        //jsonData.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
        jsonData.setSizeLimit("10000000");
        SAPoData.read("/SiparisSet", {
          filters: [
            new sap.ui.model.Filter(
              "idMusteri",
              sap.ui.model.FilterOperator.EQ,
              cari
            ),
          ],
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide(0);
            if (oData.results && oData.results.length > 0) {
              jsonData.setData(oData);
              that.getView().setModel(jsonData, "SiparisList");

              l.setProperty("/FirstDay", oData.results[0].FirstDay);
              l.setProperty("/SecondDay", oData.results[0].SecondDay);
              l.setProperty("/ThirdDay", oData.results[0].ThirdDay);
            } else {
              jsonData.setData([]);
              that.getView().setModel(jsonData, "SiparisList");
            }
          },
          error: function (oError) {
            try {
              var errMessage = JSON.parse(oError.responseText);
              errMessage = errMessage.error.message.value;
            } catch (e) {
              errMessage = oError.message;
            }
            sap.m.MessageBox.alert(errMessage, {
              icon: sap.m.MessageBox.Icon.ERROR,
              title: this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("hataUyari"),
            });
            sap.ui.core.BusyIndicator.hide(0);
          },
        });

        var jsonDataPaym = new sap.ui.model.json.JSONModel();
        jsonDataPaym.setSizeLimit("10000000");
        SAPoData.read("/OdemeSet", {
          filters: [
            new sap.ui.model.Filter(
              "idMusteri",
              sap.ui.model.FilterOperator.EQ,
              cari
            ),
          ],
          success: function (oDataPaym, oResponsePaym) {
            sap.ui.core.BusyIndicator.hide(0);
            if (oDataPaym.results && oDataPaym.results.length > 0) {
              jsonDataPaym.setData(oDataPaym);
              that.getView().setModel(jsonDataPaym, "OdemeList");
              l.setProperty("/TelPaym", oDataPaym.results[0].Telefon);
              l.setProperty("/MailPaym", oDataPaym.results[0].Email);
            } else {
              jsonDataPaym.setData([]);
              that.getView().setModel(jsonDataPaym, "OdemeList");
            }
          },
          error: function (oErrorPaym) {
            sap.ui.core.BusyIndicator.hide(0);
          },
        });

        var that = this;
        var a = true;
        if (this.selectionModel.oData.Kunnr == "") {
          var i = "Müşteri giriniz";
          sap.m.MessageToast.show(i);
          sap.ui.core.BusyIndicator.hide(0);
        } else {
          var o = this;
          var acikSip = that.byId("_IDGenComboBox3").getBinding("items");
          var r = that.byId("_idCBoxPerson").getBinding("items");
          var p = that.byId("_IDGenList2").getBinding("items");
          var s = that.byId("_IDGenList3").getBinding("items");
          if  (this.selectionModel.oData.SevkiyatVisible == true) 
          {
          var sOP = that.byId("_IDGenList6").getBinding("items");
          }
          if (this.selectionModel.oData.OPVisible == true) { 
            var reportHeader = that
              .byId("idReportHeaderTable")
              .getBinding("items");
          }
          var n = [];
          var nReport = [];

          var cari = o.getView().byId("_idMusteri").getValue();
          n.push(
            new sap.ui.model.Filter(
              "idMusteri",
              sap.ui.model.FilterOperator.EQ,
              cari
            )
          );
          nReport.push(
            new sap.ui.model.Filter(
              "Kunnr",
              sap.ui.model.FilterOperator.EQ,
              cari
            )
          );

          var initial = "initial";
          nReport.push(
            new sap.ui.model.Filter(
              "Erdat",
              sap.ui.model.FilterOperator.EQ,
              initial
            )
          );

          var oModel = new sap.ui.model.odata.v2.ODataModel(
            "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV_01/",
            true
          );

          acikSip.filter(new sap.ui.model.Filter(n, true));
          r.filter(new sap.ui.model.Filter(n, true));
          p.filter(new sap.ui.model.Filter(n, true));
          s.filter(new sap.ui.model.Filter(n, true));
          if (this.selectionModel.oData.SevkiyatVisible == true) {
           sOP.filter(new sap.ui.model.Filter(n, true));
          }
          if (this.selectionModel.oData.OPVisible == true) { 
            reportHeader.filter(new sap.ui.model.Filter(nReport, true));
          }

          var numberOfDays = 1;
          var numberOfDaysToAdd = 1;
          var today = new Date();
          var day = today.getDay();

          oModel.read("/CariSet('" + cari + "')", {
            success: function (oData, oResponse) {
              l.setProperty("/ToplamBakiye", oData.ToplamBakiye);
              l.setProperty("/ToplamBak", oData.ToplamBakiye);
              l.setProperty("/VadeBorc", oData.VadeBorc);
              l.setProperty("/Email", oData.Email);
              l.setProperty("/Telefon", oData.Telefon);
              // l.setProperty("/KisiNot",oData.KisiNot);
              l.setProperty("/Kanal", oData.Kanal);
              l.setProperty("/VadeGun", oData.VadeGun);
              l.setProperty("/KanalMudur", oData.KanalMudur);
              l.setProperty("/OperasyonMudur", oData.OperasyonMudur);
              l.setProperty("/OrganizasyonMudur", oData.OrganizasyonMudur);
              l.setProperty("/BolgeMudur", oData.BolgeMudur);
              l.setProperty("/Operasyon", oData.Operasyon);
              l.setProperty("/Organizasyon", oData.Organizasyon);
              l.setProperty("/Plasiyer", oData.Plasiyer);
              l.setProperty("/Ed", oData.Ed);
              if (oData.Ed == "") {
                l.setProperty("/EdVisible", false);
              }
              if (that.selectionModel.oData.OPVisible == true) {
                numberOfDays = parseFloat(oData.NumberOfDays);

                if (day != "7") {
                  if (day > "4") {
                    numberOfDaysToAdd = numberOfDays + 1;
                  } else {
                    numberOfDaysToAdd = numberOfDays;
                  }
                }

                var dateFormat2 = sap.ui.core.format.DateFormat.getDateInstance(
                  {
                    pattern: "dd-MM-yyyy",
                  }
                );
                today.setDate(today.getDate() + numberOfDaysToAdd);
                var dateFormatted2 = dateFormat2.format(today);

                that.getView().byId("idDate1").setValue(dateFormatted2);
                l.setProperty("/Vdatu", dateFormatted2);
              }
            },
            error: function (err) {
              alert("Error!");
            },
          });
          sap.ui.core.BusyIndicator.show(0);

          acikSip.refresh();
          r.refresh();
          p.refresh();
          s.refresh(); 
          // if (this.selectionModel.oData.OPVisible == true) {
          if (this.selectionModel.oData.SevkiyatVisible == true) {
            sOP.refresh();
            // reportHeader.refresh();
          }

          l.setProperty("/UrunPanelExpanded", true);
          l.setProperty("/Panel2", true);
          l.setProperty("/Panel3", true);
          l.setProperty("/Panel4", true);
          l.setProperty("/UrunPanelVisible", true);
          l.setProperty("/SelectionScreenPanelExpanded", true);
          if (this.selectionModel.oData.OPVisible == true) {
            l.setProperty("/OPVisible", true);
            l.setProperty("/Panel6", true);
          }
          if (this.selectionModel.oData.SevkiyatVisible == true) {
            l.setProperty("/OPSevkText", "Dist.Sevk.Günleri");
          }
          l.setProperty("/DisplayMode", true);
          sap.ui.core.BusyIndicator.hide(0);

          if (this.selectionModel.oData.OPVisible == false) {
            if (day == "6") {
              numberOfDaysToAdd = 2;
            }

            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
              pattern: "dd-MM-yyyy",
            });
            today.setDate(today.getDate() + numberOfDaysToAdd);
            var dateFormatted = dateFormat.format(today);

            this.getView().byId("idDate1").setValue(dateFormatted);
            l.setProperty("/Vdatu", dateFormatted);
          }
          // else {
          //   if (day != "7") {
          //     if(day >= "4"){
          //       numberOfDaysToAdd = numberOfDays + 1 ;
          //     }
          //     else{
          //     numberOfDaysToAdd = numberOfDays;
          //     }
          //   }
          // }
        }
},
      onPressMalzemeListesi: function (e) {
       var cari = this.getView().byId("_idMusteri").getValue();
       this.onSetSelectionModel(); 
       this.byId("_idMusteri").setValue(cari); 
       this.getMusteriRefresh();


      },

      getMusteriRefresh: function () {
        var cari = this.getView().byId("_idMusteri").getValue();
        var newKunnr = cari.replace(/^0+/, ""); 
        var that = this;
        var SAPoData = new sap.ui.model.odata.v2.ODataModel(
          "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV_01/",
          true
        );

        var l = this.getModel("selectionModel");
        sap.ui.core.BusyIndicator.show(0);
        var jsonData = new sap.ui.model.json.JSONModel();
        //jsonData.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
        jsonData.setSizeLimit("10000000");
        SAPoData.read("/MusteriSet('" + cari + "')", {
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide(0);
            if (oData.Name !== "") {
              l.setProperty("/AgEnabled", true);
              l.setProperty("/Kunnr", newKunnr);
              l.setProperty("/Name", oData.Name);
              l.setProperty("/SicilId", oData.idTemsilci);
              l.setProperty("/SicilAd", oData.TemsilciAdi);
              if (oData.SevkiyatDay == "X") {
                l.setProperty("/OPVisible", true);
                l.setProperty("/OPMusSip", "Müşteri Sip.");
                l.setProperty("/Panel6", true);
              }

              l.setProperty("/SevkiyatVisible", oData.SevkiyatVisible);
              if (oData.SevkiyatVisible == true) {
                l.setProperty("/OPSevkText", "Dist.Sevk.Günleri");
              }
              var button = sap.ui.getCore().byId(that.createId("idRBMus")); //find the button
              sap.ui
                .getCore()
                .byId(that.createId("rbGMain"))
                .setSelectedButton(button);
              l.setProperty("/SicilVisible", false);
              l.setProperty("/MusteriVisible", true); 


               that.onPressMalzemeListesiNew();
            } else if (oData.TemsilciAdi !== "") {
              l.setProperty("/SicilId", oData.idTemsilci);
              l.setProperty("/SicilAd", oData.TemsilciAdi);
              if (oData.SevkiyatDay == "X") {
                l.setProperty("/OPVisible", true);
                l.setProperty("/OPMusSip", "Müşteri Sip.");
                l.setProperty("/Panel6", true);
              }
              l.setProperty("/SevkiyatVisible", oData.SevkiyatVisible);
              if (oData.SevkiyatVisible == true) {
                l.setProperty("/OPSevkText", "Dist.Sevk.Günleri");
              }
              button = sap.ui.getCore().byId(that.createId("idRBMus")); //find the button
              sap.ui
                .getCore()
                .byId(that.createId("rbGMain"))
                .setSelectedButton(button);
              l.setProperty("/SicilVisible", false);
              l.setProperty("/MusteriVisible", true);
            }
          },
          error: function (oError) {
            sap.ui.core.BusyIndicator.hide(0);
          },
        });
      }, 

      getSiparisList: function () {
        var openOrder = this.getView().byId("_IDGenComboBox3").getValue();
        var cari = this.getView().byId("_idMusteri").getValue();

        var that = this;

        var acikSip = that.byId("_IDGenComboBox3").getBinding("items");
        var n = [];
        n.push(
          new sap.ui.model.Filter(
            "idMusteri",
            sap.ui.model.FilterOperator.EQ,
            cari
          )
        );
        acikSip.filter(new sap.ui.model.Filter(n, true));
        acikSip.refresh();

        var SAPoData = new sap.ui.model.odata.v2.ODataModel(
          "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV_01/",
          true
        );

        sap.ui.core.BusyIndicator.show(0);
        var jsonData = new sap.ui.model.json.JSONModel();
        //jsonData.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
        jsonData.setSizeLimit("10000000");
        SAPoData.read("/SiparisSet", {
          filters: [
            new sap.ui.model.Filter(
              "idMusteri",
              sap.ui.model.FilterOperator.EQ,
              cari
            ),
            new sap.ui.model.Filter(
              "Vbeln",
              sap.ui.model.FilterOperator.EQ,
              openOrder
            ),
          ],
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide(0);
            if (oData.results && oData.results.length > 0) {
              jsonData.setData(oData);
              that.getView().setModel(jsonData, "SiparisList");
            } else {
              jsonData.setData([]);
              that.getView().setModel(jsonData, "SiparisList");
            }
          },
          error: function (oError) {
            try {
              var errMessage = JSON.parse(oError.responseText);
              errMessage = errMessage.error.message.value;
            } catch (e) {
              errMessage = oError.message;
            }
            sap.m.MessageBox.alert(errMessage, {
              icon: sap.m.MessageBox.Icon.ERROR,
              title: this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("hataUyari"),
            });
            sap.ui.core.BusyIndicator.hide(0);
          },
        });
      },

      onSetSelectionModel: function () {
        this.selectionModel = new sap.ui.model.json.JSONModel({
          // cari hesap bilgileri
          ToplamBakiye: "",
          Email: "",
          Tel: "",
          Kanal: "",
          KanalMudur: "",
          Operasyon: "",
          OperasyonMudur: "",
          Organizasyon: "",
          OrganizasyonMudur: "",
          BolgeMudur: "",
          Ed: "",
          EdVisible: true,
          Plasiyer: "",
          OrderDelete: false,
          UrunGrp: "",
          UrunGrpTxt: "",
          FirstDay: "",
          SecondDay: "",
          ThirdDay: "",
          SevkiyatDay: "",
          SevkiyatVisible: false,
          Kunnr: "",
          Name: "",
          SicilId: "",
          SicilAd: "",
          // Token:"",
          Net: "",
          Kdv: "",
          Currency: "TRY",
          Uom: "KG",
          Agirlik: "",
          Aciklama: "",
          BelgeAciklama: "",
          BelAcik1: " no'lu sipariş ",
          BelAcik2: " onayı ",
          BelAcik3: " tarafından alınmıştır.",
          ToplamSiparis: "",
          ToplamSiparisKdv: "",
          ToplamBak: 0.0,
          DigerTutar: 0.0,
          VadeBorc: 0.0,
          VadeGun: 0.0,
          TelPaym: "",
          MailPaym: "",
          SyUname: sap.ushell.Container.getService("UserInfo").getId(),
          SelectionScreenPanelExpanded: true,
          OPVisible: false,
          OPSevkText: "",
          MusteriSip: "",
          Panel1: false,
          Panel2: false,
          Panel3: false,
          Panel4: false,
          Panel6: false,
          UrunPanelExpanded: false,
          UrunPanelVisible: false,
          Enabled: false,
          AgEnabled: false,
          SipTamam: false,
          SicilVisible: true,
          MusteriVisible: false,
          DisplayMode: true,
          Vdatu: "",
          //visiting hours --start--
          Query: "",
          VHName: "",
          VHEmail: "",
          VHTelefon: "",
          VHKisiNot: "",
          MOAB1: "00:00:00",
          MOBI1: "00:00:00",
          MOAB2: "00:00:00",
          MOBI2: "00:00:00",
          DIAB1: "00:00:00",
          DIBI1: "00:00:00",
          DIAB2: "00:00:00",
          DIBI2: "00:00:00",
          MIAB1: "00:00:00",
          MIBI1: "00:00:00",
          MIAB2: "00:00:00",
          MIBI2: "00:00:00",
          DOAB1: "00:00:00",
          DOBI1: "00:00:00",
          DOAB2: "00:00:00",
          DOBI2: "00:00:00",
          FRAB1: "00:00:00",
          FRBI1: "00:00:00",
          FRAB2: "00:00:00",
          FRBI2: "00:00:00",
          SAAB1: "00:00:00",
          SABI1: "00:00:00",
          SAAB2: "00:00:00",
          SABI2: "00:00:00",
          KisiNot: "",
          //visiting hours --end--
        });
        this.getView().setModel(this.selectionModel, "selectionModel");
      },
      onSetDetailModel: function () {
        var e = new sap.ui.model.json.JSONModel({
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
      onPressOpenOrder: function (e) {
        var l = this.getModel("selectionModel");

        var jsonRefresh = new sap.ui.model.json.JSONModel();
        //jsonData.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
        jsonRefresh.setData([]);
        this.getView().setModel(jsonRefresh, "OzetList");

        this.byId("_id22").setValue("0");
        this.byId("_id24").setValue("0");
        this.byId("_id26").setValue("0");
        this.byId("_IDGenFeedInput1").setValue("");

        var openOrder = this.getView().byId("_IDGenComboBox3").getValue();
        var openOrderVdatu = this.getView()
          .byId("_IDGenComboBox3")
          .getSelectedKey();

        l.setProperty("/Enabled", false);
        l.setProperty("/TelPaym", "");
        l.setProperty("/MailPaym", "");

        var cari = this.getView().byId("_idMusteri").getValue();
        var that = this;
        var SAPoData = new sap.ui.model.odata.v2.ODataModel(
          "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV_01/",
          true
        );

        sap.ui.core.BusyIndicator.show(0);
        var jsonData = new sap.ui.model.json.JSONModel();
        //jsonData.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
        jsonData.setSizeLimit("10000000");
        SAPoData.read("/SiparisSet", {
          filters: [
            new sap.ui.model.Filter(
              "idMusteri",
              sap.ui.model.FilterOperator.EQ,
              cari
            ),
            new sap.ui.model.Filter(
              "Vbeln",
              sap.ui.model.FilterOperator.EQ,
              openOrder
            ),
          ],
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide(0);
            if (oData.results && oData.results.length > 0) {
              jsonData.setData(oData);
              that.getView().setModel(jsonData, "SiparisList");

              l.setProperty("/FirstDay", oData.results[0].FirstDay);
              l.setProperty("/SecondDay", oData.results[0].SecondDay);
              l.setProperty("/ThirdDay", oData.results[0].ThirdDay);
              if (l.oData.EdVisible == true) {
                l.setProperty("/OrderDelete", true);
              }
            } else {
              jsonData.setData([]);
              that.getView().setModel(jsonData, "SiparisList");
            }
          },
          error: function (oError) {
            try {
              var errMessage = JSON.parse(oError.responseText);
              errMessage = errMessage.error.message.value;
            } catch (e) {
              errMessage = oError.message;
            }
            sap.m.MessageBox.alert(errMessage, {
              icon: sap.m.MessageBox.Icon.ERROR,
              title: this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("hataUyari"),
            });
            sap.ui.core.BusyIndicator.hide(0);
          },
        });

        var jsonDataPaym = new sap.ui.model.json.JSONModel();
        jsonDataPaym.setSizeLimit("10000000");
        SAPoData.read("/OdemeSet", {
          filters: [
            new sap.ui.model.Filter(
              "idMusteri",
              sap.ui.model.FilterOperator.EQ,
              cari
            ),
          ],
          success: function (oDataPaym, oResponsePaym) {
            sap.ui.core.BusyIndicator.hide(0);
            if (oDataPaym.results && oDataPaym.results.length > 0) {
              jsonDataPaym.setData(oDataPaym);
              that.getView().setModel(jsonDataPaym, "OdemeList");
              l.setProperty("/TelPaym", oDataPaym.results[0].Telefon);
              l.setProperty("/MailPaym", oDataPaym.results[0].Email);
            } else {
              jsonDataPaym.setData([]);
              that.getView().setModel(jsonDataPaym, "OdemeList");
            }
          },
          error: function (oErrorPaym) {
            sap.ui.core.BusyIndicator.hide(0);
          },
        });

        var that = this;
        var a = true;
        if (this.selectionModel.oData.Kunnr == "") {
          var i = "Müşteri giriniz";
          sap.m.MessageToast.show(i);
          sap.ui.core.BusyIndicator.hide(0);
        } else {
          var o = this;

          var acikSip = that.byId("_IDGenComboBox3").getBinding("items");
          var r = that.byId("_idCBoxPerson").getBinding("items");
          var p = that.byId("_IDGenList2").getBinding("items");
          var s = that.byId("_IDGenList3").getBinding("items");
          if  (this.selectionModel.oData.SevkiyatVisible == true) 
          {
          var sOP = that.byId("_IDGenList6").getBinding("items");
          }
          if (this.selectionModel.oData.OPVisible == true) { 
            var reportHeader = that
              .byId("idReportHeaderTable")
              .getBinding("items");
          }

          var n = [];
          var nReport = [];

          var cari = o.getView().byId("_idMusteri").getValue();
          n.push(
            new sap.ui.model.Filter(
              "idMusteri",
              sap.ui.model.FilterOperator.EQ,
              cari
            )
          );
          nReport.push(
            new sap.ui.model.Filter(
              "Kunnr",
              sap.ui.model.FilterOperator.EQ,
              cari
            )
          );
          var initial = "initial";
          nReport.push(
            new sap.ui.model.Filter(
              "Erdat",
              sap.ui.model.FilterOperator.EQ,
              initial
            )
          );
          var oModel = new sap.ui.model.odata.v2.ODataModel(
            "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV_01/",
            true
          );

          acikSip.filter(new sap.ui.model.Filter(n, true));
          r.filter(new sap.ui.model.Filter(n, true));
          p.filter(new sap.ui.model.Filter(n, true));
          s.filter(new sap.ui.model.Filter(n, true));
          if (this.selectionModel.oData.SevkiyatVisible == true) {
           sOP.filter(new sap.ui.model.Filter(n, true));
          }
          if (this.selectionModel.oData.OPVisible == true) { 
            reportHeader.filter(new sap.ui.model.Filter(nReport, true));
          }

          var numberOfDays = 1;
          var numberOfDaysToAdd = 1;
          var today = new Date();
          var day = today.getDay();

          oModel.read("/CariSet('" + cari + "')", {
            success: function (oData, oResponse) {
              l.setProperty("/ToplamBakiye", oData.ToplamBakiye);
              l.setProperty("/ToplamBak", oData.ToplamBakiye);
              l.setProperty("/VadeBorc", oData.VadeBorc);
              l.setProperty("/VadeGun", oData.VadeGun);
              l.setProperty("/Email", oData.Email);
              l.setProperty("/Telefon", oData.Telefon);
              // l.setProperty("/KisiNot",oData.KisiNot);
              l.setProperty("/Kanal", oData.Kanal);
              l.setProperty("/Operasyon", oData.Operasyon);
              l.setProperty("/Organizasyon", oData.Organizasyon);
              l.setProperty("/KanalMudur", oData.KanalMudur);
              l.setProperty("/OperasyonMudur", oData.OperasyonMudur);
              l.setProperty("/OrganizasyonMudur", oData.OrganizasyonMudur);
              l.setProperty("/BolgeMudur", oData.BolgeMudur);
              l.setProperty("/Plasiyer", oData.Plasiyer);
              l.setProperty("/Ed", oData.Ed);
              if (oData.Ed == "") {
                l.setProperty("/EdVisible", false);
              }
              if (l.oData.OPVisible == true) {
                numberOfDays = parseFloat(oData.NumberOfDays);

                if (day != "7") {
                  if (day > "4") {
                    numberOfDaysToAdd = numberOfDays + 1;
                  } else {
                    numberOfDaysToAdd = numberOfDays;
                  }
                }

                var dateFormat2 = sap.ui.core.format.DateFormat.getDateInstance(
                  {
                    pattern: "dd-MM-yyyy",
                  }
                );
                today.setDate(today.getDate() + numberOfDaysToAdd);
                var dateFormatted2 = dateFormat2.format(today);
                if (openOrderVdatu !== "") {
                  that.getView().byId("idDate1").setValue(openOrderVdatu);
                  l.setProperty("/Vdatu", openOrderVdatu);
                } else {
                  that.getView().byId("idDate1").setValue(dateFormatted2);
                  l.setProperty("/Vdatu", dateFormatted2);
                }
                openOrderVdatu = "";
              }
            },
            error: function (err) {
              alert("Error!");
            },
          });
          sap.ui.core.BusyIndicator.show(0);

          acikSip.refresh();
          r.refresh();
          p.refresh();
          s.refresh(); 
          // if (this.selectionModel.oData.OPVisible == true) {
          if (this.selectionModel.oData.SevkiyatVisible == true) {
            sOP.refresh();
            // reportHeader.refresh();
          }

          l.setProperty("/UrunPanelExpanded", true);
          l.setProperty("/Panel2", true);
          l.setProperty("/Panel3", true);
          l.setProperty("/Panel4", true);
          l.setProperty("/UrunPanelVisible", true);
          l.setProperty("/SelectionScreenPanelExpanded", true);
          if (this.selectionModel.oData.OPVisible == true) {
            l.setProperty("/OPVisible", true);
            l.setProperty("/Panel6", true);
          }
          if (this.selectionModel.oData.SevkiyatVisible == true) {
            l.setProperty("/OPSevkText", "Dist.Sevk.Günleri");
          }
          if (openOrder !== "Yeni Sip." && openOrder !== "") {
            l.setProperty("/DisplayMode", false);
            l.setProperty("/UrunPanelExpanded", false);
            jQuery.sap.delayedCall(500, this, function () {
              this.onKaydet();
            });
          } else {
            l.setProperty("/DisplayMode", true);
            sap.ui.core.BusyIndicator.hide(0);
          }

          var numberOfDaysToAdd = 1;
          var today = new Date();
          var day = today.getDay();
          if (this.selectionModel.oData.OPVisible == false) {
            if (day == "6") {
              numberOfDaysToAdd = 2;
            }

            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
              pattern: "dd-MM-yyyy",
            });
            today.setDate(today.getDate() + numberOfDaysToAdd);
            var dateFormatted = dateFormat.format(today);
            if (openOrderVdatu !== "") {
              this.getView().byId("idDate1").setValue(openOrderVdatu);
              l.setProperty("/Vdatu", openOrderVdatu);
            } else {
              this.getView().byId("idDate1").setValue(dateFormatted);
              l.setProperty("/Vdatu", dateFormatted);
            }
            openOrderVdatu = "";
          }
        }
      },

      //// MURATTTT

      onValueHelpMusteri: function (oEvent) {
        const oInput = oEvent.getSource();
        // oInput.setValue(""); // Input'u her açılışta temizle

        const oODataModel = this.getView().getModel("ReportKunnrSH");
        const oJSONModel = new sap.ui.model.json.JSONModel();

        if (!this._oMusteriValueHelpDialog) {
          this._oMusteriValueHelpDialog =
            new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
              title: "🔎 Müşteri Seç",
              supportMultiselect: false,
              supportRanges: false,
              key: "Kunnr",
              descriptionKey: "Name",
              SelectionMode: "Single",
              ok: (oEvt) => this._onDialogOk(oEvt, oInput),
              cancel: () => this._oMusteriValueHelpDialog.close(),
            });

          this._oMusteriValueHelpDialog.setDraggable(true);
          this._oMusteriValueHelpDialog.setResizable(true);
          this._oMusteriValueHelpDialog.setContentWidth("38rem");
          this._oMusteriValueHelpDialog.setContentHeight("26rem");

          this.getView().addDependent(this._oMusteriValueHelpDialog);

          const oSearchInput = new sap.m.Input({
            placeholder: "Müşteri No girin...",
            width: "14rem",
            liveChange: function (oEvent) {
              const sVal = oEvent.getParameter("newValue").trim().toLowerCase();
              const aAll = oJSONModel.getProperty("/allData") || [];

              const aFiltered = aAll.filter((oRow) =>
                oRow.Kunnr?.toLowerCase().startsWith(sVal)
              );

              oJSONModel.setProperty("/results", sVal ? aFiltered : aAll);
              oJSONModel.setProperty("/count", aFiltered.length);

              this._oMusteriValueHelpDialog.setTitle(
                `🔎 Müşteri Seç (${aFiltered.length})`
              );
            }.bind(this),
          });

          const oBar = new sap.m.Bar({
            contentMiddle: [
              new sap.ui.core.Icon({
                src: "sap-icon://search",
                size: "1.2rem",
                color: "#0a6ed1",
              }),
              oSearchInput,
            ],
            design: "Header",
          });

          this._oMusteriValueHelpDialog.setCustomHeader(oBar);

          // ...existing code...
          // this._oMusteriValueHelpDialog.getTableAsync().then((oTable) => {
          var oTable = this._oMusteriValueHelpDialog.getTable();
          oTable.setModel(oJSONModel);
          oTable.bindRows("/results");
          oTable.addStyleClass("sapUiTableRowAlternating");

          oTable.addColumn(
            new sap.ui.table.Column({
              label: new sap.m.Label({ text: "Müşteri No", design: "Bold" }),
              template: new sap.m.Text({ text: "{Kunnr}" }),
              width: "11rem",
              hAlign: "Left",
            })
          );

          oTable.addColumn(
            new sap.ui.table.Column({
              label: new sap.m.Label({
                text: "Müşteri Tanımı",
                design: "Bold",
              }),
              template: new sap.m.Text({ text: "{Name}", wrapping: false }),
              width: "21rem",
              hAlign: "Left",
            })
          );

          oODataModel.read("/ReportKunnrSHSet", {
            success: function (oData) {
              oJSONModel.setData({
                allData: oData.results,
                results: oData.results,
                count: oData.results.length,
              });

              this._oMusteriValueHelpDialog.setTitle(
                `🔎 Müşteri Seç (${oData.results.length})`
              );
            }.bind(this),
            error: function () {
              sap.m.MessageToast.show("Müşteri verisi alınamadı.");
            },
          });
          // }); // getTableAsync kapandı
          // ...existing code...
        } else {
          // Modeldeki filtrelenmiş veriyi sıfırla
          // const oTable = this._oMusteriValueHelpDialog.getTable();
          //   oTable.setModel(oJSONModel); // <-- BURAYA EKLE
          //   oTable.bindRows("/results"); // <-- BURAYA EKLE
          const model = this._oMusteriValueHelpDialog.getTable().getModel();
          if (model && model.getProperty("/allData")) {
            model.setProperty("/results", model.getProperty("/allData"));
            model.setProperty("/count", model.getProperty("/allData").length);
            this._oMusteriValueHelpDialog.setTitle(
              `🔎 Müşteri Seç (${model.getProperty("/allData").length})`
            );
          }

          // Arama inputunu temizle
          const aContent = this._oMusteriValueHelpDialog
            .getCustomHeader()
            .getContentMiddle();
          aContent.forEach(function (ctrl) {
            if (ctrl instanceof sap.m.Input) {
              ctrl.setValue("");
            }
          });
        }

        this._oMusteriValueHelpDialog.open();
      },

      _onDialogOk: function (oEvt, oInput) {
        const oToken = oEvt.getParameter("tokens")[0];
        if (oToken) {
          oInput.setValue(`${oToken.getKey()} - ${oToken.getText()}`);
        }
        this._oMusteriValueHelpDialog.close();
        this._oMusteriValueHelpDialog.destroy();
        this._oMusteriValueHelpDialog = null;
      },

      onValueHelpMatnr: function (oEvent) {
        const oInput = oEvent.getSource();
        // oInput.setValue(""); // Input'u her açılışta temizle
        const oODataModel = this.getView().getModel("ReportMatnrSH");
        const oJSONModel = new sap.ui.model.json.JSONModel();

        if (!this._oMatnrValueHelpDialog) {
          this._oMatnrValueHelpDialog =
            new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
              title: "🔎 Malzeme Seç",
              supportMultiselect: false,
              supportRanges: false,
              key: "Matnr",
              descriptionKey: "Maktx",
              SelectionMode: "Single",
              ok: (oEvt) => this._onDialogOkMatnr(oEvt, oInput),
              cancel: () => this._oMatnrValueHelpDialog.close(),
            });

          this._oMatnrValueHelpDialog.setDraggable(true);
          this._oMatnrValueHelpDialog.setResizable(true);
          this._oMatnrValueHelpDialog.setContentWidth("38rem");
          this._oMatnrValueHelpDialog.setContentHeight("26rem");

          this.getView().addDependent(this._oMatnrValueHelpDialog);

          const oSearchInput = new sap.m.Input({
            placeholder: "Malzeme No girin...",
            width: "14rem",
            liveChange: function (oEvent) {
              const sVal = oEvent.getParameter("newValue").trim().toLowerCase();
              const aAll = oJSONModel.getProperty("/allData") || [];

              const aFiltered = aAll.filter((oRow) =>
                oRow.Matnr?.toLowerCase().startsWith(sVal)
              );

              oJSONModel.setProperty("/results", sVal ? aFiltered : aAll);
              oJSONModel.setProperty("/count", aFiltered.length);

              this._oMatnrValueHelpDialog.setTitle(
                `🔎 Malzeme Seç (${aFiltered.length})`
              );
            }.bind(this),
          });

          const oBar = new sap.m.Bar({
            contentMiddle: [
              new sap.ui.core.Icon({
                src: "sap-icon://search",
                size: "1.2rem",
                color: "#0a6ed1",
              }),
              oSearchInput,
            ],
            design: "Header",
          });

          this._oMatnrValueHelpDialog.setCustomHeader(oBar);

          // getTableAsync yerine getTable kullanımı
          var oTable = this._oMatnrValueHelpDialog.getTable();
          oTable.setModel(oJSONModel);
          oTable.bindRows("/results");
          oTable.addStyleClass("sapUiTableRowAlternating");

          oTable.addColumn(
            new sap.ui.table.Column({
              label: new sap.m.Label({ text: "Malzeme No", design: "Bold" }),
              template: new sap.m.Text({ text: "{Matnr}" }),
              width: "11rem",
              hAlign: "Left",
            })
          );

          oTable.addColumn(
            new sap.ui.table.Column({
              label: new sap.m.Label({
                text: "Malzeme Tanımı",
                design: "Bold",
              }),
              template: new sap.m.Text({ text: "{Maktx}", wrapping: false }),
              width: "21rem",
              hAlign: "Left",
            })
          );

          oODataModel.read("/ReportMatnrSHSet", {
            success: function (oData) {
              oJSONModel.setData({
                allData: oData.results,
                results: oData.results,
                count: oData.results.length,
              });

              this._oMatnrValueHelpDialog.setTitle(
                `🔎 Malzeme Seç (${oData.results.length})`
              );
            }.bind(this),
            error: function () {
              sap.m.MessageToast.show("Malzeme verisi alınamadı.");
            },
          });
        } else {
          // Modeldeki filtrelenmiş veriyi sıfırla

          //  const oTable = this._oMatnrValueHelpDialog.getTable();
          //   oTable.setModel(oJSONModel); // <-- BURAYA EKLE
          //   oTable.bindRows("/results"); // <-- BURAYA EKLE

          const model = this._oMatnrValueHelpDialog.getTable().getModel();
          if (model && model.getProperty("/allData")) {
            model.setProperty("/results", model.getProperty("/allData"));
            model.setProperty("/count", model.getProperty("/allData").length);
            this._oMatnrValueHelpDialog.setTitle(
              `🔎 Malzeme Seç (${model.getProperty("/allData").length})`
            );
          }

          // Arama inputunu temizle
          const aContent = this._oMatnrValueHelpDialog
            .getCustomHeader()
            .getContentMiddle();
          aContent.forEach(function (ctrl) {
            if (ctrl instanceof sap.m.Input) {
              ctrl.setValue("");
            }
          });
        }

        this._oMatnrValueHelpDialog.open();
      },

      _onDialogOkMatnr: function (oEvt, oInput) {
        const oToken = oEvt.getParameter("tokens")[0];
        if (oToken) {
          oInput.setValue(`${oToken.getKey()} - ${oToken.getText()}`);
        }
        this._oMatnrValueHelpDialog.close();
        this._oMatnrValueHelpDialog.destroy();
        this._oMatnrValueHelpDialog = null;
      },

      ////// MURAT 

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
      onSipCancel: function (oEvent) {
        var that = this;

        if (
          this.getView().byId("idReportHeaderTable").getSelectedItems().length <
          1
        ) {
          this.getMessage("satirSec");
          return;
        } else if (
          this.getView().byId("idReportHeaderTable").getSelectedItems().length >
          1
        ) {
          this.getMessage("satirSec2");
          return;
        }
        var i = this.getView().byId("idReportHeaderTable").getSelectedItem();
        var o = i.getBindingContext().getObject();

        var kunnr = this.getView().byId("_idMusteri").getValue();

        if (o.Processed == "X") {
          this.getMessage("errorCancel");
          return;
        } else {
          var text1 = o.Tsblg + " nolu sipariş silinecek, emin misiniz?";

          sap.m.MessageBox.confirm(text1, {
            title: "Bilgilendirme",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            styleClass: "messageBoxError",
            onClose: function (e) {
              if (e === sap.m.MessageBox.Action.YES) {
                var aFilter = [];
                aFilter.push(
                  new sap.ui.model.Filter(
                    "Erdat",
                    sap.ui.model.FilterOperator.EQ,
                    o.Tsblg
                  )
                );

                aFilter.push(
                  new sap.ui.model.Filter(
                    "ReqDate",
                    sap.ui.model.FilterOperator.EQ,
                    "CANCEL"
                  )
                );

                var reportHeader = that
                  .byId("idReportHeaderTable")
                  .getBinding("items");
                reportHeader.filter(new sap.ui.model.Filter(aFilter, true));
                reportHeader.refresh();
              } else {
                sap.m.MessageToast.show("Sipariş silinmedi!");
              }
            },
          });
          jQuery.sap.delayedCall(1500, this, function () {
            this.getReportHeader();
          });
        }
        sap.ui.core.BusyIndicator.hide(0);
      },
      getReportHeader: function (oEvent) {
        var aFilter = [];
        var akunnr =
          this.byId("idInputMusteri")?.getValue()?.trim().split(" - ")[0] || "";
        // var akunnr = this.getView().byId("multiComboBox1").getSelectedItems();
        // var amatnr = this.getView().byId("multiComboBox2").getSelectedItems();
        var amatnr =
          this.byId("idInputMatnr")?.getValue()?.trim().split(" - ")[0] || "";
        // var aerdat = this.getView().byId("multiComboBox3").getSelectedItems();

        var oStartDate = this.getView().byId("dateRangeYaratma").getDateValue();
        if (oStartDate) {
          // sap.m.MessageToast.show("Lütfen tarih seçiniz.");
          // return;
          var yyyy = oStartDate.getFullYear();
          var mm = String(oStartDate.getMonth() + 1).padStart(2, "0");
          var dd = String(oStartDate.getDate()).padStart(2, "0");
          // var yaratmaDate = yyyy + mm + dd; // "20250616"
          var yaratmaDate = dd + "-" + mm + "-" + yyyy; // "16-06-2025"
        }

        var oEndDate = this.getView()
          .byId("dateRangeYaratma")
          .getSecondDateValue();
        if (oEndDate) {
          // sap.m.MessageToast.show("Lütfen tarih seçiniz.");
          // return;
          yyyy = oEndDate.getFullYear();
          mm = String(oEndDate.getMonth() + 1).padStart(2, "0");
          dd = String(oEndDate.getDate()).padStart(2, "0");
          // var yaratmaDateEnd = yyyy + mm + dd; // "20250616"
          var yaratmaDateEnd = dd + "-" + mm + "-" + yyyy; // "16-06-2025"
        }

        // var areqDate = this.getView().byId("multiComboBox4").getSelectedItems();

        oStartDate = this.getView().byId("dateRangeTeslim").getDateValue();
        if (oStartDate) {
          // sap.m.MessageToast.show("Lütfen tarih seçiniz.");
          // return;
          yyyy = oStartDate.getFullYear();
          mm = String(oStartDate.getMonth() + 1).padStart(2, "0");
          dd = String(oStartDate.getDate()).padStart(2, "0");
          // var teslimDate = yyyy + mm + dd; // "20250616"
          var teslimDate = dd + "-" + mm + "-" + yyyy; // "16-06-2025"
        }

        oEndDate = this.getView().byId("dateRangeTeslim").getSecondDateValue();
        if (oEndDate) {
          // sap.m.MessageToast.show("Lütfen tarih seçiniz.");
          // return;
          yyyy = oEndDate.getFullYear();
          mm = String(oEndDate.getMonth() + 1).padStart(2, "0");
          dd = String(oEndDate.getDate()).padStart(2, "0");
          // var teslimDateEnd = yyyy + mm + dd; // "20250616"
          var teslimDateEnd = dd + "-" + mm + "-" + yyyy; // "16-06-2025"
        }

        // for (var i = 0; i < akunnr.length; i++) {
        //   var kunnr = akunnr[i].getKey();
        if (akunnr) {
          aFilter.push(
            new sap.ui.model.Filter(
              "Kunnr",
              sap.ui.model.FilterOperator.EQ,
              akunnr
            )
          );
        }

        // for (var i = 0; i < amatnr.length; i++) {
        //   var matnr = amatnr[i].getKey();
        if (amatnr) {
          aFilter.push(
            new sap.ui.model.Filter(
              "Matnr",
              sap.ui.model.FilterOperator.EQ,
              amatnr
            )
          );
        }

        if (yaratmaDate && yaratmaDateEnd) {
          aFilter.push(
            new sap.ui.model.Filter({
              path: "Erdat",
              operator: sap.ui.model.FilterOperator.BT, // Between
              value1: yaratmaDate, // Başlangıç tarihi
              value2: yaratmaDateEnd, // Bitiş tarihi
            })
          );
        }
        if (teslimDate && teslimDateEnd) {
          aFilter.push(
            new sap.ui.model.Filter({
              path: "ReqDate",
              operator: sap.ui.model.FilterOperator.BT, // Between
              value1: teslimDate, // Başlangıç tarihi
              value2: teslimDateEnd, // Bitiş tarihi
            })
          );
        }

        // for (var i = 0; i < aerdat.length; i++) {
        //   var erdat = aerdat[i].getKey();
        //   aFilter.push(
        //     new sap.ui.model.Filter(
        //       "Erdat",
        //       sap.ui.model.FilterOperator.EQ,
        //       erdat
        //     )
        //   );
        // }

        // for (var i = 0; i < areqDate.length; i++) {
        //   var reqdate = areqDate[i].getKey();
        //   aFilter.push(
        //     new sap.ui.model.Filter(
        //       "ReqDate",
        //       sap.ui.model.FilterOperator.EQ,
        //       reqdate
        //     )
        //   );
        // }

        // if (
        //   akunnr.length == 0 &&
        //   amatnr.length == 0
        //   // aerdat.length == 0 &&
        //   // areqDate.length == 0
        // ) {
        //   kunnr = this.getView().byId("_idMusteri").getValue();
        //   aFilter.push(
        //     new sap.ui.model.Filter(
        //       "Kunnr",
        //       sap.ui.model.FilterOperator.EQ,
        //       kunnr
        //     )
        //   );
        // }

        var reportHeader = this.byId("idReportHeaderTable").getBinding("items");
        reportHeader.filter(new sap.ui.model.Filter(aFilter, true));
        reportHeader.refresh();
        var nReport = [];
        var tsblg = "0";
        nReport.push(
          new sap.ui.model.Filter(
            "Tsblg",
            sap.ui.model.FilterOperator.EQ,
            tsblg
          )
        );
        var reportItem = this.byId("idReportItemTable").getBinding("items");
        reportItem.filter(new sap.ui.model.Filter(nReport, true));
        reportItem.refresh();
      },
      getReportItem: function (oEvent) {
        var tsblg = oEvent
          .getParameter("listItem")
          .getBindingContext()
          .getObject("Tsblg");
        var nReport = [];
        nReport.push(
          new sap.ui.model.Filter(
            "Tsblg",
            sap.ui.model.FilterOperator.EQ,
            tsblg
          )
        );
        var reportItem = this.byId("idReportItemTable").getBinding("items");
        reportItem.filter(new sap.ui.model.Filter(nReport, true));
        reportItem.refresh();
      },

      onKaydet: function (e) {
        var results = [];
        var aData = {};

        var that = this;
        var jsonData = new sap.ui.model.json.JSONModel();
        var oTable = that.byId("lineItemsList");
        var oModel = oTable.getModel("SiparisList");
        var aTmp = oModel.getData();
        for (var i = 0; i < aTmp.results.length; i++) {
          if (aTmp.results[i].Menge > 0) {
            var siparisResult = {};
            siparisResult.Maktx = aTmp.results[i].Maktx;
            siparisResult.Matnr = aTmp.results[i].Matnr;
            siparisResult.Menge = aTmp.results[i].Menge;
            siparisResult.Meins = aTmp.results[i].Meins;
            siparisResult.SiparisTutar = aTmp.results[i].SiparisTutar;
            siparisResult.Currency = "TRY";
            results.push(siparisResult);
          }
        }
        aData.results = results;
        jsonData.setData(aData);
        this.getView().setModel(jsonData, "OzetList");
      },
      closeSum: function () {
        this._valueHelpDialogSum.close();
      },

      saveOrder: function () {
        if (this.selectionModel.oData.OPVisible == true) {
          this.checkQty();
        } else {
          this.saveInput();
        }
      },

      checkQty: function () {
        var that = this;
        if (this.selectionModel.oData.OPVisible == true) {
          var text3 = "";
          var oModel3 = this.byId("lineItemsList").getModel("SiparisList");
          var rData = oModel3.getData();
          for (var i = 0; i < rData.results.length; i++) {
            if (rData.results[i].Menge > 0) {
              var matnr = parseFloat(rData.results[i].Matnr);
              var adet = parseFloat(rData.results[i].Menge);
              var onerilen = parseFloat(rData.results[i].Onerilen);
              var perc = (onerilen / 100) * 20;
              var max = onerilen + perc;
              var min = onerilen / 2;
              if (onerilen > 0) {
                if (adet > max) {
                  text3 =
                    text3 +
                    matnr +
                    " nolu üründe Kalan Hedefe Göre Önerilen miktarın çok üzerinde sipariş giriş yapıyorsunuz. Emin misiniz?" +
                    "\r\n";
                } else if (adet < min) {
                  text3 =
                    text3 +
                    matnr +
                    " nolu üründe Kalan Hedefe Göre Önerilen miktarın çok altında sipariş giriş yapıyorsunuz. Emin misiniz?" +
                    "\r\n";
                }
              }
            }
          }

          if (text3 !== "") {
            sap.m.MessageBox.confirm(text3, {
              title: "Bilgilendirme",
              actions: [
                sap.m.MessageBox.Action.YES,
                sap.m.MessageBox.Action.NO,
              ],
              styleClass: "messageBoxError",
              onClose: function (e) {
                if (e === sap.m.MessageBox.Action.YES) {
                  that.saveInput();
                }
              },
            });
          } else {
            that.saveInput();
          }
        }
      },

      deleteOrder: function () {
        var l = this.getModel("selectionModel");
        var that = this;
        var openOrder = that.getView().byId("_IDGenComboBox3").getValue();

        if (openOrder !== "Yeni Sip." && openOrder !== "") {
          var text1 = "Sipariş siliniyor, emin misiniz?";
          var text2 = "Sipariş Siliniyor...";

          sap.m.MessageBox.confirm(text1, {
            title: "Bilgilendirme",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            styleClass: "messageBoxError",
            onClose: function (e) {
              if (e === sap.m.MessageBox.Action.YES) {
                var dialog = new sap.m.BusyDialog({
                  text: text2,
                });

                dialog.open();
                var oModel = that.getView().getModel();
                var idMusteri = that.selectionModel.oData.Kunnr;

                var siparisItem = [];
                var data = {};
                var siparisResult = {};

                siparisResult.idMusteri = idMusteri;
                siparisResult.Matnr = "";
                siparisResult.Menge = "0";
                siparisResult.Meins = "";
                siparisResult.SiparisTutar = "0";
                siparisResult.Kdv = "0";
                siparisItem.push(siparisResult);

                data.MusteriSip = "";
                data.idMusteri = idMusteri;
                data.musteriToSiparis = siparisItem;
                data.ToplamSiparis = "0";
                data.ToplamKdv = "0";
                data.ToplamSiparisKdv = "0";
                data.Vbeln = that.getView().byId("_IDGenComboBox3").getValue();
                // var begda = that.getView().byId("idDate1").getValue();
                data.SevkDate = "delete";

                oModel.create("/MusteriSet", data, {
                  success: function (oData, oResponse) {
                    sap.m.MessageBox.information(oResponse.data.Mesaj, {
                      title: "Bilgilendirme",
                      id: "messageBoxId1",
                      contentWidth: "100px",
                    });
                    dialog.close();

                    l.setProperty("/OrderDelete", false);

                    that.byId("_id22").setValue("0");
                    that.byId("_id24").setValue("0");
                    that.byId("_id26").setValue("0");
                    that.byId("_IDGenComboBox3").setValue("");
                    that.getSiparisList();

                    that.byId("_IDGenInput1").setValue("");

                    sap.ui.core.BusyIndicator.hide(0);
                  },
                  error: function (err) {
                    var errorObj1 = JSON.parse(err.responseText);
                    sap.m.MessageBox.error(
                      errorObj1.error.innererror.errordetails[0].message,
                      {
                        title: "HATA",
                        id: "messageBoxId2",
                        contentWidth: "100px",
                      }
                    );
                    dialog.close();
                    sap.ui.core.BusyIndicator.hide(0);
                  },
                });
              } else {
                sap.m.MessageToast.show("Sipariş silinemedi!");
              }
            },
          });

          sap.ui.core.BusyIndicator.hide(0);
        }
      },

      saveInput: function () {
        var that = this;
        var openOrder = that.getView().byId("_IDGenComboBox3").getValue();

        if (openOrder !== "Yeni Sip." && openOrder !== "") {
          var text1 = "Sipariş güncelleniyor, emin misiniz?";
          var text2 = "Sipariş Güncelleniyor...";
        } else {
          text1 = "Sipariş yaratılıyor, emin misiniz?";
          text2 = "Sipariş Yaratılıyor...";
        }

        sap.m.MessageBox.confirm(text1, {
          title: "Bilgilendirme",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          styleClass: "messageBoxError",
          onClose: function (e) {
            if (e === sap.m.MessageBox.Action.YES) {
              var dialog = new sap.m.BusyDialog({
                text: text2,
              });

              dialog.open();
              var oModel = that.getView().getModel();
              var oTable = that.byId("lineItemsList");

              var oModel2 = oTable.getModel("SiparisList");
              var aData = oModel2.getData();

              var idMusteri = that.selectionModel.oData.Kunnr;

              var siparisItem = [];
              var data = {};

              for (var i = 0; i < aData.results.length; i++) {
                if (aData.results[i].Menge > 0) {
                  var material = aData.results[i].Matnr;
                  var adet = parseFloat(aData.results[i].Menge).toFixed(2);
                  var birim = aData.results[i].Meins;

                  var siparisResult = {};
                  siparisResult.idMusteri = idMusteri;
                  siparisResult.Matnr = material.toString();
                  siparisResult.Menge = adet;
                  siparisResult.Meins = birim;
                  siparisResult.SiparisTutar = "0";
                  siparisResult.Kdv = "0";

                  // if (that.selectionModel.oData.OPVisible == true) {
                  //       var adetTmp     = parseFloat(aData.results[i].Menge);
                  //       var onerilenTmp = parseFloat(aData.results[i].Onerilen);
                  //       var perc  = ((onerilenTmp/ 100) * 20);
                  //       var max = onerilenTmp + perc;
                  //       var min = onerilenTmp / 2;
                  //       if(onerilenTmp > 0){
                  //         if( adetTmp > max ){
                  //           var text3 = "Kalan Hedefe Göre Önerilen miktarın çok üzerinde sipariş giriş yapıyorsunuz. Emin misiniz?";
                  //           break;
                  //         }
                  //         else if ( adetTmp < min ){
                  //           text3 = "Kalan Hedefe Göre Önerilen miktarın çok altında sipariş giriş yapıyorsunuz. Emin misiniz?";
                  //           break;
                  //         }
                  //       }

                  //   if(text3 != ""){
                  //     sap.m.MessageBox.confirm(text3, {
                  //       title: "Bilgilendirme",
                  //       actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                  //       styleClass: "messageBoxError",
                  //       onClose: function (e) {
                  //         if (e === sap.m.MessageBox.Action.YES)
                  //         {
                  //           siparisItem.push(siparisResult);
                  //         }
                  //       },
                  //     });
                  //   }

                  // }
                  // else{
                  //   siparisItem.push(siparisResult);
                  // }
                  siparisItem.push(siparisResult);
                }
              }

              // MÜŞTERİ SİPARİŞİ

              // if (that.selectionModel.oData.OPVisible == true) {
              data.MusteriSip = that.selectionModel.oData.MusteriSip;
              // }

              // MÜŞTERİ SİPARİŞİ

              data.idMusteri = idMusteri;
              data.musteriToSiparis = siparisItem;
              data.ToplamSiparis = "0";
              data.ToplamKdv = "0";
              data.ToplamSiparisKdv = "0";
              data.Vbeln = that.getView().byId("_IDGenComboBox3").getValue();
              var begda = that.getView().byId("idDate1").getValue();
              data.SevkDate = begda;
              oModel.create("/MusteriSet", data, {
                success: function (oData, oResponse) {
                  sap.m.MessageBox.information(oResponse.data.Mesaj, {
                    title: "Bilgilendirme",
                    id: "messageBoxId1",
                    contentWidth: "100px",
                  });
                  dialog.close();

                  that.byId("_id22").setValue("0");
                  that.byId("_id24").setValue("0");
                  that.byId("_id26").setValue("0");
                  that.getSiparisList();

                  that.byId("_IDGenInput1").setValue("");
                  sap.ui.core.BusyIndicator.hide(0);
                },
                error: function (err) {
                  var errorObj1 = JSON.parse(err.responseText);
                  sap.m.MessageBox.error(
                    errorObj1.error.innererror.errordetails[0].message,
                    {
                      title: "HATA",
                      id: "messageBoxId2",
                      contentWidth: "100px",
                    }
                  );
                  dialog.close();
                  sap.ui.core.BusyIndicator.hide(0);
                },
              });
            } else {
              sap.m.MessageToast.show("Sipariş kaydedilmedi!");
            }
          },
        });

        sap.ui.core.BusyIndicator.hide(0);
      },

      doSimulation: function () {
        var dialog = new sap.m.BusyDialog({
          text: "Fiyat Hesaplanıyor...",
        });

        dialog.open();

        jQuery.sap.delayedCall(2000, this, function () {
          var that = this;

          var oModel = that.getView().getModel();
          var oTable = that.byId("lineItemsList");

          var idMusteri = that.selectionModel.oData.Kunnr;

          var oModel2 = oTable.getModel("SiparisList");
          var aData = oModel2.getData();

          var siparisItem = [];
          var data = {};

          for (var i = 0; i < aData.results.length; i++) {
            if (aData.results[i].Menge > 0) {
              var material = aData.results[i].Matnr;
              var adet = parseFloat(aData.results[i].Menge).toFixed(2);
              var birim = aData.results[i].Meins;

              var siparisResult = {};
              siparisResult.idMusteri = idMusteri;
              siparisResult.Matnr = material.toString();
              siparisResult.Menge = adet;
              siparisResult.Meins = birim;
              siparisResult.SiparisTutar = "1";
              siparisResult.Kdv = "0";

              siparisItem.push(siparisResult);
            }
          }

          data.idMusteri = idMusteri;
          data.musteriToSiparis = siparisItem;
          data.ToplamSiparis = "0";
          data.ToplamKdv = "0";
          data.ToplamSiparisKdv = "0";
          var begda = this.getView().byId("idDate1").getValue();
          data.SevkDate = begda;

          var a = that.getModel("selectionModel");
          oModel.create("/MusteriSet", data, {
            success: function (oData, oResponse) {
              a.setProperty("/ToplamSiparis", oData.ToplamSiparis);
              a.setProperty("/Kdv", oData.ToplamKdv);
              a.setProperty("/ToplamSiparisKdv", oData.ToplamSiparisKdv);
              var oTableRefresh = that.byId("lineItemsList");

              var oModel3 = oTableRefresh.getModel("SiparisList");
              var aData2 = oModel3.getData();

              for (var y = 0; y < oData.musteriToSiparis.results.length; y++) {
                var material2 = oData.musteriToSiparis.results[y].Matnr;
                var mengeout = oData.musteriToSiparis.results[y].Menge;

                if (mengeout > 0) {
                  for (var i = 0; i < aData2.results.length; i++) {
                    var material = aData2.results[i].Matnr;
                    if (material == material2) {
                      var siptutar =
                        oData.musteriToSiparis.results[y].SiparisTutar;

                      aData2.results[i].SiparisTutar = siptutar;

                      break;
                    }
                  }
                }
              }
              var jsonData = new sap.ui.model.json.JSONModel();
              jsonData.setData(aData2);
              that.getView().setModel(jsonData, "SiparisList");

              sap.ui.core.BusyIndicator.hide(0);

              that.onKaydet();
            },
            error: function (err) {
              var errorObj1 = JSON.parse(err.responseText);
              sap.m.MessageBox.error(
                errorObj1.error.innererror.errordetails[0].message,
                {
                  title: "HATA",
                  id: "messageBoxId2",
                  contentWidth: "100px",
                }
              );
              sap.ui.core.BusyIndicator.hide(0);
            },
          });
          dialog.close();
          sap.ui.core.BusyIndicator.hide(0);
        });
      },
      onChange: function (event) {
        var idx = 0;
        if (this.selectionModel.oData.OPVisible == true) {
          idx = 8;
        } else {
          idx = 7;
        }
        var idMenge = parseFloat(
          event.getSource().getParent().getCells()[idx].getValue()
        );

        var oTable = this.byId("lineItemsList");

        var sPath =
          event.getSource().mBindingInfos.value.binding.oContext.sPath;
        var oModel = oTable.getModel("SiparisList");

        oModel.setProperty(sPath + "/Menge", idMenge);
        sap.ui.core.BusyIndicator.hide(0);
      },
      openKisiNot: function (e) {
        var t = this.getModel("selectionModel");
        if (!this._valueHelpDialogKisiNot) {
          this._valueHelpDialogKisiNot = sap.ui.xmlfragment(
            "zfiotelselkokpit.fragment.KisiNot",
            this
          );
          this.getView().addDependent(this._valueHelpDialogKisiNot);
        }
        var a = [];
        this._valueHelpDialogKisiNot.open();
      },
      saveKisiNot: function () {
        var l = this.getModel("selectionModel");

        var that = this;
        var oModel = this.getView().getModel();
        var data = {};

        var idMusteri = this.getView().byId("_idMusteri").getValue();
        var not = sap.ui.getCore().byId("idKisiNotTextArea").getValue();

        data.Query = this.selectionModel.oData.Query;
        data.KisiNot = not;

        oModel.create("/VisitingSet", data, {
          success: function (oData, oResponse) {
            var p = that.byId("_IDGenList2").getBinding("items");
            var n = [];
            n.push(
              new sap.ui.model.Filter(
                "idMusteri",
                sap.ui.model.FilterOperator.EQ,
                idMusteri
              )
            );
            p.filter(new sap.ui.model.Filter(n, true));
            p.refresh();

            sap.ui.core.BusyIndicator.hide(0);
            sap.m.MessageToast.show("Başarıyla tamamlandı!");
            that._valueHelpDialogKisiNot.close();
          },
          error: function (err) {
            var errorObj1 = JSON.parse(err.responseText);
            sap.m.MessageBox.error(
              errorObj1.error.innererror.errordetails[0].message,
              {
                title: "HATA",
                id: "messageBoxId2",
                contentWidth: "100px",
              }
            );
          },
        });
      },
      closeKisiNot: function () {
        this._valueHelpDialogKisiNot.close();
      },

      openVisiting: function (e) {
        var t = this.getModel("selectionModel");
        if (!this._valueHelpDialogVisiting) {
          this._valueHelpDialogVisiting = sap.ui.xmlfragment(
            "zfiotelselkokpit.fragment.Visiting",
            this
          );
          this.getView().addDependent(this._valueHelpDialogVisiting);
        }
        var a = [];
        this._valueHelpDialogVisiting.open();
      },

      closeVisiting: function () {
        this._valueHelpDialogVisiting.close();
      },
      clearVisiting: function () {
        sap.ui.getCore().byId("VHId7").setValue("00:00:00");
        sap.ui.getCore().byId("VHId8").setValue("00:00:00");
        sap.ui.getCore().byId("VHId9").setValue("00:00:00");
        sap.ui.getCore().byId("VHId10").setValue("00:00:00");
        sap.ui.getCore().byId("VHId13").setValue("00:00:00");
        sap.ui.getCore().byId("VHId14").setValue("00:00:00");
        sap.ui.getCore().byId("VHId15").setValue("00:00:00");
        sap.ui.getCore().byId("VHId16").setValue("00:00:00");
        sap.ui.getCore().byId("VHId19").setValue("00:00:00");
        sap.ui.getCore().byId("VHId20").setValue("00:00:00");
        sap.ui.getCore().byId("VHId32").setValue("00:00:00");
        sap.ui.getCore().byId("VHId33").setValue("00:00:00");
        sap.ui.getCore().byId("VHId22").setValue("00:00:00");
        sap.ui.getCore().byId("VHId23").setValue("00:00:00");
        sap.ui.getCore().byId("VHId35").setValue("00:00:00");
        sap.ui.getCore().byId("VHId36").setValue("00:00:00");
        sap.ui.getCore().byId("VHId25").setValue("00:00:00");
        sap.ui.getCore().byId("VHId26").setValue("00:00:00");
        sap.ui.getCore().byId("VHId38").setValue("00:00:00");
        sap.ui.getCore().byId("VHId39").setValue("00:00:00");
        sap.ui.getCore().byId("VHId28").setValue("00:00:00");
        sap.ui.getCore().byId("VHId29").setValue("00:00:00");
        sap.ui.getCore().byId("VHId41").setValue("00:00:00");
        sap.ui.getCore().byId("VHId42").setValue("00:00:00");
      },
      saveVisiting: function () {
        var l = this.getModel("selectionModel");

        var that = this;
        var oModel = this.getView().getModel();
        var data = {};

        var idMusteri = this.getView().byId("_idMusteri").getValue();
        var ad = sap.ui.getCore().byId("VHId2").getValue();
        var mail = sap.ui.getCore().byId("VHId4").getValue();
        var telefon = sap.ui.getCore().byId("VHId6").getValue();

        var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

        if (ad == "") {
          var i = "Ad soyad giriniz";
          sap.m.MessageToast.show(i);
          sap.ui.core.BusyIndicator.hide(0);
        } else if (telefon == "") {
          i = "Telefon giriniz";
          sap.m.MessageToast.show(i);
          sap.ui.core.BusyIndicator.hide(0);
        } else if (telefon.length < 10) {
          alert("Geçerli Numara Giriniz!");
          return false;
        } else {
          data.Query = this.selectionModel.oData.Query;
          data.Name = ad;
          data.Email = mail;
          data.Telefon = telefon;

          // visiting hours -start-
          data.MOAB1 = sap.ui.getCore().byId("VHId7").getValue();
          data.MOBI1 = sap.ui.getCore().byId("VHId8").getValue();
          data.MOAB2 = sap.ui.getCore().byId("VHId9").getValue();
          data.MOBI2 = sap.ui.getCore().byId("VHId10").getValue();

          data.DIAB1 = sap.ui.getCore().byId("VHId13").getValue();
          data.DIBI1 = sap.ui.getCore().byId("VHId14").getValue();
          data.DIAB2 = sap.ui.getCore().byId("VHId15").getValue();
          data.DIBI2 = sap.ui.getCore().byId("VHId16").getValue();

          data.MIAB1 = sap.ui.getCore().byId("VHId19").getValue();
          data.MIBI1 = sap.ui.getCore().byId("VHId20").getValue();
          data.MIAB2 = sap.ui.getCore().byId("VHId32").getValue();
          data.MIBI2 = sap.ui.getCore().byId("VHId33").getValue();

          data.DOAB1 = sap.ui.getCore().byId("VHId22").getValue();
          data.DOBI1 = sap.ui.getCore().byId("VHId23").getValue();
          data.DOAB2 = sap.ui.getCore().byId("VHId35").getValue();
          data.DOBI2 = sap.ui.getCore().byId("VHId36").getValue();

          data.FRAB1 = sap.ui.getCore().byId("VHId25").getValue();
          data.FRBI1 = sap.ui.getCore().byId("VHId26").getValue();
          data.FRAB2 = sap.ui.getCore().byId("VHId38").getValue();
          data.FRBI2 = sap.ui.getCore().byId("VHId39").getValue();

          data.SAAB1 = sap.ui.getCore().byId("VHId28").getValue();
          data.SABI1 = sap.ui.getCore().byId("VHId29").getValue();
          data.SAAB2 = sap.ui.getCore().byId("VHId41").getValue();
          data.SABI2 = sap.ui.getCore().byId("VHId42").getValue();
          // visiting hours - end -

          oModel.create("/VisitingSet", data, {
            success: function (oData, oResponse) {
              var p = that.byId("_IDGenList2").getBinding("items");
              var n = [];
              n.push(
                new sap.ui.model.Filter(
                  "idMusteri",
                  sap.ui.model.FilterOperator.EQ,
                  idMusteri
                )
              );
              p.filter(new sap.ui.model.Filter(n, true));
              p.refresh();

              sap.ui.core.BusyIndicator.hide(0);
              sap.m.MessageToast.show("Başarıyla tamamlandı!");
              that._valueHelpDialogVisiting.close();
            },
            error: function (err) {
              var errorObj1 = JSON.parse(err.responseText);
              sap.m.MessageBox.error(
                errorObj1.error.innererror.errordetails[0].message,
                {
                  title: "HATA",
                  id: "messageBoxId2",
                  contentWidth: "100px",
                }
              );
            },
          });
        }
      },
      openPayment: function (e) {
        var t = this.getModel("selectionModel");
        if (!this._valueHelpDialogPayment) {
          this._valueHelpDialogPayment = sap.ui.xmlfragment(
            "zfiotelselkokpit.fragment.Payment",
            this
          );
          this.getView().addDependent(this._valueHelpDialogPayment);
        }
        var a = [];
        this._valueHelpDialogPayment.open();
      },

      closePayment: function () {
        this._valueHelpDialogPayment.close();
      },

      openKisiEkle: function (e) {
        var t = this.getModel("selectionModel");
        if (!this._valueHelpDialogKisi) {
          this._valueHelpDialogKisi = sap.ui.xmlfragment(
            "zfiotelselkokpit.fragment.Kisi",
            this
          );
          this.getView().addDependent(this._valueHelpDialogKisi);
        }
        var a = [];
        this._valueHelpDialogKisi.open();
      },

      closeKisiEkle: function () {
        this._valueHelpDialogKisi.close();
      },

      onKisiSil: function (oEvent) {
        var oList = oEvent.getSource(),
          oItem = oEvent.getParameter("listItem"),
          sPath = oItem.getBindingContext().getPath();

        var that = this;
        sap.m.MessageBox.confirm("Kişi silinecek, emin misiniz?", {
          title: "Bilgilendirme",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          styleClass: "messageBoxError",
          onClose: function (e) {
            if (e === sap.m.MessageBox.Action.YES) {
              var oModel = that.getView().getModel();
              // after deletion put the focus back to the list
              oList.attachEventOnce("updateFinished", oList.focus, oList);
              // send a delete request to the odata service
              oModel.remove(sPath);

              sap.ui.core.BusyIndicator.hide(0);
              sap.m.MessageToast.show("Kişi Silindi");
            }
          },
        });
      },

      onSendPayment: function () {
        var dialog = new sap.m.BusyDialog({
          text: "Gönderiliyor...",
        });

        dialog.open();

        var that = this;
        var oModel = this.getView().getModel();
        var data = {};

        var idMusteri = this.getView().byId("_idMusteri").getValue();
        var mail = sap.ui.getCore().byId("_idInputMail").getValue();
        var telefon = sap.ui.getCore().byId("_idInputSMS").getValue();
        var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

        var e = sap.ui.getCore().byId("rbG");
        var t = e.getSelectedButton().getId();
        if (t === "idRB1") {
          if (telefon == "") {
            i = "Telefon giriniz";
            sap.m.MessageToast.show(i);
            sap.ui.core.BusyIndicator.hide(0);
          } else if (telefon.length < 10) {
            alert("Geçerli Numara Giriniz!");
            return false;
          } else {
            data.Type = "S";
          }
        } else if (t === "idRB2") {
          if (!mailregex.test(mail)) {
            alert(mail + " Geçerli bir mail adresi değil!");
          } else {
            data.Type = "M";
          }
        }

        var e2 = sap.ui.getCore().byId("rbG2");
        var t2 = e2.getSelectedButton().getId();
        if (t2 === "idRB3") {
          data.Tutar = sap.ui.getCore().byId("_idBakiye1").getValue();
        } else if (t2 === "idRB4") {
          data.Tutar = sap.ui.getCore().byId("_idBakiye2").getValue();
        } else if (t2 === "idRB5") {
          data.Tutar = sap.ui.getCore().byId("_idBakiye3").getValue();
        }

        data.Email = mail;
        data.Telefon = telefon;
        data.idMusteri = idMusteri;

        oModel.create("/OdemeSet", data, {
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide(0);
            sap.m.MessageToast.show("Link Gönderildi!");
            that._valueHelpDialogPayment.close();
            sap.ui.getCore().byId("_idBakiye3").setValue("0.00");
            dialog.close();
          },
          error: function (err) {
            dialog.close();
            var errorObj1 = JSON.parse(err.responseText);
            sap.m.MessageBox.error(
              errorObj1.error.innererror.errordetails[0].message,
              {
                title: "HATA",
                id: "messageBoxId2",
                contentWidth: "100px",
              }
            );
          },
        });
      },

      onKisiEkle: function () {
        var that = this;
        var oModel = this.getView().getModel();
        var data = {};

        var idMusteri = this.getView().byId("_idMusteri").getValue();
        var ad = sap.ui.getCore().byId("idAd").getValue();
        var mail = sap.ui.getCore().byId("idMail").getValue();
        var telefon = sap.ui.getCore().byId("idTelefon").getValue();
        var not = sap.ui.getCore().byId("idKisiNot").getValue();
        var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

        if (ad == "") {
          var i = "Ad soyad giriniz";
          sap.m.MessageToast.show(i);
          sap.ui.core.BusyIndicator.hide(0);
        } else if (telefon == "" && mail == "") {
          i = "Telefon veya Email'den En Az Biri Dolu Olmalıdır!";
          sap.m.MessageToast.show(i);
          sap.ui.core.BusyIndicator.hide(0);
        } else if (telefon !== "" && telefon.length < 10) {
          alert("Geçerli Numara Giriniz!");
          return false;
        } else {
          data.idMusteri = idMusteri;
          data.Name = ad;
          data.Email = mail;
          data.Telefon = telefon;
          data.KisiNot = not;
          data.Type = "I";

          oModel.create("/IletisimSet", data, {
            success: function (oData, oResponse) {
              var p = that.byId("_IDGenList2").getBinding("items");
              var n = [];
              n.push(
                new sap.ui.model.Filter(
                  "idMusteri",
                  sap.ui.model.FilterOperator.EQ,
                  idMusteri
                )
              );
              p.filter(new sap.ui.model.Filter(n, true));
              p.refresh();

              sap.ui.core.BusyIndicator.hide(0);
              sap.m.MessageToast.show("Kişi Eklendi");
              that._valueHelpDialogKisi.close();
            },
            error: function (err) {
              var errorObj1 = JSON.parse(err.responseText);
              sap.m.MessageBox.error(
                errorObj1.error.innererror.errordetails[0].message,
                {
                  title: "HATA",
                  id: "messageBoxId2",
                  contentWidth: "100px",
                }
              );
            },
          });

          sap.ui.getCore().byId("idAd").setValue("");
          sap.ui.getCore().byId("idMail").setValue("");
          sap.ui.getCore().byId("idTelefon").setValue("");
          sap.ui.getCore().byId("idKisiNot").setValue("");
        }
      },

      onSendNote: function () {
        var that = this;
        var data = {};

        var idMusteri = this.getView().byId("_idMusteri").getValue();
        var not = this.byId("_IDGenFeedInput1").getValue();
        data.idMusteri = idMusteri;
        data.Not = not;
        // data.Ad = ad;
        data.Ad = this.getView().byId("_idCBoxPerson").getValue();

        sap.m.MessageBox.confirm("Mail gönderilecek, emin misiniz?", {
          title: "Bilgilendirme",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          styleClass: "messageBoxError",
          onClose: function (e) {
            if (e === sap.m.MessageBox.Action.YES) {
              var oModel = that.getView().getModel();
              oModel.create("/NotMailSet", data, {
                success: function (oData, oResponse) {
                  sap.m.MessageBox.information(oResponse.data.Mesaj, {
                    title: "Bilgilendirme",
                    id: "messageBoxId2",
                    contentWidth: "100px",
                  });

                  sap.ui.core.BusyIndicator.hide(0);
                },
                error: function (err) {},
              });
            }
          },
        });

        this.byId("_IDGenFeedInput1").setValue("");
        this.getView().byId("_idCBoxPerson").setValue("");
      },

      onSelectRadio: function () {
        var e = sap.ui.getCore().byId("rbG");
        var t = e.getSelectedButton().getId();
        if (t === "idRB1") {
          sap.ui.getCore().byId("_idLblSMS").setVisible(true);
          sap.ui.getCore().byId("_idInputSMS").setVisible(true);
          sap.ui.getCore().byId("_idLblMail").setVisible(false);
          sap.ui.getCore().byId("_idInputMail").setVisible(false);
        } else if (t === "idRB2") {
          sap.ui.getCore().byId("_idLblSMS").setVisible(false);
          sap.ui.getCore().byId("_idInputSMS").setVisible(false);
          sap.ui.getCore().byId("_idLblMail").setVisible(true);
          sap.ui.getCore().byId("_idInputMail").setVisible(true);
        }
      },
      onSelectRadio2: function () {
        var e = sap.ui.getCore().byId("rbG2");
        var t = e.getSelectedButton().getId();
        if (t === "idRB3") {
          sap.ui.getCore().byId("_idBakiye1").setVisible(true);
          sap.ui.getCore().byId("_idBakiye2").setVisible(false);
          sap.ui.getCore().byId("_idBakiye3").setVisible(false);
        } else if (t === "idRB4") {
          sap.ui.getCore().byId("_idBakiye1").setVisible(false);
          sap.ui.getCore().byId("_idBakiye2").setVisible(true);
          sap.ui.getCore().byId("_idBakiye3").setVisible(false);
        } else if (t === "idRB5") {
          sap.ui.getCore().byId("_idBakiye1").setVisible(false);
          sap.ui.getCore().byId("_idBakiye2").setVisible(false);
          sap.ui.getCore().byId("_idBakiye3").setVisible(true);
        }
      },

      onSelectRadioMain: function () {
        var e = sap.ui.getCore().byId(this.createId("rbGMain"));
        var t = e.getSelectedButton().getText();
        var l = this.getModel("selectionModel");
        if (t === "Temsilci") {
          l.setProperty("/SicilVisible", true);
          l.setProperty("/MusteriVisible", false);
        } else if (t === "Müşteri") {
          l.setProperty("/SicilVisible", false);
          l.setProperty("/MusteriVisible", true);
        }
      },

      onHelpRequestedSicil: function (e) {
        var t = this.getModel("selectionModel");
        if (!this._valueHelpDialogSicil) {
          this._valueHelpDialogSicil = sap.ui.xmlfragment(
            "zfiotelselkokpit.fragment.Sicil",
            this
          );
          this.getView().addDependent(this._valueHelpDialogSicil);
        }
        var a = [];
        this._valueHelpDialogSicil.getBinding("items").filter(a);
        this._valueHelpDialogSicil.open();
      },
      onValueHelpSearchSicil: function (e) {
        var t = this.getModel("selectionModel");
        var a = e.getParameter("value");
        var i = [];
        i.push(
          new sap.ui.model.Filter(
            "Search",
            sap.ui.model.FilterOperator.Contains,
            a
          )
        );
        e.getSource().getBinding("items").filter(i);
      },
      onValueHelpCloseSicil: function (e) {
        var button = sap.ui.getCore().byId(this.createId("idRBMus")); //find the button

        var t = e.getParameter("selectedItem"),
          a = this.getModel("selectionModel");
        var sicil = t.getBindingContext().getProperty("idTemsilci");
        var newSicil = sicil.replace(/^0+/, "");
        if (t) {
          a.setProperty("/SicilVisible", false);
          a.setProperty("/MusteriVisible", true);
          a.setProperty("/SicilId", newSicil);
          a.setProperty(
            "/SicilAd",
            t.getBindingContext().getProperty("TemsilciAdi")
          );
          a.setProperty("/Kunnr", "");
          a.setProperty("/Name", "");
          sap.ui
            .getCore()
            .byId(this.createId("rbGMain"))
            .setSelectedButton(button);
        }
        e.getSource().getBinding("items").filter([]);
      },

      onHelpRequestedCustomer: function (e) {
        // if (this.selectionModel.oData.OPVisible == true) {
        // this.onHelpRequestedKunnr(e);
        // } else {
        this.onHelpRequestedMusteri(e);
        // }
      },

      /////erbag versiyon//////
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
        // buraya SİCİL NO eklenecek
        var idTemsilci = this.getView().byId("_idTemsilci").getValue();
        a.push(
          new sap.ui.model.Filter(
            "idTemsilci",
            sap.ui.model.FilterOperator.EQ,
            idTemsilci
          )
        );
        this._valueHelpDialogKunnr.getBinding("items").filter(a);
        this._valueHelpDialogKunnr.open();
      },
      onValueHelpSearchKunnr: function (e) {
        var t = this.getModel("selectionModel");
        var a = e.getParameter("value");
        var i = [];

        if (this.selectionModel.oData.OPVisible == true) {
          var idTemsilci = this.getView().byId("_idTemsilci").getValue();
        }

        i.push(
          new sap.ui.model.Filter(
            "Name",
            sap.ui.model.FilterOperator.Contains,
            a
          )
        );
        i.push(
          new sap.ui.model.Filter(
            "idTemsilci",
            sap.ui.model.FilterOperator.EQ,
            idTemsilci
          )
        );
        e.getSource().getBinding("items").filter(i);
      },
      onValueHelpCloseKunnr: function (e) {
        var t = e.getParameter("selectedItem"),
          a = this.getModel("selectionModel");
        var kunnr = t.getBindingContext().getProperty("idMusteri");
        var newKunnr = kunnr.replace(/^0+/, "");
        var sicil = t.getBindingContext().getProperty("idTemsilci");
        var newSicil = sicil.replace(/^0+/, "");
        if (t) {
          a.setProperty("/AgEnabled", true);
          a.setProperty("/Kunnr", newKunnr);
          a.setProperty("/Name", t.getBindingContext().getProperty("Name"));
          a.setProperty("/SicilId", newSicil);
          a.setProperty(
            "/SicilAd",
            t.getBindingContext().getProperty("TemsilciAdi")
          );
        }
        e.getSource().getBinding("items").filter([]);
      },
      /////erbag versiyon//////

      /////nilda versiyon//////
      onHelpRequestedMusteri: function (e) {
        var t = this.getModel("selectionModel");
        if (!this._valueHelpDialogKunnr) {
          this._valueHelpDialogKunnr = sap.ui.xmlfragment(
            "zfiotelselkokpit.fragment.Musteri",
            this
          );
          this.getView().addDependent(this._valueHelpDialogKunnr);
        }
        var a = [];
        var idTemsilci = this.getView().byId("_idTemsilci").getValue();
        a.push(
          new sap.ui.model.Filter(
            "idTemsilci",
            sap.ui.model.FilterOperator.EQ,
            idTemsilci
          )
        );
        sap.ui.getCore().byId("idMusteriList").getBinding("items").filter(a);

        // this._valueHelpDialogKunnr.getBinding("items").filter(a);
        this._valueHelpDialogKunnr.open();
      },

      onValueHelpSearchMusteri: function (e) {
        var t = this.getModel("selectionModel");
        var a = sap.ui.getCore().byId("_IDGenSearchField1").getValue();

        /// muratd
        var rbG = sap.ui.getCore().byId("idMusterirbG");
        var rbS = rbG.getSelectedButton().getId();
        if (rbS === "idMusteriRB1") {
          var idTemsilci = this.getView().byId("_idTemsilci").getValue();
        } else {
          // if(a=="")
          //   {
          //     var error = "X";
          //     l.error("Tüm müşterilerde boş arama yapamazsınız!");

          //   }
          idTemsilci = "";
        }

        //   if(error != "X")
        //  {
        var i = [];
        i.push(
          new sap.ui.model.Filter(
            "Name",
            sap.ui.model.FilterOperator.Contains,
            a
          )
        );
        i.push(
          new sap.ui.model.Filter(
            "idTemsilci",
            sap.ui.model.FilterOperator.EQ,
            idTemsilci
          )
        );
        // e.getSource().getBinding("items").filter(i);
        var musteriList = sap.ui
          .getCore()
          .byId("idMusteriList")
          .getBinding("items");
        musteriList.filter(new sap.ui.model.Filter(i, true));
        musteriList.refresh();
        // }
      },
      onValueHelpCloseMusteri: function (e) {
        sap.ui.getCore().byId("_IDGenSearchField1").setValue("");
        var button = sap.ui.getCore().byId("idMusteriRB1"); //find the button
        sap.ui.getCore().byId("idMusterirbG").setSelectedButton(button);
        this._valueHelpDialogKunnr.close();
      },

      onValueHelpSelectionMusteri: function (e) {
        a = this.getModel("selectionModel");

        var oList = sap.ui.getCore().byId("idMusteriList"),
          oBinding = oList.getBinding("items");
        var items = oList.getSelectedItems();
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var context = item.getBindingContext();
          var obj = context.getProperty(null, context);

          var kunnr = obj.idMusteri,
            newKunnr = kunnr.replace(/^0+/, ""),
            sicil = obj.idTemsilci,
            newSicil = sicil.replace(/^0+/, "");

          a.setProperty("/AgEnabled", true);
          a.setProperty("/Kunnr", newKunnr);
          a.setProperty("/Name", obj.Name);
          a.setProperty("/SicilId", newSicil);
          a.setProperty("/SicilAd", obj.TemsilciAdi);
        }
        // e.getSource().getBinding("items").filter([]);
        sap.ui.getCore().byId("idMusteriList").getBinding("items").filter([]);
        sap.ui.getCore().byId("_IDGenSearchField1").setValue("");
        var button = sap.ui.getCore().byId("idMusteriRB1"); //find the button
        sap.ui.getCore().byId("idMusterirbG").setSelectedButton(button);
        this._valueHelpDialogKunnr.close();
      },

      /////nilda versiyon//////

      onFavPress: function (oEvent) {
        var l = this.getModel("selectionModel");

        var oListItem = oEvent.getSource();
        var oBindingContext = oListItem.getBindingContext();
        var idMusteri = oBindingContext.getProperty("idMusteri");
        var Parnr = oBindingContext.getProperty("Parnr");
        var Telefon = oBindingContext.getProperty("Telefon");
        var Email = oBindingContext.getProperty("Email");
        var Name = oBindingContext.getProperty("Name");

        l.setProperty("/VHName", Name);
        l.setProperty("/VHEmail", Email);
        l.setProperty("/VHTelefon", Telefon);

        var data = {};
        data.idMusteri = idMusteri;
        data.Parnr = Parnr;
        data.Type = "U";
        var that = this;

        var SAPoData = new sap.ui.model.odata.v2.ODataModel(
          "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV_01/",
          true
        );

        var query = idMusteri;
        query += "-";
        query += Parnr;

        SAPoData.read("/VisitingSet('" + query + "')", {
          success: function (oData, oResponse) {
            l.setProperty("/Query", oData.Query);
            l.setProperty("/MOAB1", oData.MOAB1);
            l.setProperty("/MOBI1", oData.MOBI1);
            l.setProperty("/MOAB2", oData.MOAB2);
            l.setProperty("/MOBI2", oData.MOBI2);
            l.setProperty("/DIAB1", oData.DIAB1);
            l.setProperty("/DIBI1", oData.DIBI1);
            l.setProperty("/DIAB2", oData.DIAB2);
            l.setProperty("/DIBI2", oData.DIBI2);
            l.setProperty("/MIAB1", oData.MIAB1);
            l.setProperty("/MIBI1", oData.MIBI1);
            l.setProperty("/MIAB2", oData.MIAB2);
            l.setProperty("/MIBI2", oData.MIBI2);
            l.setProperty("/DOAB1", oData.DOAB1);
            l.setProperty("/DOBI1", oData.DOBI1);
            l.setProperty("/DOAB2", oData.DOAB2);
            l.setProperty("/DOBI2", oData.DOBI2);
            l.setProperty("/FRAB1", oData.FRAB1);
            l.setProperty("/FRBI1", oData.FRBI1);
            l.setProperty("/FRAB2", oData.FRAB2);
            l.setProperty("/FRBI2", oData.FRBI2);
            l.setProperty("/SAAB1", oData.SAAB1);
            l.setProperty("/SABI1", oData.SABI1);
            l.setProperty("/SAAB2", oData.SAAB2);
            l.setProperty("/SABI2", oData.SABI2);
            l.setProperty("/KisiNot", oData.KisiNot);

            sap.ui.core.BusyIndicator.hide(0);
          },
          error: function (oError) {
            sap.ui.core.BusyIndicator.hide(0);
          },
        });

        sap.m.MessageBox.show("Lütfen işlem seçimi yapınız", {
          title: "İşlem",
          actions: ["Arama Saatleri", "Favori", "Ara", "Not", "Çıkış"],
          styleClass: "messageBoxError",
          onClose: function (e) {
            if (e === "Arama Saatleri") {
              that.openVisiting();
            } else if (e === "Not") {
              that.openKisiNot();
            } else if (e === "Favori") {
              var oModel = that.getView().getModel();
              oModel.create("/IletisimSet", data, {
                success: function (oData, oResponse) {
                  sap.ui.core.BusyIndicator.hide(0);
                },
                error: function (err) {},
              });
            } else if (e === "Ara") {
              var phoneNumber = Telefon;
              var CustomerNo = idMusteri;

              window.chrome.webview.hostObjects.sync.ctimessage.MakeCall(
                phoneNumber,
                CustomerNo
              );
            } else {
            }
          },
        });

        sap.ui.core.BusyIndicator.hide(0);
      },

      onPressFiltreleriTemizle: function (e) {
        this.onSetSelectionModel();
        this.onSetDetailModel();
      },

      onMessagePopoverPress: function (e) {
        this._getMessagePopover().openBy(e.getSource());
      },

      onSearch3: function (e) {
        var oView = this.getView();

        var aFilter = [];

        var ugrp = this.getView()
          .byId("_IDGenComboBox2")
          .getSelectedItem()
          .getKey();
        if (ugrp !== "00") {
          aFilter.push(
            new sap.ui.model.Filter(
              "UrunGrp",
              sap.ui.model.FilterOperator.EQ,
              ugrp
            )
          );
        }
        oView
          .byId("lineItemsList")
          .getBinding("items")
          .filter(aFilter, "Application");
      },
      onSearchFieldLiveChange: function (event) {
        var oView = this.getView();
        const query = event.getParameter("newValue").trim();
        var aFilter = [];
        var i = /^-?\d*(\.\d+)?$/;
        if (!query.match(i)) {
          aFilter.push(
            new sap.ui.model.Filter(
              "Maktx",
              sap.ui.model.FilterOperator.Contains,
              query
            )
          );
        } else {
          aFilter.push(
            new sap.ui.model.Filter(
              "Matnr",
              sap.ui.model.FilterOperator.Contains,
              query
            )
          );
        }

        oView
          .byId("lineItemsList")
          .getBinding("items")
          .filter(aFilter, "Application");
      },

      handleSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var aFilter = [];
        var i = /^-?\d*(\.\d+)?$/;
        if (!sValue.match(i)) {
          aFilter.push(
            new sap.ui.model.Filter(
              "Maktx",
              sap.ui.model.FilterOperator.Contains,
              sValue
            )
          );
        } else {
          aFilter.push(
            new sap.ui.model.Filter(
              "Matnr",
              sap.ui.model.FilterOperator.Contains,
              sValue
            )
          );
        }
        var oBinding = oEvent.getSource().getBinding("items");
        oBinding.filter([aFilter]);
      },

      onFilterPosts: function (e) {
        // build filter array
        var aFilter = [];
        var sQuery = e.getParameter("query");
        if (sQuery) {
          aFilter.push(
            new sap.ui.model.Filter(
              "Search",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            )
          );
        }

        var idMusteri = this.getView().byId("_idMusteri").getValue();
        aFilter.push(
          new sap.ui.model.Filter(
            "idMusteri",
            sap.ui.model.FilterOperator.EQ,
            idMusteri
          )
        );
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
      getMessage: function (e) {
        var t = this.getView().getModel("i18n").getResourceBundle().getText(e);
        r.show(t, { duration: 3e3, width: "25em" });
      },
      onSearch2: function (oEvent) {
        if (oEvent.getParameters().refreshButtonPressed) {
          // Search field's 'refresh' button has been pressed.
          // This is visible if you select any main list item.
          // In this case no new search is triggered, we only
          // refresh the list binding.
          this.onRefresh();
        } else {
          var aFilters = this.getView().byId("smartFilterBar").getFilters();
          var oMultiComboBox = this.getView().byId("multiComboBox");
          var aCountKeys = oMultiComboBox.getSelectedKeys();
          for (var i = 0; i < aCountKeys.length; i++) {
            var newFilter = new sap.ui.model.Filter(
              "UrunGrp",
              sap.ui.model.FilterOperator.EQ,
              aCountKeys[i]
            );
            if (aCountKeys.length > 0) {
              aFilters.push(newFilter);
            }
          }
          this.getView()
            .byId("lineItemsList")
            .getBinding("items")
            .filter(new sap.ui.model.Filter(aFilters, true));
          // this.getView().byId("lineItemsList").getBinding("items").filter(aFilters);
        }
      },
      onChangeDate: function (oEvent) {
        var l = this.getModel("selectionModel");

        var fromDate = this.byId("idDate1").getDateValue();
        var h = fromDate.getDay();
        if (h === 0) {
          sap.m.MessageToast.show("Pazar günü seçilemez!");
          this.getView()
            .byId("idDate1")
            .setValue(this.selectionModel.oData.Vdatu);
          return;
        }
        var l = this.getModel("selectionModel");
        l.setProperty("/Vdatu", oEvent.getParameter("newValue"));
      },
      _fixUtcProblem: function (t) {
        if (t) {
          return new Date(e.getTime() - e.getTimezoneOffset() * 60 * 1e3);
        } else {
          return t;
        }
      },

      /**
       * Event handler for refresh event. Keeps filter, sort
       * and group settings and refreshes the list binding.
       * @public
       */
      onRefresh: function () {
        var oTable = this.byId("idPalletsTable");
        oTable.getBinding("items").refresh();
      },

      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      /**
       * Shows the selected item on the object page
       * @param {sap.m.ObjectListItem} oItem selected Item
       * @private
       */
      _showObject: function (oItem) {
        this.getRouter().navTo("object", {
          objectId: oItem
            .getBindingContext()
            .getPath()
            .substring("/SiparisSet".length),
        });
      },

      /**
       * Internal helper method to apply both filter and search state together on the list binding
       * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
       * @private
       */
      _applySearch: function (aTableSearchState) {
        var oTable = this.byId("lineItemsList"),
          oViewModel = this.getModel("worklistView");
        oTable.getBinding("items").filter(aTableSearchState, "Application");
        // changes the noDataText of the list in case there are no filter results
        if (aTableSearchState.length !== 0) {
          oViewModel.setProperty(
            "/tableNoDataText",
            this.getResourceBundle().getText("worklistNoDataWithSearchText")
          );
        }
      },
    });
  }
);
