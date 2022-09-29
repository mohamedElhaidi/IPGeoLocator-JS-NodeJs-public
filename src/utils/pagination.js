module.exports = function (itemCount, offset = 0, limit = 10) {
  const numberPerPage = +limit;
  const numberOfPages = Math.ceil(+itemCount / +numberPerPage);
  const currentPage = Math.ceil(+offset / +numberPerPage);
  const pages = [];

  //  side limitation
  const maxSidePages = 5;
  let startPage = currentPage - maxSidePages;
  let endPage = currentPage + maxSidePages;
  while (startPage < 0) {
    ++startPage;
  }
  while (endPage > numberOfPages) {
    --endPage;
  }

  for (let i = startPage; i < endPage; i++) {
    pages.push(i);
  }

  const pagination = {
    itemCount,
    numberPerPage,
    numberOfPages,
    currentPage,
    pages,
  };

  console.log(pagination);
  return pagination;
};
