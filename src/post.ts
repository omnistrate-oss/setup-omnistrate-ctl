/**
 * The entrypoint for the action.
 */
import * as core from '@actions/core'
import { cleanup, logout, revokeToken } from './main'

async function run(): Promise<void> {
  const shouldLogout = core.getInput('logout').toLowerCase() === 'true'
  const shouldSkipRevoke = core.getInput('skip-revoke').toLowerCase() === 'true'

  if (shouldLogout) {
    if (!shouldSkipRevoke) {
      await revokeToken()
    }
    await logout()
  } else {
    core.debug('Skipping logout (logout input is not set to "true")')
    await cleanup()
  }
}

run()
