import express from "express";
import { dogService } from "../services/dogService";

// Create the router
const router = express.Router();

// Add a simple test route to verify the router is working
router.get("/test", (req, res) => {
  console.log("Preview test route called");
  return res.send("Preview routes are working");
});

// Route specifically for social media previews of dog detail pages
router.get("/dogs/:id", async (req, res) => {
  try {
    console.log(`Preview route called for dog ID: ${req.params.id}`);
    console.log(`User agent: ${req.get("user-agent") || "none"}`);
    const userAgent = req.get("user-agent") || "";

    // Get the dog data
    console.log(`Trying to get dog data for ID: ${req.params.id}`);
    const dog = await dogService.getDogById(req.params.id);

    if (!dog) {
      console.log(`Dog with ID ${req.params.id} not found, returning 404`);
      return res.status(404).send("Dog not found");
    }

    console.log(
      `Dog found: ${dog._id}, name: ${
        dog.name || "unnamed"
      }, generating preview HTML`
    );

    // Generate metadata
    const title = dog.name
      ? `${dog.name} - ${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"} ${
          dog.breed
        }`
      : `${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"} ${dog.breed}`;

    const description =
      dog.description ||
      `${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"} ${dog.breed} จาก ${
        dog.locationName
      }`;

    // Get the first photo or use a default
    const imageUrl =
      dog.photos && dog.photos.length > 0
        ? dog.photos[0].startsWith("http")
          ? dog.photos[0]
          : `${req.protocol}://${req.get("host")}${dog.photos[0]}`
        : `${req.protocol}://${req.get("host")}/default-dog.jpg`;

    // Use frontend URL for canonical URL
    const frontendUrl = process.env.FRONTEND_URL || "https://www.haban.love";
    const canonicalUrl = `${frontendUrl}/dogs/${dog._id}`;

    console.log(`Using frontend URL: ${frontendUrl}`);
    console.log(`Generated canonical URL: ${canonicalUrl}`);
    console.log(`Image URL: ${imageUrl}`);

    // Generate HTML with meta tags
    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta name="description" content="${description}">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="${canonicalUrl}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:locale" content="th_TH">
        <meta property="og:site_name" content="haban.love - ระบบแจ้งและตามหาสุนัขหาย">
        <meta property="fb:app_id" content="297302183484420">
        
        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="${canonicalUrl}">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${imageUrl}">
        
        <!-- Canonical -->
        <link rel="canonical" href="${canonicalUrl}">
        
        <!-- Redirect to the actual page -->
        <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
      </head>
      <body>
        <p>กำลังนำคุณไปที่ <a href="${canonicalUrl}">${title}</a></p>
      </body>
      </html>
    `;

    console.log("Sending HTML response for social media preview");
    return res.send(html);
  } catch (error) {
    console.error("Error in preview route:", error);
    return res.status(500).send("Error generating preview");
  }
});

// Direct endpoint for Facebook bots trying to access dog detail pages
router.get("/facebook-bot/:id", async (req, res) => {
  try {
    console.log(
      `Facebook bot direct route called for dog ID: ${req.params.id}`
    );

    // Get the dog data
    const dog = await dogService.getDogById(req.params.id);

    if (!dog) {
      return res.status(404).send("Dog not found");
    }

    const title = dog.name
      ? `${dog.name} - ${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"} ${
          dog.breed
        }`
      : `${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"} ${dog.breed}`;

    const description =
      dog.description ||
      `${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"} ${dog.breed} จาก ${
        dog.locationName
      }`;

    const imageUrl =
      dog.photos && dog.photos.length > 0
        ? dog.photos[0]
        : "https://www.haban.love/fbthumnail-1.png";

    const canonicalUrl = `https://www.haban.love/dogs/${dog._id}`;

    // Generate HTML
    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta name="description" content="${description}">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="${canonicalUrl}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:locale" content="th_TH">
        <meta property="og:site_name" content="haban.love - ระบบแจ้งและตามหาสุนัขหาย">
        <meta property="fb:app_id" content="297302183484420">
        
        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="${canonicalUrl}">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${imageUrl}">
        
        <!-- Canonical -->
        <link rel="canonical" href="${canonicalUrl}">
      </head>
      <body>
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          <img src="${imageUrl}" alt="${title}" style="max-width: 100%; border-radius: 8px;">
          <h1>${title}</h1>
          <p>${description}</p>
          <p><a href="${canonicalUrl}">View on haban.love</a></p>
        </div>
      </body>
      </html>
    `;

    return res.send(html);
  } catch (error) {
    console.error("Error in Facebook bot direct route:", error);
    return res.status(500).send("Error generating preview");
  }
});

export default router;
