const mongoose = require("mongoose");

const ListingSchema = mongoose.Schema({
	title: String,
	type: String,
	location: String,
	pricePerNight: String,
	ratings: String,
	reviewNumber: String,
	coords: {
		lat: Number,
		lng: Number,
	},
	locationInfo: {
		description: String,
		place_id: String,
	},
	city: String,
	avgRating: Number,
	kickerContent: String,
	previewAmenityNames: [String],
	roomAndPropertyType: String,
	publicAddress: String,
	user: {
		id: String,
		pictureUrl: String,
		thumbnailUrl: String,
	},
	images: [{ id: String, picture: String }],
	serviceFee: {
		description: String,
		priceString: String,
	},
	cleaningFee: {
		description: String,
		priceString: String,
	},
	previewInfo: [String],
	amenities: [String],
	listingLink: String,
});

module.exports = mongoose.model("Listing", ListingSchema);
