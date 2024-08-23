require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const router = require("./router");
const errorMiddleware = require("./middlewares/error");

const cors = require("cors");

const PORT = process.env.PORT || 5000;
const app = express();

// app.use(express.static(path.resolve('..', 'frontend', 'build')));

app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use("/api/v1", router);
app.use(errorMiddleware);

// app.get('*', (req, res) => {
// 	res.sendFile(path.resolve('..', 'frontend', 'build', 'index.html'));
// });

mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
  })
  .catch((e) => console.log(e));
