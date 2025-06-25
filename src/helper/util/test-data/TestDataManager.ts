import * as staticData from './apiTestData.json';
import { faker } from '@faker-js/faker';

/**
 * Test Data Manager
 * Handles both static data from JSON files and random data generation
 */
export class TestDataManager {
    private static useRandomData: boolean = false;
    private static randomDataCache: any = {};

    // ==================== CORE MANAGEMENT METHODS ====================

    /**
     * Enable random data generation for tests with @randomTestData tag
     */
    static enableRandomData() {
        this.useRandomData = true;
        this.generateRandomDataCache();
    }

    /**
     * Disable random data generation (use static data)
     */
    static disableRandomData() {
        this.useRandomData = false;
        this.randomDataCache = {};
    }

    /**
     * Check if random data is enabled
     */
    static isRandomDataEnabled(): boolean {
        return this.useRandomData;
    }

    /**
     * Generate and cache random data
     */
    private static generateRandomDataCache() {
        this.randomDataCache = this.generateRandomTestScenarios();
    }

    /**
     * Helper method to get data (static or random)
     */
    private static getData<T>(
        staticPath: string,
        randomKey: string,
        fallbackGenerator?: () => T
    ): T {
        if (this.useRandomData) {
            return fallbackGenerator ? fallbackGenerator() : this.randomDataCache[randomKey];
        }
        
        // Navigate to static data using path (e.g., "users.validUser")
        const pathParts = staticPath.split('.');
        let data: any = staticData;
        for (const part of pathParts) {
            data = data[part];
        }
        return data;
    }

    // ==================== DATA GETTER METHODS ====================

    /**
     * Get user data (static or random)
     */
    static getUser(type: 'valid' | 'invalid' = 'valid') {
        if (this.useRandomData) {
            return type === 'valid' 
                ? this.randomDataCache.validUser 
                : this.generateInvalidUser();
        }
        return type === 'valid' 
            ? staticData.users.validUser 
            : staticData.users.invalidUser;
    }

    /**
     * Get post data (static or random)
     */
    static getPost(type: 'valid' | 'update' = 'valid') {
        if (this.useRandomData) {
            return type === 'valid' 
                ? this.randomDataCache.validPost 
                : this.generateRandomPost();
        }
        return type === 'valid' 
            ? staticData.posts.validPost 
            : staticData.posts.updatePost;
    }

    /**
     * Get comment data (static or random)
     */
    static getComment() {
        return this.getData('comments.validComment', 'validComment');
    }

    /**
     * Get todo data (static or random)
     */
    static getTodo(type: 'valid' | 'completed' = 'valid') {
        if (this.useRandomData) {
            return type === 'valid' 
                ? this.randomDataCache.validTodo 
                : { ...this.randomDataCache.validTodo, completed: true };
        }
        return type === 'valid' 
            ? staticData.todos.validTodo 
            : staticData.todos.completedTodo;
    }

    /**
     * Get album data (static or random)
     */
    static getAlbum() {
        return this.getData('albums.validAlbum', 'validAlbum');
    }

    /**
     * Get photo data (static or random)
     */
    static getPhoto() {
        return this.getData('photos.validPhoto', 'validPhoto');
    }

    /**
     * Get login credentials (static or random)
     */
    static getLoginCredentials() {
        if (this.useRandomData) {
            return this.randomDataCache.loginCredentials;
        }
        return {
            username: "admin",
            password: "password123"
        };
    }

    /**
     * Get authentication payload (static or random)
     */
    static getAuthPayload() {
        if (this.useRandomData) {
            return this.randomDataCache.authPayload;
        }
        return {
            username: "admin",
            password: "password123",
            email: "admin@example.com",
            firstName: "Admin",
            lastName: "User"
        };
    }

    /**
     * Get headers (static or random)
     */
    static getHeaders(type: 'custom' | 'auth' = 'custom') {
        if (this.useRandomData) {
            return type === 'custom' 
                ? this.randomDataCache.customHeaders 
                : { ...staticData.headers.authHeaders, ...this.randomDataCache.customHeaders };
        }
        return type === 'custom' 
            ? staticData.headers.customHeaders 
            : staticData.headers.authHeaders;
    }

    // ==================== STATIC DATA ACCESS METHODS ====================

    /**
     * Get endpoints (always static)
     */
    static getEndpoints() {
        return staticData.endpoints;
    }

    /**
     * Get expected response schemas (always static)
     */
    static getExpectedResponses() {
        return staticData.expectedResponses;
    }

    /**
     * Get error scenarios (static or random)
     */
    static getErrorScenarios() {
        if (this.useRandomData) {
            return {
                ...staticData.errorScenarios,
                invalidData: this.randomDataCache.invalidData
            };
        }
        return staticData.errorScenarios;
    }

    /**
     * Get performance test data (always static)
     */
    static getPerformanceData() {
        return staticData.performance;
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Generate fresh random data (bypasses cache)
     */
    static getFreshRandomData(type: string) {
        const generators: { [key: string]: () => any } = {
            'user': this.generateRandomUser,
            'post': this.generateRandomPost,
            'comment': this.generateRandomComment,
            'todo': this.generateRandomTodo,
            'album': this.generateRandomAlbum,
            'photo': this.generateRandomPhoto,
            'login': this.generateRandomLoginCredentials,
            'auth': this.generateRandomAuthPayload,
            'headers': this.generateRandomHeaders
        };

        const generator = generators[type.toLowerCase()];
        return generator ? generator.call(this) : this.generateRandomUser();
    }

    /**
     * Generate bulk random data
     */
    static getBulkRandomData(type: string, count: number = 5) {
        return this.generateBulkData(type, count);
    }

    /**
     * Generate invalid user data for negative testing
     */
    private static generateInvalidUser() {
        const invalidData = this.generateInvalidData();
        return {
            name: invalidData.emptyString,
            username: invalidData.specialCharacters,
            email: invalidData.invalidEmail,
            phone: invalidData.invalidPhone,
            website: invalidData.invalidURL
        };
    }

    /**
     * Seed random data for consistent test runs
     */
    static seedRandomData(seed?: number) {
        return this.seedFaker(seed);
    }

    /**
     * Reset random data generation
     */
    static resetRandomData() {
        this.resetFaker();
        this.generateRandomDataCache();
    }

    /**
     * Get all test data as JSON string (useful for debugging)
     */
    static getAllTestDataAsJson(): string {
        const data = {
            isRandomData: this.useRandomData,
            user: this.getUser(),
            post: this.getPost(),
            comment: this.getComment(),
            todo: this.getTodo(),
            album: this.getAlbum(),
            photo: this.getPhoto(),
            loginCredentials: this.getLoginCredentials(),
            authPayload: this.getAuthPayload(),
            headers: this.getHeaders()
        };
        return JSON.stringify(data, null, 2);
    }

    // ==================== RANDOM DATA GENERATOR METHODS ====================

    /**
     * Generate random user data
     */
    static generateRandomUser() {
        return {
            name: faker.person.fullName(),
            username: faker.internet.userName().toLowerCase(),
            email: faker.internet.email().toLowerCase(),
            phone: faker.phone.number(),
            website: faker.internet.domainName(),
            address: {
                street: faker.location.streetAddress(),
                suite: faker.location.secondaryAddress(),
                city: faker.location.city(),
                zipcode: faker.location.zipCode(),
                geo: {
                    lat: faker.location.latitude().toString(),
                    lng: faker.location.longitude().toString()
                }
            },
            company: {
                name: faker.company.name(),
                catchPhrase: faker.company.catchPhrase(),
                bs: faker.company.buzzPhrase()
            }
        };
    }

    /**
     * Generate random post data
     */
    static generateRandomPost() {
        return {
            title: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(2),
            userId: faker.number.int({ min: 1, max: 10 })
        };
    }

    /**
     * Generate random comment data
     */
    static generateRandomComment() {
        return {
            postId: faker.number.int({ min: 1, max: 100 }),
            name: faker.person.fullName(),
            email: faker.internet.email().toLowerCase(),
            body: faker.lorem.paragraph()
        };
    }

    /**
     * Generate random todo data
     */
    static generateRandomTodo() {
        return {
            title: faker.lorem.sentence(),
            completed: faker.datatype.boolean(),
            userId: faker.number.int({ min: 1, max: 10 })
        };
    }

    /**
     * Generate random album data
     */
    static generateRandomAlbum() {
        return {
            title: faker.lorem.words(3),
            userId: faker.number.int({ min: 1, max: 10 })
        };
    }

    /**
     * Generate random photo data
     */
    static generateRandomPhoto() {
        const width = faker.number.int({ min: 400, max: 800 });
        const height = faker.number.int({ min: 300, max: 600 });
        
        return {
            albumId: faker.number.int({ min: 1, max: 50 }),
            title: faker.lorem.words(2),
            url: `https://picsum.photos/${width}/${height}`,
            thumbnailUrl: `https://picsum.photos/150/150`
        };
    }

    /**
     * Generate random login credentials
     */
    static generateRandomLoginCredentials() {
        return {
            username: faker.internet.userName().toLowerCase(),
            password: faker.internet.password({ length: 12 })
        };
    }

    /**
     * Generate random authentication payload
     */
    static generateRandomAuthPayload() {
        return {
            username: faker.internet.userName().toLowerCase(),
            password: "password123", // Keep consistent for testing
            email: faker.internet.email().toLowerCase(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName()
        };
    }

    /**
     * Generate random headers with dynamic values
     */
    static generateRandomHeaders() {
        return {
            'X-Request-ID': faker.string.uuid(),
            'X-Client-Version': faker.system.semver(),
            'X-Session-ID': faker.string.alphanumeric(16),
            'User-Agent': faker.internet.userAgent(),
            'X-Correlation-ID': faker.string.uuid()
        };
    }

    /**
     * Generate invalid data for negative testing
     */
    static generateInvalidData() {
        return {
            invalidEmail: faker.lorem.word(),
            invalidPhone: faker.lorem.words(2),
            invalidURL: "not-a-url",
            emptyString: "",
            nullValue: null,
            longString: faker.lorem.paragraphs(10),
            specialCharacters: "!@#$%^&*()_+-=[]{}|;':\",./<>?",
            sqlInjection: "'; DROP TABLE users; --",
            xssPayload: "<script>alert('xss')</script>"
        };
    }

    /**
     * Generate random API test scenarios
     */
    static generateRandomTestScenarios() {
        return {
            validUser: this.generateRandomUser(),
            validPost: this.generateRandomPost(),
            validComment: this.generateRandomComment(),
            validTodo: this.generateRandomTodo(),
            validAlbum: this.generateRandomAlbum(),
            validPhoto: this.generateRandomPhoto(),
            loginCredentials: this.generateRandomLoginCredentials(),
            authPayload: this.generateRandomAuthPayload(),
            customHeaders: this.generateRandomHeaders(),
            invalidData: this.generateInvalidData()
        };
    }

    /**
     * Generate bulk random data
     */
    static generateBulkData(type: string, count: number = 5) {
        const generators: { [key: string]: () => any } = {
            'user': this.generateRandomUser,
            'users': this.generateRandomUser,
            'post': this.generateRandomPost,
            'posts': this.generateRandomPost,
            'comment': this.generateRandomComment,
            'comments': this.generateRandomComment,
            'todo': this.generateRandomTodo,
            'todos': this.generateRandomTodo
        };

        const data = [];
        const generator = generators[type.toLowerCase()] || this.generateRandomUser;
        
        for (let i = 0; i < count; i++) {
            data.push(generator.call(this));
        }
        
        return data;
    }

    /**
     * Seed faker for consistent random data in test runs
     */
    static seedFaker(seed?: number) {
        const seedValue = seed || Date.now();
        faker.seed(seedValue);
        console.log(`Faker seeded with: ${seedValue}`);
        return seedValue;
    }

    /**
     * Reset faker seed for new random data
     */
    static resetFaker() {
        faker.seed();
    }

    // ==================== RANDOM BODY PARSING ====================

    /**
     * Parse and replace random placeholders in request body
     * @param body - Request body string with random placeholders
     * @param logger - Optional logger for debugging
     * @returns Processed body string with random values
     */
    static parseRandomBody(body: string, logger?: any): string {
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
} 