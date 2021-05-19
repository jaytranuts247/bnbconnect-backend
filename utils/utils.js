const fs = require("fs");

const ScrapperSelectorMaps = {
  listingItemType: "._b14dlit",
  listingItemTitle: ".",
};

const getLastWord = (s) => {
  var n = s.split(" ");
  return n[n.length - 1];
};

const isFileExisted = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error(err);
  }
};

const getStayType = (s) => {
  const n = s.split(" ");
  return n[1];
};

const getStayName = (s) => {
  const n = s.split(" ");
  let stayName = [];
  let isTaken = false;
  n.map((item) => {
    if (item === "in") {
      isTaken = true;
      return;
    }
    if (!isTaken) return;
    stayName.push(item);
  });

  return stayName.reduce((acc, currentItem) => acc + " " + currentItem, "");
};

const extractContent = (s) => {
  var span = window.document.createElement("span");
  span.innerHTML = s;
  return span.textContent || span.innerText;
};

function getPath(object, value) {
  return Object.keys(object).reduce((r, k) => {
    var kk = Array.isArray(object) ? `[${k}]` : `${k}`;
    if (object[k] === value) {
      r.push(kk);
    }
    if (object[k] && typeof object[k] === "object") {
      r.push(
        ...getPath(object[k], value).map(
          (p) => kk + (p[0] === "[" ? "" : ".") + p
        )
      );
    }
    return r;
  }, []);
}

function getPathByKey(object, key) {
  return Object.keys(object).reduce((r, k) => {
    var kk = Array.isArray(object) ? `[${k}]` : `${k}`;
    if (k === key) {
      r.push(kk);
    }
    if (object[k] && typeof object[k] === "object") {
      r.push(
        ...getPathByKey(object[k], key).map(
          (p) => kk + (p[0] === "[" ? "" : ".") + p
        )
      );
    }
    return r;
  }, []);
}

const getRating = (s) => {
  const n = s.split(" ");
};

const addDates = (listings, toBeAdded) => {
  return listings.map((listing) => {
    return Object.assign({}, listing.toJSON(), toBeAdded);
  });
};

const checkNull = (array) => {
  let count = 0;
  array.map((item) => {
    if (!item[0]) {
      console.log(item[1] + "is undefined");
      count++;
    }
  });
  if (count !== 0) console.log("There is no undefined Item found");
};

const getListingData = (firstListing, secondListing) => {
  if (firstListing.length >= 20 - 1) return firstListing;
  if (secondListing.length >= 20 - 1) return secondListing;
};

module.exports = {
  getLastWord,
  isFileExisted,
  getStayType,
  getStayName,
  extractContent,
  getPath,
  addDates,
  getPathByKey,
  checkNull,
  getListingData,
};
