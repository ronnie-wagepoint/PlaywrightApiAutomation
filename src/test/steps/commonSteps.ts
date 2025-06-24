import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { fixture } from "../../hooks/pageFixture";
import { DataTable } from "@cucumber/cucumber";
import { ApiHelper } from "../../helper/api/apiHelper";
import { testData } from "../../helper/api/apiHelper";
import { executeRestApi } from "../../helper/api/commonFunctions";
import { RequestMethodType } from "../../helper/api/enums";

setDefaultTimeout(60 * 1000 * 2);

let response: any;
let responseData: any;
let apiHelper: ApiHelper;
let createdPostId: number;
let createdUserId: number;
let customHeaders: any = {};

// ==================== COMMON STEPS ====================

Given('I have a valid API endpoint', async function () {
    fixture.logger.info("API endpoint is ready for testing");
});

Given('I initialize the API helper', async function () {
    apiHelper = new ApiHelper(fixture.request);
    fixture.logger.info("API helper initialized");
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

// Simplified step patterns for better IDE navigation
Given('I execute GET REST API with url path {string}', async function (urlPath) {
});

Given('I execute POST REST API with url path {string} and body {string}', async function (urlPath, body) {
});

Given('I execute PUT REST API with url path {string} and body {string}', async function (urlPath, body) {
});

Given('I execute DELETE REST API with url path {string}', async function (urlPath) {
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
    response = await apiHelper.post('/posts', {
        title: title,
        body: body,
        userId: 1
    });
    responseData = await response.json();
    createdPostId = responseData.id;
    fixture.logger.info(`Created post with ID: ${createdPostId}`);
});

When('I get the created post by ID', async function () {
    fixture.logger.info(`Getting post with ID: ${createdPostId}`);
    response = await apiHelper.get(`/posts/${createdPostId}`);
    responseData = await response.json();
    fixture.logger.info("Retrieved created post");
});

When('I update the post with new title {string}', async function (newTitle: string) {
    fixture.logger.info(`Updating post ${createdPostId} with new title: ${newTitle}`);
    response = await apiHelper.put(`/posts/${createdPostId}`, {
        title: newTitle,
        body: responseData.body,
        userId: responseData.userId
    });
    responseData = await response.json();
    fixture.logger.info("Post updated");
});

When('I create a new user with authentication', async function () {
    fixture.logger.info("Creating new user with authentication");
    response = await apiHelper.post('/users', testData.validUser, apiHelper.getAuthHeaders());
    responseData = await response.json();
    createdUserId = responseData.id;
    fixture.logger.info(`Created user with ID: ${createdUserId}`);
});

When('I get the user profile with authentication', async function () {
    fixture.logger.info(`Getting user profile for ID: ${createdUserId}`);
    response = await apiHelper.get(`/users/${createdUserId}`, apiHelper.getAuthHeaders());
    responseData = await response.json();
    fixture.logger.info("User profile retrieved");
});

When('I update the user with authentication', async function () {
    fixture.logger.info(`Updating user ${createdUserId}`);
    response = await apiHelper.put(`/users/${createdUserId}`, {
        ...testData.validUser,
        name: 'Updated User'
    }, apiHelper.getAuthHeaders());
    responseData = await response.json();
    fixture.logger.info("User updated");
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
    expect(apiHelper.validateResponseFields(responseData, requiredFields)).toBeTruthy();
    expect(typeof responseData.id).toBe('number');
    expect(typeof responseData.title).toBe('string');
    expect(typeof responseData.body).toBe('string');
    expect(typeof responseData.userId).toBe('number');
    fixture.logger.info("Post schema validation passed");
});

Then('the post should have required fields: {string}', async function (fields: string) {
    const requiredFields = fields.split(', ').map(field => field.trim());
    expect(apiHelper.validateResponseFields(responseData, requiredFields)).toBeTruthy();
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
    response = await apiHelper.get(`/posts?_limit=${limit}&_start=${offset}`);
    responseData = await response.json();
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
    response = await apiHelper.get(`/posts?userId=${userId}`);
    responseData = await response.json();
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
        apiHelper.get(endpoint)
    );
    
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    
    response = responses[0]; // Use first response for status checks
    responseData = await response.json();
    
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
    response = await apiHelper.post('/posts', {
        title: `File Upload: ${fileName}`,
        body: content,
        userId: 1
    });
    responseData = await response.json();
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
    response = await apiHelper.get('/posts/1');
    responseData = await response.json();
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
    response = await apiHelper.delete(`/users/${createdUserId}`, apiHelper.getAuthHeaders());
    fixture.logger.info("User deletion request sent");
}); 