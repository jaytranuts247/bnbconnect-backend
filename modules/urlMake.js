// "https://www.airbnb.com/s/Las-Vegas-Strip--Las-Vegas--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_dates%5B%5D=april&flexible_trip_dates%5B%5D=may&flexible_trip_lengths%5B%5D=weekend_trip&date_picker_type=calendar&query=Las%20Vegas%20Strip%2C%20Las%20Vegas%2C%20United%20States&place_id=ChIJ69QoNDjEyIARTIMmDF0Z4kM&checkin=2021-09-05&checkout=2021-09-11&adults=5&source=structured_search_input_header&search_type=autocomplete_click";

// "https://www.airbnb.com/s/homes?tab_id=home_tab&date_picker_type=calendar&checkin=2021-09-06&checkout=2021-09-16&adults=3&source=structured_search_input_header&search_type=pagination&place_id=ChIJ69QoNDjEyIARTIMmDF0Z4kM&items_offset=0&section_offset=1";

const urlConfig = {
	tab_id: "home_tab",
	date_picker_type: "calendar",
	baseUrl: "https://www.airbnb.com/s/homes?",
	source: "structured_search_input_header",
	search_type: "pagination",
};

const urlMake = (data) => {
	let url = "";
	// return url = `${baseUrl}tab_id=${urlConfig.tab_id}&`
	const { pagination, bookingInput, locationInfo } = data;
	return (url =
		urlConfig.baseUrl +
		`tab_id=${urlConfig.tab_id}` +
		`&date_picker_type=${urlConfig.date_picker_type}` +
		`&search_type=${urlConfig.search_type}` +
		`&source=${urlConfig.source}` +
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
		`&items_offset=${(pagination - 1) * 20}`);
};

const autocompletedInput = {
	query: "las vegas strip",
	description: "Las Vegas Strip, NV, USA",
	matched_substrings: [
		{
			length: 9,
			offset: 0,
		},
	],
	place_id: "ChIJ69QoNDjEyIARTIMmDF0Z4kM",
	reference: "ChIJ69QoNDjEyIARTIMmDF0Z4kM",
	structured_formatting: {
		main_text: "Las Vegas Strip",
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

const requestBody = {
	pagination: 1,
	bookingInput: {
		adults: 3,
		children: 0,
		infants: 0,
		checkIn: "2021-09-06",
		checkOut: "2021-09-16",
	},
	locationInfo: {
		description: "Las Vegas, NV, USA",
		matched_substrings: [
			{
				length: 9,
				offset: 0,
			},
		],
		place_id: "ChIJ69QoNDjEyIARTIMmDF0Z4kM",
		reference: "ChIJ69QoNDjEyIARTIMmDF0Z4kM",
		structured_formatting: {
			main_text: "Las Vegas Strip",
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
				value: "Las Vegas Strip",
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
	},
};

module.exports = {
	urlMake,
	requestBody,
};
