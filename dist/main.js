"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = install;
exports.resolveUrl = resolveUrl;
exports.login = login;
exports.logout = logout;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const toolCache = __importStar(require("@actions/tool-cache"));
const constants_1 = require("./constants");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function install() {
    try {
        // Resolve the url for the requested version
        const url = resolveUrl(constants_1.PLATFORM, constants_1.ARCHITECTURE, constants_1.VERSION);
        core.debug(`Resolved url: ${url}`);
        // Install the resolved version if necessary
        const toolPath = toolCache.find('omnistrate-ctl', constants_1.VERSION);
        const toolPath2 = toolCache.find('omctl', constants_1.VERSION);
        if (constants_1.VERSION !== 'latest' && toolPath && toolPath2) {
            // use cache
            core.addPath(toolPath);
            core.addPath(toolPath2);
        }
        else {
            await installCtl(url, constants_1.VERSION);
        }
        // Login to the Omnistrate CLI with the provided credentials
        const email = core.getInput('email');
        const password = core.getInput('password');
        if (email && password) {
            login(email, password);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed(`${error}`);
        }
    }
}
function resolveUrl(platform, architecture, version) {
    let url = `https://github.com/omnistrate/cli/releases/download/${version}/omnistrate-ctl-${platform}-${architecture}`;
    if (version === 'latest') {
        url = `https://github.com/omnistrate/cli/releases/latest/download/omnistrate-ctl-${platform}-${architecture}`;
    }
    if (platform === 'windows') {
        url += '.exe';
    }
    return url;
}
async function installCtl(url, version) {
    const downloadedPath = await toolCache.downloadTool(url);
    core.info(`Requested omnistrate-ctl:${version} from ${url}`);
    let extension = '';
    if (constants_1.PLATFORM === 'windows') {
        extension = '.exe';
    }
    const cachedPath = await toolCache.cacheFile(downloadedPath, `omnistrate-ctl${extension}`, 'omnistrate-ctl', version);
    core.debug(`Successfully cached omnistrate-ctl to ${cachedPath}`);
    core.addPath(cachedPath);
    core.debug('Added omnistrate-ctl to the path');
    const cachedPathAlias = await toolCache.cacheFile(downloadedPath, `omctl${extension}`, 'omctl', version);
    core.debug(`Successfully cached omctl to ${cachedPathAlias}`);
    core.addPath(cachedPathAlias);
    core.debug('Added omctl to the path');
    // Set execution permissions for the cached tool
    if (constants_1.PLATFORM !== 'windows') {
        fs.chmodSync(path.join(cachedPath, `omnistrate-ctl`), '755');
        fs.chmodSync(path.join(cachedPathAlias, `omctl`), '755');
    }
}
async function login(email, password) {
    try {
        const exitCode = await exec.exec('omnistrate-ctl login', [
            '--email',
            email,
            '--password',
            password
        ]);
        if (exitCode !== 0) {
            core.setFailed('Failed to login to Omnistrate CLI');
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed(`${error}`);
        }
    }
}
async function logout() {
    try {
        // logout of the Omnistrate CLI
        const exitCode = await exec.exec('omnistrate-ctl logout');
        if (exitCode !== 0) {
            console.warn('Failed to logout from Omnistrate CLI');
            return;
        }
        console.info('Logged out of Omnistrate CLI');
    }
    catch (error) {
        console.warn('Failed to logout from Omnistrate CLI', error);
    }
}
//# sourceMappingURL=main.js.map