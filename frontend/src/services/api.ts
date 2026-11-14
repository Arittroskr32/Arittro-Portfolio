// API client used by every service.
//
// There is no backend server any more: requests are answered by
// staticBackend.ts, which reads the site's JSON content files and (for the
// signed-in admin) commits changes to GitHub. The method names are unchanged so
// the pages and services did not need to change.

import { handleRequest } from './staticBackend';

class ApiClient {
  private async call<T>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', endpoint: string, data?: any): Promise<T> {
    try {
      return (await handleRequest(method, endpoint, data)) as T;
    } catch (err: any) {
      // Keep the old error shape so existing `error.response?.data?.message` checks still work.
      const message = err?.message || 'An error occurred';
      const e: any = new Error(message);
      e.status = err?.status;
      e.response = { data: { error: message, message } };
      throw e;
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.call<T>('GET', endpoint);
  }

  post<T>(endpoint: string, data: any): Promise<T> {
    return this.call<T>('POST', endpoint, data);
  }

  put<T>(endpoint: string, data: any): Promise<T> {
    return this.call<T>('PUT', endpoint, data);
  }

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.call<T>('PATCH', endpoint, data);
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.call<T>('DELETE', endpoint);
  }

  postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.call<T>('POST', endpoint, formData);
  }

  putFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.call<T>('PUT', endpoint, formData);
  }
}

export const apiClient = new ApiClient();
