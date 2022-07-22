const fs = require('fs').promises
const https = require('https')
const path = require('path')

const { projectDir, packageDir } = require('./path-utils')

async function fetchOriginal (filePath) {
  const oldVersion = (await fs.readFile(path.join(projectDir, 'VERSION.txt'), 'utf8')).trim()
  const remoteUrl = `https://raw.githubusercontent.com/alphagov/govuk-prototype-kit/v${oldVersion}/${filePath}`

  let data = ''
  return new Promise((resolve, reject) => {
    https.get(remoteUrl, (response) => {
      let error

      if (response.statusCode !== 200) {
        error = new Error(`could not fetch ${remoteUrl}: status code ${response.statusCode}`)
        Object.assign(error, response)
        response.resume()
        reject(error)
      }

      response.setEncoding('utf8')

      response.on('data', (chunk) => {
        data += chunk
      })

      response.on('end', () => {
        resolve(data)
      })
    })
  })
}

async function removeKitJsFromApplicationJs () {
  const assetPath = 'assets/javascripts/application.js'
  const original = await fetchOriginal(path.posix.join('app', assetPath))
  const theirs = await fs.readFile(path.resolve(projectDir, 'app', assetPath), 'utf8')

  // If the user hasn't changed their application.js file we can just replace it completely
  if (original === theirs) {
    return fs.copyFile(path.join(packageDir, 'lib', assetPath), path.join(projectDir, 'app', assetPath))
  }

  // Otherwise, if the original code is contained as-is in their file, we can
  // remove the shared lines, and add our hints
  if (theirs.includes(original)) {
    const ours = await fs.readFile(path.resolve(packageDir, 'app', assetPath), 'utf8')

    let merged
    merged = theirs.replace(original, '\n')
    merged = ours + '\n' + merged
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

if (require.main === module) {
  main()
}
