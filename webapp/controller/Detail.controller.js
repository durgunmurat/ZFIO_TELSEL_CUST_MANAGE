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
        // if (pieces.length > 2)
        // {   idMusteri = window.location.href.split("?")[1]; }
        // else
        // { idMusteri = "" ; }
        this.byId("_idMusteri").setValue(idMusteri);
        this.getMusteri();
      },
      _onRouteMatched: function (oEvent) {
        oController = this;
      },

      onAfterRendering: function () {
        oController = this;
      },
      getMusteri: function () {
        var cari = this.getView().byId("_idMusteri").getValue();
        var newKunnr = cari.replace(/^0+/, "");
        var oButton = this.byId("_idBtnList");
        var that = this;
        var SAPoData = new sap.ui.model.odata.v2.ODataModel(
          "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV_01/",
          true
        );

        var l = this.getModel("selectionModel");
        sap.ui.core.BusyIndicator.show(0);
        var jsonData = new sap.ui.model.json.JSONModel();
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

              var button = sap.ui.getCore().byId(that.createId("idRBMus")); //find the button
              sap.ui
                .getCore()
                .byId(that.createId("rbGMain"))
                .setSelectedButton(button);
              l.setProperty("/SicilVisible", false);
              l.setProperty("/MusteriVisible", true);
              // oButton.attachPress(function (oEvent) {
              //   console.log("Pressed!");
              // });

              oButton.firePress();
            } else if (oData.TemsilciAdi !== "") {
              l.setProperty("/SicilId", oData.idTemsilci);
              l.setProperty("/SicilAd", oData.TemsilciAdi);
              if(oData.SevkiyatDay == "X"){
                l.setProperty("/DistSevkVisible", true);
                l.setProperty("/DistSevkText", "Dist.Sevk.Günleri"); 
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
          UrunGrp: "",
          UrunGrpTxt: "",
          FirstDay: "",
          SecondDay: "",
          ThirdDay: "",
          SevkiyatDay: "",
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
          TelPaym: "",
          MailPaym: "",
          SyUname: sap.ushell.Container.getService("UserInfo").getId(),
          SelectionScreenPanelExpanded: true,
          DistSevkVisible:false,
          DistSevkText:"",
          Panel1: false,
          Panel2: false,
          Panel3: false,
          Panel4: false,
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
          Query:"",
          VHName: "",
          VHEmail: "",
          VHTelefon: "",
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
          //visiting hours --end--
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
      onPressOpenOrder: function (e) {
        var l = this.getModel("selectionModel");


        var jsonRefresh = new sap.ui.model.json.JSONModel();
        jsonRefresh.setData([]);
        this.getView().setModel(jsonRefresh, "OzetList");

        this.byId("_id22").setValue("0");
        this.byId("_id24").setValue("0");
        this.byId("_id26").setValue("0");
        this.byId("_IDGenFeedInput1").setValue("");

        var openOrder = this.getView().byId("_IDGenComboBox3").getValue();
        var openOrderVdatu = this.getView().byId("_IDGenComboBox3").getSelectedKey();
        // this.byId("_IDGenComboBox3").setValue("");

        var numberOfDaysToAdd = 1;
        var today = new Date();
        var day = today.getDay();
        if (day == "6") {
          numberOfDaysToAdd = 2;
        }
        var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: "dd-MM-yyyy",
        });
        today.setDate(today.getDate() + numberOfDaysToAdd);
        var dateFormatted = dateFormat.format(today);
        if (openOrderVdatu !== '') {

          this.getView().byId("idDate1").setValue(openOrderVdatu);
          l.setProperty("/Vdatu", openOrderVdatu);
        }
        else {
          this.getView().byId("idDate1").setValue(dateFormatted);
          l.setProperty("/Vdatu", dateFormatted);
        }
        openOrderVdatu = '';



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
          
          if(this.selectionModel.oData.DistSevkVisible == true){
            var sDist = that.byId("_IDGenList6").getBinding("items");
          }
          

          var n = [];

          var cari = o.getView().byId("_idMusteri").getValue();
          n.push(
            new sap.ui.model.Filter(
              "idMusteri",
              sap.ui.model.FilterOperator.EQ,
              cari
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
          if(this.selectionModel.oData.DistSevkVisible == true){
            sDist.filter(new sap.ui.model.Filter(n, true));
          }
          

          oModel.read("/CariSet('" + cari + "')", {
            success: function (oData, oResponse) {
              l.setProperty("/ToplamBakiye", oData.ToplamBakiye);
              l.setProperty("/ToplamBak", oData.ToplamBakiye);
              l.setProperty("/VadeBorc", oData.VadeBorc);
              l.setProperty("/Email", oData.Email);
              l.setProperty("/Telefon", oData.Telefon);
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
          if(this.selectionModel.oData.DistSevkVisible == true){
            sDist.refresh();
          }
          

          l.setProperty("/UrunPanelExpanded", true);
          l.setProperty("/Panel2", true);
          l.setProperty("/Panel3", true);
          l.setProperty("/Panel4", true);
          l.setProperty("/UrunPanelVisible", true);
          l.setProperty("/SelectionScreenPanelExpanded", true);
          if(this.selectionModel.oData.DistSevkVisible == true){
            l.setProperty("/DistSevkVisible", true);
            l.setProperty("/DistSevkText", "Dist.Sevk.Günleri");
          }
          if (openOrder !== 'Yeni Sip.' && openOrder !== '') {
            l.setProperty("/DisplayMode", false);
            l.setProperty("/UrunPanelExpanded", false);
            jQuery.sap.delayedCall(500, this, function () {
              this.onKaydet();
            });
          } else {
            l.setProperty("/DisplayMode", true);
            // l.setProperty("/Panel1", false);
            sap.ui.core.BusyIndicator.hide(0);
          }
        }
      },
      onPressMalzemeListesi: function (e) {
        var l = this.getModel("selectionModel");

        var jsonRefresh = new sap.ui.model.json.JSONModel();
        jsonRefresh.setData([]);
        this.getView().setModel(jsonRefresh, "OzetList");

        this.byId("_id22").setValue("0");
        this.byId("_id24").setValue("0");
        this.byId("_id26").setValue("0");
        this.byId("_IDGenFeedInput1").setValue("");

        // var openOrder = this.getView().byId("_IDGenComboBox3").getValue();
        // var openOrderVdatu = this.getView().byId("_IDGenComboBox3").getSelectedKey();
        // this.byId("_IDGenComboBox3").setValue("");
        this.byId("_IDGenComboBox3").setSelectedKey("");

        var numberOfDaysToAdd = 1;
        var today = new Date();
        var day = today.getDay();
        if (day == "6") {
          numberOfDaysToAdd = 2;
        }
        var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: "dd-MM-yyyy",
        });
        today.setDate(today.getDate() + numberOfDaysToAdd);
        var dateFormatted = dateFormat.format(today);
        // if(openOrderVdatu !== ''){

        //   this.getView().byId("idDate1").setValue(openOrderVdatu);  
        //   l.setProperty("/Vdatu",openOrderVdatu);
        // }
        // else{
        this.getView().byId("idDate1").setValue(dateFormatted);
        l.setProperty("/Vdatu", dateFormatted);
        // }
        // openOrderVdatu = '';



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
        jsonData.setSizeLimit("10000000");
        SAPoData.read("/SiparisSet", {
          filters: [
            new sap.ui.model.Filter(
              "idMusteri",
              sap.ui.model.FilterOperator.EQ,
              cari
            ),
            // new sap.ui.model.Filter(
            //   "Vbeln",
            //   sap.ui.model.FilterOperator.EQ,
            //   openOrder
            // ),
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
          if(this.selectionModel.oData.DistSevkVisible == true){
            var sDist = that.byId("_IDGenList6").getBinding("items");
          }
          var n = [];

          var cari = o.getView().byId("_idMusteri").getValue();
          n.push(
            new sap.ui.model.Filter(
              "idMusteri",
              sap.ui.model.FilterOperator.EQ,
              cari
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
          if(this.selectionModel.oData.DistSevkVisible == true){
            sDist.filter(new sap.ui.model.Filter(n, true));
          }

          oModel.read("/CariSet('" + cari + "')", {
            success: function (oData, oResponse) {
              l.setProperty("/ToplamBakiye", oData.ToplamBakiye);
              l.setProperty("/ToplamBak", oData.ToplamBakiye);
              l.setProperty("/VadeBorc", oData.VadeBorc);
              l.setProperty("/Email", oData.Email);
              l.setProperty("/Telefon", oData.Telefon);
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
          if(this.selectionModel.oData.DistSevkVisible == true){
            sDist.refresh();
          }

          l.setProperty("/UrunPanelExpanded", true);
          l.setProperty("/Panel2", true);
          l.setProperty("/Panel3", true);
          l.setProperty("/Panel4", true);
          l.setProperty("/UrunPanelVisible", true);
          l.setProperty("/SelectionScreenPanelExpanded", true);
          if(this.selectionModel.oData.DistSevkVisible == true){
            l.setProperty("/DistSevkVisible", true);
            l.setProperty("/DistSevkText", "Dist.Sevk.Günleri");
          }
          // if (openOrder !== 'Yeni Sip.' && openOrder !== '') {
          //   l.setProperty("/DisplayMode", false);
          //   l.setProperty("/UrunPanelExpanded", false);
          //   jQuery.sap.delayedCall(500, this, function () {
          //     this.onKaydet();
          //   });
          // } else {
          l.setProperty("/DisplayMode", true);
          // l.setProperty("/Panel1", false);
          sap.ui.core.BusyIndicator.hide(0);
          // }
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

      saveInput: function () {
        var that = this;
        var openOrder = this.getView().byId("_IDGenComboBox3").getValue();

        if (openOrder !== 'Yeni Sip.' && openOrder !== '') {
          var text1 = "Sipariş güncelleniyor, emin misiniz?";
          var text2 = "Sipariş Güncelleniyor...";
        }
        else {
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

                  siparisItem.push(siparisResult);
                }
              }

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

                  // that.byId("_IDGenComboBox3").setValue("");
                  that.byId("_IDGenComboBox3").setSelectedKey("");
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
              // // for (var o = 0; o < oTable.getItems().length; o++) {
              // // if(oTable.getItems()[i].getCells()[6].getValue() > 0){
              // var Menge = oTable.getItems()[i].getCells()[6].getValue();
              // // }
              // // }
              // if (aData.results[i].Menge !== Menge) {
              //   aData.results[i].Menge = Menge;
              // }

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
              // } else {
              //   var Menge2 = oTable.getItems()[i].getCells()[6].getValue();
              //   if (Menge2 > 0) {
              //     aData.results[i].Menge = Menge2;

              //     var material = aData.results[i].Matnr;
              //     var adet = parseFloat(aData.results[i].Menge).toFixed(2);
              //     var birim = aData.results[i].Meins;

              //     var siparisResult = {};
              //     siparisResult.idMusteri = idMusteri;
              //     siparisResult.Matnr = material.toString();
              //     siparisResult.Menge = adet;
              //     siparisResult.Meins = birim;
              //     siparisResult.SiparisTutar = "1";
              //     siparisResult.Kdv = "0";

              //     siparisItem.push(siparisResult);
              //   }
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
        // jQuery.sap.delayedCall(500, this, function () {
        // var cellMenge = event.getSource().getParent().getCells()[6];
        var idMenge = event.getSource().getParent().getCells()[6].getValue();
        //   while (idMenge.charAt(0) == '0') {
        //     if (idMenge.length == 1) { break };
        //     if (idMenge.charAt(1) == '.') { break };
        //     idMenge = idMenge.substr(1, s.length-1)
        // }

        var oTable = this.byId("lineItemsList");

        var sPath =
          event.getSource().mBindingInfos.value.binding.oContext.sPath;
        var oModel = oTable.getModel("SiparisList");
        oModel.setProperty(sPath + "/Menge", idMenge);
        // });
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
      clearVisiting:function (){
      
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
        var ad        = sap.ui.getCore().byId("VHId2").getValue();
        var mail      = sap.ui.getCore().byId("VHId4").getValue();
        var telefon   = sap.ui.getCore().byId("VHId6").getValue();


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
        }
        // else if (!mailregex.test(mail)) {
        //   alert(mail + " Geçerli bir mail adresi değil!");
        // }
        else {

          data.Query   = this.selectionModel.oData.Query;
          data.Name    = ad;
          data.Email   = mail;
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

          // sap.ui.getCore().byId("idAd").setValue("");
          // sap.ui.getCore().byId("idMail").setValue("");
          // sap.ui.getCore().byId("idTelefon").setValue("");
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
        // this._valueHelpDialogKunnr.getBinding("items").filter(a);
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
            // data.Telefon   = sap.ui.getCore().byId("_idInputSMS").getValue();
            data.Type = "S";
            // data.idMusteri = idMusteri;
          }
        } else if (t === "idRB2") {
          if (!mailregex.test(mail)) {
            alert(mail + " Geçerli bir mail adresi değil!");
          } else {
            // data.Email     = sap.ui.getCore().byId("_idInputMail").getValue();
            data.Type = "M";
            // data.idMusteri = idMusteri;
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

        // data.Tutar   = data.Tutar.replace(",", ".");
        // data.Tutar  = parseFloat(data.Tutar).toFixed(2);
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
        }
        // else if (!mailregex.test(mail)) {
        //   alert(mail + " Geçerli bir mail adresi değil!");
        // }
        else {
          data.idMusteri = idMusteri;
          data.Name = ad;
          data.Email = mail;
          data.Telefon = telefon;
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
              // this._showServiceError($(err.response.responseText).find("message").first().text());
              // var message = $(err.responseText).find('message').first().text();
              var errorObj1 = JSON.parse(err.responseText);
              // sap.m.MessageBox.error(errorObj1.error.message.value,  {
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
                error: function (err) { },
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

          // sap.ui.getCore().byId(this.createId("_idTemsilci")).setVisible(true);
          // sap.ui.getCore().byId(this.createId("_idMusteri")).setVisible(false);
          // sap.ui.getCore().byId(this.createId("_idBtnList")).setVisible(false);
        } else if (t === "Müşteri") {
          l.setProperty("/SicilVisible", false);
          l.setProperty("/MusteriVisible", true);

          // sap.ui.getCore().byId(this.createId("_idTemsilci")).setVisible(false);
          // sap.ui.getCore().byId(this.createId("_idMusteri")).setVisible(true);
          // sap.ui.getCore().byId(this.createId("_idBtnList")).setVisible(true);
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

          // sap.ui.getCore().byId(this.createId("_idTemsilci")).setVisible(false);
          // sap.ui.getCore().byId(this.createId("_idMusteri")).setVisible(true);
          // sap.ui.getCore().byId(this.createId("_idBtnList")).setVisible(true);
        }
        e.getSource().getBinding("items").filter([]);
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

      onFavPress: function (oEvent) {
        var l = this.getModel("selectionModel");

        var oListItem       = oEvent.getSource();
        var oBindingContext = oListItem.getBindingContext();
        var idMusteri       = oBindingContext.getProperty("idMusteri");
        var Parnr           = oBindingContext.getProperty("Parnr");
        var Telefon         = oBindingContext.getProperty("Telefon");
        var Email           = oBindingContext.getProperty("Email");
        var Name            = oBindingContext.getProperty("Name");

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
        query += '-';
        query += Parnr;

        SAPoData.read("/VisitingSet('" + query + "')", {
          success: function (oData, oResponse) {

            // l.setProperty("/VHName", oData.results[0].Name);
            // l.setProperty("/VHEmail", oData.results[0].Email);
            // l.setProperty("/VHTelefon",oData.results[0].Email);
            l.setProperty("/Query",oData.Query);
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



            sap.ui.core.BusyIndicator.hide(0);
          },
          error: function (oError) {
            sap.ui.core.BusyIndicator.hide(0);
          },
        });


        sap.m.MessageBox.show("Lütfen işlem seçimi yapınız", {
          title: "İşlem",
          actions: ["Arama Saatleri", "Favori", "Ara", "Çıkış"],
          styleClass: "messageBoxError",
          onClose: function (e) {
            if (e === "Arama Saatleri") {

              that.openVisiting(); 

            }
            else if (e === "Favori") {
              var oModel = that.getView().getModel();
              oModel.create("/IletisimSet", data, {
                success: function (oData, oResponse) {
                  sap.ui.core.BusyIndicator.hide(0);
                },
                error: function (err) { },
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

        // var oTable = this.byId("lineItemsList");
        // var oBinding = oTable.getBinding("items");
        // oBinding.filter(aFilter, sap.ui.model.FilterType.Application);
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
          sap.m.MessageToast.show('Pazar günü seçilemez!');
          this.getView().byId("idDate1").setValue(this.selectionModel.oData.Vdatu);
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
