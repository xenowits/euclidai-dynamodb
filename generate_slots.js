var uuid = require("uuid");
var dbconfig = require("../config");
var AWS = require("aws-sdk");

AWS.config.update(dbconfig.aws_remote_config);
var docClient = new AWS.DynamoDB.DocumentClient();

var table = "euclid-ticket-table";

console.log("Adding new items...");

for (let i = 0; i < 24; i += 1) {
  for (let j = i + 1; j <= 24; j += 1) {
    var params = {
      TableName: table,
      Item: {
        slot_start_time: i,
        slot_end_time: j,
        no_of_tickets: 10,
      },
    };
    docClient.put(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to add item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
      }
    });
  }
}

// for (let i = 0; i < 24; i += 1) {
//   // let random_uuid = uuid.v4().toString();

// }
