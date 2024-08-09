import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as toolCache from '@actions/tool-cache'
import { ARCHITECTURE, PLATFORM, VERSION } from './constants'

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
    const toolPath = toolCache.find('omnistrate-ctl', VERSION, ARCHITECTURE)
    if (toolPath) {
      core.addPath(toolPath)
    } else {
      await installOctl(url, VERSION)
    }

    // Check the version of the installed tool
    const exitCode = await exec.exec('omnistrate-ctl --version')
    if (exitCode !== 0) {
      core.setFailed('Failed to check the version of the installed')
      return
    }

    // Login to the Omnistrate CLI with the provided credentials
    const email = core.getInput('email')
    const password = core.getInput('password')
    if (email && password) {
      //core.setSecret(password)
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

async function installOctl(url: string, version: string): Promise<void> {
  const downloadedPath = await toolCache.downloadTool(url)
  core.info(`Acquired omnistrate-ctl:${version} from ${url}`)
  const cachedPath = await toolCache.cacheDir(
    downloadedPath,
    'omnistrate-ctl',
    version
  )
  core.info(`Successfully cached omnistrate-ctl to ${cachedPath}`)
  core.addPath(cachedPath)
  core.info('Added omnistrate-ctl to the path')
  const cachedPathAlias = await toolCache.cacheDir(
    downloadedPath,
    'omctl',
    version
  )
  core.info(`Successfully cached omctl to ${cachedPathAlias}`)
  core.addPath(cachedPath)
  core.info('Added omctl to the path')
}

async function login(email: string, password: string): Promise<void> {
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
    const toolPath = toolCache.find('omnistrate-ctl', VERSION, ARCHITECTURE)
    if (toolPath) {
      const exitCode = await exec.exec('omnistrate-ctl logout')
      if (exitCode !== 0) {
        core.setFailed('Failed to logout of Omnistrate CLI')
        return
      }
      console.log('Logged out of Omnistrate CLI')
    } else {
      console.log('Omnistrate CLI is not installed')
    }
  } catch (error) {
    console.log('Failed to logout of Omnistrate CLI - ', error)
  }
}
