const express = require("express");
const router = express.Router();
const axios = require("axios");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const ListingScrapper = require("../modules/ListingScrapper_2");
const ListingScrapperTertiary = require("../modules/ListingScrapper_3");
const Listing = require("../model/Listing");

const { addDates } = require("../utils/utils");
const authMiddleware = require("../middlewares/authMiddleware");

// https://www.airbnb.com/s/Las-Vegas--NV--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_dates%5B%5D=april&flexible_trip_dates%5B%5D=may&flexible_trip_lengths%5B%5D=weekend_trip&date_picker_type=calendar&checkin=2021-09-14&checkout=2021-09-22&adults=5&source=structured_search_input_header&search_type=autocomplete_click&place_id=ChIJ0X31pIK3voARo3mz1ebVzDo
// https://www.airbnb.com/s/Las-Vegas--NV--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_dates%5B%5D=april&flexible_trip_dates%5B%5D=may&flexible_trip_lengths%5B%5D=weekend_trip&date_picker_type=calendar&checkin=2021-09-14&checkout=2021-09-22&adults=5&source=structured_search_input_header&search_type=autocomplete_click&place_id=ChIJ0X31pIK3voARo3mz1ebVzDo
// https://www.airbnb.com/s/Las-Vegas--NV--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_dates%5B%5D=april&flexible_trip_dates%5B%5D=may&flexible_trip_lengths%5B%5D=weekend_trip&date_picker_type=calendar&checkin=2021-09-05&checkout=2021-09-11&adults=5&source=structured_search_input_header&search_type=autocomplete_click&query=Las%20Vegas%2C%20NV%2C%20United%20States&place_id=ChIJ0X31pIK3voARo3mz1ebVzDo

const url =
  "https://www.airbnb.com/s/Las-Vegas-Strip--Las-Vegas--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_dates%5B%5D=april&flexible_trip_dates%5B%5D=may&flexible_trip_lengths%5B%5D=weekend_trip&date_picker_type=calendar&query=Las%20Vegas%20Strip%2C%20Las%20Vegas%2C%20United%20States&place_id=ChIJ69QoNDjEyIARTIMmDF0Z4kM&checkin=2021-09-05&checkout=2021-09-11&adults=5&source=structured_search_input_header&search_type=autocomplete_click";

const autocompletedInput = {
  description: "Las Vegas, NV, USA",
  matched_substrings: [
    {
      length: 9,
      offset: 0,
    },
  ],
  place_id: "ChIJ0X31pIK3voARo3mz1ebVzDo",
  reference: "ChIJ0X31pIK3voARo3mz1ebVzDo",
  structured_formatting: {
    main_text: "Las Vegas",
    main_text_matched_substrings: [
      {
        length: 9,
        offset: 0,
      },
    ],
    secondary_text: "NV, USA",
  },
  terms: [
    {
      offset: 0,
      value: "Las Vegas",
    },
    {
      offset: 11,
      value: "NV",
    },
    {
      offset: 15,
      value: "USA",
    },
  ],
  types: ["locality", "political", "geocode"],
};
//www.airbnb.com/s/Saigon--Ho-Chi-Minh--Vietnam/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_dates%5B%5D=april&flexible_trip_dates%5B%5D=may&flexible_trip_lengths%5B%5D=weekend_trip&date_picker_type=calendar&checkin=2021-09-14&checkout=2021-09-22&adults=5&source=structured_search_input_header&search_type=autocomplete_click&query=Saigon%2C%20Ho%20Chi%20Minh%2C%20Vietnam&place_id=ChIJ0T2NLikpdTERKxE8d61aX_E

router.post("/", async (req, res) => {
  let flag = false;
  let attemp = 0;
  var listingFound = null;
  console.log("request body", req.body);
  try {
    while (attemp < 2 && !flag) {
      // find if there is any listings according to place_id searched in Db
      listingFound = await Listing.find({
        "locationInfo.place_id": req.body.locationInfo.place_id,
      });
      console.log("listingFound", listingFound);

      // if there are less than 2-5 listings for searched place_id
      // then Start scrape listing and pushing Scrapped listings to Db
      if (!listingFound || listingFound.length <= 2) {
        // Start Scrapping listings base on place_id
        console.log(
          `cannot found enough listings in DB with ${listingFound.length} listings. Start Scrapping listings From Airbnb`
        );
        // console.log(req.body);
        const Scrapper = new ListingScrapperTertiary("", req.body);
        const listings = await Scrapper.ScrapeHtml();
        console.log("Scrapped Listing", listings);

        // push scrapped listings to mongoDB
        await Promise.all(
          listings.map(async (item) => {
            const newListing = new Listing({
              ...item,
            });
            return await newListing.save();
          })
        );
        attemp++;
        continue;
      }

      console.log(`Found ${listingFound.length} listings from DB`);

      // get 20 listings
      let listingTwenty = listingFound.slice(0, 21);
      console.log(`Send response of ${listingTwenty.length} listings`);
      if (listingTwenty?.length !== 0) flag = true; // if listings found then set flag to stop while loop

      let newListingTwenty = addDates(listingTwenty, {
        checkIn: req.body.bookingInput.checkIn,
        checkOut: req.body.bookingInput.checkOut,
      });

      // console.log(listingFound[0], listingTwenty[0], newListingTwenty);

      // res send
      res.json(newListingTwenty);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/:listing_id", authMiddleware, async (req, res) => {
  const { listing_id } = req.params;
  try {
    const foundListings = await Listing.findOne({
      _id: listing_id,
    });
    console.log("foundListings", foundListings);
    if (!foundListings)
      return res
        .status(404)
        .json({ msg: `cannot found listing with id: ${listing_id}` });
    res.json(foundListings);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err);
  }
});

router.post("/test", async (req, res) => {
  try {
    const Scrapper = new ListingScrapperTertiary("", req.body);
    const listings = await Scrapper.ScrapeHtml();
    console.log(listings, listings.length);
    if (listings.length < 20)
      res.json({ msg: "cannot scrape listings as blocked from airbnb" });
    res.json(listings);
  } catch (err) {
    console.log(err.message);
    res.send(err);
  }
});

router.post("/test2", async (req, res) => {
  try {
    const foundListings = await Listing.find({
      "locationInfo.place_id": req.body.locationInfo.place_id,
    });
    console.log(foundListings);
    res.json(foundListings);
  } catch (err) {
    console.log(err.message);
    res.send(err);
  }
});
// model.find({
//   '_id': { $in: [
//       mongoose.Types.ObjectId('4ed3ede8844f0f351100000c'),
//       mongoose.Types.ObjectId('4ed3f117a844e0471100000d'),
//       mongoose.Types.ObjectId('4ed3f18132f50c491100000e')
//   ]}
// }, function(err, docs){
//    console.log(docs);
// });

module.exports = router;
