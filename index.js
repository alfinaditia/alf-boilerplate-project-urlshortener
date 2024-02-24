require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// In-memory storage for URLs
const urlDatabase = {};
let counter = 1;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// API to shorten URL
app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  // Validate URL format
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: "invalid url" });
  }

  // Check if URL already exists in the database
  for (const key in urlDatabase) {
    if (urlDatabase[key].original_url === originalUrl) {
      return res.json({
        original_url: urlDatabase[key].original_url,
        short_url: urlDatabase[key].short_url,
      });
    }
  }

  // Create a new short URL
  const shortUrl = counter++;
  urlDatabase[shortUrl] = { original_url: originalUrl, short_url: shortUrl };

  return res.json({ original_url: originalUrl, short_url: shortUrl });
});

// Redirect to original URL
app.get("/api/shorturl/:short_url", function (req, res) {
  const shortUrl = parseInt(req.params.short_url);
  if (urlDatabase[shortUrl]) {
    res.redirect(urlDatabase[shortUrl].original_url);
  } else {
    res.json({ error: "short url not found" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
