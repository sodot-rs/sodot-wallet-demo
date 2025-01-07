import { userGetCredentials } from '../user';

export class Fetcher<ResponseType> {
  private url: string;
  private needCredentials: boolean;
  constructor(url: string, needCredentials: boolean = true) {
    this.url = url;
    this.needCredentials = needCredentials;
  }

  async post(body: Record<string, unknown> | null = null): Promise<ResponseType> {
    const credentials = userGetCredentials();
    if (!credentials && this.needCredentials) {
      throw new Error('No credentials provided');
    }
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.needCredentials && { Authorization: credentials }),
      },
      body: body ? JSON.stringify(body) : '',
    });
    if (!response.ok) {
      throw new Error((await response.json()).message);
    }

    try {
      return (await response.json()) as ResponseType;
    } catch {
      return {} as ResponseType;
    }
  }

  async get(): Promise<ResponseType> {
    const credentials = userGetCredentials();
    if (!credentials && this.needCredentials) {
      throw new Error('No credentials provided');
    }
    const response = await fetch(this.url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.needCredentials && { Authorization: credentials }),
      },
    });
    if (!response.ok) {
      throw new Error((await response.json()).message);
    }

    try {
      return (await response.json()) as ResponseType;
    } catch {
      return {} as ResponseType;
    }
  }
}
