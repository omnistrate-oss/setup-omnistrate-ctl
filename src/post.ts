/**
 * The entrypoint for the action.
 */
import * as core from '@actions/core'
import { logout } from './main'

const shouldLogout = core.getInput('logout').toLowerCase() === 'true'
if (shouldLogout) {
  logout()
} else {
  core.debug('Skipping logout (logout input is not set to "true")')
}
