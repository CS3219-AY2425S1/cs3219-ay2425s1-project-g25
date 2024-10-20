import mongoose from "mongoose";

export const connectToDatabase = async () => {
    const {
        DB_REQUIRE_AUTH,
        MONGO_INITDB_ROOT_USERNAME,
        MONGO_INITDB_ROOT_PASSWORD,
        DB_HOST = "localhost",
        DB_PORT = "27017",
        DATABASE_NAME = "peerprepQuestionServiceDB",
    } = process.env;

    let mongoURI = "";

    if (DB_REQUIRE_AUTH === "true") {
        mongoURI = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${DB_HOST}:${DB_PORT}/${DATABASE_NAME}?authSource=admin`;
    } else {
        mongoURI = `mongodb://${DB_HOST}:${DB_PORT}/${DATABASE_NAME}`;
    }

    const options = {};

    if (!mongoURI) {
        throw new Error('Invalid/Missing MongoDB connection URI');
    }

    try {
        await mongoose.connect(mongoURI, options);
        console.log("Successfully connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB: ", error);
    }
};
