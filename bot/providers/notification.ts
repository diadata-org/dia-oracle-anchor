import { injectable, inject } from 'inversify'
import sgMail from '@sendgrid/mail'
import path from 'path'
import EmailTemplates from 'swig-email-templates'
import { split } from 'lodash'
import { CONFIG } from '@config'
import LLogger from '@core/Logger'

@injectable()
export default class NotificationProvider {
  @inject(LLogger.name) private _logger: LLogger

  public readonly EMAIL_TEMPLATES_ROOT_PATH = path.join(__dirname, '../templates')
  public readonly MASK = '__MASK__'

  constructor(@inject(LLogger.name) logger: LLogger) {
    this._logger = logger
  }

  public async sendEmail(address: string, subject: string, text: string, html: string) {
    if (CONFIG.SYSTEM.ENV !== 'production' || CONFIG.EMAIL_NOTIFICATION.ENABLE_REPORT_TO_ADMIN !== 'enabled') {
      this._logger.info('sending email ..')
      this._logger.info('from => ' + CONFIG.EMAIL_NOTIFICATION.FROM_ADDRESS)
      this._logger.info('to => ' + address)
      this._logger.info('subject => ' + subject)
      this._logger.info('text => ' + text)
      this._logger.info('html => ' + html)
      return
    }

    sgMail.setApiKey(CONFIG.EMAIL_NOTIFICATION.SEND_GRID_API_KEY)
    const msg = {
      to: address,
      from: CONFIG.EMAIL_NOTIFICATION.FROM_ADDRESS,
      subject: subject,
      text: text,
      html: html
    }
    try {
      await sgMail.send(msg)
    } catch (error) {
      // Log friendly error
      this._logger.error(String(error))
    }
  }

  public async sendTaskRunFailed(params: { error: string; task_name: string }) {
    const context = {
      email_to: CONFIG.EMAIL_NOTIFICATION.TO_ADDRESS,
      task_name: params.task_name,
      content: `Can NOT run task ${params.task_name} error: ${params.error}`
    }

    const templates = new EmailTemplates({
      root: this.EMAIL_TEMPLATES_ROOT_PATH
    })
    try {
      await new Promise((resolve, reject) => {
        templates.render('task-run-failed.html', context, (err: any, html?: string, text?: string, subject?: string) => {
          if (err) {
            reject(err)
          } else {
            html = split(String(html || ''), this.MASK).join('<br><br>')
            subject = `${params.task_name} Run Failed`
            this.sendEmail(context.email_to, subject, String(text || ''), String(html || ''))
            resolve('done')
          }
        })
      })
    } catch (err) {
      this._logger.error(`Error when compiling mail: ${err}`)
    }
  }
}
