import { ParseBodyType, RequestOptions, RestResponse } from './types';

export class Rest {
  origin: string;

  constructor(origin: string) {
    this.origin = origin;
  }

  public async get<RES = any>(path: string, options?: Omit<Partial<RequestOptions>, 'body'>) {
    return await this.request<RES>({
      path,
      method: 'GET',
      ...options,
    });
  }

  public async post<RES = any, REQ = any>(path: string, options?: Partial<RequestOptions<REQ>>) {
    return await this.request<RES>({
      path,
      method: 'POST',
      ...options,
    });
  }

  public async put<RES = any, REQ = any>(path: string, options?: Partial<RequestOptions<REQ>>) {
    return await this.request<RES>({
      path,
      method: 'PUT',
      ...options,
    });
  }

  public async patch<RES = any, REQ = any>(path: string, options?: Partial<RequestOptions<REQ>>) {
    return await this.request<RES>({
      path,
      method: 'DELETE',
      ...options,
    });
  }

  public async delete<RES = any, REQ = any>(path: string, options?: Partial<RequestOptions<REQ>>) {
    return await this.request<RES>({
      path,
      method: 'DELETE',
      ...options,
    });
  }

  private async request<RES = any, REQ = any>(
    options: RequestOptions<REQ>
  ): Promise<RestResponse<RES>> {
    const body =
      options.body && options.method !== 'GET'
        ? this.parseBody(options.body.parseAs, options.body.data)
        : null;
    const response = await fetch(`${options.origin ?? this.origin}/${options.path}`, {
      headers: options.headers ?? {},
      method: options.method,
      body: body,
    });
    // TODO: cache logic
    if (!response.ok) {
      return {
        success: false,
        data: await this.parseJsonResponse<RES>(response),
        // TODO: cache logic
        cached: false,
      };
    }
    return {
      success: true,
      data: await this.parseJsonResponse<RES>(response),
      // TODO: cache logic
      cached: false,
    };
  }

  private parseBody(parseAs: ParseBodyType, data: any) {
    switch (parseAs) {
      case 'JSON':
        return JSON.stringify(data);
      default:
        return new FormData(data);
    }
  }

  private async parseJsonResponse<RES = any>(res: Response) {
    try {
      return (await res.json()) as RES;
    } catch {
      return null as RES;
    }
  }
}
