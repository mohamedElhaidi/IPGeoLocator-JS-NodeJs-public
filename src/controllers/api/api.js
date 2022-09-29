const ApiKey = require("../../models/apiKey");
const ApikeyVisit = require("../../models/apiKeyVisitsHistory");
const { getLocationInfo } = require("../../utils/network");

const getData = async (req, res, format) => {
  const remoteAddress = req.clientIp;
  const address = req.params.address;
  const { key, fields } = req.query;
  const origin = req.headers.origin;

  if (origin) origin.trim();

  console.log("Request Origin: ", origin);

  //fetch key
  const fetchedApiKey = await ApiKey.findOne({ where: { key: key } });

  if (!fetchedApiKey) {
    // key doesn't exists
    // throw forbiden status

    return res.status(404).send({ status: "fail", message: "Invalid key" });
  }

  // //   CORS
  if (fetchedApiKey.domain !== "*")
    if (origin !== fetchedApiKey.domain) {
      return res
        .status(403)
        .send({ status: "fail", message: "Origin restriction" });
    }

  res.setHeader("Access-Control-Allow-Origin", fetchedApiKey.domain);
  res.setHeader("Access-Control-Max-Age", 0);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  //   pesue
  let status = 0;
  const data = await getLocationInfo(address, format, fields);
  if (data) {
    res.send({ ...data, status: "success" });
    status = 1;
  } else
    res.status(400).send({
      status: "fail",
      message: "could'nt retrieve data from provider",
    });

  // log the visit
  await fetchedApiKey.set({ total_queries: fetchedApiKey.total_queries + 1 });
  fetchedApiKey.save();

  const { continent, country, countryCode, city, regionName, isp, lat, lon } =
    data;
  const avh = await ApikeyVisit.create({
    origin,
    user_remoteAddress: remoteAddress,
    query: address,
    query_result: JSON.stringify(data),
    status,
    query_continent: continent,
    query_country: country,
    query_countryCode: countryCode,
    query_city: city,
    query_regionName: regionName,
    query_isp: isp,
    query_lat: lat,
    query_lon: lon,
  });

  await fetchedApiKey.addApikey_visit(avh);
};
const getJsonApi = async (req, res) => {
  try {
    return getData(req, res, "json");
  } catch (error) {
    console.log(error);
  }
};
const getXMLApi = async (req, res) => {
  try {
    return getData(req, res, "xml");
  } catch (error) {
    console.log(error);
  }
};
const geCSVApi = async (req, res) => {
  try {
    return getData(req, res, "xml");
  } catch (error) {
    console.log(error);
  }
};
const getNLApi = async (req, res) => {
  try {
    return getData(req, res, "xml");
  } catch (error) {
    console.log(error);
  }
};

const demoJsonApi = (req, res) => {
  console.log("json demo triggered");
  const dummyData = {
    query: "68.235.60.237",
    status: "success",
    continent: "North America",
    continentCode: "NA",
    country: "United States",
    countryCode: "US",
    region: "IL",
    regionName: "Illinois",
    city: "Chicago",
    district: "",
    zip: "60605",
    lat: 41.871,
    lon: -87.6289,
    timezone: "America/Chicago",
    offset: -18000,
    currency: "USD",
    isp: "tzulo, inc.",
    org: "tzulo, inc.",
    as: "AS11878 tzulo, inc.",
    asname: "TZULO",
    mobile: false,
    proxy: false,
    hosting: true,
  };
  res.send(dummyData);
};
module.exports.apiConroller = { getJsonApi, getXMLApi, geCSVApi ,getNLApi};
