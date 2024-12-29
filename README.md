# Smart Chat

A modern, feature-rich chat application powered by Google's Gemini AI, built with React, TypeScript, and Tailwind CSS.

![Smart Chat Logo](./public/brain-circuit.png)

## Features

### Authentication
- Google Sign-In integration for secure authentication
- User profile display with profile picture or initials
- Seamless sign-out functionality

### Chat Interface
- Clean and intuitive chat interface
- Real-time message updates
- Support for code snippets and markdown
- Dark/Light theme toggle
- Typing indicators
- Scroll to bottom functionality

### Data Persistence
- Chat history saved to Google Drive
- Local backup using IndexedDB
- Automatic sync between Google Drive and local storage
- Persistent user preferences

### UI/UX
- Modern and responsive design
- Beautiful animations and transitions
- Consistent branding with Smart Chat logo
- Accessible color schemes
- Mobile-friendly layout

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React Icons
- **Authentication**: Google OAuth 2.0
- **Storage**: 
  - Google Drive API for cloud storage
  - IndexedDB for local backup
- **State Management**: React Context API
- **Build Tool**: Vite

## Getting Started

1. Clone the repository
```bash
git clone [repository-url]
cd project
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Run the development server
```bash
npm run dev
```

## Environment Setup

### Google Cloud Console Setup
1. Create a new project in Google Cloud Console
2. Enable the following APIs:
   - Google Drive API
   - Google Sign-In API
3. Create OAuth 2.0 credentials
4. Add authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`

## Project Structure

```
project/
├── src/
│   ├── components/         # React components
│   ├── context/           # React context providers
│   ├── services/          # Service layer
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
└── package.json         # Project dependencies
```

## Features in Detail

### Google Integration
- Sign in with Google account
- Store chat history in Google Drive
- Automatic backup and sync
- Secure token management

### Chat History Management
- Persistent chat history across sessions
- Automatic backup to IndexedDB
- Fallback to local storage when offline
- Clear history on sign-out

### Theme Support
- Light and dark mode support
- System theme detection
- Persistent theme preference
- Smooth theme transitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.