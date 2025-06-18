import { CustomOpenAI } from '../src/internal/new_client';

describe('CustomOpenAI', () => {
  let client: CustomOpenAI;

  beforeEach(() => {
    client = new CustomOpenAI({
      apiKey: 'test-api-key',
      baseURL: 'https://api.openai.com/v1'
    });
  });

  describe('prepareRequest override', () => {
    it('should add authorization header via prepareRequest', async () => {
      // Create mock request and options objects
      const mockRequest = {};
      const mockOptions = {
        headers: {} as any,
        method: 'POST'
      };
      const mockParams = {
        url: '/chat/completions',
        options: mockOptions
      };

      // Call the protected method using bracket notation to access it
      await (client as any).prepareRequest(mockRequest, mockParams);

      expect(mockOptions.headers.Authorization).toBe('Bearer test-api-key');
    });

    it('should handle requests with existing headers', async () => {
      const mockRequest = {};
      const mockOptions = {
        headers: {
          'Content-Type': 'application/json'
        } as any,
        method: 'POST'
      };
      const mockParams = {
        url: '/chat/completions',
        options: mockOptions
      };

      await (client as any).prepareRequest(mockRequest, mockParams);
      
      expect(mockOptions.headers.Authorization).toBe('Bearer test-api-key');
      expect(mockOptions.headers['Content-Type']).toBe('application/json');
    });

    it('should override existing authorization header', async () => {
      const mockRequest = {};
      const mockOptions = {
        headers: {
          'Authorization': 'Bearer old-key'
        },
        method: 'POST'
      };
      const mockParams = {
        url: '/chat/completions',
        options: mockOptions
      };

      await (client as any).prepareRequest(mockRequest, mockParams);
      
      expect(mockOptions.headers.Authorization).toBe('Bearer test-api-key');
    });
  });

  describe('constructor', () => {
    it('should create instance with custom options', () => {
      const customClient = new CustomOpenAI({
        apiKey: 'custom-key',
        baseURL: 'https://custom-api.example.com'
      });
      
      expect(customClient).toBeInstanceOf(CustomOpenAI);
      expect(customClient.apiKey).toBe('custom-key');
      expect(customClient.baseURL).toBe('https://custom-api.example.com');
    });
  });
}); 