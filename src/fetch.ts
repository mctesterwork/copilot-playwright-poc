import {APIRequestContext} from '@playwright/test';

type RequestConfig = {
  url: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';
  data?: any;
  params?: {[key: string]: string | number | boolean};
  headers?: {[key: string]: string};
};

type ResponseConfig<ResponseData = unknown> = {
  data?: ResponseData;
  status: number;
  statusText: string;
  headers: {
    [key: string]: string;
  };
};

export const fetch = async <ResponseData>(
  request: APIRequestContext,
  requestConfig: RequestConfig,
): Promise<ResponseConfig<ResponseData>> => {
  const response = await request.fetch(requestConfig.url, {
    method: requestConfig.method,
    data: requestConfig.data,
    params: requestConfig.params,
    headers: requestConfig.headers,
  });

  const json = await (async () => {
    let result;
    try {
      result = await response.json();
    } catch {}
    return result;
  })();

  const result: ResponseConfig<ResponseData> = {
    data: json,
    status: response.status(),
    statusText: response.statusText(),
    headers: response.headers(),
  };

  return result;
};
