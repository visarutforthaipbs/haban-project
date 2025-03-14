# Lost & Found Dogs Chiang Mai 🐕

A community-driven platform to help reunite lost dogs with their owners in Chiang Mai, especially during festivals and events with fireworks.

## Features

- 🗺️ Interactive map-based interface for lost and found dogs
- 🔐 LINE authentication and messaging integration
- 📱 Mobile-first, responsive design
- 🌐 Bilingual support (Thai/English)
- 📍 Real-time location-based search
- 🔔 Instant notifications via LINE
- 💬 In-app messaging system
- 📸 Photo upload and management

## Tech Stack

- **Frontend**: React (Vite), TypeScript
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Maps**: Google Maps API
- **Real-time**: Socket.io
- **Authentication**: LINE Login API
- **Notifications**: LINE Messaging API
- **Hosting**: Vercel (Frontend), DigitalOcean/AWS (Backend)

## Project Structure

```
/
├── frontend/           # React frontend (Vite)
├── backend/           # Node.js/Express backend
└── docs/             # Project documentation
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- LINE Developer Account
- Google Maps API Key

## Getting Started

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Environment Variables

Create `.env` files in both frontend and backend directories:

Frontend (.env):

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_LINE_CHANNEL_ID=your_line_channel_id
VITE_API_URL=http://localhost:3000
```

Backend (.env):

```
PORT=3000
MONGODB_URI=your_mongodb_uri
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_access_token
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
