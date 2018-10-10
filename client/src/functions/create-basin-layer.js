const createBasinLayer = (basin, esri) => {

  let layer = new esri.GraphicsLayer();
  layer.id = 'basinLayer';
  layer.attributionDataUrl = 'https://streamstats.usgs.gov/docs/streamstatsservices/#/';

  let basinPolygon = new esri.Polygon({
    'rings': basin,
    'spatialReference': {'wkid': 4326}
  });

  let basinStyle = new esri.SimpleFillSymbol(
    esri.SimpleFillSymbol.STYLE_SOLID,
    new esri.SimpleLineSymbol(
      esri.SimpleLineSymbol.STYLE_DASHDOT,
      new esri.Color([66,134,244]),
      2
    ),
    new esri.Color([83,127,198,0.8])
  );

  let graphic = new esri.Graphic(basinPolygon, basinStyle);
  layer.add(graphic);
  return layer;
};

module.exports = createBasinLayer;