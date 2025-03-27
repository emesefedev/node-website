const http = require('http')
const fs = require('fs/promises')
const url = require('url')

const supportedUrls = [
  '/',
  '/index.html',
  '/about',
  '/contact-me'
]


async function respondHtml(res, { file, html, status = 200 }) {
  if (html == null && file != null) {
    html = await fs.readFile(file)
  }

  res.writeHead(status, { 'content-type': 'text/html' })
  res.write(html)
  res.end()
}


function handleErrors(server) {

  return async (req, res) => {
    try {
      await server(req, res)
    } catch (error) {
      console.error("Unhandled error", error)
      res.writeHead(500, { 'content-type': 'text/plain' })
      res.write('Internal Server Error')
      res.end()
    }
  }
}

function respond404(res) {
  return respondHtml(res, {
    file: './404.html',
    status: 404
  })
}

function redirect(res, url) {
  if(!url) {
    throw new Error('url parameter missing')
  }
  res.writeHead(302, 'Found', {
    'location': url
  })
  res.end()
}


http
  .createServer(
    handleErrors(async function (req, res) {
      const reqUrl = url.parse(req.url, true);
      console.log(reqUrl.pathname, req.url)
      if (!supportedUrls.includes(reqUrl.pathname)) {
        return await respond404(res)
      }
      const fileName = reqUrl.pathname === "/"
        ? './index.html'
        : '.' + reqUrl.pathname + '.html'

      return respondHtml(res, {
        file: fileName
      })
    })
  )
  .listen(8080);