export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ENV: "staging" | "prod" | "test" | "dev",
            API_BASE_URL: string,
            API_TOKEN: string,
            API_USERNAME: string,
            API_PASSWORD: string,
            API_TIMEOUT: string,
            API_RETRIES: string
        }
    }
}