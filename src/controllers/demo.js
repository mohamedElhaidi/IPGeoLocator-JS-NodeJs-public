const { Op } = require("sequelize");
const RequestPool = require("../models/basicRequestPool");
const LogError = require("../utils/errorLog");
const { getLocationInfo } = require("../utils/network");
const objectToXmlString = require("object-to-xml-string");

// common
const getData = async (req, res, format) => {
  const MAX_REQUEST_PER_MINUTE = 42;
  const query = req.params.address;
  let fields = req.query.fields;

  if (!query) {
    const err = new Error("Specify a domain or IP address");
    res.status(400);
    throw err;
  }
  if (fields) {
    fields = fields.split(",");
  }

  const remoteAddress = req.clientIp;
  // count all matching records from request_pool table for the last minute
  let requestCount = 0;
  let requestMaker = null;
  try {
    requestMaker = await RequestPool.findOne({
      where: {
        remoteAddress: remoteAddress,
        createdAt: {
          [Op.lt]: new Date(),
          [Op.gt]: new Date(new Date() - 60 * 1000),
        },
      },
    });

    if (!requestMaker) {
      requestMaker = await RequestPool.create({
        remoteAddress: remoteAddress,
        request_count: 0,
      });
    }

    requestCount = requestMaker.request_count;
  } catch (error) {
    console.log(error);
    const err = new Error("Internal error");
    res.status(400);
    throw err;
  }

  // if request count is bigger then specified max request per minute
  // then send 403
  if (requestCount >= MAX_REQUEST_PER_MINUTE) {
    console.log(remoteAddress, "has reached the maximum requests per minute");
    const err = new Error("reached the maximum requests per minute");
    res.status(403);
    throw err;
  }

  //insert a request record in request_pool
  requestMaker.update({ request_count: requestCount + 1 }).catch((err) => {
    console.log("++++> issue with updating request_pool");
  });

  //
  let data = await getLocationInfo(String(query), format, fields);
  if (!data) {
    console.log(remoteAddress, "no data");
    const err = new Error("no data");
    res.status(404);
    throw err;
  }
  return data;
};

// JSON request handler
const getFetchQueryJSON = async (req, res) => {
  if (req.query.key) return next();
  try {
    const data = await getData(req, res, "json");
    return res.send(JSON.stringify(data));
  } catch (error) {
    LogError(req, error);
    console.log(error);
    res.send({ status: "fail", message: error.message });
  }
};

const obj2xml = new objectToXmlString();
// XML request handler
const getFetchQueryXML = async (req, res) => {
  if (req.query.key) return next();
  try {
    const data = await getData(req, res, "xml");
    return res.send(data);
  } catch (error) {
    LogError(req, error);
    console.log(error);
    res.send({ status: "fail", message: error.message });
  }
};
// CSV request handler
const getFetchQueryCSV = async (req, res) => {
  if (req.query.key) return next();
  try {
    const data = await getData(req, res,"csv");
    return res.send(data);
  } catch (error) {
    LogError(req, error);
    console.log(error);
    res.send({ status: "fail", message: error.message });
  }
};
// newLine request handler
const getFetchQueryNL = async (req, res) => {
  if (req.query.key) return next();
  try {
    const data = await getData(req, res,"line");
    return res.send(data);
  } catch (error) {
    LogError(req, error);
    console.log(error);
    res.send({ status: "fail", message: error.message });
  }
};

module.exports.demoController = {getFetchQueryNL, getFetchQueryJSON, getFetchQueryXML,getFetchQueryCSV };
