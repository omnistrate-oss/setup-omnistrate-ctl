/**
 * The entrypoint for the action.
 */
import * as core from '@actions/core'
import { cleanup, logout } from './main'

async function run(): Promise<void> {
  const shouldLogout = core.getInput('logout').toLowerCase() === 'true'
  if (shouldLogout) {
    await logout()
  } else {
    core.debug('Skipping logout (logout input is not set to "true")')
  }
  await cleanup()
}

run()
