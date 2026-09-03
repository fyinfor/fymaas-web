export default {
  // `menu.settings` already exists in menu.ts, which loads after this
  // file and would win anyway -- only the new leaf belongs here.
  'menu.settings.branding': '品牌定制',

  'branding.page.description':
    '将平台定制成你自己的产品：名称、标识、配色与相关链接。设置对所有用户生效。',

  'branding.section.identity': '品牌标识',
  'branding.section.identity.description':
    '产品名称会出现在侧边栏、浏览器标签页和登录页。',
  'branding.form.productName': '产品名称',
  'branding.form.productName.holder': '留空则使用默认名称',

  'branding.section.appearance': '视觉外观',
  'branding.section.appearance.description':
    '标识与主题色。未上传的图片会沿用内置默认值。',
  'branding.form.colorPrimary': '主题色',
  'branding.form.logoLight': '标识（浅色主题）',
  'branding.form.logoLight.tips':
    '显示在侧边栏顶部，建议高度 28px 的横向标识。',
  'branding.form.logoDark': '标识（深色主题）',
  'branding.form.logoDark.tips': '留空则深色主题下沿用浅色标识。',
  'branding.form.miniLogo': '折叠标识',
  'branding.form.miniLogo.tips': '侧边栏收起时显示，建议为方形图标。',
  'branding.form.favicon': '站点图标',
  'branding.form.favicon.tips': '浏览器标签页图标，建议 32×32 的 PNG 或 ICO。',

  'branding.section.login': '登录页',
  'branding.section.login.description': '用户登录前看到的内容。',
  'branding.form.loginTitle': '登录页标题',
  'branding.form.loginSubtitle': '登录页副标题',
  'branding.form.loginBackground': '登录页背景图',
  'branding.form.loginBackground.tips': '建议使用宽幅图片，注意控制文件体积。',

  'branding.section.links': '链接与域名',
  'branding.section.links.description':
    '替换界面中指向外部资源的链接，去除默认品牌痕迹。',
  'branding.form.docUrl': '文档地址',
  'branding.form.supportUrl': '技术支持地址',
  'branding.form.contactUrl': '联系我们地址',
  'branding.form.customDomain': '自定义域名',
  'branding.form.customDomain.tips':
    '仅填写主机名，例如 ai.example.com。DNS 与证书需另行配置。',
  'branding.form.rule.url': '请填写以 http:// 或 https:// 开头的地址',
  'branding.form.rule.domain': '请填写合法的主机名，例如 ai.example.com',

  'branding.asset.upload': '上传图片',
  'branding.asset.replace': '更换',
  'branding.asset.empty': '使用默认',
  'branding.asset.hint': '支持 PNG、JPEG、WebP、SVG、ICO，不超过 {size}',
  'branding.asset.error.type': '不支持的图片格式',
  'branding.asset.error.size': '图片超过 {size} 上限',

  'branding.message.saved': '品牌设置已保存，正在刷新以应用更改…',
  'branding.message.assetUpdated': '图片已更新',
  'branding.message.assetRemoved': '图片已移除'
};
