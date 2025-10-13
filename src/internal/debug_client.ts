import OpenAI from "openai"; //  [oai_citation:0‡github.com](https://github.com/openai/openai-node?utm_source=chatgpt.com)

export class DebugOpenAI extends OpenAI {
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */

  protected override async prepareRequest(
    request: any, // any should be RequestInit but it is internal to openai
    { url, options }: { url: string; options: any }, // any should be FinalRequestOptions but it is internal to openai
  ): Promise<void> {
    await super.prepareRequest(request, { url, options });
    console.log("DebugOpenAI - URL param:", url);
    console.log("DebugOpenAI - BaseURL:", this.baseURL);
    console.log(
      "DebugOpenAI - Request body:",
      JSON.stringify(options.body, null, 2),
    );
    console.log("DebugOpenAI - Request headers:", options.headers);
    console.log(
      "DebugOpenAI - Full options:",
      JSON.stringify(options, null, 2),
    );
  }
}
