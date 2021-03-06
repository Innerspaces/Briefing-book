﻿/*global require,dojo,dojoConfig,appGlobals:true */
/*jslint browser:true,sloppy:true,nomen:true,unparam:true,plusplus:true,indent:4 */
/*
 | Copyright 2013 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
//============================================================================================================================//

require([
    "coreLibrary/widget-loader",
    "application/config",
    "esri/IdentityManager",
    "coreLibrary/oauth-helper",
    "widgets/alert-dialog/alert-dialog",
    "esri/config",
    "esri/arcgis/utils",
    "dojo/domReady!"
], function (WidgetLoader, config, IdentityManager, OAuthHelper, AlertBox, esriConfig, arcgisUtils) {

    //========================================================================================================================//


    // from repository application-boilerplate-js
    function _setupOAuth(oauthappid, portalURL) {
        OAuthHelper.init({
            appId: oauthappid,
            portal: portalURL,
            expiration: (4 * 60) // 4 hours (in minutes); default is 30 minutes
        });
    }

    // adapted from repository application-boilerplate-js
    function _initializeApplication() {
        var appLocation, instance;

        // Check to see if the app is hosted or a portal. If the app is hosted or a portal set the
        // sharing url and the proxy. Otherwise use the sharing url set it to arcgis.com.
        // We know app is hosted (or portal) if it has /apps/ or /home/ in the url.
        appLocation = location.pathname.indexOf("/apps/");
        if (appLocation === -1) {
            appLocation = location.pathname.indexOf("/home/");
        }
        // app is hosted and no sharing url is defined so let's figure it out.
        if (appLocation !== -1) {
            // hosted or portal
            instance = location.pathname.substr(0, appLocation); //get the portal instance name
            appGlobals.appConfigData.PortalURL = location.protocol + "//" + location.host + instance;
            appGlobals.appConfigData.ProxyURL = location.protocol + "//" + location.host + instance + "/sharing/proxy";
        } else {
            // setup OAuth if oauth appid exists. If we don't call it here before querying for appid
            // the identity manager dialog will appear if the appid isn't publicly shared.
            if (appGlobals.appConfigData.OAuthAppid) {
                _setupOAuth(appGlobals.appConfigData.OAuthAppid, appGlobals.appConfigData.PortalURL);
            }
        }
        arcgisUtils.arcgisUrl = appGlobals.appConfigData.PortalURL + "/sharing/rest/content/items";
        // Define the proxy url for the app
        if (appGlobals.appConfigData.ProxyURL) {
            esriConfig.defaults.io.proxyUrl = dojoConfig.baseURL + appGlobals.appConfigData.ProxyURL;
            esriConfig.defaults.io.alwaysUseProxy = false;
        }
    }

    try {

        /**
        * load application configuration settings from configuration file
        * create an object of widget loader class
        */
        //create global var to store application data
        appGlobals = {};
        //to store configuration setting.
        appGlobals.appConfigData = config;
        //to store all books.
        appGlobals.bookInfo = [];
        //to store index of selected book.
        appGlobals.currentBookIndex = null;
        //to store name of logged in user.
        appGlobals.currentUser = null;
        //to store count of unloaded module.
        appGlobals.moduleLoadingCount = null;
        _initializeApplication();
        esriConfig.defaults.io.corsDetection = true;
        esriConfig.defaults.io.corsEnabledServers.push(appGlobals.appConfigData.PortalURL);
        esriConfig.defaults.io.timeout = 600000;
        //initialize widget-loader.
        var applicationWidgetLoader = new WidgetLoader();
        applicationWidgetLoader.startup();

    } catch (ex) {
        //display error message if any error occurred.
        this.alertDialog = new AlertBox();
        this.alertDialog._setContent(ex.message, 0);
    }

});
