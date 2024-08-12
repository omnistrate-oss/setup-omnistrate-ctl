import * as core from '@actions/core'

export const VERSION = getVersion()

export function getVersion(): string {
  return core.getInput('version')
}

export const ARCHITECTURE = getArchitecture(process.arch)

export function getArchitecture(arch: string): string {
  switch (arch) {
    case 'arm64': {
      return 'arm64'
    }
    case 'x64': {
      return 'amd64'
    }
    default: {
      throw new Error(arch)
    }
  }
}

export const PLATFORM = getPlatform(process.platform)

export function getPlatform(platform: string): string {
  switch (platform) {
    case 'darwin': {
      return 'darwin'
    }
    case 'linux': {
      return 'linux'
    }
    case 'win32': {
      return 'windows'
    }
    default: {
      throw new Error(platform)
    }
  }
}
