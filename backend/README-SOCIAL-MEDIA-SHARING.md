# Social Media Preview Guide for haban.love

## Overview

This document explains how to ensure proper social media previews when sharing dog detail pages on platforms like Facebook, Twitter, LINE, and other social media.

## How Social Media Previews Work

When you share a URL on social media, the platform sends a crawler (bot) to fetch the webpage and extract metadata such as title, description, and images using Open Graph tags. This metadata is then displayed as a rich preview card.

## Debugging Social Media Previews

### Facebook Debugger

1. Visit the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Enter a dog detail URL (e.g., `https://www.haban.love/dogs/67d53602be7b8380d9763047`)
3. Click "Debug"
4. If the preview doesn't look right, click "Scrape Again" to refresh Facebook's cache

### Twitter Card Validator

1. Visit the [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. Enter a dog detail URL
3. Click "Preview Card"

### LINE Sharing Debug

LINE doesn't provide an official debugger, but you can:

1. Share the URL in a private chat with yourself
2. Check if the preview displays correctly

## Implementation Details

### Backend API Endpoint

We've implemented a dedicated endpoint for social media bots:

```
GET /preview/dogs/:id
```

This endpoint:

1. Checks if the request is from a social media bot
2. Fetches dog details from the database
3. Generates HTML with proper Open Graph meta tags
4. Returns the HTML to the social media crawler

### Environment Variables

Make sure these environment variables are set correctly in your Render.com dashboard:

- `FRONTEND_URL`: Your frontend URL (e.g., `https://www.haban.love`)

### Common Issues and Solutions

#### Issue 1: Facebook Shows Generic Website Preview

If Facebook shows your website's default image/title instead of the specific dog:

1. Make sure Facebook's crawler is reaching `/preview/dogs/:id`
2. Check the `fb:app_id` is correct in the meta tags
3. Use the Facebook Debugger to scrape again

#### Issue 2: Images Not Displaying

If images don't appear in the preview:

1. Verify image URLs are absolute (starting with http:// or https://)
2. Check image dimensions (Facebook prefers 1200x630 pixels)
3. Ensure images are publicly accessible

#### Issue 3: Thai Text Not Displaying Correctly

If Thai text is garbled or not displaying:

1. Verify the charset is set to UTF-8
2. Check that meta tags are using the correct encoding

## Testing Your Changes

### Testing in Production

1. Share a dog detail page URL on Facebook
2. Check the preview that appears
3. If incorrect, use the Facebook Debugger to scrape again
4. Verify the tags are as expected

### Testing Locally

For local testing with Facebook's crawler:

1. Use a tool like ngrok to expose your local server
2. Set the appropriate environment variables
3. Use the Facebook Debugger with your ngrok URL

## Need Help?

If you encounter issues with social media previews, check the backend logs for any errors related to the social media prerender middleware or the preview routes.
