import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import * as routes from "./routes";

// initialize configuration
dotenv.config();

// port is now available to the Node.js runtime
// as if it were an environment variable
const port = process.env.SERVER_PORT;

const app = express();

// CORS Policy
const allowedOrigins = ["http://127.0.0.1:8000", "http://localhost:8000"];
app.use(cors({
    credentials: true,
    origin(origin, callback) {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = "The CORS policy for this site does not " +
                "allow access from the specified Origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

// Configure Express to parse incoming JSON data
app.use( express.json() );

// Configure Express to use EJS
app.set( "views", path.join( __dirname, "views" ) );
app.set( "view engine", "ejs" );

// Configure routes
routes.register( app );
// Configure session auth
// sessionAuth.register( app );

// Configure routes
// routes.register( app );

// define a route handler for the default home page
// app.get( "/", ( req, res ) => {
//     // render the index template
//     res.render( "index" );
// } );

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );
