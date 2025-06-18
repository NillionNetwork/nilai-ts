import OpenAI from "openai";                              //  [oai_citation:0‡github.com](https://github.com/openai/openai-node?utm_source=chatgpt.com)

export class CustomOpenAI extends OpenAI {
  constructor(opts?: ConstructorParameters<typeof OpenAI>[0]) {
    super(opts);
  }

  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  protected async prepareRequest(
    request: any,
    { url, options }: { url: string; options: any },
  ): Promise<void> {
    await super.prepareRequest(request, { url, options });
    options.headers.Authorization = `Bearer ${this.apiKey}`;
  }

}