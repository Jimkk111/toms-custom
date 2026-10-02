const serverHost = 'http://192.168.0.62'
// const serverHost = 'http://localhost'
const serverPort = '8081'
const baseUrl = process.env.NODE_ENV === 'production' ? '' : `${serverHost}:${serverPort}`

export default baseUrl