var dbconfig = require("./config");
var AWS = require("aws-sdk");
AWS.config.update(dbconfig.aws_remote_config);

exports.handler = (event, context, callback) => {
  let response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      "Content-Type": "application/json",
    },
    body: JSON.stringify("Hello from Lambda!"),
  };
  console.log(response);

  const table_name = "euclid-ticket-table";
  var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
  });
  if (event.body == null) {
    response.statusCode = 400;
    response.body = JSON.stringify("Request body absent");
    callback(null, response);
  }
  console.log("request body before parsing", event.body);
  let req_body = JSON.parse(event.body);
  // let req_body = {
  //   start_time: 12,
  //   no_of_tickets: 4,
  // };
  console.log("request body", req_body);
  if (req_body.start_time == null) {
    console.log("start time absent returning..", req_body.start_time);
    response.statusCode = 400;
    response.body = JSON.stringify("Start time absent in request body");
    callback(null, response);
  }

  // let params = {
  //   TableName: table_name,
  //   KeyConditionExpression: "slot_start_time = :startTime",
  //   ExpressionAttributeValues: {
  //     ":startTime": req_body.start_time,
  //   },
  // };

  if (req_body.no_of_tickets == null || req_body.no_of_tickets <= 0) {
    console.log("no of tickets problem returning...", req_body.no_of_tickets);
    response.statusCode = 400;
    response.body = JSON.stringify("Invalid no-of-tickets");
    callback(null, response);
  }

  let start_time = parseInt(req_body.start_time);
  let end_time = parseInt(req_body.end_time);
  console.log("start time and end_time", start_time, end_time);

  let params = {
    TableName: table_name,
    // KeyConditionExpression: "slot_start_time = :startTime",
    // ExpressionAttributeValues: {
    //   ":startTime": req_body.start_time,
    // },
    Key: {
      slot_start_time: start_time,
      slot_end_time: end_time,
    },
  };

  console.log("params", params);

  docClient.get(params, function (err, data) {
    if (err) {
      console.log("error occured");
      console.log(err);
      response.statusCode = 400;
      response.body = JSON.stringify("Couldn't find such key");
      callback(null, response);
    }
    console.log(data.Item);
    let slot_details = data.Item;
    let updatedNoOfTickets =
      slot_details.no_of_tickets - parseInt(req_body.no_of_tickets);
    if (updatedNoOfTickets < 0) {
      console.log("no of tickets problem returning...", req_body.no_of_tickets);
      response.statusCode = 400;
      response.body = JSON.stringify("Max limit reached!");
      callback(null, response);
    }
    let updatedParams = {
      TableName: table_name,
      Item: {
        slot_start_time: start_time,
        slot_end_time: end_time,
        no_of_tickets: updatedNoOfTickets,
      },
    };
    docClient.put(updatedParams, function (err, data) {
      if (err) {
        console.log("Error", err);
        response.statusCode = 400;
        response.body = JSON.stringify("Some error occurred");
        callback(null, response);
      } else {
        console.log("Success", data);
        response.statusCode = 200;
        response.body = JSON.stringify("success");
        callback(null, response);
      }
    });
  });
};

// curl -X POST \
// -H "Content-Type: application/json" \
// --request POST --data '{"start_time": 12, "no_of_tickets": 5}' \
// https://1ctsx2kh5i.execute-api.us-east-1.amazonaws.com/test/add-tickets

// var params = {
//   TableName: table,
//   KeyConditionExpression: "slot_start_time = :rkey",
//   ExpressionAttributeValues: {
//     ":rkey": {'N': '12'},
//   },
//   // KeyConditions: {
//   //   'slot_start_time': 12
//   // }
// };

// docClient.query(params, function (err, data) {
//   if (err) {
//     console.log("error occured");
//     console.log(err);
//   } else {
//     // console.log(data);
//     const { Items } = data;
//     // for (item in Items) {
//     //   // if (item.info.slot_start_time == req_body.start_time) {
//     //   //   item.info.no_of_tickets += req_body.no_of_tickets;
//     //   // }
//     // }
//     console.log(Items);
//   }
// });

// docClient.scan(params, function (err, data) {
//   if (err) {
//     console.log(err);
//   } else {
//     // console.log(data);
//     const { Items } = data;
//     // for (item in Items) {
//     //   if (item.info.slot_start_time == req_body.start_time) {
//     //     item.info.no_of_tickets += req_body.no_of_tickets;
//     //   }
//     // }
//     console.log(Items);
//   }
// });
