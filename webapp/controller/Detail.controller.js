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

      getSiparisList: function() { 
        var cari = this.getView().byId("_id6").getValue(); 
        var that = this; 
        var SAPoData = new sap.ui.model.odata.v2.ODataModel(
          "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV/",
          true
        );
  
        sap.ui.core.BusyIndicator.show(0);
        var jsonData = new sap.ui.model.json.JSONModel();
          jsonData.setSizeLimit("10000000"); 
          SAPoData.read("/SiparisSet", {
            filters: [
              new sap.ui.model.Filter("idMusteri", sap.ui.model.FilterOperator.EQ, cari), 
  
            ],
            success: function(oData, oResponse) {
              sap.ui.core.BusyIndicator.hide(0);
              if (oData.results && oData.results.length > 0) {
                jsonData.setData(oData);
                that.getView().setModel(jsonData, "SiparisList");
              } else {
                      jsonData.setData([]);
                that.getView().setModel(jsonData, "SiparisList"); 
              }
            },
            error: function(oError) {
              try {
                var errMessage = JSON.parse(oError.responseText);
                errMessage = errMessage.error.message.value;
              } catch (e) {
                errMessage = oError.message;
              }
              sap.m.MessageBox.alert(errMessage, {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: this.getView().getModel("i18n").getResourceBundle().getText("hataUyari")
              });
              sap.ui.core.BusyIndicator.hide(0);
            }
          });
       
      },


      onSetSiparisList: function(){  


        var data = [
          { 
            idMusteri:"",
            idTemsilci:"",
            Matnr:"",
            Maktx:"",
            Menge:0,
            Meins:"",
            UrunGrp:"",
            UrunGrpTxt:"",
            Search:"",
            FirstDay:"",
            SecondDay:"",
            ThirdDay:"",
            Onerilen:"",
            Koli:"",
            SiparisTutar:0,
            FirstDayAdet:"",
            SecondDayAdet:"",
            ThirdDayAdet:"",
            Mesaj:"",
            Kdv:0
      }
      
      ];


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
          Aciklama: "",
          BelgeAciklama: "",
          BelAcik1: " no'lu sipariş ",
          BelAcik2: " onayı ",
          BelAcik3: " tarafından alınmıştır.",
          ToplamSiparis: "",
          ToplamSiparisKdv: "",
          SyUname: sap.ushell.Container.getService("UserInfo").getId(),
          SelectionScreenPanelExpanded: true,
          Panel1: false,
          Panel2: false,
          Panel3: false,
          Panel4: false,
          UrunPanelExpanded: false,
          UrunPanelVisible: false,
          Enabled: false,
          AgEnabled: false,
          SipTamam:false,
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

        var l = this.getModel("selectionModel");
        l.setProperty("/Enabled", false);


        var cari = this.getView().byId("_id6").getValue(); 
        var that = this; 
        var SAPoData = new sap.ui.model.odata.v2.ODataModel(
          "/sap/opu/odata/sap/ZFIO_TELSEL_CUST_MANAGE_SRV/",
          true
        );

        sap.ui.core.BusyIndicator.show(0);
        var jsonData = new sap.ui.model.json.JSONModel();
          jsonData.setSizeLimit("10000000"); 
          SAPoData.read("/SiparisSet", {
            filters: [
              new sap.ui.model.Filter("idMusteri", sap.ui.model.FilterOperator.EQ, cari), 
  
            ],
            success: function(oData, oResponse) {
              sap.ui.core.BusyIndicator.hide(0);
              if (oData.results && oData.results.length > 0) {
                jsonData.setData(oData);
                that.getView().setModel(jsonData, "SiparisList");


              l.setProperty("/FirstDay", oData.results[0].FirstDay);
              l.setProperty("/SecondDay", oData.results[0].FirstDay);
              l.setProperty("/ThirdDay", oData.results[0].FirstDay);

              } else {
                      jsonData.setData([]);
                that.getView().setModel(jsonData, "SiparisList"); 
              }
            },
            error: function(oError) {
              try {
                var errMessage = JSON.parse(oError.responseText);
                errMessage = errMessage.error.message.value;
              } catch (e) {
                errMessage = oError.message;
              }
              sap.m.MessageBox.alert(errMessage, {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: this.getView().getModel("i18n").getResourceBundle().getText("hataUyari")
              });
              sap.ui.core.BusyIndicator.hide(0);
            }
          });





        var that = this;
        var a = true;
        if (this.selectionModel.oData.Kunnr == "") {
          var i = "Müşteri giriniz";
          sap.m.MessageToast.show(i);
          sap.ui.core.BusyIndicator.hide(0);
        } else {
          var o = this;
          // var r = this.byId("lineItemsList").getBinding("items");
          var r = this.byId("_idCBoxPerson").getBinding("items");
          var p = this.byId("_IDGenList2").getBinding("items");
          var s = this.byId("_IDGenList3").getBinding("items");



          var n = [];

          var cari = o.getView().byId("_id6").getValue(); 
          n.push(
            new sap.ui.model.Filter(
              "idMusteri",
              sap.ui.model.FilterOperator.EQ,
              cari
            )
          );
 
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
            },
          });
          sap.ui.core.BusyIndicator.show(0);
          r.refresh();
          p.refresh();
          s.refresh();

          l.setProperty("/UrunPanelExpanded", true);
          l.setProperty("/Panel1", true);
          l.setProperty("/Panel2", true);
          l.setProperty("/Panel3", true);
          l.setProperty("/Panel4", true);
          l.setProperty("/UrunPanelVisible", true);
          l.setProperty("/SelectionScreenPanelExpanded", true);

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


      onKaydet:function(e){ 


        var results = [];
        var aData = {}; 

        var that = this;
        var jsonData = new sap.ui.model.json.JSONModel(); 
        var oTable = that.byId("lineItemsList");    
        var oModel = oTable.getModel("SiparisList");    
        var aTmp   = oModel.getData(); 
        for (var i = 0; i < aTmp.results.length; i++) { 
          if(aTmp.results[i].Menge > 0){

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
              // for (var i = 0; i < oTable.getItems().length; i++) { 
              //   if(oTable.getItems()[i].getCells()[6].getValue() > 0){
      
              //     var siparisResult = {};
              //     siparisResult.Maktx = oTable.getItems()[i].getCells()[1].getText();
              //     siparisResult.Matnr = oTable.getItems()[i].getCells()[0].getText();
              //     siparisResult.Menge = oTable.getItems()[i].getCells()[6].getValue();
              //     siparisResult.Meins = oTable.getItems()[i].getCells()[8].getText();
              //     siparisResult.SiparisTutar = oTable.getItems()[i].getCells()[9].getText(); 
        
              //     aData.results.push(siparisResult);                
              //   } 
              // }
              jsonData.setData(aData);
              this.getView().setModel(jsonData, "OzetList"); 

              // if (!this._valueHelpDialogSum) {
              //   this._valueHelpDialogSum = sap.ui.xmlfragment(
              //     "zfiotelselkokpit.fragment.Sum",
              //     this
              //   );
              //   this._valueHelpDialogSum.setMultiSelect(true);
              //   this.getView().addDependent(this._valueHelpDialogSum);
              // } 
 
              // sap.ui.getCore().byId("lineSumList")._getOkButton().setText("Kaydet"); 
              // sap.ui.getCore().byId("lineSumList")._getCancelButton().setText("Kapat"); 
              // this._valueHelpDialogSum.open(); 

      },
      closeSum: function () {
        this._valueHelpDialogSum.close();
      },      

      saveInput: function () {
        var that = this;
        sap.m.MessageBox.confirm("Sipariş yaratılıyor, emin misiniz?", {
          title: "Bilgilendirme",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          styleClass: "messageBoxError",
          onClose: function (e) {
            if (e === sap.m.MessageBox.Action.YES) {
              // var oGlobalBusyDialog = new sap.m.BusyDialog();
              // oGlobalBusyDialog.setProperty("text", "Sipariş Yaratılıyor...");
              // oGlobalBusyDialog.open();
              sap.ui.core.BusyIndicator.show(0); 
              var oModel = that.getView().getModel();
              var oTable = that.byId("lineItemsList");



              var oModel2 = oTable.getModel("SiparisList");    
              var aData   = oModel2.getData();



              var idMusteri = that.selectionModel.oData.Kunnr;

              var siparisItem = [];
              var data = {}; 

              for (var i = 0; i < aData.results.length; i++) { 
                if(aData.results[i].Menge > 0){
                  var material = aData.results[i].Matnr;
                  var adet = parseFloat(
                    aData.results[i].Menge
                  ).toFixed(2);
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
              oModel.create("/MusteriSet", data, {
                success: function (oData, oResponse) { 

                  sap.m.MessageBox.information(oResponse.data.Mesaj, {
                    title: "Bilgilendirme",
                    id: "messageBoxId1", 
                    contentWidth: "100px",
                  });  

                  var oTableSum = that.byId("lineSumList");    
                  var oModelSum = oTableSum.getModel("OzetList");    
                  oModelSum.setData(null);
                  that.byId("_id22").setValue("0");
                  that.byId("_id24").setValue("0");
                  that.byId("_id26").setValue("0");
                  that.getSiparisList();
                  
                  sap.ui.core.BusyIndicator.hide(0); 
                  // oGlobalBusyDialog.close();
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
        

        var that = this;
        sap.m.MessageBox.confirm("Fiyat hesaplaması yapılacak, emin misiniz?", {
          title: "Bilgilendirme",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          styleClass: "messageBoxError",
          onClose: function (e) {
            if (e === sap.m.MessageBox.Action.YES) {
              sap.ui.core.BusyIndicator.show();

              var oModel = that.getView().getModel();
              var oTable = that.byId("lineItemsList");

              var idMusteri = that.selectionModel.oData.Kunnr;

              var oModel2 = oTable.getModel("SiparisList");    
              var aData   = oModel2.getData();

              var siparisItem = [];
              var data = {};


              for (var i = 0; i < aData.results.length; i++) { 
                if(aData.results[i].Menge > 0){
                  var material = aData.results[i].Matnr;
                  var adet = parseFloat(
                    aData.results[i].Menge
                  ).toFixed(2);
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

              // for (var i = 0; i < oTable.getItems().length; i++) {
              //   var material = oTable.getItems()[i].getCells()[0].getText();
              //   var adet = parseFloat(
              //     oTable.getItems()[i].getCells()[6].getValue()
              //   ).toFixed(2);
              //   var birim = oTable.getItems()[i].getCells()[8].getText();

              //   var siparisResult = {};
              //   siparisResult.idMusteri = idMusteri;
              //   siparisResult.Matnr = material.toString();
              //   siparisResult.Menge = adet;
              //   siparisResult.Meins = birim;
              //   siparisResult.SiparisTutar = "1";
              //   siparisResult.Kdv = "0";

              //   siparisItem.push(siparisResult);
              // }

              data.idMusteri = idMusteri;
              data.musteriToSiparis = siparisItem;
              data.ToplamSiparis = "0";
              data.ToplamKdv = "0";
              data.ToplamSiparisKdv = "0";

              
              
              var a = that.getModel("selectionModel");
              oModel.create("/MusteriSet", data, {
                success: function (oData, oResponse) {
                  a.setProperty("/ToplamSiparis", oData.ToplamSiparis);
                  a.setProperty("/Kdv", oData.ToplamKdv);
                  a.setProperty("/ToplamSiparisKdv", oData.ToplamSiparisKdv);
                  var oTableRefresh = that.byId("lineItemsList");


                  var oModel3 = oTableRefresh.getModel("SiparisList");    
                  var aData2   = oModel3.getData();
 

                  for (var y = 0;y < oData.musteriToSiparis.results.length;y++ ) {
                    var material2 = oData.musteriToSiparis.results[y].Matnr;
                    var mengeout = oData.musteriToSiparis.results[y].Menge;

                    if (mengeout > 0) {
                      for ( var i = 0;i < aData2.results.length; i++) {
                        var material = aData2.results[i].Matnr;
                        if (material == material2) {
                          var siptutar = oData.musteriToSiparis.results[y].SiparisTutar;
                          // var kdvtutar = oData.musteriToSiparis.results[y].Kdv;
                          // oTableRefresh .getItems()[i].getCells()[9].setText(siptutar);
                          aData2.results[i].SiparisTutar = siptutar;
                          // var sPath = "/results/"
                          // oModel3.setProperty(sPath+"i"+"/SiparisTutar", siptutar);    
                          break;
                        }
                      }                  
                
                      // for ( var i = 0;i < oTableRefresh.getItems().length; i++) {
                      //   var material = oTableRefresh.getItems()[i].getCells()[0].getText();
                      //   if (material == material2) {
                      //     var siptutar = oData.musteriToSiparis.results[y].SiparisTutar;
                      //     // var kdvtutar = oData.musteriToSiparis.results[y].Kdv;
                      //     oTableRefresh .getItems()[i].getCells()[9].setText(siptutar);
                      //     break;
                      //   }
                      // }
                    }
                  }
                  var jsonData = new sap.ui.model.json.JSONModel(); 
                  jsonData.setData(aData2);
                  that.getView().setModel(jsonData, "SiparisList"); 
                  
                  sap.ui.core.BusyIndicator.hide(0);

                  that.onKaydet();
                  // MessageToast.show("Sipariş Başarıyla Yaratıldı");
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
      onChange:function(event){
        var idMenge = event.getSource().getParent().getCells()[6].getValue();   
        var oTable = this.byId("lineItemsList"); 

        var sPath = event.getSource().mBindingInfos.value.binding.oContext.sPath;
        var oModel = oTable.getModel("SiparisList");  
          oModel.setProperty(sPath+"/Menge", idMenge);    
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

      onKisiEkle: function () {
        var that = this;
        var oModel = this.getView().getModel();
        var data = {};

        var idMusteri = this.getView().byId("_id6").getValue();
        var ad = sap.ui.getCore().byId("idAd").getValue();
        var mail = sap.ui.getCore().byId("idMail").getValue();
        var telefon = sap.ui.getCore().byId("idTelefon").getValue();
 
        var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/; 
        
        


        if (ad == "") {
          var i = "Ad soyad giriniz";
          sap.m.MessageToast.show(i);
          sap.ui.core.BusyIndicator.hide(0);
        } else if (telefon == "") {
          i = "Telefon giriniz";
          sap.m.MessageToast.show(i);
          sap.ui.core.BusyIndicator.hide(0);
        }
          else if( telefon.length < 10){
            alert("Geçerli Numara Giriniz!");
            return false;
        
        }
        else if(!mailregex.test(mail)){

          alert(mail + " Geçerli bir mail adresi değil!"); 
        }
        
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

      onSendNote:function(){
        var ad = this.getView()
          .byId("_idCBoxPerson")
          .getSelectedItem()
          .getText();
          if(ad == "")
          { 
            var i = "Görüşülen kişiyi seçiniz!";
            sap.m.MessageToast.show(i);
            sap.ui.core.BusyIndicator.hide(0);    
            return false;      
          }

        var that = this; 
        var data = {};

        var idMusteri = this.getView().byId("_id6").getValue();
        var not = this.byId("_IDGenFeedInput1").getValue();
        data.idMusteri = idMusteri;
        data.Not = not;
        data.Ad = ad;

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
          var kunnr = t.getBindingContext().getProperty("idMusteri");
          var newKunnr = kunnr.replace(/^0+/, '');
        if (t) {
          a.setProperty("/AgEnabled", true);
          a.setProperty(
            "/Kunnr",
            newKunnr
          );
          a.setProperty("/Name", t.getBindingContext().getProperty("Name"));
        }
        e.getSource().getBinding("items").filter([]); 
      },

      onFavPress: function (oEvent) {
        var oListItem = oEvent.getSource();
        var oBindingContext = oListItem.getBindingContext();
        var idMusteri = oBindingContext.getProperty("idMusteri");
        var Parnr = oBindingContext.getProperty("Parnr");
        var data = {};
        data.idMusteri = idMusteri;
        data.Parnr = Parnr;
        data.Type = "U"; 
        var that = this;
        sap.m.MessageBox.show("Lütfen işlem seçimi yapınız", {
          title: "İşlem",
          actions: ["Favori", "Ara", "Çıkış"],
          styleClass: "messageBoxError",
          onClose: function (e) {
            if (e === "Favori") {
              var oModel = that.getView().getModel(); 
              oModel.create("/IletisimSet", data, {
                success: function (oData, oResponse) {
                  sap.ui.core.BusyIndicator.hide(0);
                },
                error: function (err) {},
              });
            } else if (e === "Ara") {
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
          if(ugrp !== "00")
          {
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
        oView.byId("lineItemsList").getBinding("items").filter(aFilter, "Application");
      },
      onSearchFieldLiveChange: function(event) {
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

        oView.byId("lineItemsList").getBinding("items").filter(aFilter, "Application"); 
      },

      handleSearch:function(oEvent){
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
        // var ugrp = this.getView().byId('_IDGenComboBox2').getSelectedItem().getKey();
        // aFilter.push(
        //   new sap.ui.model.Filter(
        //     "UrunGrp",
        //     sap.ui.model.FilterOperator.EQ,
        //     ugrp
        //   )
        // );
        // filter binding

        var idMusteri = this.getView().byId("_id6").getValue();
        aFilter.push(
          new sap.ui.model.Filter(
            "idMusteri",
            sap.ui.model.FilterOperator.EQ,
            idMusteri
          )
        );
         
        // var oTable = this.byId("lineItemsList");
        // var oBinding = oTable.getBinding("items");
        // oBinding.filter(aFilter);
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
