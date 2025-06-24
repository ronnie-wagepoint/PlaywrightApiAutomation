# Playwright API Testing with Cucumber TypeScript

A comprehensive API testing framework built with Playwright, Cucumber, and TypeScript for robust API automation.

## 🚀 Features

- **API Testing**: Full support for REST API testing using Playwright's request API
- **Cucumber Integration**: BDD approach with Gherkin syntax
- **TypeScript**: Type-safe development with full IntelliSense support
- **Multiple HTTP Methods**: GET, POST, PUT, DELETE, PATCH support
- **Authentication**: Bearer token and Basic auth support
- **Custom Headers**: Flexible header management
- **Response Validation**: Comprehensive response validation and schema checking
- **Error Handling**: Robust error scenario testing
- **Performance Testing**: Concurrent request testing capabilities
- **Reporting**: Detailed HTML and JSON reports
- **Logging**: Comprehensive logging with Winston

## 📁 Project Structure

```
src/
├── helper/
│   ├── api/
│   │   ├── apiConfig.ts      # API configuration and endpoints
│   │   └── apiHelper.ts      # API utility functions
│   ├── env/
│   │   └── api.env           # API environment variables
│   └── ...
├── hooks/
│   ├── hooks.ts              # Test lifecycle hooks
│   └── pageFixture.ts        # Shared test fixtures
├── test/
│   ├── features/
│   │   ├── apiTests.feature          # Basic API tests
│   │   ├── advancedApiTests.feature  # Advanced API scenarios
│   │   └── comprehensiveApiTests.feature # Comprehensive examples
│   └── steps/
│       ├── apiSteps.ts               # Basic API step definitions
│       ├── advancedApiSteps.ts       # Advanced API steps
│       └── comprehensiveApiSteps.ts  # Comprehensive API steps
└── ...
```

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
cp src/helper/env/api.env .env
```

## 🚀 Usage

### Running API Tests

```bash
# Run all API tests
npm run test:api

# Run specific API test tags
npm run test -- --tags @get
npm run test -- --tags @post
npm run test -- --tags @auth

# Run with debug mode
npm run debug -- --tags @api
```

### Available Test Tags

- `@api` - All API tests
- `@get` - GET request tests
- `@post` - POST request tests
- `@put` - PUT request tests
- `@delete` - DELETE request tests
- `@auth` - Authentication tests
- `@advanced` - Advanced API scenarios
- `@comprehensive` - Comprehensive test examples

## 📝 Writing API Tests

### Basic API Test Example

```gherkin
@api
Feature: Basic API Testing

  Scenario: Get all posts
    When I send a GET request to "/posts"
    Then the response status should be 200
    And the response should contain an array of posts
```

### Advanced API Test Example

```gherkin
@api @auth
Feature: Authenticated API Testing

  Background:
    Given I set the authorization header

  Scenario: Create user with authentication
    When I send a POST request to "/users" with the following user data:
      | name     | username | email           |
      | John Doe | johndoe  | john@test.com   |
    Then the response status should be 201
    And the response should contain the created user
```

### Step Definitions

```typescript
When('I send a GET request to {string}', async function (endpoint: string) {
    response = await fixture.request.get(endpoint);
    responseData = await response.json();
});

Then('the response status should be {int}', async function (expectedStatus: number) {
    expect(response.status()).toBe(expectedStatus);
});
```

## ⚙️ Configuration

### API Configuration (`src/helper/api/apiConfig.ts`)

```typescript
export const apiConfig: ApiConfig = {
    baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 30000,
    retries: 3
};
```

### Environment Variables

```bash
# API Configuration
API_BASE_URL=https://jsonplaceholder.typicode.com
API_TOKEN=your-api-token-here
API_USERNAME=testuser
API_PASSWORD=testpass

# Timeout settings
API_TIMEOUT=30000
API_RETRIES=3
```

## 🔧 API Helper Usage

The framework provides a comprehensive `ApiHelper` class for common API operations:

```typescript
import { ApiHelper } from '../helper/api/apiHelper';

const apiHelper = new ApiHelper(fixture.request);

// GET request
const response = await apiHelper.get('/posts');

// POST request with data
const response = await apiHelper.post('/posts', {
    title: 'Test Post',
    body: 'Test Body',
    userId: 1
});

// With authentication
const response = await apiHelper.get('/users/1', apiHelper.getAuthHeaders());

// With custom headers
const response = await apiHelper.get('/posts', {
    'X-Request-ID': 'test-123',
    'Cache-Control': 'no-cache'
});
```

## 📊 Test Reports

After running tests, reports are generated in the `test-results/` directory:

- `cucumber-report.html` - HTML report with detailed test results
- `cucumber-report.json` - JSON report for CI/CD integration
- `screenshots/` - Screenshots for failed tests (UI tests)
- `videos/` - Video recordings (UI tests)
- `trace/` - Playwright trace files

## 🧪 Sample Test Scenarios

### 1. Basic CRUD Operations
- Create, Read, Update, Delete resources
- Validate response schemas
- Check required fields

### 2. Authentication Testing
- Bearer token authentication
- Basic authentication
- Custom authorization headers

### 3. Error Handling
- Invalid endpoints
- Malformed requests
- Server errors
- Timeout scenarios

### 4. Performance Testing
- Concurrent requests
- Response time validation
- Load testing scenarios

### 5. Data Validation
- Schema validation
- Field type checking
- Required field validation
- Data integrity checks

## 🔍 Debugging

### Enable Debug Mode

```bash
npm run debug -- --tags @api
```

### View Logs

The framework uses Winston for logging. Logs include:
- Request/response details
- Test execution flow
- Error information
- Performance metrics

### Trace Files

Playwright generates trace files for debugging:
- Open `test-results/trace/` files in Playwright Trace Viewer
- Analyze request/response flows
- Debug timing issues

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run test:api
      - uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: test-results/
```

## 📚 Best Practices

1. **Use Descriptive Feature Names**: Make test scenarios clear and understandable
2. **Implement Proper Error Handling**: Test both success and failure scenarios
3. **Use Data Tables**: For complex test data, use Cucumber data tables
4. **Validate Response Schemas**: Always validate response structure and data types
5. **Use Environment Variables**: Keep sensitive data in environment variables
6. **Implement Retry Logic**: For flaky endpoints, use retry mechanisms
7. **Test Authentication**: Always test both authenticated and unauthenticated scenarios
8. **Performance Testing**: Include performance validation for critical endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include test logs and error messages

---

**Happy API Testing! 🚀**
