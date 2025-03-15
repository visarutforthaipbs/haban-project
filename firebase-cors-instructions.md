# Firebase Storage CORS Configuration Instructions

Follow these steps to configure CORS for your Firebase Storage bucket:

## Option 1: Using Firebase CLI (Recommended)

1. Install Firebase CLI if you haven't already:

```bash
npm install -g firebase-tools
```

2. Login to your Firebase account:

```bash
firebase login
```

3. Set the default project:

```bash
firebase use haban-pics
```

4. Upload the CORS configuration:

```bash
gsutil cors set firebase-cors.json gs://haban-pics.firebasestorage.app
```

## Option 2: Using Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to Storage → Browser
3. Find your bucket `haban-pics.firebasestorage.app`
4. Click on "Bucket Settings" tab
5. Scroll down to the CORS configuration section
6. Click "Edit" and paste the content of `firebase-cors.json`
7. Save the changes

## Verification

After applying the CORS configuration, it may take a few minutes to propagate.
You can verify it's working by refreshing your application and confirming that
images load correctly without CORS errors in the console.
