export default {
  // `menu.settings` already exists in menu.ts, which loads after this
  // file and would win anyway -- only the new leaf belongs here.
  'menu.settings.branding': 'Branding',

  'branding.page.description':
    'Make the platform your own product: name, logos, colours and links. Changes apply to every user.',

  'branding.section.identity': 'Identity',
  'branding.section.identity.description':
    'The product name appears in the sidebar, the browser tab and the login page.',
  'branding.form.productName': 'Product name',
  'branding.form.productName.holder': 'Leave empty to use the default name',

  'branding.section.appearance': 'Appearance',
  'branding.section.appearance.description':
    'Logos and theme colour. Anything left empty keeps the built-in default.',
  'branding.form.colorPrimary': 'Primary colour',
  'branding.form.logoLight': 'Logo (light theme)',
  'branding.form.logoLight.tips':
    'Shown at the top of the sidebar. A horizontal logo around 28px tall works best.',
  'branding.form.logoDark': 'Logo (dark theme)',
  'branding.form.logoDark.tips':
    'Leave empty to reuse the light logo in dark mode.',
  'branding.form.miniLogo': 'Collapsed logo',
  'branding.form.miniLogo.tips':
    'Shown when the sidebar is collapsed. A square mark works best.',
  'branding.form.favicon': 'Favicon',
  'branding.form.favicon.tips':
    'Browser tab icon. A 32×32 PNG or ICO works best.',

  'branding.section.login': 'Login page',
  'branding.section.login.description': 'What users see before signing in.',
  'branding.form.loginTitle': 'Login title',
  'branding.form.loginSubtitle': 'Login subtitle',
  'branding.form.loginBackground': 'Login background',
  'branding.form.loginBackground.tips':
    'A wide image works best. Keep the file size in check.',

  'branding.section.links': 'Links and domain',
  'branding.section.links.description':
    'Point the interface at your own resources instead of the defaults.',
  'branding.form.docUrl': 'Documentation URL',
  'branding.form.supportUrl': 'Support URL',
  'branding.form.contactUrl': 'Contact URL',
  'branding.form.customDomain': 'Custom domain',
  'branding.form.customDomain.tips':
    'Hostname only, e.g. ai.example.com. DNS and certificates are configured separately.',
  'branding.form.rule.url': 'Must start with http:// or https://',
  'branding.form.rule.domain': 'Must be a valid hostname, e.g. ai.example.com',

  'branding.asset.upload': 'Upload image',
  'branding.asset.replace': 'Replace',
  'branding.asset.empty': 'Using default',
  'branding.asset.hint': 'PNG, JPEG, WebP, SVG or ICO, up to {size}',
  'branding.asset.error.type': 'Unsupported image format',
  'branding.asset.error.size': 'Image exceeds the {size} limit',

  'branding.message.saved': 'Branding saved. Reloading to apply the changes…',
  'branding.message.assetUpdated': 'Image updated',
  'branding.message.assetRemoved': 'Image removed',

  'menu.accessControl.auditLogs': 'Audit Logs',
  'menu.accessControl.ipAccessControl': 'IP Access',

  'auditLogs.table.time': 'Time',
  'auditLogs.table.actor': 'Actor',
  'auditLogs.table.action': 'Action',
  'auditLogs.table.resource': 'Resource',
  'auditLogs.table.result': 'Result',
  'auditLogs.table.sourceIp': 'Source IP',
  'auditLogs.filter.search': 'Search actor or resource',
  'auditLogs.filter.action': 'All actions',
  'auditLogs.filter.result': 'All results',
  'auditLogs.result.success': 'Success',
  'auditLogs.result.failure': 'Failure',
  'auditLogs.button.detail': 'Details',
  'auditLogs.button.export': 'Export CSV',
  'auditLogs.export.failed': 'Export failed. Try narrowing the time range.',
  'auditLogs.detail.title': 'Audit entry',
  'auditLogs.detail.actorType': 'Actor type',
  'auditLogs.detail.apiKey': 'API key',
  'auditLogs.detail.organization': 'Organization',
  'auditLogs.detail.request': 'Request',
  'auditLogs.detail.userAgent': 'User agent',
  'auditLogs.detail.requestId': 'Request ID',
  'auditLogs.detail.error': 'Error',
  'auditLogs.detail.changes': 'Changes',
  'auditLogs.noresult.title': 'No audit entries yet',
  'auditLogs.noresult.subTitle':
    'Entries appear here as users create, update and delete resources.',
  'auditLogs.noresult.nofound': 'No entries match these filters',

  'ipAccess.rule': 'IP access rule',
  'ipAccess.rule.add': 'Add Rule',
  'ipAccess.rule.edit': 'Edit Rule',
  'ipAccess.page.description':
    'Rules are checked in ascending priority; the first match decides. If none match, the default action applies.',
  'ipAccess.policy.enabled': 'Enforce IP rules',
  'ipAccess.policy.defaultAction': 'Default action',
  'ipAccess.policy.confirm.title': 'Enable IP enforcement?',
  'ipAccess.policy.confirm.deny':
    'The default action is Deny, so every address without a matching Allow rule will be refused — including yours. Test your address first.',
  'ipAccess.policy.confirm.allow':
    'The default action is Allow, so only addresses matching a Deny rule will be refused.',
  'ipAccess.policy.denyWarning':
    'Deny by default is active. Only addresses matched by an Allow rule can reach the platform.',
  'ipAccess.form.cidr': 'CIDR',
  'ipAccess.form.action': 'Action',
  'ipAccess.form.priority': 'Priority',
  'ipAccess.form.priority.tips': 'Lower numbers are checked first.',
  'ipAccess.form.enabled': 'Enabled',
  'ipAccess.form.rule.cidr':
    'Must be an address or CIDR block, e.g. 10.0.0.0/8',
  'ipAccess.form.rule.cidrHostBits':
    'Host bits are set. Did you mean the network address, e.g. 10.0.0.0/8?',
  'ipAccess.action.allow': 'Allow',
  'ipAccess.action.deny': 'Deny',
  'ipAccess.table.priority': 'Priority',
  'ipAccess.filter.name': 'Search by name',
  'ipAccess.test.holder': 'Test an IP address',
  'ipAccess.test.button': 'Test',
  'ipAccess.test.allowed': 'Allowed',
  'ipAccess.test.blocked': 'Blocked',
  'ipAccess.test.byDefault': 'by default',
  'ipAccess.noresult.title': 'No IP rules yet',
  'ipAccess.noresult.subTitle':
    'Add rules to allow or deny specific networks, then turn enforcement on.',
  'ipAccess.noresult.nofound': 'No rules match these filters'
};
