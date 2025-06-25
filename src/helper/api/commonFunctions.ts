import { APIRequestContext, APIResponse } from '@playwright/test';
import { RequestMethodType } from './enums';
import { faker } from '@faker-js/faker';
import { RandomDataGenerator } from '../util/test-data/randomDataGenerator';
import * as staticData from '../util/test-data/apiTestData.json';

/**
 * Parse and replace random placeholders in request body
 * @param body - Request body string with random placeholders
 * @param logger - Optional logger for debugging
 * @returns Processed body string with random values
 */
export function parseRandomBody(body: string, logger?: any): string {
  if (!body || body === 'null' || body === '') {
    return body;
  }

  let processedBody = body;
  
  // Random placeholder patterns and their replacements
  const randomReplacements = {
    // Basic random values
    'RANDOM': () => faker.lorem.word(),
    'RANDOM_STRING': () => faker.lorem.word(),
    'RANDOM_NUMBER': () => faker.number.int({ min: 1, max: 1000 }).toString(),
    'RANDOM_ID': () => faker.number.int({ min: 1, max: 999999 }).toString(),
    
    // User related
    'RANDOM_USERNAME': () => faker.internet.userName().toLowerCase(),
    'RANDOM_PASSWORD': () => faker.internet.password({ length: 12 }),
    'RANDOM_EMAIL': () => faker.internet.email().toLowerCase(),
    'RANDOM_FIRSTNAME': () => faker.person.firstName(),
    'RANDOM_LASTNAME': () => faker.person.lastName(),
    'RANDOM_NAME': () => faker.person.fullName(),
    'RANDOM_PHONE': () => faker.phone.number(),
    'RANDOM_WEBSITE': () => faker.internet.domainName(),
    
    // Address related
    'RANDOM_ADDRESS': () => faker.location.streetAddress(),
    'RANDOM_CITY': () => faker.location.city(),
    'RANDOM_STATE': () => faker.location.state(),
    'RANDOM_COUNTRY': () => faker.location.country(),
    'RANDOM_ZIPCODE': () => faker.location.zipCode(),
    
    // Content related
    'RANDOM_TITLE': () => faker.lorem.sentence(),
    'RANDOM_TEXT': () => faker.lorem.paragraph(),
    'RANDOM_SENTENCE': () => faker.lorem.sentence(),
    'RANDOM_WORD': () => faker.lorem.word(),
    'RANDOM_WORDS': () => faker.lorem.words(3),
    
    // Date and time
    'RANDOM_DATE': () => faker.date.recent().toISOString().split('T')[0],
    'RANDOM_DATETIME': () => faker.date.recent().toISOString(),
    'RANDOM_TIMESTAMP': () => faker.date.recent().getTime().toString(),
    
    // Company related
    'RANDOM_COMPANY': () => faker.company.name(),
    'RANDOM_JOB': () => faker.person.jobTitle(),
    'RANDOM_DEPARTMENT': () => faker.commerce.department(),
    
    // Internet related
    'RANDOM_URL': () => faker.internet.url(),
    'RANDOM_DOMAIN': () => faker.internet.domainName(),
    'RANDOM_IP': () => faker.internet.ip(),
    'RANDOM_UUID': () => faker.string.uuid(),
    
    // Financial
    'RANDOM_PRICE': () => faker.commerce.price(),
    'RANDOM_CURRENCY': () => faker.finance.currencyCode(),
    'RANDOM_ACCOUNT': () => faker.finance.accountNumber(),
    
    // Boolean and choices
    'RANDOM_BOOLEAN': () => faker.datatype.boolean().toString(),
    'RANDOM_STATUS': () => faker.helpers.arrayElement(['active', 'inactive', 'pending']),
    'RANDOM_PRIORITY': () => faker.helpers.arrayElement(['low', 'medium', 'high']),
    
    // Common API values
    'RANDOM_TOKEN': () => faker.string.alphanumeric(32),
    'RANDOM_KEY': () => faker.string.alphanumeric(16),
    'RANDOM_CODE': () => faker.string.alphanumeric(8).toUpperCase()
  };

  // Replace all random placeholders
  for (const [placeholder, generator] of Object.entries(randomReplacements)) {
    const regex = new RegExp(`"${placeholder}"`, 'g');
    const quotedRegex = new RegExp(`'${placeholder}'`, 'g');
    const unquotedRegex = new RegExp(`\\b${placeholder}\\b`, 'g');
    
    if (processedBody.includes(placeholder)) {
      const randomValue = generator();
      
      // Replace quoted placeholders with quoted values
      processedBody = processedBody.replace(regex, `"${randomValue}"`);
      processedBody = processedBody.replace(quotedRegex, `"${randomValue}"`);
      
      // Replace unquoted placeholders (for non-string values)
      if (['RANDOM_NUMBER', 'RANDOM_ID', 'RANDOM_BOOLEAN', 'RANDOM_TIMESTAMP'].includes(placeholder)) {
        processedBody = processedBody.replace(unquotedRegex, randomValue);
      }
    }
  }

  // Special case: replace common field patterns
  const fieldPatterns = {
    '"username"\\s*:\\s*"random"': () => `"username": "${faker.internet.userName().toLowerCase()}"`,
    '"password"\\s*:\\s*"random"': () => `"password": "${faker.internet.password({ length: 12 })}"`,
    '"email"\\s*:\\s*"random"': () => `"email": "${faker.internet.email().toLowerCase()}"`,
    '"name"\\s*:\\s*"random"': () => `"name": "${faker.person.fullName()}"`,
    '"title"\\s*:\\s*"random"': () => `"title": "${faker.lorem.sentence()}"`,
    '"body"\\s*:\\s*"random"': () => `"body": "${faker.lorem.paragraph()}"`,
    '"phone"\\s*:\\s*"random"': () => `"phone": "${faker.phone.number()}"`,
    '"address"\\s*:\\s*"random"': () => `"address": "${faker.location.streetAddress()}"`,
    '"city"\\s*:\\s*"random"': () => `"city": "${faker.location.city()}"`,
    '"company"\\s*:\\s*"random"': () => `"company": "${faker.company.name()}"`,
    '"job"\\s*:\\s*"random"': () => `"job": "${faker.person.jobTitle()}"`,
    '"website"\\s*:\\s*"random"': () => `"website": "${faker.internet.domainName()}"`
  };

  for (const [pattern, replacement] of Object.entries(fieldPatterns)) {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(processedBody)) {
      processedBody = processedBody.replace(regex, replacement());
    }
  }

  // Log the replacement if logger is available
  if (logger && processedBody !== body) {
    logger.info(`Random body transformation applied:`);
    logger.info(`Original: ${body}`);
    logger.info(`Processed: ${processedBody}`);
  }

  return processedBody;
}

/**
 * Parse headers string to object with proper error handling
 * @param headers - Headers string in JSON format
 * @param logger - Optional logger for warning messages
 * @returns Parsed headers object
 */
export function parseHeaders(headers: string, logger?: any): Record<string, string> {
  let headersObj: Record<string, string> = {};
  
  if (headers && headers !== 'null' && headers !== '' && headers !== '{}') {
    try {
      // Handle both single and double quotes
      const normalizedHeaders = headers.replace(/'/g, '"');
      headersObj = JSON.parse(normalizedHeaders);
    } catch (error) {
      const errorMessage = `Failed to parse headers: ${error.message}. Using empty headers.`;
      if (logger) {
        logger.warn(errorMessage);
      } else {
        console.warn(errorMessage);
      }
    }
  }
  
  return headersObj;
}

/**
 * Create authentication headers with Bearer token
 * @param token - Optional token (defaults to env variable or test token)
 * @param additionalHeaders - Optional additional headers to merge
 * @returns Headers object with authentication
 */
export function createAuthHeaders(token?: string, additionalHeaders?: Record<string, string>): Record<string, string> {
  const authToken = token || process.env.API_TOKEN || 'test-token';
  const authHeaders = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
  
  return authHeaders;
}

/**
 * Execute REST API with random body support
 * @param request - Playwright APIRequestContext
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param urlPath - API endpoint URL
 * @param body - Request body with random placeholders
 * @param headers - Optional headers object or string
 * @param logger - Optional logger for debugging
 * @returns Promise<APIResponse>
 */
export async function executeRestApiWithRandomBody(
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  urlPath: string,
  body?: string,
  headers?: string | Record<string, string>,
  logger?: any
): Promise<APIResponse> {
  
  logger?.info(`Executing ${method} request to: ${urlPath} with random body`);
  
  // Parse headers
  let headersObj: Record<string, string> = {};
  if (headers) {
    if (typeof headers === 'string') {
      headersObj = parseHeaders(headers, logger);
    } else {
      headersObj = headers;
    }
  }
  
  // Parse and process random body
  let requestBody: any = {};
  if (body && body !== 'null' && body !== '') {
    const processedBody = parseRandomBody(body, logger);
    try {
      requestBody = JSON.parse(processedBody);
    } catch (error) {
      logger?.warn(`Failed to parse processed body as JSON: ${error.message}`);
      requestBody = {};
    }
  }
  
  // Execute request based on method
  let response: APIResponse;
  const requestOptions: any = { headers: headersObj };
  
  switch (method.toUpperCase()) {
    case 'GET':
      response = await request.get(urlPath, requestOptions);
      break;
      
    case 'POST':
      requestOptions.data = requestBody;
      response = await request.post(urlPath, requestOptions);
      break;
      
    case 'PUT':
      requestOptions.data = requestBody;
      response = await request.put(urlPath, requestOptions);
      break;
      
    case 'DELETE':
      if (Object.keys(requestBody).length > 0) {
        requestOptions.data = requestBody;
      }
      response = await request.delete(urlPath, requestOptions);
      break;
      
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
  
  logger?.info(`${method} request completed with status: ${response.status()}`);
  
  return response;
}

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
  try {
    const headersObj = parseHeaders(headers, world.fixture?.logger);
    let requestBody: any = null;

    // Parse body if provided
    if (body && body !== 'null' && body !== '') {
      try {
        requestBody = JSON.parse(body);
      } catch (error) {
        world.fixture?.logger?.warn(`Failed to parse body as JSON: ${error.message}. Using body as string.`);
        requestBody = body;
      }
    }

    // Execute request based on method type
    let response: APIResponse;
    const requestOptions: any = {
      headers: headersObj
    };

    if (requestBody && methodType !== RequestMethodType.GET && methodType !== RequestMethodType.DELETE) {
      requestOptions.data = requestBody;
    }

    switch (methodType) {
      case RequestMethodType.GET:
        response = await world.fixture.request.get(urlPath, requestOptions);
        break;
      case RequestMethodType.POST:
        response = await world.fixture.request.post(urlPath, requestOptions);
        break;
      case RequestMethodType.PUT:
        response = await world.fixture.request.put(urlPath, requestOptions);
        break;
      case RequestMethodType.DELETE:
        response = await world.fixture.request.delete(urlPath, requestOptions);
        break;
      default:
        throw new Error(`Unsupported method type: ${methodType}`);
    }

    // Parse response
    const contentType = response.headers()['content-type'] || '';
    let responseData: any;

    try {
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else if (response.status() === 204) {
        responseData = {};
      } else {
        responseData = await response.text();
      }
    } catch (error) {
      world.fixture?.logger?.warn(`Failed to parse response: ${error.message}`);
      responseData = {};
    }

    // Store response data if variable name provided
    if (variableName && jsonQuery) {
      try {
        const queryResult = jsonQuery ? eval(`responseData.${jsonQuery}`) : responseData;
        world[variableName] = queryResult;
        world.fixture?.logger?.info(`Stored ${variableName} = ${JSON.stringify(queryResult)}`);
      } catch (error) {
        world.fixture?.logger?.warn(`Failed to extract ${jsonQuery} from response: ${error.message}`);
      }
    }

    // Validate status code if expected
    if (expectedStatusCode) {
      const expectedStatus = parseInt(expectedStatusCode);
      expect(response.status()).toBe(expectedStatus);
      world.fixture?.logger?.info(`Status code validation passed: ${response.status()} === ${expectedStatus}`);
    }

    world.fixture?.logger?.info(`${methodType} request completed with status: ${response.status()}`);
    return response;

  } catch (error) {
    world.fixture?.logger?.error(`API request failed: ${error.message}`);
    throw error;
  }
} 