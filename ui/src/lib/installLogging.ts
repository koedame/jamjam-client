// Imported first by main.tsx so the hooks are in place before any other
// module runs (ADR-036).
import { installFrontendLogging } from "./logging";

installFrontendLogging();
