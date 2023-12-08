const message = {
  mongoDBError: 'Error connecting to MongoDb',
  mongoDBConnected: 'MongoDb connected successfully.',
  err_unauthorized: 'Authentication failed. Please login again!',
  access_denied: 'You don\'t have permission',
  read_access_denied: 'You don\'t have read permission for ##',
  write_access_denied: 'You don\'t have write permission for ##',
  user_blocked: 'You are blocked by our system. Contact administrator for more details.',
  auth_failed: 'Please enter a valid credentials.',
  OTP_sent_succ: 'OTP sent successfully.',
  limit_reached: 'You have reached a limit for sending ##. Please try after some time.',
  must_alpha_num: 'Username allows alphanumeric characters only.',
  invalid: '## is invalid.',
  not_exist: '## does not exist.',
  do_not_exist: '## do not exist.',
  already_exist: '## is already exist.',
  add_success: '## added successfully.',
  success: '## fetched successfully.',
  del_success: '## deleted successfully.',
  role_exist: '## is already exist in SubAdmin.',
  error: 'Something went wrong.',
  error_with: 'Something went wrong with ##.',
  update_success: '## updated successfully.'

}

module.exports = message
