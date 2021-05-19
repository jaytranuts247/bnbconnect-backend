const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
	try {
		await mongoose.connect(db, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false,
		});
		console.log("MongoDb connected...");
	} catch (err) {
		console.err(err.message);
		process.exit();
	}
};

module.exports = connectDB;

// 4kTakBCImo65dpay
