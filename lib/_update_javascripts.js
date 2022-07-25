const fs = require('fs').promises
const path = require('path')

const { projectDir } = require('./path-utils')
const { getProjectVersion, fetchOriginal } = require('./update-utils')

const updateDir = path.join(projectDir, 'update')

async function removeKitJsFromApplicationJs () {
  const userVersion = await getProjectVersion()

  // If the user already has version 13 or greater of the kit installed then
  // their application.js file is all their code and we don't don't want to
  // change it
  if (userVersion >= '13.0.0') {
    return
  }

  const assetPath = 'assets/javascripts/application.js'
  const original = await fetchOriginal(userVersion, path.posix.join('app', assetPath))
  const theirs = await fs.readFile(path.resolve(projectDir, 'app', assetPath), 'utf8')

  // If the user hasn't changed their application.js file we can just replace it completely
  if (original === theirs) {
    return fs.copyFile(path.join(updateDir, 'app', assetPath), path.join(projectDir, 'app', assetPath))
  }

  // Otherwise, if the original code is contained as-is in their file, we can
  // remove the shared lines, and add our hints
  if (theirs.includes(original)) {
    const ours = await fs.readFile(path.resolve(updateDir, 'app', assetPath), 'utf8')

    let merged
    merged = theirs.replace(original, '')
    merged = ours + merged
    return fs.writeFile(path.resolve(projectDir, 'app', assetPath), merged, 'utf8')
  }

  // If the original code is not recognisable, we should give up, but not
  // without giving a warning to the user
  console.warn(
    `WARNING: update.sh was not able to automatically update your ${assetPath} file.\n` +
    'If you have issues when running your prototype please contact the GOV.UK Prototype Kit team for support,\n' +
    'using one of the methods listed at https://design-system.service.gov.uk/get-in-touch/'
  )
}

async function removeKitJsFromAppJsPath () {
  const appJsPath = path.join(projectDir, 'app', 'assets', 'javascripts')
  await fs.unlink(path.join(appJsPath, 'auto-store-data.js')).catch(() => {})
  await fs.unlink(path.join(appJsPath, 'jquery-1.11.3.js')).catch(() => {})
  await fs.unlink(path.join(appJsPath, 'step-by-step-nav.js')).catch(() => {})
  await fs.unlink(path.join(appJsPath, 'step-by-step-navigation.js')).catch(() => {})
}

async function main () {
  await removeKitJsFromAppJsPath()
  await removeKitJsFromApplicationJs()
}

module.exports = {
  /* exported for tests only */
  removeKitJsFromApplicationJs
}

if (require.main === module) {
  main()
}
