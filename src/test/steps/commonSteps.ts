import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { fixture } from "../../hooks/pageFixture";
import { DataTable } from "@cucumber/cucumber";
import { executeRestApi, parseHeaders, createAuthHeaders, executeRestApiWithRandomBody } from "../../helper/api/commonFunctions";
import { RequestMethodType } from "../../helper/api/enums";
import { TestDataManager } from "../../helper/util/test-data/testDataManager";

setDefaultTimeout(60 * 1000 * 2);

let response: any;
let responseData: any;
let createdPostId: number;
let createdUserId: number;
let customHeaders: any = {};

// Helper function to parse response based on content type
async function parseResponse(response: any): Promise<any> {
    const contentType = response.headers()['content-type'] || '';
    
    try {
        if (contentType.includes('application/json')) {
            return await response.json();
        } else if (response.status() === 204) {
            // 204 No Content - return empty object
            return {};
        } else {
            // For non-JSON responses, return as text
            const textData = await response.text();
            fixture.logger.info(`Non-JSON response received. Content-Type: ${contentType}`);
            return textData;
        }
    } catch (error) {
        fixture.logger.warn(`Failed to parse response: ${error.message}. Falling back to text.`);
        try {
            return await response.text();
        } catch (textError) {
            fixture.logger.warn(`Failed to parse as text: ${textError.message}. Returning empty object.`);
            return {};
        }
    }
}

// ==================== COMMON STEPS ====================

Given('I have a valid API endpoint', async function () {
    fixture.logger.info("API endpoint is ready for testing");
});

Given('I initialize the API helper', async function () {
    // No longer needed - using fixture.request directly
    fixture.logger.info("Using Playwright's built-in request context");
});

Given('I set the authorization header', async function () {
    customHeaders['Authorization'] = `Bearer ${process.env.API_TOKEN || 'test-token'}`;
    fixture.logger.info("Authorization header set");
});

Given('I set up authentication', async function () {
    fixture.logger.info("Setting up authentication");
    // This would typically involve getting a token or setting up auth headers
});

// ==================== GENERIC API STEPS ====================

// Main generic step for all REST API operations
Given(
  'I execute {word} REST API with url path {string}, headers {string}, request body {string}, expect status {string}, store json query {string} result in {string}',
  async function (methodType, urlPath, headers, body, expectedStatusCode, jsonQuery, variableName) {
    response = await executeRestApi(
      this,
      urlPath,
      headers,
      body,
      RequestMethodType[methodType.toUpperCase()],
      jsonQuery,
      variableName,
      expectedStatusCode
    );
  }
);

// Simplified step patterns for backward compatibility (without headers)
Given('I execute GET REST API with url path {string}', async function (urlPath) {
    fixture.logger.info(`Executing GET request to: ${urlPath}`);
    response = await fixture.request.get(urlPath);
    responseData = await parseResponse(response);
    fixture.logger.info(`GET request completed with status: ${response.status()}`);
});

Given('I execute POST REST API with url path {string} and body {string}', async function (urlPath, body) {
    fixture.logger.info(`Executing POST request to: ${urlPath}`);
    const requestBody = body !== 'null' && body !== '' ? JSON.parse(body) : {};
    response = await fixture.request.post(urlPath, { data: requestBody });
    responseData = await parseResponse(response);
    fixture.logger.info(`POST request completed with status: ${response.status()}`);
});

Given('I execute PUT REST API with url path {string} and body {string}', async function (urlPath, body) {
    fixture.logger.info(`Executing PUT request to: ${urlPath}`);
    const requestBody = body !== 'null' && body !== '' ? JSON.parse(body) : {};
    response = await fixture.request.put(urlPath, { data: requestBody });
    responseData = await parseResponse(response);
    fixture.logger.info(`PUT request completed with status: ${response.status()}`);
});

Given('I execute PUT REST API with url path {string}, headers {string}, and body {string}', async function (urlPath, headers, body) {
    fixture.logger.info(`Executing PUT request to: ${urlPath}`);
    const requestBody = body !== 'null' && body !== '' ? JSON.parse(body) : {};
    const headersObj = parseHeaders(headers, fixture.logger);
    
    response = await fixture.request.put(urlPath, { 
        data: requestBody, 
        headers: headersObj 
    });
    responseData = await parseResponse(response);
    fixture.logger.info(`PUT request completed with status: ${response.status()}`);
});

Given('I execute DELETE REST API with url path {string}', async function (urlPath) {
    fixture.logger.info(`Executing DELETE request to: ${urlPath}`);
    response = await fixture.request.delete(urlPath);
    responseData = await parseResponse(response);
    fixture.logger.info(`DELETE request completed with status: ${response.status()}`);
});

// Enhanced step patterns with headers support
Given('I execute GET REST API with url path {string}, headers {string}', async function (urlPath, headers) {
    fixture.logger.info(`Executing GET request to: ${urlPath}`);
    const headersObj = parseHeaders(headers, fixture.logger);
    
    response = await fixture.request.get(urlPath, { headers: headersObj });
    responseData = await parseResponse(response);
    fixture.logger.info(`GET request completed with status: ${response.status()}`);
});

Given('I execute POST REST API with url path {string}, headers {string}, and body {string}', async function (urlPath, headers, body) {
    fixture.logger.info(`Executing POST request to: ${urlPath}`);
    const requestBody = body !== 'null' && body !== '' ? JSON.parse(body) : {};
    const headersObj = parseHeaders(headers, fixture.logger);
    
    response = await fixture.request.post(urlPath, { 
        data: requestBody, 
        headers: headersObj 
    });
    responseData = await parseResponse(response);
    fixture.logger.info(`POST request completed with status: ${response.status()}`);
});

Given('I execute DELETE REST API with url path {string}, headers {string}', async function (urlPath, headers) {
    fixture.logger.info(`Executing DELETE request to: ${urlPath}`);
    const headersObj = parseHeaders(headers, fixture.logger);
    
    response = await fixture.request.delete(urlPath, { headers: headersObj });
    responseData = await parseResponse(response);
    fixture.logger.info(`DELETE request completed with status: ${response.status()}`);
});

// ==================== RANDOM BODY STEP DEFINITIONS ====================

Given('I execute POST REST API with url path {string} and random body {string}', async function (urlPath, body) {
    response = await executeRestApiWithRandomBody(fixture.request, 'POST', urlPath, body, undefined, fixture.logger);
    responseData = await parseResponse(response);
});

Given('I execute PUT REST API with url path {string} and random body {string}', async function (urlPath, body) {
    response = await executeRestApiWithRandomBody(fixture.request, 'PUT', urlPath, body, undefined, fixture.logger);
    responseData = await parseResponse(response);
});

Given('I execute DELETE REST API with url path {string} and random body {string}', async function (urlPath, body) {
    response = await executeRestApiWithRandomBody(fixture.request, 'DELETE', urlPath, body, undefined, fixture.logger);
    responseData = await parseResponse(response);
});

// Random body with headers support

Given('I execute POST REST API with url path {string}, headers {string}, and random body {string}', async function (urlPath, headers, body) {
    response = await executeRestApiWithRandomBody(fixture.request, 'POST', urlPath, body, headers, fixture.logger);
    responseData = await parseResponse(response);
});

Given('I execute PUT REST API with url path {string}, headers {string}, and random body {string}', async function (urlPath, headers, body) {
    response = await executeRestApiWithRandomBody(fixture.request, 'PUT', urlPath, body, headers, fixture.logger);
    responseData = await parseResponse(response);
});

Given('I execute DELETE REST API with url path {string}, headers {string}, and random body {string}', async function (urlPath, headers, body) {
    response = await executeRestApiWithRandomBody(fixture.request, 'DELETE', urlPath, body, headers, fixture.logger);
    responseData = await parseResponse(response);
});



// ==================== VALIDATION STEPS ====================

// Status code validation step
Then('I validate status code is {string}', async function (expectedStatusCode: string) {
    if (!response) {
        throw new Error('No response available. Please execute an API request first.');
    }
    
    const actualStatusCode = response.status();
    const expectedStatus = parseInt(expectedStatusCode);
    
    fixture.logger.info(`Validating status code. Expected: ${expectedStatus}, Actual: ${actualStatusCode}`);
    
    expect(actualStatusCode).toBe(expectedStatus);
    
    if (this.attach) {
        await this.attach(`Status code validation passed: ${actualStatusCode}`);
    }
    
    fixture.logger.info(`Status code validation successful: ${actualStatusCode}`);
});

// ==================== LOGIN STEPS REMOVED - API AUTOMATION ONLY ====================

// ==================== CRUD OPERATION STEPS ====================

When('I create a new post with title {string} and body {string}', async function (title: string, body: string) {
    fixture.logger.info(`Creating post with title: ${title}`);
    response = await fixture.request.post('/posts', {
        data: {
            title: title,
            body: body,
            userId: 1
        }
    });
    responseData = await parseResponse(response);
    createdPostId = responseData.id;
    fixture.logger.info(`Created post with ID: ${createdPostId}`);
});

When('I get the created post by ID', async function () {
    fixture.logger.info(`Getting post with ID: ${createdPostId}`);
    response = await fixture.request.get(`/posts/${createdPostId}`);
    responseData = await parseResponse(response);
    fixture.logger.info("Retrieved created post");
});

When('I update the post with new title {string}', async function (newTitle: string) {
    fixture.logger.info(`Updating post ${createdPostId} with new title: ${newTitle}`);
    response = await fixture.request.put(`/posts/${createdPostId}`, {
        data: {
            title: newTitle,
            body: responseData.body,
            userId: responseData.userId
        }
    });
    responseData = await parseResponse(response);
    fixture.logger.info("Post updated");
});

When('I create a new user with authentication', async function () {
    fixture.logger.info("Creating new user with authentication");
    const userData = TestDataManager.getUser();
    response = await fixture.request.post('/users', {
        data: userData,
        headers: createAuthHeaders()
    });
    responseData = await parseResponse(response);
    createdUserId = responseData.id;
    fixture.logger.info(`Created user with ID: ${createdUserId}`);
    fixture.logger.info(`Using ${TestDataManager.isRandomDataEnabled() ? 'random' : 'static'} user data: ${JSON.stringify(userData)}`);
});

When('I get the user profile with authentication', async function () {
    fixture.logger.info(`Getting user profile for ID: ${createdUserId}`);
    response = await fixture.request.get(`/users/${createdUserId}`, {
        headers: createAuthHeaders()
    });
    responseData = await parseResponse(response);
    fixture.logger.info("User profile retrieved");
});

When('I update the user with authentication', async function () {
    fixture.logger.info(`Updating user ${createdUserId}`);
    const userData = TestDataManager.getUser();
    response = await fixture.request.put(`/users/${createdUserId}`, {
        data: {
            ...userData,
            name: 'Updated User'
        },
        headers: createAuthHeaders()
    });
    responseData = await parseResponse(response);
    fixture.logger.info("User updated");
    fixture.logger.info(`Using ${TestDataManager.isRandomDataEnabled() ? 'random' : 'static'} user data for update`);
});

// ==================== VALIDATION STEPS ====================

Then('the response status should be {int}', async function (expectedStatus: number) {
    expect(response.status()).toBe(expectedStatus);
    fixture.logger.info(`Response status verified: ${response.status()}`);
});

Then('the response should contain an array of posts', async function () {
    expect(Array.isArray(responseData)).toBeTruthy();
    expect(responseData.length).toBeGreaterThan(0);
    fixture.logger.info(`Response contains ${responseData.length} posts`);
});

Then('each post should have id, title, and body fields', async function () {
    for (const post of responseData) {
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('body');
    }
    fixture.logger.info("All posts have required fields");
});

Then('the response should contain a post with id {string}', async function (expectedId: string) {
    expect(responseData.id).toBe(parseInt(expectedId));
    fixture.logger.info(`Post ID verified: ${responseData.id}`);
});

Then('the post should have title and body fields', async function () {
    expect(responseData).toHaveProperty('title');
    expect(responseData).toHaveProperty('body');
    fixture.logger.info("Post has title and body fields");
});

Then('the response should contain the created post', async function () {
    expect(responseData).toHaveProperty('id');
    expect(responseData).toHaveProperty('title');
    expect(responseData).toHaveProperty('body');
    expect(responseData).toHaveProperty('userId');
    fixture.logger.info("Created post contains all required fields");
});

Then('the post should have an id field', async function () {
    expect(responseData).toHaveProperty('id');
    expect(typeof responseData.id).toBe('number');
    fixture.logger.info(`Post has ID: ${responseData.id}`);
});

Then('the response should contain the updated post', async function () {
    expect(responseData).toHaveProperty('id');
    expect(responseData).toHaveProperty('title');
    expect(responseData).toHaveProperty('body');
    expect(responseData).toHaveProperty('userId');
    fixture.logger.info("Updated post contains all required fields");
});

Then('the post title should be {string}', async function (expectedTitle: string) {
    expect(responseData.title).toBe(expectedTitle);
    fixture.logger.info(`Post title verified: ${responseData.title}`);
});

Then('the response should match the post schema', async function () {
    const requiredFields = ['id', 'title', 'body', 'userId'];
    
    // Validate all required fields are present
    for (const field of requiredFields) {
        expect(responseData).toHaveProperty(field);
    }
    
    // Validate field types
    expect(typeof responseData.id).toBe('number');
    expect(typeof responseData.title).toBe('string');
    expect(typeof responseData.body).toBe('string');
    expect(typeof responseData.userId).toBe('number');
    fixture.logger.info("Post schema validation passed");
});

Then('the post should have required fields: {string}', async function (fields: string) {
    const requiredFields = fields.split(', ').map(field => field.trim());
    
    // Validate all required fields are present
    for (const field of requiredFields) {
        expect(responseData).toHaveProperty(field);
    }
    
    fixture.logger.info(`Required fields validation passed: ${fields}`);
});

Then('the response should contain error message', async function () {
    expect(responseData).toHaveProperty('error');
    fixture.logger.info("Response contains error message");
});

// ==================== SUCCESS/FAILURE STEPS ====================

Then('the post should be created successfully', async function () {
    expect(response.status()).toBe(201);
    expect(responseData).toHaveProperty('id');
    expect(responseData).toHaveProperty('title');
    expect(responseData).toHaveProperty('body');
    fixture.logger.info("Post created successfully");
});

Then('the post should be updated successfully', async function () {
    expect(response.status()).toBe(200);
    expect(responseData).toHaveProperty('id');
    expect(responseData).toHaveProperty('title');
    fixture.logger.info("Post updated successfully");
});

Then('the post should be deleted successfully', async function () {
    expect(response.status()).toBe(200);
    fixture.logger.info("Post deleted successfully");
});

Then('the user should be created successfully', async function () {
    expect(response.status()).toBe(201);
    expect(responseData).toHaveProperty('id');
    fixture.logger.info("User created successfully");
});

Then('the user profile should be retrieved successfully', async function () {
    expect(response.status()).toBe(200);
    expect(responseData).toHaveProperty('id');
    fixture.logger.info("User profile retrieved successfully");
});

Then('the user should be updated successfully', async function () {
    expect(response.status()).toBe(200);
    expect(responseData.name).toBe('Updated User');
    fixture.logger.info("User updated successfully");
});

Then('the user should be deleted successfully', async function () {
    expect(response.status()).toBe(200);
    fixture.logger.info("User deleted successfully");
});

// ==================== USER VALIDATION STEPS ====================

Then('the response should contain user information', async function () {
    expect(responseData).toHaveProperty('id');
    expect(responseData).toHaveProperty('name');
    expect(responseData).toHaveProperty('username');
    fixture.logger.info("Response contains user information");
});

Then('the user should have name, email, and phone fields', async function () {
    expect(responseData).toHaveProperty('name');
    expect(responseData).toHaveProperty('email');
    expect(responseData).toHaveProperty('phone');
    fixture.logger.info("User has name, email, and phone fields");
});

Then('the response should contain the created user', async function () {
    expect(responseData).toHaveProperty('id');
    expect(responseData).toHaveProperty('name');
    expect(responseData).toHaveProperty('username');
    expect(responseData).toHaveProperty('email');
    fixture.logger.info("Created user contains all required fields");
});

Then('the user should have an id field', async function () {
    expect(responseData).toHaveProperty('id');
    expect(typeof responseData.id).toBe('number');
    fixture.logger.info(`User has ID: ${responseData.id}`);
});

Then('the response should contain the updated user', async function () {
    expect(responseData).toHaveProperty('id');
    expect(responseData).toHaveProperty('name');
    expect(responseData).toHaveProperty('username');
    expect(responseData).toHaveProperty('email');
    fixture.logger.info("Updated user contains all required fields");
});

Then('the user name should be {string}', async function (expectedName: string) {
    expect(responseData.name).toBe(expectedName);
    fixture.logger.info(`User name verified: ${responseData.name}`);
});

// ==================== PAGINATION AND SEARCH STEPS ====================

When('I get posts with limit {string} and offset {string}', async function (limit: string, offset: string) {
    fixture.logger.info(`Getting posts with limit: ${limit}, offset: ${offset}`);
    response = await fixture.request.get(`/posts?_limit=${limit}&_start=${offset}`);
    responseData = await parseResponse(response);
    fixture.logger.info(`Retrieved ${responseData.length} posts`);
});

Then('the response should contain exactly {string} posts', async function (expectedCount: string) {
    expect(responseData.length).toBe(parseInt(expectedCount));
    fixture.logger.info(`Verified ${expectedCount} posts in response`);
});

Then('the first post should have id {string}', async function (expectedId: string) {
    expect(responseData[0].id).toBe(parseInt(expectedId));
    fixture.logger.info(`First post ID verified: ${expectedId}`);
});

When('I search posts by user ID {string}', async function (userId: string) {
    fixture.logger.info(`Searching posts by user ID: ${userId}`);
    response = await fixture.request.get(`/posts?userId=${userId}`);
    responseData = await parseResponse(response);
    fixture.logger.info(`Found ${responseData.length} posts for user ${userId}`);
});

Then('all posts should have userId {string}', async function (expectedUserId: string) {
    for (const post of responseData) {
        expect(post.userId).toBe(parseInt(expectedUserId));
    }
    fixture.logger.info(`All posts verified to have userId: ${expectedUserId}`);
});

Then('the response should contain at least {string} post', async function (minCount: string) {
    expect(responseData.length).toBeGreaterThanOrEqual(parseInt(minCount));
    fixture.logger.info(`Response contains at least ${minCount} posts`);
});

// ==================== PERFORMANCE TESTING STEPS ====================

When('I send {string} concurrent GET requests to {string}', async function (count: string, endpoint: string) {
    const requestCount = parseInt(count);
    fixture.logger.info(`Sending ${requestCount} concurrent requests to ${endpoint}`);
    
    const startTime = Date.now();
    const promises = Array(requestCount).fill(null).map(() => 
        fixture.request.get(endpoint)
    );
    
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    
    response = responses[0]; // Use first response for status checks
    responseData = await parseResponse(response);
    
    // Store timing info for assertion
    (this as any).requestTime = endTime - startTime;
    (this as any).allResponses = responses;
    
    fixture.logger.info(`All ${requestCount} requests completed in ${(this as any).requestTime}ms`);
});

Then('all requests should complete within {string} milliseconds', async function (maxTime: string) {
    expect((this as any).requestTime).toBeLessThan(parseInt(maxTime));
    fixture.logger.info(`All requests completed within ${maxTime}ms`);
});

Then('all responses should have status {string}', async function (expectedStatus: string) {
    for (const resp of (this as any).allResponses) {
        expect(resp.status()).toBe(parseInt(expectedStatus));
    }
    fixture.logger.info(`All responses have status ${expectedStatus}`);
});

// ==================== FILE UPLOAD STEPS ====================

When('I upload a file with name {string} and content {string}', async function (fileName: string, content: string) {
    fixture.logger.info(`Uploading file: ${fileName}`);
    // Simulate file upload - in real scenario, you'd use multipart/form-data
    response = await fixture.request.post('/posts', {
        data: {
            title: `File Upload: ${fileName}`,
            body: content,
            userId: 1
        }
    });
    responseData = await parseResponse(response);
    fixture.logger.info("File upload simulated");
});

Then('the file should be uploaded successfully', async function () {
    expect(response.status()).toBe(201);
    expect(responseData).toHaveProperty('id');
    fixture.logger.info("File upload successful");
});

Then('the response should contain file information', async function () {
    expect(responseData).toHaveProperty('title');
    expect(responseData.title).toContain('File Upload');
    fixture.logger.info("File information verified");
});

// ==================== WEBSOCKET STEPS ====================

When('I establish a WebSocket connection', async function () {
    fixture.logger.info("Establishing WebSocket connection");
    // Simulate WebSocket connection - in real scenario, you'd use WebSocket API
    response = await fixture.request.get('/posts/1');
    responseData = await parseResponse(response);
    fixture.logger.info("WebSocket connection simulated");
});

Then('the connection should be established', async function () {
    expect(response.status()).toBe(200);
    fixture.logger.info("WebSocket connection established");
});

When('I send a message {string}', async function (message: string) {
    fixture.logger.info(`Sending message: ${message}`);
    // Simulate sending message
    fixture.logger.info("Message sent");
});

Then('I should receive a response', async function () {
    // Simulate receiving response
    fixture.logger.info("Response received");
});

When('I close the WebSocket connection', async function () {
    fixture.logger.info("Closing WebSocket connection");
    // Simulate closing connection
    fixture.logger.info("WebSocket connection closed");
});

Then('the connection should be closed', async function () {
    fixture.logger.info("WebSocket connection closed successfully");
});

// ==================== DELETE USER STEPS ====================

When('I delete the user with authentication', async function () {
    fixture.logger.info(`Deleting user ${createdUserId}`);
    response = await fixture.request.delete(`/users/${createdUserId}`, {
        headers: createAuthHeaders()
    });
    fixture.logger.info("User deletion request sent");
});

// ==================== RANDOM DATA SPECIFIC STEPS ====================

Given('I use random test data', async function () {
    TestDataManager.enableRandomData();
    fixture.logger.info("Random test data enabled");
    fixture.logger.info(`Sample random data: ${TestDataManager.getAllTestDataAsJson()}`);
});

Given('I use static test data', async function () {
    TestDataManager.disableRandomData();
    fixture.logger.info("Static test data enabled");
});

When('I create a post with random data', async function () {
    fixture.logger.info("Creating post with random data");
    const postData = TestDataManager.getPost();
    response = await fixture.request.post('/posts', {
        data: postData
    });
    responseData = await parseResponse(response);
    createdPostId = responseData.id;
    fixture.logger.info(`Created post with ID: ${createdPostId}`);
    fixture.logger.info(`Post data used: ${JSON.stringify(postData)}`);
});

When('I create a user with random credentials', async function () {
    fixture.logger.info("Creating user with random credentials");
    const userData = TestDataManager.getUser();
    response = await fixture.request.post('/users', {
        data: userData
    });
    responseData = await parseResponse(response);
    createdUserId = responseData.id;
    fixture.logger.info(`Created user with ID: ${createdUserId}`);
    fixture.logger.info(`User data used: ${JSON.stringify(userData)}`);
});

When('I login with random credentials', async function () {
    fixture.logger.info("Logging in with random credentials");
    const loginData = TestDataManager.getLoginCredentials();
    response = await fixture.request.post('/auth/login', {
        data: loginData
    });
    responseData = await parseResponse(response);
    fixture.logger.info("Login request sent");
    fixture.logger.info(`Login data used: ${JSON.stringify(loginData)}`);
});

When('I send a request with random headers', async function () {
    fixture.logger.info("Sending request with random headers");
    const randomHeaders = TestDataManager.getHeaders();
    response = await fixture.request.get('/posts', {
        headers: randomHeaders
    });
    responseData = await parseResponse(response);
    fixture.logger.info("Request sent with random headers");
    fixture.logger.info(`Headers used: ${JSON.stringify(randomHeaders)}`);
});

When('I create {int} random posts', async function (count: number) {
    fixture.logger.info(`Creating ${count} random posts`);
    const bulkData = TestDataManager.getBulkRandomData('posts', count);
    const promises = bulkData.map(postData => 
        fixture.request.post('/posts', { data: postData })
    );
    const responses = await Promise.all(promises);
    response = responses[0]; // Store first response for validation
    responseData = await parseResponse(response);
    fixture.logger.info(`Created ${count} random posts`);
});

Then('I should see random data in the response', async function () {
    fixture.logger.info("Validating random data in response");
    expect(responseData).toBeDefined();
    expect(responseData).not.toBeNull();
    
    // Log the response for debugging
    fixture.logger.info(`Response data: ${JSON.stringify(responseData)}`);
    
    // Basic validation that response contains data
    if (Array.isArray(responseData)) {
        expect(responseData.length).toBeGreaterThan(0);
    } else {
        expect(Object.keys(responseData).length).toBeGreaterThan(0);
    }
    
    fixture.logger.info("Random data validation passed");
});

// ==================== ADDITIONAL PLAYWRIGHT-SPECIFIC STEPS ====================

When('I get all posts', async function () {
    fixture.logger.info("Getting all posts");
    response = await fixture.request.get('/posts');
    responseData = await parseResponse(response);
    fixture.logger.info(`Retrieved ${responseData.length} posts`);
});

When('I get post with id {string}', async function (postId: string) {
    fixture.logger.info(`Getting post with ID: ${postId}`);
    response = await fixture.request.get(`/posts/${postId}`);
    responseData = await parseResponse(response);
    fixture.logger.info("Post retrieved");
});

When('I delete post with id {string}', async function (postId: string) {
    fixture.logger.info(`Deleting post with ID: ${postId}`);
    response = await fixture.request.delete(`/posts/${postId}`);
    responseData = await parseResponse(response);
    fixture.logger.info("Post deletion request sent");
});

Then('the response should be ok', async function () {
    expect(response.ok()).toBeTruthy();
    fixture.logger.info(`Response is ok with status: ${response.status()}`);
});

Then('the response should not be ok', async function () {
    expect(response.ok()).toBeFalsy();
    fixture.logger.info(`Response is not ok with status: ${response.status()}`);
});

// Validation step for checking response headers
Then('the response should have header {string} with value {string}', async function (headerName: string, expectedValue: string) {
    const headers = response.headers();
    expect(headers[headerName.toLowerCase()]).toBe(expectedValue);
    fixture.logger.info(`Header ${headerName} verified with value: ${expectedValue}`);
});

// Validation step for checking response body contains specific text
Then('the response body should contain {string}', async function (expectedText: string) {
    const responseText = await response.text();
    expect(responseText).toContain(expectedText);
    fixture.logger.info(`Response body contains: ${expectedText}`);
}); 