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
    // Install the resolved version if necessary
    const toolPath = toolCache.find('omnistrate-ctl', VERSION, ARCHITECTURE)
    if (toolPath) {
      core.addPath(toolPath)
    } else {
      await installOctl(url, VERSION)
    }

    // Check the version of the installed tool
    await exec.exec('omnistrate-ctl --version')

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
  if (platform === 'Windows') {
    url += '.exe'
  }
  return url
}

async function installOctl(url: string, version: string): Promise<void> {
  const downloadedPath = await toolCache.downloadTool(url)
  core.info(`Acquired omnistrate-ctl ${version} from ${url}`)
  const cachedPath = await toolCache.cacheDir(
    downloadedPath,
    'omnistrate-ctl',
    version,
    ARCHITECTURE
  )
  core.info(`Successfully cached omnistrate-ctl to ${cachedPath}`)
  core.addPath(cachedPath)
  core.info('Added omnistrate-ctl to the path')
}

async function login(email: string, password: string): Promise<void> {
  try {
    await exec.exec('omnistrate-ctl login', [
      '--email',
      email,
      '--password',
      password
    ])
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
    await exec.exec('omnistrate-ctl logout')
    console.log('Logged out of Omnistrate CLI')
  } catch (error) {
    console.log('Failed to logout of Omnistrate CLI - ', error)
  }
}
