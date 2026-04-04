// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// import dotenv from "dotenv"

// dotenv.config()

// const app = express();

// app.use(cors());
// app.use(bodyParser.json()); // or just: app.use(express.json());

// import user from "./routes/userRoute.js"

// app.use("/api/v1",user)

// export default app;



// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import path from "path"
// import user from "./routes/userRoute.js"; 
// import sendMessage from "./routes/sendMessageRoute.js"; 


// const __dirname=path.resolve()
// dotenv.config();

// const app = express();
// app.use(express.json())

// app.use(express.static(path.join(__dirname, "/bulk-message/dist")));

// // app.js ya server.js me sabse upar add karo
// app.use((req, res, next) => {
//     // Skip the ngrok warning page so Twilio can receive raw XML
//     res.setHeader("ngrok-skip-browser-warning", "true");
//     next();
//   });
// app.use(cors({
//     credentials:true,
//     origin:'http://localhost:5173'
// }));


// app.use(cookieParser())
// app.use(bodyParser.json()); // or use: app.use(express.json());
// app.use(bodyParser.urlencoded({extended:true}))


// app.use('/upload',express.static(path.join(__dirname,'upload')))


// app.get("/twiml", (req, res) => {
//     const { message = "Hello Dileep, How are you" } = req.query;

//     const twimlResponse =
//       '<?xml version="1.0" encoding="UTF-8"?>\n' +
//       '<Response>\n' +
//       `  <Say voice="alice" language="en-US">${message}</Say>\n` +
//       '</Response>';

//     res.type("text/xml");
//     res.send(Buffer.from(twimlResponse));
//   });

// app.use("/api/v1", user); 
// app.use("/api/v1", sendMessage); 


// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, "bulk-message", "dist", "index.html"));
// });



// export default app;



// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import path from "path";
// import user from "./routes/userRoute.js"; 
// import sendMessage from "./routes/sendMessageRoute.js"; 
// import helmet from "helmet"; // ✅ Import helmet

// const __dirname = path.resolve();
// dotenv.config();

// const app = express();



// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(helmet()); 

// // Serve static files for the React app
// app.use(express.static(path.join(__dirname, "/bulk-message/dist")));

// // Skip the ngrok warning page
// app.use((req, res, next) => {
//   res.setHeader("ngrok-skip-browser-warning", "true");
//   next();
// });

// // CORS configuration
// app.use(cors({
//   credentials: true,
//   origin: 'http://localhost:5173', // Adjust for production
// }));

// app.use(cookieParser());

// // Static file serving for uploads
// app.use('/upload', express.static(path.join(__dirname, 'upload')));


// // API routes
// app.use("/api/v1", user); 
// app.use("/api/v1", sendMessage); 

// // Serve React app for other routes
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, "bulk-message", "dist", "index.html"));
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack); // Log the error
//   res.status(500).json({ success: false, message: 'Something went wrong!' });
// });

// export default app;



import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


import user from "./routes/userRoute.js"
// import order from "./routes/orderRoute.js"
import notification from "./routes/notificationRoute.js"
import paymentMethod from "./routes/paymentMethodRoute.js"
import banners from "./routes/bannerRoute.js"
import { fileURLToPath } from "url";
import role from "./routes/roleRoutes.js";
import Permissions from "./routes/permissonRoutes.js"
import superadminRoutes from "./routes/superadminRoutes.js";
import category from "./routes/categoryRoute.js";
import AdminCommmonRoutes from "./routes/adminCommonRoutes.js";
import menuItemRoutes from "./routes/menuItemRoutes.js";
import menuManagementCommonRoutes from "./routes/menuManagementCommonRoutes.js";
import customerMenuRoute from "./routes/customerMenuRoutes.js";
import OrderRoute from "./routes/orderRoute.js"
import InventoryRoute from "./routes/inventoryRoutes.js"
import posRoutes from "./routes/posRoutes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();

// ✅ General rate limiter: 100 requests per 15 minutes per IP
// const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 mins
//   max: 100,
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again after 15 minutes.',
//   },
// });

// const superStrictLimiter = rateLimit({
//   windowMs: 2 * 60 * 1000, // 2 minutes
//   max: 1, // Only 1 request per window per IP
//   message: {
//     success: false,
//     message: "Too many requests. Only 1 request allowed every 2 minutes.",
//   },
// });
// app.use(generalLimiter); 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

// app.use(cors({
//   credentials: true,
//   origin: "https://7jq23dd6-5173.inc1.devtunnels.ms" || "http://localhost:5173",
//   // origin: "http://localhost:5173/" || `https://7jq23dd6-5173.inc1.devtunnels.ms/`,
// }));



app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    const frontendUrl = "https://restaurant-management-f.vercel.app";
    const localhost = "http://localhost:5173";

    if (origin === frontendUrl || origin === localhost || !origin) {
      callback(null, origin || localhost);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));


// app.use(express.static(path.join(__dirname, "/bulk-message/dist")));
// app.use('/upload', express.static(path.join(__dirname, 'upload')));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));  


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ✅ API routes
app.use("/api/v1", user);
// app.use("/api/v1", order);  
app.use("/api/v1", notification);
app.use("/api/v1", paymentMethod);
app.use("/api/v1", banners);
app.use("/api/v1", role);
app.use("/api/v1", Permissions)
app.use("/api/v1", superadminRoutes)
app.use("/api/v1", category)
app.use("/api/v1", AdminCommmonRoutes)
app.use("/api/v1", menuItemRoutes)
app.use("/api/v1", menuManagementCommonRoutes)
app.use("/api/v1", customerMenuRoute)
app.use("/api/v1", OrderRoute)
app.use("/api/v1", InventoryRoute)
app.use("/api/v1/pos", posRoutes)

// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, "bulk-message", "dist", "index.html"));
// });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

export default app;
