const enums = {
  ePlatform: {
    values: ['a', 'i', 'w', 'o', 'ad'],
    description: { a: 'Android', i: 'iOS', w: 'Web', o: 'Other', ad: 'Admin' }
  },
  eStatus: {
    values: ['a', 'd'],
    default: 'a',
    description: { a: 'Active', d: 'Deactivated' }
  },
  eAdminLogTypes: {
    values: ['l', 'pc', 'rp'],
    description: { l: 'Login', pc: 'Password Change', rp: 'Reset Password' }
  },
  eAdminStatus: {
    values: ['a', 'b', 'd'],
    default: 'a',
    description: { a: 'Active', b: 'Blocked', d: 'Deactivated' }
  },
  eAdminType: {
    values: ['SUPER']
  },
  eAdminPermissionType: {
    values: ['r', 'w', 'n'],
    description: { r: 'Read', w: 'Write', n: 'None - Access Rights' }
  },
  eAdminPermission: {
    values: [
      'USERS_PERSONAL_INFO',
      'SUBADMIN',
      'PERMISSION',
      'ADMIN_ROLE',
      'RULE',
      'DASHBOARD',
      'EMAIL_TEMPLATES',
      'NOTIFICATION',
      'PUSHNOTIFICATION',
      'ROLES',
      'SETTING',
      'USERS',
      'APILOGS',
      'PROFILE_LEVEL'
    ]
  },
  eImageFormat: {
    values: [
      { extension: 'jpeg', type: 'image/jpeg' },
      { extension: 'jpg', type: 'image/jpeg' },
      { extension: 'png', type: 'image/png' },
      { extension: 'gif', type: 'image/gif' },
      { extension: 'svg', type: 'image/svg+xml' },
      { extension: 'heic', type: 'image/heic' },
      { extension: 'heif', type: 'image/heif' }
    ]
  },
  eOtpType: {
    values: ['e', 'm'],
    description: { e: 'Email', m: 'Mobile' }
  },
  eOtpAuth: {
    values: ['l'],
    description: { l: 'Register | ForgotPass | Verification | Login' }
  },
  ePermissionModule: {
    values: ['USER', 'SETTINGS', 'SUPER-ADMIN', 'OTHER', 'VENDOR'] // admin panel, manage permission
  }
  // adminLogKeys: ['D', 'W', 'P', 'KYC', 'BD', 'SUB', 'AD', 'AW', 'PC', 'L', 'PB', 'M', 'ML', 'CR', 'S', 'SLB', 'LB', 'CF', 'MP', 'PL', 'PLC', 'UPU', 'T', 'USR'], // D = DEPOSIT, W = WITHDRAW, P = PROFILE, BD = BANK DETAILS, SA = SUBADMIN, AD = ADMIN DEPOSIT, AW = ADMIN WITHDRAW, PC = PROMOCODE, L = LEAGUE, PB = PRIZE BREAKUP, M = MATCH, ML = MATCHLEAGUE, CR = COMMON RULE, S = SETTINGS, SL= SERIES LEADERBOARD, LLB = LOAD LEADERBOARD,PL = PROFILE LEVEL,PLC = PROFILE LEVEL CRITERIA, T = TOURNAMENT, USR  = USER STREAK REWARD
}

module.exports = enums
