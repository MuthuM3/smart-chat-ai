interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  userId: string;
  lastUpdated: number;
}

const DB_NAME = 'SmartChatDB';
const DB_VERSION = 3;
const CONVERSATIONS_STORE = 'conversations';
const MESSAGES_STORE = 'chatHistory';
const USER_STORE = 'users';

let db: IDBDatabase | null = null;

class IndexedDBService {
  private currentUserId: string | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;

        // Delete old stores if they exist during upgrade
        if (oldVersion < DB_VERSION) {
          const storeNames = Array.from(db.objectStoreNames);
          storeNames.forEach(storeName => {
            db.deleteObjectStore(storeName);
          });
        }

        // Create conversations store with indexes
        if (!db.objectStoreNames.contains(CONVERSATIONS_STORE)) {
          const conversationsStore = db.createObjectStore(CONVERSATIONS_STORE, { keyPath: 'id' });
          conversationsStore.createIndex('userId', 'userId', { unique: false });
          conversationsStore.createIndex('title', 'title', { unique: false });
          conversationsStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        // Create messages store with indexes
        if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
          const messagesStore = db.createObjectStore(MESSAGES_STORE, { keyPath: ['userId', 'timestamp'] });
          messagesStore.createIndex('userId', 'userId', { unique: false });
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create users store
        if (!db.objectStoreNames.contains(USER_STORE)) {
          const userStore = db.createObjectStore(USER_STORE, { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }
      };
    });
  }

  async deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      
      request.onsuccess = () => {
        console.log('Database deleted successfully');
        db = null;
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  setUserId(userId: string) {
    this.currentUserId = userId;
  }

  clearUserId() {
    this.currentUserId = null;
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    if (!db) await this.initDB();
    if (!this.currentUserId) throw new Error('No user ID set');

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(CONVERSATIONS_STORE, 'readwrite');
      const store = transaction.objectStore(CONVERSATIONS_STORE);
      
      const conversationToSave = {
        ...conversation,
        userId: this.currentUserId,
        lastUpdated: Date.now()
      };

      const request = store.put(conversationToSave);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getConversations(): Promise<Conversation[]> {
    if (!db) await this.initDB();
    if (!this.currentUserId) return [];

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(CONVERSATIONS_STORE, 'readonly');
      const store = transaction.objectStore(CONVERSATIONS_STORE);
      const index = store.index('userId');
      const request = index.getAll(this.currentUserId);

      request.onsuccess = () => {
        const conversations = request.result as Conversation[];
        // Sort by last updated timestamp, most recent first
        conversations.sort((a, b) => b.lastUpdated - a.lastUpdated);
        resolve(conversations);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async deleteConversation(conversationId: string): Promise<void> {
    if (!db) await this.initDB();
    if (!this.currentUserId) throw new Error('No user ID set');

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(CONVERSATIONS_STORE, 'readwrite');
      const store = transaction.objectStore(CONVERSATIONS_STORE);
      const request = store.delete(conversationId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async searchConversationsByTitle(searchTerm: string): Promise<Conversation[]> {
    if (!db) await this.initDB();
    if (!this.currentUserId) return [];

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(CONVERSATIONS_STORE, 'readonly');
      const store = transaction.objectStore(CONVERSATIONS_STORE);
      const index = store.index('userId');
      const request = index.getAll(this.currentUserId);

      request.onsuccess = () => {
        const conversations = request.result as Conversation[];
        const filteredConversations = conversations.filter(conv => 
          conv.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        filteredConversations.sort((a, b) => b.lastUpdated - a.lastUpdated);
        resolve(filteredConversations);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async loadChatHistory(): Promise<ChatMessage[]> {
    if (!this.currentUserId) {
      console.error('No user ID set for IndexedDB');
      return [];
    }

    try {
      if (!db) {
        await this.initDB();
      }

      return new Promise((resolve, reject) => {
        const transaction = db!.transaction([MESSAGES_STORE], 'readonly');
        const store = transaction.objectStore(MESSAGES_STORE);
        const index = store.index('userId');
        const request = index.getAll(IDBKeyRange.only(this.currentUserId));

        request.onsuccess = () => {
          const messages = request.result.map(({ userId, ...message }) => message);
          console.log('Successfully loaded chat history from IndexedDB for user:', this.currentUserId);
          resolve(messages);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error loading chat history:', error);
      // If there's an error with the database, try to recreate it
      await this.deleteDatabase();
      await this.initDB();
      return [];
    }
  }

  async saveChatHistory(messages: ChatMessage[]): Promise<void> {
    if (!this.currentUserId) {
      console.error('No user ID set for IndexedDB');
      return;
    }

    try {
      if (!db) {
        await this.initDB();
      }

      return new Promise((resolve, reject) => {
        const transaction = db!.transaction([MESSAGES_STORE], 'readwrite');
        const store = transaction.objectStore(MESSAGES_STORE);

        // Clear existing messages for this user
        const clearRequest = store.index('userId').openKeyCursor(IDBKeyRange.only(this.currentUserId));
        clearRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            store.delete(cursor.primaryKey);
            cursor.continue();
          } else {
            // Add new messages
            messages.forEach(message => {
              store.add({
                ...message,
                userId: this.currentUserId
              });
            });
          }
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Error saving chat history:', error);
      // If there's an error with the database, try to recreate it
      await this.deleteDatabase();
      await this.initDB();
      await this.saveChatHistory(messages); // Retry the save
    }
  }

  async clearChatHistory(): Promise<void> {
    if (!this.currentUserId) {
      console.error('No user ID set for IndexedDB');
      return;
    }

    try {
      if (!db) {
        await this.initDB();
      }

      return new Promise((resolve, reject) => {
        const transaction = db!.transaction([MESSAGES_STORE], 'readwrite');
        const store = transaction.objectStore(MESSAGES_STORE);
        const userIndex = store.index('userId');
        const request = userIndex.openKeyCursor(IDBKeyRange.only(this.currentUserId));

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            store.delete(cursor.primaryKey);
            cursor.continue();
          }
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Error clearing chat history:', error);
      // If there's an error with the database, try to recreate it
      await this.deleteDatabase();
      await this.initDB();
    }
  }

  async getUserData(userId: string): Promise<any> {
    if (!db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(USER_STORE, 'readonly');
      const store = transaction.objectStore(USER_STORE);
      const request = store.get(userId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async saveUserData(userId: string, data: any): Promise<void> {
    if (!db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(USER_STORE, 'readwrite');
      const store = transaction.objectStore(USER_STORE);
      const request = store.put({ id: userId, ...data });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

export const indexedDBService = new IndexedDBService();
