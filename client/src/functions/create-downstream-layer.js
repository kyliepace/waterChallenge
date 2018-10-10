const createDownstreamLayer = (rights, esri, callback) => {

  const defaultColor = new esri.Color([255, 0, 0, 0.5]);
  const selectedColor = new esri.Color([122, 66, 123, 1]);

  const sms = new esri.SimpleMarkerSymbol(
    esri.SimpleMarkerSymbol.STYLE_CIRCLE,
    15,
    null,
    defaultColor
  );
  const info = new esri.InfoTemplate('Water Right POD', 'Appl_ID: ${appl_id}<br>');

  let downstreamLayer = new esri.GraphicsLayer({
    id: 'downstreamLayer',
    opacity: 0.7,
    visible: true
  });

  let selectedPointLayer = new esri.GraphicsLayer({
    id: 'selectedDownstreamPOD',
    opacity: 1,
    visible: true
  });

  let makePoint = (x, y) => {
    return new esri.Point({
      'x': x,
      'y': y,
      'spatialReference': {
        'wkid': 4326
      }
    });
  }

  rights.forEach(right => {
    let point = makePoint(right.LONGITUDE, right.LATITUDE);
    let attr = {
      'appl_id': right.appl_id
    };
    let graphic = new esri.Graphic(point, sms);
    downstreamLayer.add(graphic);
  });

  const selectedSymbol = new esri.SimpleMarkerSymbol(
    esri.SimpleMarkerSymbol.STYLE_CIRCLE,
    15,
    null,
    selectedColor
  );

  downstreamLayer.on('click', evt => {
    selectedPointLayer.clear();
    let x = evt.graphic.geometry.x;
    let y = evt.graphic.geometry.y;
    let point = makePoint(x, y);
    let graphic = new esri.Graphic(point, selectedSymbol);
    selectedPointLayer.add(graphic);
    selectedPointLayer.redraw();
    return callback({
      x,
      y
    });
  });
  return {
    downstreamLayer,
    selectedPointLayer
  };
};

module.exports = createDownstreamLayer;