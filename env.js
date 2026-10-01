const serverHost = 'http://localhost'
const serverPort = '8081'
const baseUrl = process.env.NODE_ENV === 'production' ? '' : `${serverHost}:${serverPort}`

export default baseUrl