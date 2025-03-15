// Test script for social media bot preview functionality
const axios = require("axios");

// Replace this with an actual dog ID from your database
const dogId = "67d53602be7b8380d9763047";
const url = `https://www.haban.love/dogs/${dogId}`;

// Test with Facebook bot user agent
async function testFacebookBotPreview() {
  try {
    console.log(`Testing Facebook bot preview for URL: ${url}`);
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      },
    });

    console.log("Status:", response.status);
    console.log("Content-Type:", response.headers["content-type"]);

    // Check if the response contains OpenGraph meta tags
    const hasOgTags = response.data.includes('property="og:');
    console.log("Has OpenGraph Tags:", hasOgTags);

    // Check if it contains specific dog information
    const hasSpecificDogInfo = response.data.includes(dogId);
    console.log("Contains Specific Dog Info:", hasSpecificDogInfo);

    // Output a preview of the HTML
    const htmlPreview = response.data.substring(0, 1000) + "...";
    console.log("\nHTML Preview (first 1000 chars):");
    console.log(htmlPreview);
  } catch (error) {
    console.error("Error testing Facebook bot preview:");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Headers:", error.response.headers);
      console.log(
        "Data preview:",
        error.response.data.substring(0, 500) + "..."
      );
    } else {
      console.error(error.message);
    }
  }
}

// Test with a regular user agent
async function testRegularUserPreview() {
  try {
    console.log(`\nTesting regular user preview for URL: ${url}`);
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
      },
    });

    console.log("Status:", response.status);
    console.log("Content-Type:", response.headers["content-type"]);

    // Check if the response is the SPA index.html
    const isSPA = response.data.includes('<div id="root"></div>');
    console.log("Is SPA Content:", isSPA);
  } catch (error) {
    console.error("Error testing regular user preview:", error.message);
  }
}

// Test direct access to the preview endpoint
async function testDirectPreviewAccess() {
  try {
    const previewUrl = `https://haban-project.onrender.com/preview/dogs/${dogId}`;
    console.log(`\nTesting direct access to preview endpoint: ${previewUrl}`);

    const response = await axios.get(previewUrl);

    console.log("Status:", response.status);
    console.log("Content-Type:", response.headers["content-type"]);

    // Check if the response contains OpenGraph meta tags
    const hasOgTags = response.data.includes('property="og:');
    console.log("Has OpenGraph Tags:", hasOgTags);

    // Output a preview of the HTML
    const htmlPreview = response.data.substring(0, 1000) + "...";
    console.log("\nHTML Preview (first 1000 chars):");
    console.log(htmlPreview);
  } catch (error) {
    console.error("Error testing direct preview access:");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Headers:", error.response.headers);
      console.log(
        "Data preview:",
        error.response.data.substring(0, 500) + "..."
      );
    } else {
      console.error(error.message);
    }
  }
}

// Run all tests
(async () => {
  await testFacebookBotPreview();
  await testRegularUserPreview();
  await testDirectPreviewAccess();
})();
