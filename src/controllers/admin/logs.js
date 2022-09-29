const Log = require("../../models/log");
const pagination = require("../../utils/pagination");
const path = require("path");
const { Op } = require("sequelize");
const getAdminLogsPage = async (req, res) => {
  const offset = req.query.offset || 0;
  const numberPerPage = req.query.limit || 10;
  const { search } = req.query;
  let query_str = "";
  if (search) {
    query_str = `%${search.trim()}%`;
  }
  //
  //
  //
  const users = await Log.findAll({
    where: search
      ? {
          [Op.or]: [
            { event: { [Op.like]: query_str } },
            { description: { [Op.like]: query_str } },
          ],
        }
      : {},
    limit: +numberPerPage,
    offset: +offset,
  });

  const logsCount = await Log.count({
    where: search
      ? {
          [Op.or]: [
            { event: { [Op.like]: query_str } },
            { description: { [Op.like]: query_str } },
          ],
        }
      : {},
  });

  //pagination
  const pag = pagination(logsCount, offset, numberPerPage);

  // building table
  const table = {
    search,
    pagination: pag,
    heads: ["id", "event", "description", "createdAt"],
    rows: [],
  };

  // injecting data
  table.rows = users.map((i) => {
    return {
      cols: [i.id, i.event, i.description, i.createdAt],
    };
  });

  // render
  return res.render(path.join("pages", "admin", "logs"), {
    table,
    query: search ? search.trim() : "",
  });
};

module.exports.adminLogsController = { getAdminLogsPage };
