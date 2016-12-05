require(["dojo/ready","dojo/parser","esri/map","./js/src/geojsonlayer.js","./js/pace.js","esri/geometry/webMercatorUtils","esri/geometry/Point","esri/geometry/Polyline","esri/geometry/geometryEngine","esri/symbols/SimpleMarkerSymbol","esri/geometry/Polygon","esri/symbols/SimpleFillSymbol","esri/symbols/SimpleLineSymbol","esri/Color","esri/graphic","esri/layers/FeatureLayer","esri/layers/GraphicsLayer","esri/InfoTemplate","dijit/TooltipDialog","esri/SpatialReference","esri/tasks/query","dojo/dom"],function(ready,parser,Map,GeoJsonLayer,pace,webMercatorUtils,Point,Polyline,geometryEngine,SimpleMarkerSymbol,Polygon,SimpleFillSymbol,SimpleLineSymbol,Color,Graphic,FeatureLayer,GraphicsLayer,InfoTemplate,TooltipDialog,SpatialReference,Query,dom){var featureServiceUrl;var tracePolyline;var dialog;var diverterLayer=new GraphicsLayer;var selectedLayer=new GraphicsLayer;selectedLayer.id="selectedLayer";var map=null;var mp;var downstreamRights=[];var instructions=document.getElementById("instructions");var table=document.getElementById("table");var update=document.getElementById("update");var button1=document.getElementById("button1");var button2=document.getElementById("button2");var button3=document.getElementById("button3");var button4=document.getElementById("button4");function initialize(){parser.parse();map=new Map("map",{basemap:"topo",center:[-119.4179,36.7783],zoom:7,smartNavigation:false,spatialReference:4326});fillSymbol=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,0,1]),200),new Color([255,255,0,1]));map.on("load",function(){map.hidePanArrows();map.showZoomSlider();map.setMapCursor("move");instructions.innerHTML="Zoom in to select the proposed point of diversion"});var mapZoom=map.on("zoom-end",function(){if(!trace_api.haveTrace()){if(map.getZoom()>=10){map.setMapCursor("crosshair");instructions.innerHTML="click within a stream to select the proposed point of diversion"}else if(map.getZoom()<10){map.setMapCursor("move");instructions.innerHTML="Zoom in to select the proposed point of diversion"}}else{mapZoom.remove()}});var mapClick=map.on("click",function(evt){if(map.getZoom()>=10&&!trace_api.haveTrace()){showCoordinates(evt);traceDownstream()}else if(trace_api.haveTrace()){mapClick.remove()}});var button1Listener=button1.addEventListener("click",function(){this.disabled="disabled";queryDiverters()});button2.addEventListener("click",function(){makeTable()});button3.addEventListener("click",function(){this.disabled="disabled";button3.style.display="none";usgsRequest(0,saveWatershed);diverterListener.remove()});button4.addEventListener("click",function(){this.disabled="disabled";sumWatershedDiversions()});diverterLayer.on("mouse-over",function(evt){var g=evt.graphic;map.infoWindow.setContent(g.getContent());map.infoWindow.show(evt.screenPoint,map.getInfoWindowAnchor(evt.screenPoint))});diverterLayer.on("mouse-out",function(evt){map.infoWindow.hide()});var diverterListener=diverterLayer.on("mouse-up",function(evt){button2.style.display="block";button3.style.display="none";if(evt.graphic._graphicsLayer.id!==selectedLayer.id){evt.graphic.setSymbol((new SimpleMarkerSymbol).setSize(10).setStyle(SimpleMarkerSymbol.STYLE_CIRCLE).setColor(new Color([122,66,123,1])));selectedLayer.add(evt.graphic);selectedLayer.redraw();diverterLayer.redraw()}else{evt.graphic.setSymbol((new SimpleMarkerSymbol).setSize(10).setStyle(SimpleMarkerSymbol.STYLE_CIRCLE).setColor(new Color([255,0,0,.5])));selectedLayer.remove(evt.graphic);diverterLayer.redraw();selectedLayer.redraw()}})}function showCoordinates(evt){mp=webMercatorUtils.webMercatorToGeographic(evt.mapPoint);var sms=new SimpleMarkerSymbol;sms.setSize(10);sms.setStyle("STYLE_X");var proposed=new Graphic(new Point(evt.mapPoint),sms);map.graphics.add(proposed)}var traceDownstream=function(){trace_api.addTrace({map:map,x:mp.x,y:mp.y,traceLineColor:[46,138,138,1],traceLineStyle:"STYLE_SHORTDASHDOT",originPointColor:[46,138,138,1],originPoint:"infoHover",clearOldTraces:true,originPointTextSymbol:trace_api.lastTraceInfo.originStreamName});if(trace_api.isTracing){update.style.display="block";update.innerHTML="Tracing flowline with USGS Streamer"}trace_api.on("trace-success",function(){instructions.innerHTML="";button1.style.display="block";map.setMapCursor("auto")})};var queryDiverters=function(){var trace=geometryEngine.geodesicBuffer(trace_api.allTraceExtents,5e3,"meters",true);var sms=(new SimpleMarkerSymbol).setSize(10).setStyle(SimpleMarkerSymbol.STYLE_CIRCLE).setColor(new Color([255,0,0,.5]));diverterLayer.id="diverterLayer";var info=new InfoTemplate("Water Right POD","Stream: ${stream} <br>WR Type: ${wrType}<br>WR Status: ${wrStatus} <br>divType: ${divType}<br>diversion status: ${podStatus}");for(var i=1;i<ewrims.length;i++){var record=ewrims[i];if(record.FIELD49=="Appropriative"&&record.FIELD45=="Active"){var diversion=new Point([record.FIELD19,record.FIELD18]);if(trace.contains(diversion)){var attr={stream:record.FIELD22,face:record.FIELD46,site:record.FIELD32,rightId:record.FIELD40,directDiv:record.FIELD41,divToStorage:record.FIELD42,divType:record.FIELD47,wrType:record.FIELD49,wrStatus:record.FIELD50,podStatus:record.FIELD45,appId:record.FIELD3,appPod:record.FIELD5};var graphic=new Graphic(diversion,sms,attr,info);diverterLayer.add(graphic)}}}map.addLayers([diverterLayer,selectedLayer]);button1.style.display="none";instructions.innerHTML="click on a water right diversion to select it for analysis";applyToolTip()};var applyToolTip=function(){dialog=new TooltipDialog({id:"tooltipDialog",style:"position: absolute; width: 250px; font: normal normal normal 10pt Helvetica;z-index:100"});dialog.startup()};var makeTable=function(){table.innerHTML="";button2.style.display="none";var counter=0;selectedLayer.graphics.forEach(function(diversion){var htmlDiv=makeDiv(diversion.attributes,counter);table.insertAdjacentHTML("beforeEnd",htmlDiv);counter++});instructions.style.display="none";table.style.display="block";button3.style.display="block";allowDeletion(true)};var makeDiv=function(attr,counter){var background;if(counter%2===0){background="lightgrey"}var htmlDiv="<div id="+attr.appPod+" class='waterRight' style='background-color:"+background+"'><div><p>"+attr.stream+"</p>    <br><span>app: "+attr.appId+"</span><br><span>status: "+attr.wrStatus+"</span><br><span>diversion: "+attr.divType+"</span>    <br><span>status: "+attr.podStatus+"</span>    <br><span>face value (a-f/yr): "+attr.face+'</span></div>    <div class=\'delete\'><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></div>';return htmlDiv};var allowDeletion=function(){var deleteDiverters=document.getElementsByClassName("delete");var diverterLength=deleteDiverters.length;for(var i=0;i<diverterLength;i++){deleteDiverters[i].addEventListener("click",function(evt){console.log("delete graphic from selectedLayer");var targetId=evt.target.parentNode.id;var j=0;while(j<selectedLayer.graphics.length){if(selectedLayer.graphics[j].attributes.appPod===targetId){selectedLayer.remove(selectedLayer.graphics[j]);j=selectedLayer.graphics.length+100}else{j++}}selectedLayer.redraw();makeTable()})}};function usgsRequest(counter,callback){var request=new XMLHttpRequest;var faceAmount=selectedLayer.graphics[counter].attributes.face;request.onreadystatechange=function(){if(request.status===200&&request.readyState===4){callback(JSON.parse(request.responseText),faceAmount);counter++;mySyncFunction()}else if(request.status!==200&&request.readyState===4){console.log(request);button3.style.display="block";document.body.style.cursor="auto";update.style.display="none";instructions.innerHTML=request.error}};var mySyncFunction=function(){update.style.display="block";update.innerHTML="Retrieving watershed data from USGS";instructions.innerHTML="";document.body.style.cursor="wait";console.log("counter: "+counter);var selectedLength=selectedLayer.graphics.length;if(counter<selectedLength){var x=selectedLayer.graphics[counter].geometry.x;var y=selectedLayer.graphics[counter].geometry.y;var usgsBasinUrl="http://streamstatsags.cr.usgs.gov/streamstatsservices/watershed.geojson?rcode=CA&xlocation="+x+"&ylocation="+y+"&crs=4326&includeparameters=true&includeflowtypes=false&includefeatures=true&simplify=true";request.open("Get",usgsBasinUrl,true);request.send()}else{console.log("end");document.body.style.cursor="auto";map.setMapCursor("move");update.style.display="none";button4.style.display="block";map.setExtent(trace_api.allTraceExtents);drawWatershed();updateTable("area (sq mi)","area",downstreamRights)}};mySyncFunction()}var saveWatershed=function(response,face){var watershed=response.featurecollection[1].feature;console.log(watershed);console.log(face);var area=response.parameters[0].value;console.log("area: "+area);var parameters=response.parameters;var watershedID=response.workspaceID;var waterRightObject={watershed:watershed,area:area,face:face,sum:parseInt(face),parameters:parameters,watershedID:watershedID};downstreamRights.push(waterRightObject);console.log(downstreamRights)};var drawWatershed=function(){downstreamRights.forEach(function(downstreamRight){var watershedLayer=new GeoJsonLayer({data:downstreamRight.watershed,style:new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,new Color([255,0,0]),2),new Color([255,255,0,.25]))});map.addLayer(watershedLayer)})};var updateTable=function(string,key,arrayName){var counter=0;arrayName.forEach(function(i){console.log(i.key);console.log(i);var span="<br><span>"+string+": "+i[key]+"</span>";table.children[counter].children[0].insertAdjacentHTML("beforeEnd",span);counter++})};var sumWatershedDiversions=function(){downstreamRights.forEach(function(downstreamRight){console.log(downstreamRight.face);console.log(downstreamRight.watershed);var polygonJson={rings:downstreamRight.watershed.features[0].geometry.coordinates,spatialReference:{wkid:4326}};var watershedPolygon=new Polygon(polygonJson);var ewrimsLength=ewrims.length;for(var i=0;i<ewrimsLength;i++){var record=ewrims[i];if(record.FIELD49=="Appropriative"&&record.FIELD45=="Active"){var diversion=new Point([record.FIELD19,record.FIELD18]);if(watershedPolygon.contains(diversion)){var faceAmount=parseInt(record.FIELD46);downstreamRight.sum=downstreamRight.sum+faceAmount}}}updateTable("Sum of all diversions (a-f/yr)","sum",downstreamRights);button4.style.display="none";document.getElementById("download").style.display="block"})};ready(initialize);pace.start()});