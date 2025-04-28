const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const session = require("express-session");
const multer = require("multer");
const routes = require("./routes/routes");

const bodyParser = require("body-parser");
const cors = require("cors");

app.use(cors());
// Use bodyParser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", routes);

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.static(path.join(__dirname, "public")));

// Specifically serve the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
