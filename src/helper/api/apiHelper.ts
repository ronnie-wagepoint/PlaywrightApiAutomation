import { APIRequestContext, APIResponse } from '@playwright/test';

// Configuration interfaces and data (moved from apiConfig.ts)
export interface ApiConfig {
    baseURL: string;
    headers: Record<string, string>;
    timeout: number;
    retries: number;
}

export const apiConfig: ApiConfig = {
    baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Playwright-API-Test'
    },
    timeout: 30000,
    retries: 3
};

export const endpoints = {
    posts: '/posts',
    users: '/users',
    comments: '/comments',
    albums: '/albums',
    photos: '/photos',
    todos: '/todos'
};

export const authConfig = {
    token: process.env.API_TOKEN || 'test-token',
    username: process.env.API_USERNAME || 'testuser',
    password: process.env.API_PASSWORD || 'testpass'
};

export const testData = {
    validPost: {
        title: 'Test Post',
        body: 'This is a test post body',
        userId: 1
    },
    validUser: {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@test.com',
        phone: '1234567890'
    }
};

// ApiHelper class
export class ApiHelper {
    private request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    /**
     * Send GET request
     */
    async get(endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
        const url = endpoint.startsWith('http') ? endpoint : `${apiConfig.baseURL}${endpoint}`;
        return await this.request.get(url, {
            headers: { ...apiConfig.headers, ...headers },
            timeout: apiConfig.timeout
        });
    }

    /**
     * Send POST request
     */
    async post(endpoint: string, data: any, headers?: Record<string, string>): Promise<APIResponse> {
        const url = endpoint.startsWith('http') ? endpoint : `${apiConfig.baseURL}${endpoint}`;
        return await this.request.post(url, {
            headers: { ...apiConfig.headers, ...headers },
            data: data,
            timeout: apiConfig.timeout
        });
    }

    /**
     * Send PUT request
     */
    async put(endpoint: string, data: any, headers?: Record<string, string>): Promise<APIResponse> {
        const url = endpoint.startsWith('http') ? endpoint : `${apiConfig.baseURL}${endpoint}`;
        return await this.request.put(url, {
            headers: { ...apiConfig.headers, ...headers },
            data: data,
            timeout: apiConfig.timeout
        });
    }

    /**
     * Send DELETE request
     */
    async delete(endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
        const url = endpoint.startsWith('http') ? endpoint : `${apiConfig.baseURL}${endpoint}`;
        return await this.request.delete(url, {
            headers: { ...apiConfig.headers, ...headers },
            timeout: apiConfig.timeout
        });
    }

    /**
     * Send PATCH request
     */
    async patch(endpoint: string, data: any, headers?: Record<string, string>): Promise<APIResponse> {
        const url = endpoint.startsWith('http') ? endpoint : `${apiConfig.baseURL}${endpoint}`;
        return await this.request.patch(url, {
            headers: { ...apiConfig.headers, ...headers },
            data: data,
            timeout: apiConfig.timeout
        });
    }

    /**
     * Get authorization headers
     */
    getAuthHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer ${authConfig.token}`
        };
    }

    /**
     * Get basic auth headers
     */
    getBasicAuthHeaders(): Record<string, string> {
        const credentials = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString('base64');
        return {
            'Authorization': `Basic ${credentials}`
        };
    }

    /**
     * Validate response status
     */
    validateStatus(response: APIResponse, expectedStatus: number): boolean {
        return response.status() === expectedStatus;
    }

    /**
     * Validate response contains required fields
     */
    validateResponseFields(responseData: any, requiredFields: string[]): boolean {
        return requiredFields.every(field => responseData.hasOwnProperty(field));
    }

    /**
     * Retry request with exponential backoff
     */
    async retryRequest<T>(
        requestFn: () => Promise<T>,
        maxRetries: number = apiConfig.retries
    ): Promise<T> {
        let lastError: Error;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error as Error;
                if (attempt === maxRetries) {
                    throw lastError;
                }
                // Exponential backoff: wait 2^attempt * 1000ms
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
        
        throw lastError!;
    }

    /**
     * Wait for response with polling
     */
    async waitForResponse(
        endpoint: string,
        expectedStatus: number,
        maxWaitTime: number = 30000,
        pollInterval: number = 1000
    ): Promise<APIResponse> {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            const response = await this.get(endpoint);
            if (response.status() === expectedStatus) {
                return response;
            }
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        
        throw new Error(`Timeout waiting for response with status ${expectedStatus}`);
    }
} 