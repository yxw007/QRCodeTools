export default class Logger {
  constructor(log, region) {
    this.log = log
    this.region = region
  }
  info(...args) {
    this.log.info(this.region, ':', ...args)
  }
  error(...args) {
    this.log.error(this.region, ':', ...args)
  }
}
