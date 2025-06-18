import { NilaiOpenAIClient } from '../src/client';

describe('NilaiOpenAIClient', () => {
  let client: NilaiOpenAIClient;

  beforeEach(() => {
    client = new NilaiOpenAIClient({
      base_url: 'https://nilai-a779.nillion.network/nuc/v1',
      api_key: 'c2b961027b26c38824bdc2eccf9cdada6646d1b87c665ddf235c33a57335bd47',
    });
  });

  describe('e2e test', () => {
    it('should add authorization header via prepareRequest', async () => {
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Hello, how are you?' }],
        });
        console.log(response);
    });
  });
});