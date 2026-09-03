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
  'branding.message.assetRemoved': '图片已移除',

  'menu.accessControl.auditLogs': '审计日志',
  'menu.accessControl.ipAccessControl': 'IP 访问控制',

  'auditLogs.table.time': '时间',
  'auditLogs.table.actor': '操作者',
  'auditLogs.table.action': '操作',
  'auditLogs.table.resource': '资源',
  'auditLogs.table.result': '结果',
  'auditLogs.table.sourceIp': '来源 IP',
  'auditLogs.filter.search': '搜索操作者或资源',
  'auditLogs.filter.action': '全部操作',
  'auditLogs.filter.result': '全部结果',
  'auditLogs.result.success': '成功',
  'auditLogs.result.failure': '失败',
  'auditLogs.button.detail': '详情',
  'auditLogs.button.export': '导出 CSV',
  'auditLogs.export.failed': '导出失败，请尝试缩小时间范围。',
  'auditLogs.detail.title': '审计记录',
  'auditLogs.detail.actorType': '操作者类型',
  'auditLogs.detail.apiKey': 'API 密钥',
  'auditLogs.detail.organization': '组织',
  'auditLogs.detail.request': '请求',
  'auditLogs.detail.userAgent': '客户端',
  'auditLogs.detail.requestId': '请求 ID',
  'auditLogs.detail.error': '错误信息',
  'auditLogs.detail.changes': '变更内容',
  'auditLogs.noresult.title': '暂无审计记录',
  'auditLogs.noresult.subTitle':
    '用户创建、修改、删除资源时，记录会出现在这里。',
  'auditLogs.noresult.nofound': '没有符合筛选条件的记录',

  'ipAccess.rule': 'IP 访问规则',
  'ipAccess.rule.add': '添加规则',
  'ipAccess.rule.edit': '编辑规则',
  'ipAccess.page.description':
    '规则按优先级从小到大匹配，命中即生效；全部未命中时应用默认策略。',
  'ipAccess.policy.enabled': '启用 IP 管控',
  'ipAccess.policy.defaultAction': '默认策略',
  'ipAccess.policy.confirm.title': '确认启用 IP 管控？',
  'ipAccess.policy.confirm.deny':
    '默认策略为拒绝，所有没有命中允许规则的地址都将被拒绝访问，包括你当前的地址。建议先测试自己的 IP。',
  'ipAccess.policy.confirm.allow':
    '默认策略为允许，只有命中拒绝规则的地址会被拒绝访问。',
  'ipAccess.policy.denyWarning':
    '默认拒绝已生效，只有命中允许规则的地址才能访问平台。',
  'ipAccess.form.cidr': 'IP 或网段',
  'ipAccess.form.action': '动作',
  'ipAccess.form.priority': '优先级',
  'ipAccess.form.priority.tips': '数值越小越先匹配。',
  'ipAccess.form.enabled': '启用',
  'ipAccess.form.rule.cidr': '请填写 IP 地址或网段，例如 10.0.0.0/8',
  'ipAccess.form.rule.cidrHostBits':
    '主机位不为 0，你要填的是不是网络地址，例如 10.0.0.0/8？',
  'ipAccess.action.allow': '允许',
  'ipAccess.action.deny': '拒绝',
  'ipAccess.table.priority': '优先级',
  'ipAccess.filter.name': '按名称搜索',
  'ipAccess.test.holder': '测试 IP 地址',
  'ipAccess.test.button': '测试',
  'ipAccess.test.allowed': '允许',
  'ipAccess.test.blocked': '拒绝',
  'ipAccess.test.byDefault': '默认策略',
  'ipAccess.noresult.title': '暂无 IP 规则',
  'ipAccess.noresult.subTitle': '添加规则以允许或拒绝特定网段，然后启用管控。',
  'ipAccess.noresult.nofound': '没有符合筛选条件的规则'
};
