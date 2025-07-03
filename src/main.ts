import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as toolCache from '@actions/tool-cache'
import { ARCHITECTURE, PLATFORM, VERSION } from './constants'
import * as fs from 'fs'
import * as path from 'path'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function install(): Promise<void> {
  try {
    // Resolve the url for the requested version
    const url = resolveUrl(PLATFORM, ARCHITECTURE, VERSION)
    core.debug(`Resolved url: ${url}`)
    // Install the resolved version if necessary
    const toolPath = toolCache.find('omnistrate-ctl', VERSION)
    const toolPath2 = toolCache.find('omctl', VERSION)
    if (VERSION !== 'latest' && toolPath && toolPath2) {
      // use cache
      core.addPath(toolPath)
      core.addPath(toolPath2)
    } else {
      await installCtl(url, VERSION)
    }

    // Login to the Omnistrate CLI with the provided credentials
    const email = core.getInput('email')
    const password = core.getInput('password')
    if (email && password) {
      login(email, password)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(`${error}`)
    }
  }
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
    url += '.zip'
  } else {
    url += '.tar.gz'
  }
  return url
}

async function installCtl(url: string, version: string): Promise<void> {
  const downloadedPath = await toolCache.downloadTool(url)
  core.info(`Requested omnistrate-ctl:${version} from ${url}`)

  let extension = ''
  if (PLATFORM === 'windows') {
    extension = '.exe'
  }

  // Create a destination directory for extraction
  const extractDestination = path.join(
    process.env.RUNNER_TEMP || '/tmp',
    `omnistrate-ctl` + extension
  )

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

  // Find the extracted binary
  const cachedPath = await toolCache.cacheFile(
    extractedPath,
    `omnistrate-ctl${extension}`,
    'omnistrate-ctl',
    version
  )
  core.debug(`Successfully cached omnistrate-ctl to ${cachedPath}`)
  core.addPath(cachedPath)
  core.debug('Added omnistrate-ctl to the path')

  const cachedPathAlias = await toolCache.cacheFile(
    extractedPath,
    `omctl${extension}`,
    'omctl',
    version
  )
  core.debug(`Successfully cached omctl to ${cachedPathAlias}`)
  core.addPath(cachedPathAlias)
  core.debug('Added omctl to the path')

  // Set execution permissions for the cached tool
  if (PLATFORM !== 'windows') {
    fs.chmodSync(path.join(cachedPath, `omnistrate-ctl`), '755')
    fs.chmodSync(path.join(cachedPathAlias, `omctl`), '755')
  }
}

export async function login(email: string, password: string): Promise<void> {
  try {
    const exitCode = await exec.exec('omnistrate-ctl login', [
      '--email',
      email,
      '--password',
      password
    ])
    if (exitCode !== 0) {
      core.setFailed('Failed to login to Omnistrate CLI')
      return
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(`${error}`)
    }
  }
}

export async function logout(): Promise<void> {
  try {
    // logout of the Omnistrate CLI
    const exitCode = await exec.exec('omnistrate-ctl logout')
    if (exitCode !== 0) {
      console.warn('Failed to logout from Omnistrate CLI')
      return
    }
    console.info('Logged out of Omnistrate CLI')
  } catch (error) {
    console.warn('Failed to logout from Omnistrate CLI', error)
  }
}
