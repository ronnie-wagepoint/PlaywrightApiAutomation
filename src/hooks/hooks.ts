import { BeforeAll, AfterAll, Before, After, Status } from "@cucumber/cucumber";
import { APIRequestContext, request } from "@playwright/test";
import { fixture } from "./pageFixture";
import { createLogger } from "winston";
import { options } from "../helper/util/logger";
import { TestDataManager } from "../helper/util/test-data/testDataManager";

let apiContext: APIRequestContext;

BeforeAll(async function () {
    // Setup for API automation
});

// It will trigger for random test data scenarios
Before({ tags: "@randomTestData" }, async function ({ pickle }) {
    const scenarioName = pickle.name + pickle.id;
    
    // Enable random data generation
    TestDataManager.enableRandomData();
    
    // Optional: Seed random data for consistent test runs (uncomment if needed)
    // const seed = TestDataManager.seedRandomData();
    
    fixture.logger?.info(`Random test data enabled for scenario: ${scenarioName}`);
    fixture.logger?.info(`Current test data mode: ${TestDataManager.isRandomDataEnabled() ? 'Random' : 'Static'}`);
    
    // Log sample random data for debugging
    if (fixture.logger) {
        fixture.logger.info(`Sample random data: ${TestDataManager.getAllTestDataAsJson()}`);
    }
});

// It will trigger for API scenarios
Before({ tags: "@api" }, async function ({ pickle }) {
    const scenarioName = pickle.name + pickle.id;
    
    // Create API request context for API testing
    apiContext = await request.newContext({
        baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
        extraHTTPHeaders: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
    
    // Set up fixture
    fixture.request = apiContext;
    fixture.logger = createLogger(options(scenarioName));
    
    // Also set it on the world object directly as a fallback
    this.request = apiContext;
    this.fixture = fixture;
    
    fixture.logger.info(`Starting API test: ${scenarioName}`);
});

After({ tags: "@randomTestData" }, async function ({ pickle, result }) {
    const scenarioName = pickle.name + pickle.id;
    
    if (result?.status == Status.PASSED) {
        fixture.logger?.info(`Random test data scenario passed: ${scenarioName}`);
    } else {
        fixture.logger?.error(`Random test data scenario failed: ${scenarioName}`);
    }
    
    // Disable random data generation after the scenario
    TestDataManager.disableRandomData();
    fixture.logger?.info(`Random test data disabled after scenario: ${scenarioName}`);
});

After({ tags: "@api" }, async function ({ pickle, result }) {
    const scenarioName = pickle.name + pickle.id;
    
    if (result?.status == Status.PASSED) {
        fixture.logger.info(`API test passed: ${scenarioName}`);
    } else {
        fixture.logger.error(`API test failed: ${scenarioName}`);
    }
    
    // Dispose API context
    if (apiContext) {
        await apiContext.dispose();
    }
});

AfterAll(async function () {
    // Cleanup for API automation
});


