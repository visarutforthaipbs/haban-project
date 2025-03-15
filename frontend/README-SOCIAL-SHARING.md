# Social Media Sharing Solution for Haban Project

This document explains how we've implemented social media sharing support for the Haban.love SPA (Single Page Application).

## The Challenge

SPAs like our React application have a common issue with social media sharing: when social media crawlers visit our dog detail pages (e.g., `https://www.haban.love/dogs/123456`), they don't execute JavaScript and only see the generic metadata from our `index.html`, resulting in generic/incorrect previews when shared.

## Our Solution

We've implemented a multi-layered approach to ensure proper social media sharing:

### 1. Backend Preview Routes

Our backend server (`haban-project.onrender.com`) has a dedicated `/preview/dogs/:id` endpoint that:

- Receives requests from social media crawlers
- Fetches the specific dog data from the database
- Generates HTML with proper Open Graph and Twitter Card meta tags
- Returns a fully rendered page with the correct dog information

### 2. Frontend Configurations

#### Vercel.json Configuration

We've updated the `vercel.json` file to include special routing for social media bots:

```json
"rewrites": [
  {
    "source": "/dogs/:id",
    "has": [
      {
        "type": "header",
        "key": "user-agent",
        "value": ".*?(facebookexternalhit|Facebot|LinkedInBot|Twitterbot|WhatsApp|Line).*"
      }
    ],
    "destination": "https://haban-project.onrender.com/preview/dogs/:id"
  },
  { "source": "/(.*)", "destination": "/index.html" }
]
```

This configuration:

- Detects when a social media bot is accessing a dog detail page
- Redirects the request to our backend preview service
- Preserves normal navigation for regular users

#### Client-Side Detection (Fallback)

We've added a script to our `index.html` as a fallback mechanism:

```javascript
// Only runs if a social media bot somehow bypasses the Vercel configuration
if (window.location.hostname === "www.haban.love" && isDogDetailPage()) {
  const dogId = getDogIdFromURL();
  if (dogId && isSocialBot()) {
    window.location.href = `https://haban-project.onrender.com/preview/dogs/${dogId}`;
  }
}
```

## Testing the Solution

We've created a test script (`test-social-bot.js`) to verify our implementation:

```
node test-social-bot.js
```

This script:

1. Tests requests with a Facebook bot user agent
2. Tests requests with a regular user agent
3. Tests direct access to the preview endpoint

## Debugging Facebook Sharing Issues

If Facebook is still showing incorrect previews:

1. Use the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Enter the full dog detail URL (e.g., `https://www.haban.love/dogs/67d53602be7b8380d9763047`)
3. Click "Debug" and check the results
4. Click "Scrape Again" to refresh Facebook's cache
5. Verify that:
   - The URL shown in the debugger matches your dog detail URL
   - The crawler is receiving a 200 status code
   - The preview shows the correct dog image and information

### Common Issues and Fixes

1. **Facebook still shows generic metadata**

   - Use the Facebook Debugger to force a cache refresh
   - Verify that the bot detection in `vercel.json` is working
   - Test direct access to `https://haban-project.onrender.com/preview/dogs/{ID}`

2. **Preview shows "404 Not Found"**

   - Check if the dog ID exists in your database
   - Verify that the backend preview route is working correctly

3. **Preview shows error or server issues**
   - Check the backend logs for errors
   - Ensure the MongoDB connection is working
   - Verify that the `dogService.getDogById()` function is working

## Implementation Details

The specific meta tags we generate for each dog include:

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.haban.love/dogs/{dogId}" />
<meta property="og:title" content="{dogName} - haban.love" />
<meta property="og:description" content="{dogDescription}" />
<meta property="og:image" content="{dogImageUrl}" />
<meta property="fb:app_id" content="297302183484420" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="https://www.haban.love/dogs/{dogId}" />
<meta property="twitter:title" content="{dogName} - haban.love" />
<meta property="twitter:description" content="{dogDescription}" />
<meta property="twitter:image" content="{dogImageUrl}" />
```

## Deployment Process

After making changes to this sharing solution:

1. Commit and push changes to GitHub
2. Vercel will automatically deploy frontend changes
3. Backend changes on Render will also deploy automatically
4. Use the test script to verify everything is working
5. Test real sharing on Facebook, Twitter, Line, etc.

## Resources

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Open Graph Protocol](https://ogp.me/)
- [Vercel Rewrites Documentation](https://vercel.com/docs/concepts/projects/project-configuration#rewrites)
