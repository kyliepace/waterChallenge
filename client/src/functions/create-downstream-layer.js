const createDownstreamLayer = (downstreamRights, esri) => {

  const sms = new esri.SimpleMarkerSymbol()
        .setSize(10)
        .setStyle(esri.SimpleMarkerSymbol.STYLE_CIRCLE)
        .setColor(new esri.Color([255, 0, 0, 0.5]));

  const info = new esri.InfoTemplate('Water Right POD', 'Appl_ID: ${appl_id}<br>');

  return downstreamRights.map(right => {
    let point = new esri.Point([right.LONGITUDE, right.LATITUDE]);

    let attr = {
      'appl_id': right.appl_id
    };


    return new esri.Graphic(point, sms, attr, info);
  });
};

module.exports = createDownstreamLayer;