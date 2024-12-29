import { indexedDBService } from './indexedDBService';

interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

declare global {
  interface Window {
    gapi: any;
  }
}

class GoogleDriveService {
  private accessToken: string | null = null;
  private isInitialized = false;
  private readonly historyFileName = 'chat_history.json';
  private currentUserId: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  setUserId(userId: string) {
    this.currentUserId = userId;
  }

  async ensureInitialized() {
    if (!this.accessToken) {
      throw new Error('Access token not set');
    }

    if (!this.currentUserId) {
      throw new Error('User ID not set');
    }

    if (this.isInitialized) {
      return;
    }

    try {
      await this.loadGapiScript();
      await this.initializeGoogleDriveAPI();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing Google Drive API:', error);
      throw error;
    }
  }

  private loadGapiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  async initializeGoogleDriveAPI() {
    try {
      await window.gapi.client.init({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
      window.gapi.client.setToken({ access_token: this.accessToken });
    } catch (error) {
      console.error('Error initializing Google Drive API:', error);
      throw error;
    }
  }

  private async findOrCreateHistoryFile(): Promise<string> {
    try {
      // Search for user-specific history file
      const fileName = `${this.currentUserId}_${this.historyFileName}`;
      const response = await window.gapi.client.drive.files.list({
        q: `name = '${fileName}' and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'appDataFolder'
      });

      const files = response.result.files;
      if (files && files.length > 0) {
        return files[0].id;
      }

      // Create new file if not found
      const fileMetadata = {
        name: fileName,
        parents: ['appDataFolder']
      };

      const createResponse = await window.gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      });

      return createResponse.result.id;
    } catch (error) {
      console.error('Error finding/creating history file:', error);
      throw error;
    }
  }

  async saveChatHistory(messages: ChatMessage[]) {
    if (!messages || messages.length === 0) {
      console.log('No messages to save');
      return;
    }

    try {
      console.log('Saving chat history to IndexedDB...');
      // First, save to IndexedDB as backup
      await indexedDBService.saveChatHistory(messages);

      console.log('Saving chat history to Google Drive...');
      // Then try to save to Google Drive
      await this.ensureInitialized();
      const fileId = await this.findOrCreateHistoryFile();
      const content = JSON.stringify(messages);

      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const closeDelim = "\r\n--" + boundary + "--";

      const contentType = 'application/json';
      const metadata = {
        mimeType: contentType
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n\r\n' +
        content +
        closeDelim;

      await window.gapi.client.request({
        path: '/upload/drive/v3/files/' + fileId,
        method: 'PATCH',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
      });

      console.log('Successfully saved chat history to both storages');
      
      // Update localStorage
      localStorage.setItem('conversations', JSON.stringify([{
        id: 'default',
        title: 'Chat History',
        messages: messages
      }]));
    } catch (error) {
      console.error('Error saving chat history:', error);
      // If Google Drive fails, at least we have the backup in IndexedDB
    }
  }

  async loadChatHistory(): Promise<ChatMessage[]> {
    try {
      console.log('Loading chat history from Google Drive...');
      // Try to load from Google Drive first
      await this.ensureInitialized();
      const fileId = await this.findOrCreateHistoryFile();
      
      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      const messages = JSON.parse(response.body) as ChatMessage[];
      console.log('Successfully loaded chat history from Google Drive');
      
      // Update IndexedDB backup
      await indexedDBService.saveChatHistory(messages);
      
      // Update localStorage
      localStorage.setItem('conversations', JSON.stringify([{
        id: 'default',
        title: 'Chat History',
        messages: messages
      }]));
      
      return messages;
    } catch (error: any) {
      console.error('Error loading from Google Drive:', error);
      console.log('Falling back to IndexedDB...');
      
      try {
        // Try IndexedDB
        const localMessages = await indexedDBService.loadChatHistory();
        if (localMessages && localMessages.length > 0) {
          console.log('Successfully loaded chat history from IndexedDB');
          return localMessages;
        }
        
        // If no messages in IndexedDB, try localStorage
        const savedConversations = localStorage.getItem('conversations');
        if (savedConversations) {
          const conversations = JSON.parse(savedConversations);
          if (conversations[0]?.messages) {
            console.log('Successfully loaded chat history from localStorage');
            return conversations[0].messages;
          }
        }
      } catch (dbError) {
        console.error('Error loading from IndexedDB:', dbError);
      }
      
      console.log('No chat history found in any storage');
      return [];
    }
  }

  async clearState() {
    this.accessToken = null;
    this.isInitialized = false;
    this.currentUserId = null;
  }
}

export const googleDriveService = new GoogleDriveService();
