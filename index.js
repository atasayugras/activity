import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Step 1: Make sure that when a user visits the home page, it shows a random activity.
app.get("/", async (req, res) => {
  const url = "https://bored-api.appbrewery.com/random";
  try {
    const response = await axios.get(url);
    const result = response.data;

    // Render the index.ejs file with a single *random* activity
    res.render("index.ejs", { data: result });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", { error: error.message, data: null });
  }
});

app.post("/", async (req, res) => {
  const { type, participants } = req.body; // Destructuring

  try {
    const response = await axios.get(
      `https://bored-api.appbrewery.com/filter?type=${type}&participants=${participants}`
    );
    const result = response.data;

    // Check if any activities were found
    if (result.length > 0) {
      res.render("index.ejs", {
        data: result[Math.floor(Math.random() * result.length)],
      });
    } else {
      res.render("index.ejs", {
        error: "No activities match your criteria.",
        data: null,
      });
    }
  } catch (error) {
    console.error("Failed to make request:", error.message);
    let errorMessage;
    // Check if the error has a response and a status code
    if (error.response) {
      const statusCode = error.response.status;

      switch (statusCode) {
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 404:
          errorMessage = "No activities found. Please check your criteria.";
          break;
        default:
          errorMessage = "An error occurred while fetching activities.";
          break;
      }
    } else {
      // This handles errors that do not have a response, e.g., network issues
      errorMessage =
        "Network error. Please check your connection and try again.";
    }
    res.render("index.ejs", {
      error: errorMessage,
      data: null, // Ensure data is set to null to avoid "not defined"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
