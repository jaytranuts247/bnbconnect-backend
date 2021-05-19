const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const proxyChain = require("proxy-chain");
const getFreeProxies = require("get-free-https-proxy");

const fs = require("fs");
const path = require("path");

const {
  getLastWord,
  isFileExisted,
  getStayName,
  extractContent,
  getPath,
  checkNull,
  getPathByKey,
  getListingData,
} = require("../utils/utils");
const { JSONPath } = require("jsonpath-plus");

class ListingScrapper {
  requestInput = {};
  url = "";
  scrappedListings = [];
  // browser;

  #toScrapped = {
    city: {
      name: "city",
      path: "$..city",
      value: null,
    },
    avgRating: {
      name: "avgRating",
      path: "$..avgRating",
      value: null,
    },
    previewAmenityNames: {
      name: "previewAmenityNames",
      path: "$..previewAmenityNames",
      value: null,
    },
    roomAndPropertyType: {
      name: "roomAndPropertyType",
      path: "$..roomAndPropertyType",
      value: null,
    },
    user: {
      name: "user",
      path: "$..user",
      value: null,
    },
    publicAddress: {
      name: "publicAddress",
      path: "$..publicAddress",
      value: null,
    },
    lat: {
      name: "lat",
      path: "$..lat",
      value: null,
    },
    lng: {
      name: "lng",
      path: "$..lng",
      value: null,
    },
  };

  #Selectors = {
    item: "._8s3ctt",
    type: "._b14dlit",
    title: "._5kaapu span",
    previewInfo: {
      current: "div._kqh46o",
      info: "span._3hmsj",
      amenities: "div._kqh46o",
    },
    pricePerNight:
      "div._12oal24 > div._h34mg6 > div._ls0e43 > div > div._mjvmnj > div > span._155sga30",
    ratings: "span._10fy1f8",
    reviewNumber: "span._a7a5sx",
    // images: "._9ofhsl",
    images: "div._skzmvy img",
    individualListingLink: "a._mm360j",
    forwardButton: "._1u6aumhe button",
    prevButton: "_1qfwqy2d button",
    individualListing: {
      ratings: {
        ratingTotal:
          '[data-plugin-in-point-id="REVIEWS_DEFAULT"] > div > div > section > h2 > span._goo6eo > div > span',
        ratingType: "._gmaj6l > div > div > div > div > div > div._y1ba89",
        ratingNum:
          "._gmaj6l > div > div > div > div > div > div._bgq2leu > span._4oybiu",
      },
      reviews: {
        reviewUser: "",
        reviewDate: "",
        reviewContent: "",
      },
      host: {
        name: "div._f47qa6 ._svr7sj h2", // text()
        image: "div._f47qa6 > div > div > a > div > div > img",
        description: "",
        joined: "div._f47qa6 ._svr7sj div._1fg5h8r",
        readMoreButton:
          "div._1byskwn > div._5zvpp1l > div._152qbzi > div > span > div._cfvh61 > div > button",
        Intro:
          "div._1byskwn > div._5zvpp1l > ._upzyfk1 > div > span > div > span",
        IntroClickMore:
          "div._1byskwn > div._5zvpp1l > ._152qbzi > div > span > div > span",
      },
      services: {
        parent: "._ryvszj",
        servicesString: "span > button> span._11o89bi",
        serviceFee: "span._ra05uc",
        cleaningFee: "span._ra05uc",
      },
    },
  };

  #urlConfig = {
    tab_id: "home_tab",
    date_picker_type: "calendar",
    baseUrl: "https://www.airbnb.com/s/homes?",
    source: "structured_search_input_header",
    search_type: "pagination",
  };

  constructor(url, requestInput) {
    (this.requestInput = requestInput),
      (this.url = url),
      (this.scrappedListings = this.scrappedListings);
  }

  getUrl() {
    return this.url;
  }

  getSelectors() {
    return this.#Selectors;
  }

  getScrappedListings = () => this.scrappedListings;

  urlMake = () => {
    // return url = `${baseUrl}tab_id=${urlConfig.tab_id}&`
    const { pagination, bookingInput, locationInfo } = this.requestInput;
    this.url =
      this.#urlConfig.baseUrl +
      `tab_id=${this.#urlConfig.tab_id}` +
      `&date_picker_type=${this.#urlConfig.date_picker_type}` +
      `&search_type=${this.#urlConfig.search_type}` +
      `&source=${this.#urlConfig.source}` +
      `&query=${locationInfo.structured_formatting.main_text.replace(
        " ",
        "%20"
      )}%2C%20United%20States` +
      `&checkin=${bookingInput.checkIn}` +
      `&checkout=${bookingInput.checkOut}` +
      `&adults=${bookingInput.adults}` +
      `&children=${bookingInput.children}` +
      `&place_id=${locationInfo.place_id}` +
      `&section_offset=${pagination}` +
      `&items_offset=${(pagination - 1) * 20}`;
    return this.url;
  };

  static saveImagesToDisk = async () => {
    return;
  };
  static saveTextToDisk = () => {
    return;
  };

  fetchHtml = async () => {
    let browser;
    try {
      const [proxy1] = await getFreeProxies();
      console.log("- using proxy", proxy1);

      // const oldProxyUrl =
      //   "http://proxy_user+US:proxy_password@x.botproxy.net:8080";
      const oldProxyUrl = "http://198.199.86.11:8080";
      const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);

      // print proxy - something like http://127.0.0.1:56548
      // console.log(newProxyUrl);

      browser = await puppeteer.launch({
        headless: true,
        // args: [`--proxy-server=${newProxyUrl}`],
        // args: ["--no-sandbox", `--proxy-server=${proxy1.host}:${proxy1.port}`],
        ignoreHTTPSErrors: true,
        args: ["--no-sandbox"], // include this for heroku buildpack
        // args: ["–proxy-server=zproxy.lum-superproxy.io:22225"],
        // args: ["--proxy-server=http://198.199.86.11:8080"],
      });
      const page = await browser.newPage();
      page.setViewport({ width: 1280, height: 800 });

      // waitForSelector ??
      await page.goto(this.url, { waitUntil: "networkidle0", timeout: 0 });
      // await page.goto(pageUrl, { waitUntil: "networkidle0" });

      // const content = await page.content();
      const content = await page.evaluate(() => document.body.innerHTML);

      await browser.close();

      // Clean up
      // await proxyChain.closeAnonymizedProxy(newProxyUrl, true);

      return content;
    } catch (err) {
      if (browser) await browser.close();
      throw new Error(err);
    } finally {
      if (browser) await browser.close();
    }
  };

  ScrapeHtml = async () => {
    // let browser;
    var listingData = [];
    var loadingAttempt = 0;
    try {
      // make the url
      this.urlMake();

      console.log("- start Scrapping");
      // browser = await puppeteer.launch({ headless: false });
      // var page = await browser.newPage();
      // page.setViewport({ width: 1280, height: 800 });

      while (listingData.length === 0 || loadingAttempt < 2) {
        // get html file
        var html = await this.fetchHtml();

        // save html file to disk
        fs.writeFileSync("./html.html", html);

        // const html = fs.readFileSync("./html.html", "utf8");

        // load html with cheerio
        var $ = cheerio.load(html);

        // get response data
        var dataRes = $("#data-state").html();
        fs.writeFileSync("./datares.txt", dataRes);

        // var dataRes = fs.readFileSync("./datares.txt", "utf8");

        console.log("- JSON parse jsonData");
        var jsonData = JSON.parse(dataRes);
        // fs.writeFileSync("./jsonData.js", JSON.stringify(jsonData));

        // loading toScrapped data
        for (let [key, item] of Object.entries(this.#toScrapped)) {
          console.log("- scapped Item: " + item.name);
          item.value = [...JSONPath({ path: item.path, json: jsonData })];
          console.log(item.value);
        }

        console.log(loadingAttempt + " attempt");

        listingData = JSONPath({
          path:
            getPathByKey(jsonData, "exploreV3")[0] + ".sections[0].items[*]",
          json: jsonData,
        });
        let listingData2 = JSONPath({
          path:
            getPathByKey(jsonData, "exploreV3")[0] + ".sections[1].items[*]",
          json: jsonData,
        });

        console.log("- exploreV3 link ", getPathByKey(jsonData, "exploreV3"));
        console.log(
          getPathByKey(jsonData, "exploreV3")[0] + ".sections[0].items[*]"
        );

        console.log("- listingData length ", listingData.length);
        console.log("- listingData length ", listingData2.length);

        listingData = getListingData(listingData, listingData2);
        if (listingData[0].hasOwnProperty("place_id")) {
          if (!listingData[0].place_id) {
            console.log("- not the right one");
          }
        }

        if (!listingData) {
          if (loadingAttempt === 1) {
            console.log("- error loading data");
            break;
          }
          console.log(
            "data not existed!!" + " on " + loadingAttempt + " attempt"
          );
          console.log("- retry...");
          loadingAttempt++;
        } else {
          console.log("- data loaded!!");
          break;
        }
      }

      fs.writeFileSync("./listingData.txt", JSON.stringify(listingData));

      // if (listingData.length <= 21) return listingData;

      // get LatLng
      console.log("- Scrape listingData");
      listingData.map((item, idx) => {
        const { pricingQuote, listing } = item;

        // checkNull([
        //   [listing.city, "city"],
        //   [listing.avgRating, "avgRating"],
        //   [listing.contextualPictures, "contextualPictures"],
        //   [listing.kickerContent, "kickerContent"],
        //   [listing.lat, "lat"],
        //   [listing.lng, "lng"],
        //   [listing.previewAmenityNames, "previewAmenityNames"],
        //   [listing.roomAndPropertyType, "roomAndPropertyType"],
        //   [listing.user, "user"],
        //   [listing.publicAddress, "publicAddress"],
        //   [listing.pricingQuote, "pricingQuote"],
        // ]);

        // console.log("- pricingQuote", pricingQuote);
        this.scrappedListings.push({
          locationInfo: {
            description: this.requestInput.locationInfo.description,
            place_id: this.requestInput.locationInfo.place_id,
          },
          coords: {
            lat: listing.lat
              ? listing.lat
              : this.#toScrapped.lat.value[idx] || 0,
            lng: listing.lng
              ? listing.lng
              : this.#toScrapped.lng.value[idx] || 0,
          },
          city: listing.city
            ? listing.city
            : this.#toScrapped.city.value[0] || "",
          avgRating: listing.avgRating
            ? listing.avgRating
            : this.#toScrapped.avgRating.value[idx] || 0,
          kickerContent: listing.kickerContent.messages[0] || "",
          previewAmenityNames: listing.previewAmenityNames
            ? listing.previewAmenityNames
            : ["Wifi", "Free parking", "Air conditioning"],
          roomAndPropertyType: listing.roomAndPropertyType
            ? listing.roomAndPropertyType
            : this.#toScrapped.roomAndPropertyType.value[idx] || "",
          publicAddress: listing.publicAddress
            ? listing.publicAddress
            : this.#toScrapped.publicAddress.value[idx] || "",
          user: {
            id: listing.user ? listing.user.id : "",
            pictureUrl: listing.user ? listing.user.pictureUrl : "",
            thumbnailUrl: listing.user ? listing.user.thumbnailUrl : "",
          },
          images: listing.contextualPictures
            ? this.getImages(listing.contextualPictures)
            : [],
          serviceFee: pricingQuote.structuredStayDisplayPrice.explanationData
            ? this.getPriceQuote(
                pricingQuote?.structuredStayDisplayPrice?.explanationData
                  .priceDetails[0].items,
                "Service fee"
              )
            : {
                description: "Service fee",
                priceString: "$0",
              },
          cleaningFee: pricingQuote.structuredStayDisplayPrice.explanationData
            ? this.getPriceQuote(
                pricingQuote?.structuredStayDisplayPrice?.explanationData
                  .priceDetails[0].items,
                "Cleaning fee"
              )
            : {
                description: "Cleaning fee",
                priceString: "$0",
              },
        });
      });

      console.log("- loaded cheerio to scape individual listing details");
      // Start scrapping individual listings
      const listings = $(this.#Selectors.item);
      // console.log("- listings", listings);

      console.log("- --> scrap listing detials");
      listings.each((idx, listing) => {
        let previewInfo = [],
          amenities = [];
        let reviewNumber = 0;

        const $$ = cheerio.load(listing);

        // scrape the listing title
        let title = $$(this.#Selectors.title).text();
        let type = $$(this.#Selectors.type).text();
        let location = getStayName($$(this.#Selectors.type).text());
        let pricePerNight = $$(this.#Selectors.pricePerNight).text();
        let ratings = $$(this.#Selectors.ratings).text();
        let reviewNumberArr = $$(this.#Selectors.reviewNumber)
          .text()
          .trim()
          .match(/(\d+)/g);
        if (reviewNumberArr?.length !== 0) {
          reviewNumber = reviewNumberArr ? reviewNumberArr[0] : 0;
        } else {
          console.log("- reviewNumber cannot be found");
        }

        // scrape previewInfo
        $$(this.#Selectors.previewInfo.current)
          .first()
          .children(this.#Selectors.previewInfo.info)
          .each((i, e) => {
            previewInfo.push($$(e).text());
          });

        // scrape amenities
        $$(this.#Selectors.previewInfo.current)
          .next()
          .children(this.#Selectors.previewInfo.info)
          .each((i, e) => {
            amenities.push($$(e).text());
          });

        // get links
        let listingLink =
          "https://www.airbnb.com" +
          $$(this.#Selectors.individualListingLink).attr("href");

        // push to scrappedListings
        // this.scrappedListings.push(scrappedListingInfo);
        this.scrappedListings[idx] = {
          title,
          type,
          location,
          pricePerNight,
          ratings,
          reviewNumber,
          ...this.scrappedListings[idx],
          previewInfo,
          amenities,
          listingLink,
        };
      });

      return this.scrappedListings;
    } catch (err) {
      throw new Error(err);
    }
  };

  getPriceQuote = (priceList, priceTag) => {
    try {
      if (priceList.length === 0 || !priceList)
        console.log("- priceQoute not existed");
      let priceQuotes = priceList.filter(
        (item) => item.description === priceTag
      )[0];
      // console.log("- priceQuotes", priceQuotes);
      return {
        description: (priceQuotes && priceQuotes.description) || priceTag,
        priceString: (priceQuotes && priceQuotes.priceString) || 0,
      };
    } catch (err) {
      console.log(err);
    }
  };

  getImages = (picturesList) => {
    return picturesList.map((item) => {
      // console.log(item);
      return {
        id: item.id,
        picture: item.picture,
      };
    });
  };
}

module.exports = ListingScrapper;

/*
 {
        "title": "Vegas Life at its Best",
        "type": "Entire condominium in Las Vegas",
        "location": " Las Vegas",
        "pricePerNight": "$109",
        "ratings": "5.0",
        "reviewNumber": [
            "23",
            "23"
        ],
        "coords": {
            "lat": 36.11306,
            "lng": -115.18781
        },
        "city": "Las Vegas",
        "avgRating": 5,
        "kickerContent": "Entire condominium in Las Vegas",
        "previewAmenityNames": [
            "Pool",
            "Wifi",
            "Free parking",
            "Air conditioning"
        ],
        "roomAndPropertyType": "Entire condominium",
        "publicAddress": "Las Vegas, NV, United States",
        "user": {
            "id": "360547879",
            "pictureUrl": "https://a0.muscache.com/im/pictures/user/3bd36f0b-d20b-4e3e-9121-d252ed8fb7ce.jpg?aki_policy=profile_x_medium",
            "thumbnailUrl": "https://a0.muscache.com/im/pictures/user/3bd36f0b-d20b-4e3e-9121-d252ed8fb7ce.jpg?aki_policy=profile_small"
        },
        "images": [
            {
                "id": "1062038137",
                "picture": "https://a0.muscache.com/im/pictures/miso/Hosting-44555924/original/5a420749-0028-4993-b297-b506f7a8c54f.jpeg?im_w=720"
            },
            {
                "id": "1062040392",
                "picture": "https://a0.muscache.com/im/pictures/miso/Hosting-44555924/original/5a8bc69b-0dc2-4200-b58f-c21da335d188.jpeg?im_w=720"
            },
            {
                "id": "1048851500",
                "picture": "https://a0.muscache.com/im/pictures/4310f3fd-cea6-403a-a3f2-5d60fb3d9736.jpg?im_w=720"
            },
            {
                "id": "1062041347",
                "picture": "https://a0.muscache.com/im/pictures/miso/Hosting-44555924/original/76c92f31-f136-48b2-a9ae-55c0edcff2a2.jpeg?im_w=720"
            },
            {
                "id": "1062044257",
                "picture": "https://a0.muscache.com/im/pictures/miso/Hosting-44555924/original/e371c469-8e22-47a6-ae2b-4fa34f38b020.jpeg?im_w=720"
            },
        ],
        "serviceFee": {
            "description": "Service fee",
            "priceString": "$167"
        },
        "cleaningFee": {
            "description": "Cleaning fee",
            "priceString": "$100"
        },
        "previewInfo": [
            "4 guests",
            "2 bedrooms",
            "3 beds",
            "2 baths"
        ],
        "amenities": [
            "Pool",
            "Wifi",
            "Free parking",
            "Air conditioning"
        ],
        "listingLink": "https://www.airbnb.com/rooms/44555924?adults=3&check_in=2021-09-06&check_out=2021-09-16&previous_page_section_name=1000&federated_search_id=096d7899-146d-4221-b928-1cd2bc05d46a"
    },
*/

/*
const response  = [
	{
		listingTitle:
		listingType:
		location:
		description: []
		amenities: [

		]
		previewInfo: [],
		amenities: []
		pricePerNight: 
		ratings:
		reviewNumber:
		ratingDetails: {
			cleancliness:
			communication:
			check-in
			accuracy:
			location: 
			value:
		}
		reviews: [
			{
				user: 
				review: 
				rating: 
			},
			{
				user: 
				review: 
				rating:
			}
		]
		images: [

		],
		mapLocation: {
			lat:
			lng:
		},
		individualMapZoom: 

	},
	{

	}
];

*/

/* --------------------------------------- */

/*
 {
  "pagination": 1,
	"bookingInput": {
		"adults": 3,
		"children": 0,
		"infants": 0,
		"checkIn": "2021-09-06",
		"checkOut": "2021-09-16"
	},
	"locationInfo": {
		"description": "Las Vegas, NV, USA",
		"matched_substrings": [
			{
				"length": 9,
				"offset": 0
			},
		],
		"place_id": "ChIJ69QoNDjEyIARTIMmDF0Z4kM",
		"reference": "ChIJ69QoNDjEyIARTIMmDF0Z4kM",
		"structured_formatting": {
			"main_text": "Las Vegas Strip",
			"main_text_matched_substrings": [
				{
					"length": 9,
					"offset": 0
				},
			],
			"secondary_text": "NV, USA"
		},
		"terms": [
			{
				"offset": 0,
				"value": "Las Vegas Strip"
			},
			{
				"offset": 11,
				"value": "NV"
			},
			{
				"offset": 15,
				"value": "USA"
			},
		],
		"types": ["locality", "political", "geocode"]
	},
}
*/

/*
const raceSelectors = (page, selectors) => {
  return Promise.race(
    selectors.map(selector => {
      return page
        .waitForSelector(selector, {
          visible: true,
        })
        .then(() => selector);
    }),
  );
};

...

const selector = await raceSelectors(page, ['#foo', '#bar']);

if (selector === '#foo') {
  // do something
} else if (selector === '#bar') {
  // do something else
}
*/
// div._8s3ctt > div._12oal24 > div._h34mg6 > div._ls0e43 > div > div._mjvmnj > div > span._155sga30
