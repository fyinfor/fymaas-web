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
  'branding.message.assetRemoved': 'Image removed'
};
