import { APIRequestContext } from "@playwright/test";
import { Logger } from "winston";

export const fixture = {
    // @ts-ignore
    request: undefined as APIRequestContext,
    logger: undefined as Logger
}