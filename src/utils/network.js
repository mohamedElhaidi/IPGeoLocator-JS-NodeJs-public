const { default: axios } = require("axios");

const generateEndPoint = function (
  format = "json",
  query,
  fields = [
    "status",
    "message",
    "continent",
    "continentCode",
    "country",
    "countryCode",
    "region",
    "regionName",
    "city",
    "district",
    "zip",
    "lat",
    "lon",
    "timezone",
    "offset",
    "currency",
    "isp",
    "org",
    "as",
    "asname",
    "reverse",
    "mobile",
    "proxy",
    "hosting",
    "query",
  ]
) {
  return `https://pro.ip-api.com/${format}/${query}?key=ipapiq9SFY1Ic4&fields=${fields.reduce(
    (acum, val, i) => acum + "," + val,
    fields[0]
  )}`;
};

async function getLocationInfo(query, format = "json", fields) {
  let result = null;
  try {
    result = await axios.get(generateEndPoint(format, query, fields), {
      headers: {
        origin: "https://members.ip-api.com",
      },
    });
    if (result.status !== 200) {
      return null;
    }
    return result.data;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}


module.exports = {
  getLocationInfo,
};
