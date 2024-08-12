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
    let useCache = false
    let toolPath = toolCache.find('omnistrate-ctl', VERSION)
    const toolPath2 = toolCache.find('omctl', VERSION)
    if (VERSION !== 'latest' && toolPath && toolPath2) {
      useCache = true
    }
    if (useCache) {
      core.addPath(toolPath)
      core.addPath(toolPath2)
    } else {
      toolPath = await installCtl(url, VERSION)
    }

    // Check the version of the installed tool
    let execPath = `${toolPath}/omnistrate-ctl`
    if (PLATFORM === 'windows') {
      execPath += '.exe'
    }
    const exitCode = await exec.exec(execPath, ['--version'])
    if (exitCode !== 0) {
      core.setFailed('Failed to check the version of the installed')
      return
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

function resolveUrl(
  platform: string,
  architecture: string,
  version: string
): string {
  let url = `https://github.com/omnistrate/cli/releases/download/${version}/omnistrate-ctl-${platform}-${architecture}`
  if (version === 'latest') {
    url = `https://github.com/omnistrate/cli/releases/latest/download/omnistrate-ctl-${platform}-${architecture}`
  }
  if (platform === 'windows') {
    url += '.exe'
  }
  return url
}

async function installCtl(url: string, version: string): Promise<string> {
  const downloadedPath = await toolCache.downloadTool(url)
  core.setCommandEcho
  core.info(`Acquired omnistrate-ctl:${version} from ${url}`)
  let extension = ''
  if (PLATFORM === 'windows') {
    extension = '.exe'
  }
  const cachedPath = await toolCache.cacheFile(
    downloadedPath,
    `omnistrate-ctl${extension}`,
    'omnistrate-ctl',
    version
  )
  core.debug(`Successfully cached omnistrate-ctl to ${cachedPath}`)
  core.addPath(cachedPath)
  core.debug('Added omnistrate-ctl to the path')
  const cachedPathAlias = await toolCache.cacheFile(
    downloadedPath,
    `omctl${extension}`,
    'omctl',
    version
  )
  core.debug(`Successfully cached omctl to ${cachedPathAlias}`)
  core.addPath(cachedPathAlias)
  core.debug('Added omctl to the path')

  // Set execution permissions for the cached tool
  if (PLATFORM !== 'windows') {
    fs.chmodSync(path.join(cachedPath, `omnistrate-ctl${extension}`), '755')
    fs.chmodSync(path.join(cachedPathAlias, `omctl${extension}`), '755')
  }

  return cachedPath
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
    console.warn('Failed to logout from Omnistrate CLI - ', error)
  }
}
