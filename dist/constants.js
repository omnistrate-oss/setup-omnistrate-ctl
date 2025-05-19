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
exports.PLATFORM = exports.ARCHITECTURE = exports.VERSION = void 0;
exports.getVersion = getVersion;
exports.getArchitecture = getArchitecture;
exports.getPlatform = getPlatform;
const core = __importStar(require("@actions/core"));
exports.VERSION = getVersion();
function getVersion() {
    const version = core.getInput('version');
    if (version) {
        return version;
    }
    return 'latest';
}
exports.ARCHITECTURE = getArchitecture(process.arch);
function getArchitecture(arch) {
    switch (arch) {
        case 'arm64': {
            return 'arm64';
        }
        case 'x64': {
            return 'amd64';
        }
        default: {
            throw new Error(arch);
        }
    }
}
exports.PLATFORM = getPlatform(process.platform);
function getPlatform(platform) {
    switch (platform) {
        case 'darwin': {
            return 'darwin';
        }
        case 'linux': {
            return 'linux';
        }
        case 'win32': {
            return 'windows';
        }
        default: {
            throw new Error(platform);
        }
    }
}
//# sourceMappingURL=constants.js.map