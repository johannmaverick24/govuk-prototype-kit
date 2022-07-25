/* eslint-env jest */

const fs = require('fs').promises
const https = require('https')
const stream = require('stream')

const { fetchOriginal, getProjectVersion } = require('./update-utils.js')

afterEach(() => {
  jest.restoreAllMocks()
})

describe('fetchOriginal', () => {
  it('gets the contents of a file as of version from GitHub', async () => {
    const mockHttpsGet = jest.spyOn(https, 'get').mockImplementation((url, callback) => {
      const response = new stream.PassThrough()
      response.statusCode = 200

      callback(response)

      response.write('foo\n')
      response.write('bar\n')
      response.end()
    })

    await expect(fetchOriginal('99.99.99', 'app/views/foo.html')).resolves.toEqual(
      'foo\nbar\n'
    )
    expect(mockHttpsGet).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/alphagov/govuk-prototype-kit/v99.99.99/app/views/foo.html',
      expect.anything()
    )
  })
})

describe('getProjectVersion', () => {
  it('reads the VERSION.txt file to get the version number', async () => {
    const mockReadFile = jest.spyOn(fs, 'readFile').mockImplementation(
      async () => '99.99.99\n'
    )

    await expect(getProjectVersion()).resolves.toEqual('99.99.99')
    expect(mockReadFile).toHaveBeenCalledWith(
      expect.stringMatching(/.*\/VERSION.txt$/),
      'utf8'
    )
  })
})
