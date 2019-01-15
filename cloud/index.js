exports.sense = function (event, callback) {
  const pubsubMessage = event.data;
  const Influx = require('influxdb-nodejs');
  const client = new Influx('http://{fluxdb_adress}:8086/sensible');
  const fieldSchema = {
    value: 'f'
  };
  const tagSchema = {
    feature: ['temperature', 'humidity', 'pressure', 'magnetometer', 'gyroscope', 'accelerometer'],
    device: ['sensi1','sensi2','sensi3','sensi4','sensi5','sensi6','sensi7','sensi8']
  };
  client.schema('measurement', fieldSchema, tagSchema, {
    stripUnknown: true
  });

  var msgStr = Buffer.from(pubsubMessage.data, 'base64').toString();
  var msgObj = parseMsgData(msgStr);

  client.write('measurement')
  	.tag({
    	feature: msgObj.feature,
    	device: pubsubMessage.attributes.deviceId
  	})
  	.field({
    	value: msgObj.value
  	})
  .then(() => console.log('success wrote: %s %O', msgStr, pubsubMessage.attributes))
  .catch(console.error);

  callback();
};

function parseMsgData (data) {
  dataObj = JSON.parse(data);
  valueStr = dataObj.value;
  value = parseFloat(valueStr.substring(1,valueStr.length-1));
  return {
    feature: dataObj.feature.toLowerCase(),
    value: value
  };
}
