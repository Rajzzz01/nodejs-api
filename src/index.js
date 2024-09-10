const express = require("express");
const routes = require("./routes/routes");

const app = express();
const port = 3000;

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the defined routes
app.use("/api", routes);

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
