import mongoose  from "mongoose";
import {DB_NAME} from '../constants.js';

const connectDB = async () => {
    try {
        const connectInitially = mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Data Base successfully connected || Data Base HOST ${(await connectInitially).connection.host}`);
    } catch (error) {
        console.log("Data Base connection failed ", error);
        process.exit(1)
    }
}

export default connectDB