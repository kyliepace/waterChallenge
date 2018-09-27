const createPoint = (right, esri) => {

  const sms = new esri.SimpleMarkerSymbol(
    esri.SimpleMarkerSymbol.STYLE_CIRCLE,
    15,
    null,
    new esri.Color([255, 0, 0, 0.5])
  );

  const info = new esri.InfoTemplate('Water Right POD', 'Appl_ID: ${appl_id}<br>');

  let point = new esri.Point({
      'x': right.LONGITUDE.toString(),
      'y': right.LATITUDE.toString(),
      'spatialReference': {
        'wkid': 4326
      }
    });

    let attr = {
      'appl_id': right.appl_id
    };


    return new esri.Graphic(point, sms, attr, info);
};

module.exports = createPoint;