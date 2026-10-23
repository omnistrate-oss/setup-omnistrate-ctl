import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as cache from '@actions/cache'
import * as toolCache from '@actions/tool-cache'
import { ARCHITECTURE, PLATFORM, getVersion } from './constants'
import { createHash } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const CACHE_KEY_VERSION = 'v1'

interface ResolvedRelease {
  version: string
  url: string
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function install(): Promise<void> {
  try {
    const requestedVersion = getVersion()
    let cacheEnabled = isCacheEnabled()
    let release: ResolvedRelease = {
      version: requestedVersion,
      url: resolveUrl(PLATFORM, ARCHITECTURE, requestedVersion)
    }

    if (cacheEnabled && requestedVersion === 'latest') {
      const latestRelease = await resolveLatestRelease(release.url)
      if (latestRelease) {
        release = latestRelease
      } else {
        cacheEnabled = false
        core.warning(
          'Could not resolve the latest CTL version; skipping the cache for this run'
        )
      }
    }

    const url = release.url
    core.debug(`Resolved url: ${url}`)

    const installDirectory = getInstallDirectory(release.version)
    const cacheKey = getCacheKey(PLATFORM, ARCHITECTURE, release.version)
    let restored = false

    if (cacheEnabled) {
      restored = await restoreCtlCache(installDirectory, cacheKey)
    }

    if (restored && hasInstalledBinaries(installDirectory)) {
      core.info(`Restored omnistrate-ctl:${release.version} from cache`)
    } else {
      if (restored) {
        core.warning('The restored CTL cache was incomplete; downloading again')
      }
      await installCtl(url, requestedVersion, installDirectory)
      if (cacheEnabled) {
        await saveCtlCache(installDirectory, cacheKey, release.version)
      }
    }

    core.addPath(installDirectory)
    core.debug('Added omnistrate-ctl and omctl to the path')

    // Login to the Omnistrate CLI
    const apiKey = core.getInput('api-key')
    const email = core.getInput('email')
    const password = core.getInput('password')

    // Register secrets so the runner masks them in all log output
    if (apiKey) core.setSecret(apiKey)
    if (password) core.setSecret(password)

    if (apiKey) {
      await loginWithAPIKey(apiKey)
    } else if (email && password) {
      await login(email, password)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(`${error}`)
    }
  }
}

export function isCacheEnabled(value = core.getInput('cache')): boolean {
  return value.trim().toLowerCase() !== 'false'
}

export function getCacheKey(
  platform: string,
  architecture: string,
  version: string
): string {
  const versionHash = createHash('sha256')
    .update(version)
    .digest('hex')
    .slice(0, 12)
  const versionLabel = version.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 64)
  return `setup-omnistrate-ctl-${CACHE_KEY_VERSION}-${platform}-${architecture}-${versionLabel}-${versionHash}`
}

export function getInstallDirectory(version: string): string {
  const root = process.env.RUNNER_TEMP || os.tmpdir()
  const versionHash = createHash('sha256')
    .update(version)
    .digest('hex')
    .slice(0, 12)
  return path.join(
    root,
    'setup-omnistrate-ctl',
    `${PLATFORM}-${ARCHITECTURE}-${versionHash}`
  )
}

export async function resolveLatestRelease(
  latestUrl: string
): Promise<ResolvedRelease | undefined> {
  try {
    const response = await fetch(latestUrl, {
      method: 'HEAD',
      redirect: 'manual'
    })
    const location = response.headers.get('location')
    const match = location?.match(/\/releases\/download\/([^/]+)\//)

    if (!location || !match) {
      core.debug(`Latest release redirect was not returned for ${latestUrl}`)
      return undefined
    }

    return {
      version: decodeURIComponent(match[1]),
      url: new URL(location, latestUrl).toString()
    }
  } catch (error) {
    core.debug(`Failed to resolve latest release: ${error}`)
    return undefined
  }
}

async function restoreCtlCache(
  installDirectory: string,
  cacheKey: string
): Promise<boolean> {
  try {
    const restoredKey = await cache.restoreCache([installDirectory], cacheKey)
    return restoredKey === cacheKey
  } catch (error) {
    core.warning(`Failed to restore the CTL cache: ${error}`)
    return false
  }
}

async function saveCtlCache(
  installDirectory: string,
  cacheKey: string,
  version: string
): Promise<void> {
  try {
    await cache.saveCache([installDirectory], cacheKey)
    core.info(`Cached omnistrate-ctl:${version} for future workflow runs`)
  } catch (error) {
    core.warning(`Failed to save the CTL cache: ${error}`)
  }
}

function hasInstalledBinaries(installDirectory: string): boolean {
  const extension = PLATFORM === 'windows' ? '.exe' : ''
  return (
    fs.existsSync(path.join(installDirectory, `omnistrate-ctl${extension}`)) &&
    fs.existsSync(path.join(installDirectory, `omctl${extension}`))
  )
}

export function resolveUrl(
  platform: string,
  architecture: string,
  version: string
): string {
  let url = `https://github.com/omnistrate-oss/omnistrate-ctl/releases/download/${version}/omnistrate-ctl-${platform}-${architecture}`
  if (version === 'latest') {
    url = `https://github.com/omnistrate-oss/omnistrate-ctl/releases/latest/download/omnistrate-ctl-${platform}-${architecture}`
  }
  if (platform === 'windows') {
    url += '.exe.zip'
  } else {
    url += '.tar.gz'
  }
  return url
}

async function installCtl(
  url: string,
  version: string,
  installDirectory: string
): Promise<void> {
  const downloadedPath = await toolCache.downloadTool(url)
  core.info(`Requested omnistrate-ctl:${version} from ${url}`)

  let extension = ''
  if (PLATFORM === 'windows') {
    extension = '.exe'
  }

  // Create a destination directory for extraction
  const extractDestination = process.env.RUNNER_TEMP || '/tmp'

  let extractedPath: string
  if (PLATFORM === 'windows') {
    // Extract zip file to specific destination
    extractedPath = await toolCache.extractZip(
      downloadedPath,
      extractDestination
    )
  } else {
    // Extract tar.gz file to specific destination
    extractedPath = await toolCache.extractTar(
      downloadedPath,
      extractDestination,
      'xz'
    )
  }

  core.debug(`Successfully extracted to ${extractedPath}`)

  const extractedFile = path.join(
    extractedPath,
    `omnistrate-ctl-${PLATFORM}-${ARCHITECTURE}${extension}`
  )
  core.debug(`Extracted path: ${extractedFile}`)

  fs.rmSync(installDirectory, { recursive: true, force: true })
  fs.mkdirSync(installDirectory, { recursive: true })
  const ctlPath = path.join(installDirectory, `omnistrate-ctl${extension}`)
  const aliasPath = path.join(installDirectory, `omctl${extension}`)
  fs.copyFileSync(extractedFile, ctlPath)
  fs.copyFileSync(extractedFile, aliasPath)
  core.debug(`Installed omnistrate-ctl and omctl to ${installDirectory}`)

  // Set execution permissions for the installed tools
  if (PLATFORM !== 'windows') {
    fs.chmodSync(ctlPath, '755')
    fs.chmodSync(aliasPath, '755')
  }
}

export async function login(email: string, password: string): Promise<void> {
  try {
    let output = ''
    const exitCode = await exec.exec(
      'omnistrate-ctl login',
      ['--email', email, '--password-stdin'],
      {
        input: Buffer.from(password),
        silent: true,
        listeners: {
          stdout: (data: Buffer) => {
            output += data.toString()
          },
          stderr: (data: Buffer) => {
            output += data.toString()
          }
        }
      }
    )
    if (exitCode !== 0) {
      core.setFailed('Failed to login to Omnistrate CLI')
      core.debug(output)
      return
    }
    core.info('Logged in to Omnistrate CLI')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(`${error}`)
    }
  }
}

export async function loginWithAPIKey(apiKey: string): Promise<void> {
  try {
    let output = ''
    const exitCode = await exec.exec(
      'omnistrate-ctl login',
      ['--api-key-stdin'],
      {
        input: Buffer.from(apiKey),
        silent: true,
        listeners: {
          stdout: (data: Buffer) => {
            output += data.toString()
          },
          stderr: (data: Buffer) => {
            output += data.toString()
          }
        }
      }
    )
    if (exitCode !== 0) {
      core.setFailed('Failed to login to Omnistrate CLI with API key')
      core.debug(output)
      return
    }
    core.info('Logged in to Omnistrate CLI with API key')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(`${error}`)
    }
  }
}

export async function revokeToken(): Promise<void> {
  try {
    const exitCode = await exec.exec('omnistrate-ctl', ['revoke-token'], {
      env: { ...process.env, NO_COLOR: '1' },
      silent: true
    })
    if (exitCode !== 0) {
      core.warning('Failed to revoke token from Omnistrate CLI')
      return
    }
    core.info('Revoked refresh token from Omnistrate CLI')
  } catch (error) {
    core.warning(`Failed to revoke token: ${error}`)
  }
}

export async function logout(): Promise<void> {
  try {
    const exitCode = await exec.exec('omnistrate-ctl', ['logout'], {
      env: { ...process.env, NO_COLOR: '1' },
      silent: true
    })
    if (exitCode !== 0) {
      core.warning('Failed to logout from Omnistrate CLI')
      return
    }
    core.info('Logged out of Omnistrate CLI')
  } catch (error) {
    core.warning(`Failed to logout from Omnistrate CLI: ${error}`)
  }
}

export async function cleanup(): Promise<void> {
  const configDir = path.join(os.homedir(), '.omnistrate')
  try {
    if (fs.existsSync(configDir)) {
      fs.rmSync(configDir, { recursive: true })
      core.info('Cleaned up ~/.omnistrate/ credentials')
    } else {
      core.debug('No ~/.omnistrate/ directory to clean up')
    }
  } catch (error) {
    core.warning(`Failed to clean up ~/.omnistrate/: ${error}`)
  }
}
