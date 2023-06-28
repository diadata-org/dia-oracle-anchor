export const CommonErrors = {
  // common errors - start from 1000
  not_implemented: { code: 1000, status: 501, message: 'Not Implemented.' },
  request_validation_error: { code: 1001, status: 422, message: 'The request failed due to a validation error.' },
  internal_server_error: { code: 1002, status: 500, message: 'Internal Server Error' },
  request_forbidden_error: { code: 1003, status: 403, message: 'Forbidden' }
}
