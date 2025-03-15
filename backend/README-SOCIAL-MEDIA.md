# Social Media Prerender Middleware

This middleware enhances social media sharing by providing rich previews when links to dog detail pages are shared on platforms like Facebook, Twitter, LINE, etc.

## How It Works

1. The middleware detects requests from social media bots based on their user agent.
2. For dog detail pages (both `/api/dogs/:id` and `/dogs/:id` patterns), it generates HTML with Open Graph and Twitter Card meta tags.
3. The generated HTML includes the dog's name, type, breed, description, image, and other relevant information.

## Configuration

### MongoDB Connection

Ensure your MongoDB connection string is correctly set in the environment variables:

```
MONGODB_URI=mongodb+srv://visarut298:vWLYUneRGQahE6Am@haban-database.hucgh.mongodb.net/?retryWrites=true&w=majority&appName=haban-database
```

For the production environment (https://haban-project.onrender.com), make sure to update the environment variables in the Render dashboard:

1. Go to the Render dashboard: https://dashboard.render.com/
2. Select your web service
3. Navigate to the "Environment" tab
4. Update the `MONGODB_URI` variable with the correct connection string
5. Click "Save Changes" and deploy

### Frontend URL

The middleware uses the `FRONTEND_URL` environment variable to generate canonical URLs for social media sharing. Make sure this is set correctly in your production environment:

```
FRONTEND_URL=https://your-frontend-url.com
```

## Testing

### Test on Local Development Environment

Run these scripts to test the middleware on your local server:

```bash
# Test API endpoint
node test-social-media.js

# Test frontend route
node test-frontend-route.js
```

### Test on Production Environment

Run these scripts to test the middleware on your production server:

```bash
# Test API endpoint
node test-production.js

# Test frontend route
node test-production-frontend.js
```

## Real-World Testing

To test the middleware with actual social media platforms:

1. Share a dog detail page URL on Facebook, Twitter, LINE, etc.
2. Check if the preview shows the correct title, description, and image.
3. Monitor your server logs for any errors or issues.

## Troubleshooting

- **404 Not Found**: Make sure the dog ID exists in your database.
- **502 Bad Gateway**: The server might be experiencing issues or the deployment might still be in progress. Wait a few minutes and try again.
- **No Preview**: Check if the social media platform is caching the old preview. Try using the platform's debugging tools (e.g., [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)).
