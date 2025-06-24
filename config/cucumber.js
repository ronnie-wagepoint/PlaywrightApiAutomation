// Function to get tags from command line arguments
function getTags() {
    // Check for environment variable first
    if (process.env.TAGS) {
        return process.env.TAGS;
    }
    
    // Check for npm config
    if (process.env.npm_config_TAGS) {
        return process.env.npm_config_TAGS;
    }
    
    // Check for --tags in command line arguments
    const args = process.argv;
    const tagsIndex = args.findIndex(arg => arg === '--tags');
    if (tagsIndex !== -1 && args[tagsIndex + 1]) {
        return args[tagsIndex + 1];
    }
    
    return "";
}

module.exports = {
    default: {
        tags: getTags(),
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
            "src/test/features/"
        ],
        publishQuiet: true,
        dryRun: false,
        require: [
            "src/test/steps/*.ts",
            "src/hooks/hooks.ts"
        ],
        requireModule: [
            "ts-node/register"
        ],
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt"
        ],
        parallel: 1
    },
    rerun: {
        formatOptions: {
            snippetInterface: "async-await"
        },
        publishQuiet: true,
        dryRun: false,
        require: [
            "src/test/steps/*.ts",
            "src/hooks/hooks.ts"
        ],
        requireModule: [
            "ts-node/register"
        ],
        format: [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt"
        ],
        parallel: 2
    }
}