import { Request, Response, NextFunction } from "express";
import { dogService } from "../services/dogService";

// List of known social media bot user agents
const SOCIAL_MEDIA_BOTS = [
  "facebookexternalhit",
  "Facebot",
  "LinkedInBot",
  "Twitterbot",
  "WhatsApp",
  "Line",
  "Slackbot",
  "TelegramBot",
  "Discordbot",
  "Pinterest",
];

/**
 * Checks if the request is from a social media bot
 */
function isSocialMediaBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false;

  return SOCIAL_MEDIA_BOTS.some((bot) =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
}

/**
 * Middleware to handle social media bot requests for dog detail pages
 * Generates HTML with Open Graph and Twitter Card meta tags
 */
export function socialMediaPrerender(req: any, res: any, next: any) {
  const userAgent = req.get("user-agent");
  console.log(`Social Media Prerender Middleware - UA: ${userAgent}`);

  // Only process requests from social media bots
  if (!isSocialMediaBot(userAgent)) {
    console.log("Not a social media bot, skipping middleware");
    return next();
  }

  // Check if this is a dog detail page request
  const url = req.originalUrl || "";
  console.log(`Processing URL: ${url}`);

  // Handle both /api/dogs/:id and /dogs/:id patterns
  const dogDetailRegex = /\/(api\/)?dogs\/([a-f0-9]{24})$/i;
  const match = url.match(dogDetailRegex);

  if (!match) {
    console.log("Not a dog detail page, skipping middleware");
    return next();
  }

  const dogId = match[2]; // Group 2 contains the ID
  console.log(`Found dog ID: ${dogId}`);

  // Get dog details
  dogService
    .getDogById(dogId)
    .then((dog) => {
      if (!dog) {
        console.log("Dog not found, skipping middleware");
        return next();
      }

      console.log("Dog found, generating HTML");

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
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
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
          <meta property="twitter:card" content="summary_large_image">
          <meta property="twitter:url" content="${canonicalUrl}">
          <meta property="twitter:title" content="${title}">
          <meta property="twitter:description" content="${description}">
          <meta property="twitter:image" content="${imageUrl}">
          
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
      res.send(html);
    })
    .catch((error) => {
      console.error("Error in social media prerender middleware:", error);
      next();
    });
}
