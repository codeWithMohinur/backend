import dotenv from "dotenv";
import connectDB from "./db/index.js";


dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`server is running on this port ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("Mongo Db connection failed " , error);
})