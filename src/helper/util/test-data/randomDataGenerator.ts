import { faker } from '@faker-js/faker';

/**
 * Random Data Generator for API Testing
 * Uses Faker.js to generate realistic random test data
 */
export class RandomDataGenerator {
    
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
        const color = faker.color.rgb({ format: 'hex', casing: 'lower' }).substring(1);
        
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
        const data = [];
        for (let i = 0; i < count; i++) {
            switch (type.toLowerCase()) {
                case 'user':
                case 'users':
                    data.push(this.generateRandomUser());
                    break;
                case 'post':
                case 'posts':
                    data.push(this.generateRandomPost());
                    break;
                case 'comment':
                case 'comments':
                    data.push(this.generateRandomComment());
                    break;
                case 'todo':
                case 'todos':
                    data.push(this.generateRandomTodo());
                    break;
                default:
                    data.push(this.generateRandomUser());
            }
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
} 