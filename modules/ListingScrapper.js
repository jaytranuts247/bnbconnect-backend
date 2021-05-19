const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const fs = require("fs");
const path = require("path");

const {
  getLastWord,
  isFileExisted,
  getStayName,
  extractContent,
} = require("../utils/utils");

class ListingScrapper {
  requestInput = {};
  url = "";
  scrappedListings = [];
  // browser;

  #Selectors = {
    item: "._8s3ctt",
    type: "._b14dlit",
    title: "._5kaapu span",
    previewInfo: {
      current: "div._kqh46o",
      info: "span._3hmsj",
      amenities: "div._kqh46o",
    },
    pricePerNight: "span._olc9rf0",
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
      browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      page.setViewport({ width: 1280, height: 800 });
      // waitForSelector ??
      await page.goto(this.url);
      const content = await page.content();
      // await browser.close();
      return content;
    } catch (err) {
      if (browser) await browser.close();
      throw new Error(err);
    }
  };

  ScrapeHtml = async () => {
    let browser;
    let results = [];
    var listingData = [];
    var listingDataApollo = [];
    var loadingAttempt = 0;
    try {
      // make the url
      this.urlMake();
      /*

			if (isFileExisted("./test1.html")) {
				console.log("isFileExisted");
				const filePath = path.join(__dirname, "../test.html");
				var html = fs.readFileSync(filePath, "utf8");
				console.log("file type", mime.lookup(html));
			} else {
				// fetch html from url
				// var html = await this.fetchHtml();
				console.log("start scrapping");
				browser = await puppeteer.launch({ headless: false });
				var page = await browser.newPage();
				page.setViewport({ width: 1280, height: 800 });

				await page.goto(this.url, { waitUntil: "networkidle2" });
				// await page.goto(this.url);
				// page.waitForSelector("._8s3ctt a");
				// page.waitForSelector("#data-state");

				// const html = await page.content();
				var html = await page.evaluate(() => document.body.innerHTML);

				// save html file to disk
				fs.writeFileSync("./test.html", html);
			}
			*/

      console.log("start Scrapping");
      browser = await puppeteer.launch({ headless: false });
      var page = await browser.newPage();
      page.setViewport({ width: 1280, height: 800 });
      /*

			while (listingData.length === 0 || loadingAttempt < 2) {
				await page.goto(this.url, { waitUntil: "networkidle2" });
				// await page.goto(this.url);
				// page.waitForSelector("._8s3ctt a");
				// page.waitForSelector("#data-state");

				// const html = await page.content();
				var html = await page.evaluate(() => document.body.innerHTML);

				// save html file to disk
				fs.writeFileSync("./test.html", html);

				// load html with cheerio
				var $ = cheerio.load(html);

				// get response data
				var dataRes = $("#data-state").html();
				fs.writeFileSync("./datares.txt", dataRes);

				var jsonData = JSON.parse(dataRes);
				fs.writeFileSync("./jsonData.js", jsonData);
				console.log(loadingAttempt + " attempt");

				if (
					jsonData &&
					jsonData.niobeMinimalClientData &&
					jsonData.niobeMinimalClientData[1] &&
					jsonData.niobeMinimalClientData[1][1]
				) {
					listingData =
						jsonData.niobeMinimalClientData[1][1].data.dora.exploreV3
							.sections[0].items;
				}

				if (
					jsonData &&
					jsonData.niobeApolloClientData &&
					jsonData.niobeApolloClientData.__niobe_denormalized &&
					jsonData.niobeApolloClientData.__niobe_denormalized.queries[0] &&
					jsonData.niobeApolloClientData.__niobe_denormalized.queries[0][1]
				) {
					listingData =
						jsonData.niobeApolloClientData.__niobe_denormalized.queries[0][1]
							.dora.exploreV3.sections[0].items;
				}

				if (!listingData) {
					if (loadingAttempt === 1) {
						console.log("error loading data");
						break;
					}
					console.log(
						"data not existed!!" + " on " + loadingAttempt + " attempt"
					);
					console.log("retry...");
					loadingAttempt++;
				} else {
					console.log("data loaded!!");
					break;
				}
			}
			*/
      const html = fs.readFileSync("./test.html", "utf8");
      var $ = cheerio.load(html);
      const dataText = $("#data-state").html();
      const jsonData = JSON.parse(dataText);

      if (
        jsonData &&
        jsonData.niobeMinimalClientData &&
        jsonData.niobeMinimalClientData[1] &&
        jsonData.niobeMinimalClientData[1][1]
      ) {
        listingData =
          jsonData.niobeMinimalClientData[1][1].data.dora.exploreV3.sections[0]
            .items;
      } else if (
        jsonData &&
        jsonData.niobeApolloClientData &&
        jsonData.niobeApolloClientData.__niobe_denormalized &&
        jsonData.niobeApolloClientData.__niobe_denormalized.queries[0] &&
        jsonData.niobeApolloClientData.__niobe_denormalized.queries[0][1]
      ) {
        listingData =
          jsonData.niobeApolloClientData.__niobe_denormalized.queries[0][1].dora
            .exploreV3.sections[0].items;
      } else {
        console.log("jsonData not existed");
        return;
      }

      fs.writeFileSync("./listingData.txt", JSON.stringify(listingData));

      // get LatLng
      listingData.map((item, idx) => {
        this.scrappedListings.push({
          coords: {
            lat: item.listing.lat,
            lng: item.listing.lng,
          },
        });
      });

      // get service fee, cleaning fee

      console.log("loaded cheerio");
      // Start scrapping
      const listings = $(this.#Selectors.item);
      // console.log("listings", listings);

      listings.each((idx, listing) => {
        let previewInfo = [],
          amenities = [];

        const $$ = cheerio.load(listing);

        // scrape the listing title
        let title = $$(this.#Selectors.title).text();
        let type = $$(this.#Selectors.type).text();
        let location = getStayName($$(this.#Selectors.type).text());
        let pricePerNight = $$(this.#Selectors.pricePerNight).text();
        let ratings = $$(this.#Selectors.ratings).text();
        let reviewNumber = $$(this.#Selectors.reviewNumber)
          .text()
          .trim()
          .match(/(\d+)/);

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
          images: [],
        };
      });

      // get listing details
      const detailsPage = await browser.newPage();

      for (let idx = 0; idx < this.scrappedListings.length; idx++) {
        let serviceFee = this.getPriceQuote(jsonData, idx, "Service fee")[0];
        let cleaningFee = this.getPriceQuote(jsonData, idx, "Cleaning fee")[0];

        // push service/cleaning fee to scrappedListings
        this.scrappedListings[idx] = {
          ...this.scrappedListings[idx],
          serviceFee: {
            description:
              (serviceFee && serviceFee.description) || "Service fee",
            priceString: (serviceFee && serviceFee.priceString) || 0,
          },
          cleaningFee: {
            description:
              (cleaningFee && cleaningFee.description) || "Cleaning fee",
            priceString: (cleaningFee && cleaningFee.priceString) || 0,
          },
        };
        if (!serviceFee) console.log("Service fee not existed");
        if (!cleaningFee) console.log("Cleaning fee not existed");

        await this.scrapeListingDetails(
          this.scrappedListings[idx].listingLink,
          idx,
          detailsPage
        );
      }

      return this.scrappedListings;
    } catch (err) {
      throw new Error(err);
    }
  };

  scrapeListingDetails = async (url, idx, page) => {
    let serviceFee = {},
      cleaningFee = {};

    try {
      // if (idx >= 1) return;
      await page.goto(url);
      // await page.waitForNavigation({
      // 	timeout: 60000,
      // 	waitUntil: "networkidle2",
      // });

      // await page.waitForSelector("._1fog6rx a");
      // await page.waitForSelector("button._ejra3kg", { visible: true });

      // check readmore button isvisible or not

      // let readMoreVisible = await this.isElementVisible(
      // 	page,
      // 	this.#Selectors.individualListing.host.hostDivContainer
      // );

      await page.waitForSelector(this.#Selectors.individualListing.host.image, {
        visible: true,
      });

      // .waitForSelector(
      // 	this.#Selectors.individualListing.host.readMoreButton,
      // 	{ visible: true }
      // );

      const html = await page.content();

      const $$ = cheerio.load(html);

      // write file
      fs.writeFileSync(`./scrappedFiles/listings_${idx}.html`, html);
      console.log("buttotn sada", $$("div._1byskwn button"));

      // click readmore button
      if (
        $$(this.#Selectors.individualListing.host.readMoreButton).length !== 0
      ) {
        console.log("click readmore");
        await page
          .click(this.#Selectors.individualListing.host.readMoreButton)
          .catch(() => {});
        let hostIntro = $$(
          this.#Selectors.individualListing.host.IntroClickMore
        ).text();
      } else {
        console.log("clickmore not clicked");
        let hostIntro = $$(this.#Selectors.individualListing.host.Intro).text();
      }

      // scrape host name - and url - introduction
      let hostName = getLastWord(
        $$(this.#Selectors.individualListing.host.name).text()
      );
      let hostImage = $$(this.#Selectors.individualListing.host.image).attr(
        "src"
      );
      let joinDate = $$(this.#Selectors.individualListing.host.joined).text();

      // scrape service/cleaning fee
      if (
        this.scrappedListings[idx].serviceFee.priceString !== 0 ||
        this.scrappedListings[idx].cleaningFee.priceString !== 0
      ) {
        $$(this.#Selectors.individualListing.services.parent).each((i, ele) => {
          const newSelector = cheerio.load($$(ele).html());
          if (
            newSelector(
              this.#Selectors.individualListing.services.servicesString
            )
              .text()
              .trim() === "Service fee"
          ) {
            serviceFee = {
              description: newSelector(
                this.#Selectors.individualListing.services.servicesString
              )
                .text()
                .trim(),
              priceString: newSelector(
                this.#Selectors.individualListing.services.serviceFee
              ).text(),
            };
          }
          if (
            newSelector(
              this.#Selectors.individualListing.services.servicesString
            )
              .text()
              .trim() === "Cleaning fee"
          ) {
            cleaningFee = {
              description: newSelector(
                this.#Selectors.individualListing.services.servicesString
              )
                .text()
                .trim(),
              priceString: newSelector(
                this.#Selectors.individualListing.services.cleaningFee
              ).text(),
            };
          }
        });
      }

      // scrape listing images
      $$(this.#Selectors.images).each((i, e) => {
        console.log($$(e).attr("src"));
        this.scrappedListings[idx].images.push($$(e).attr("src"));
        console.log(this.scrappedListings[idx].images);
      });

      // scrape listing reviews: scrape to 3-5 reviews
      if (this.scrappedListings[idx].ratings !== "") {
        $$(this.#Selectors.individualListing.ratings.ratingTotal).text();
      }

      this.scrappedListings[idx] = {
        ...this.scrappedListings[idx],
        host: {
          hostName,
          hostImage,
          joinDate,
        },
      };
    } catch (err) {
      console.error(err);
    }
  };

  isElementVisible = async (page, cssSelector) => {
    let visible = true;
    await page
      .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
      .catch(() => {
        visible = false;
      });
    return visible;
  };

  getPriceQuote = (json, idx, priceTag) => {
    let priceQuotes;
    if (
      json &&
      json.niobeMinimalClientData[1] &&
      json.niobeMinimalClientData[1][1]
    ) {
      priceQuotes =
        json.niobeMinimalClientData[1][1].data.dora.exploreV3.sections[0].items[
          idx
        ].pricingQuote.structuredStayDisplayPrice.explanationData
          .priceDetails[0].items;
    } else if (
      json &&
      json.niobeApolloClientData &&
      json.niobeApolloClientData.__niobe_denormalized &&
      json.niobeApolloClientData.__niobe_denormalized.queries[0] &&
      json.niobeApolloClientData.__niobe_denormalized.queries[0][1]
    ) {
      priceQuotes =
        json.niobeApolloClientData.__niobe_denormalized.queries[0][1].dora
          .exploreV3.sections[0].items[idx].pricingQuote
          .structuredStayDisplayPrice.explanationData.priceDetails[0].items;
    } else {
      return null;
    }
    console.log("priceQuotes", priceQuotes);

    return priceQuotes.filter((item) => item.description === priceTag);
  };
}
// content="www.airbnb.com/rooms/49020824?adults=3&check_in=2021-09-06&check_out=2021-09-16&previous_page_section_name=1000"
module.exports = ListingScrapper;

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
