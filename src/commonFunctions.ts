import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { RequestMethodType } from './helper/api/enums';

/**
 * Generic REST API executor for Playwright
 */
export async function executeRestApi(
  world: any,
  urlPath: string,
  headers: string,
  body: string,
  methodType: RequestMethodType,
  jsonQuery?: string,
  variableName?: string,
  expectedStatusCode?: string,
  isFormData?: boolean
): Promise<APIResponse | undefined> {
  // Parse headers and body
  let parsedHeaders: Record<string, string> = {};
  let parsedBody: any = {};
  try {
    parsedHeaders = headers && headers !== '{}' ? JSON.parse(headers.replace(/'/g, '"')) : {};
  } catch (e) {
    throw new Error(`Invalid headers JSON: ${headers}`);
  }
  try {
    parsedBody = body && body !== '{}' ? JSON.parse(body.replace(/'/g, '"')) : {};
  } catch (e) {
    parsedBody = body; // fallback to raw string
  }

  // Use Playwright's request context
  const request: APIRequestContext = world.fixture?.request || world.request;
  if (!request) throw new Error('Playwright APIRequestContext not found in world.');

  let response: APIResponse | undefined;
  let requestOptions: any = { headers: parsedHeaders };
  if (!isFormData && (methodType === RequestMethodType.POST || methodType === RequestMethodType.PUT || methodType === RequestMethodType.PATCH)) {
    requestOptions.data = parsedBody;
  }
  if (isFormData) {
    // For form-data, use multipart/form-data
    requestOptions.multipart = parsedBody;
  }

  // Send request
  switch (methodType) {
    case RequestMethodType.GET:
      response = await request.get(urlPath, requestOptions);
      break;
    case RequestMethodType.POST:
      response = await request.post(urlPath, requestOptions);
      break;
    case RequestMethodType.PUT:
      response = await request.put(urlPath, requestOptions);
      break;
    case RequestMethodType.DELETE:
      response = await request.delete(urlPath, requestOptions);
      break;
    case RequestMethodType.PATCH:
      response = await request.patch(urlPath, requestOptions);
      break;
    default:
      throw new Error(`Unsupported HTTP method: ${methodType}`);
  }

  // Attach response status
  if (world.attach) {
    await world.attach(`Response status code: ${response.status()}`);
  }

  // Status code validation
  if (expectedStatusCode && response.status() !== parseInt(expectedStatusCode)) {
    throw new Error(`Expected status code ${expectedStatusCode}, got ${response.status()}`);
  }

  // Store variable if needed
  if (variableName) {
    const responseBody = await response.json();
    // Optionally, apply jsonQuery (not implemented here, but you can use jsonata or lodash.get)
    world[variableName] = responseBody;
  }

  return response;
} 