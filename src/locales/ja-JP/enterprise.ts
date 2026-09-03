export default {
  'menu.settings.branding': 'ブランディング',

  'branding.page.description':
    'プラットフォームを自社製品としてカスタマイズします。名称、ロゴ、配色、リンクを設定でき、変更は全ユーザーに適用されます。',

  'branding.section.identity': 'ブランド情報',
  'branding.section.identity.description':
    '製品名はサイドバー、ブラウザのタブ、ログインページに表示されます。',
  'branding.form.productName': '製品名',
  'branding.form.productName.holder': '空欄の場合は既定の名称を使用します',

  'branding.section.appearance': '外観',
  'branding.section.appearance.description':
    'ロゴとテーマカラー。未設定の項目は既定値が使用されます。',
  'branding.form.colorPrimary': 'テーマカラー',
  'branding.form.logoLight': 'ロゴ（ライトテーマ）',
  'branding.form.logoLight.tips':
    'サイドバー上部に表示されます。高さ 28px 程度の横長ロゴを推奨します。',
  'branding.form.logoDark': 'ロゴ（ダークテーマ）',
  'branding.form.logoDark.tips':
    '空欄の場合、ダークテーマでもライトテーマのロゴを使用します。',
  'branding.form.miniLogo': '折りたたみ時のロゴ',
  'branding.form.miniLogo.tips':
    'サイドバーを折りたたんだときに表示されます。正方形のアイコンを推奨します。',
  'branding.form.favicon': 'ファビコン',
  'branding.form.favicon.tips':
    'ブラウザのタブに表示されるアイコン。32×32 の PNG または ICO を推奨します。',

  'branding.section.login': 'ログインページ',
  'branding.section.login.description': 'サインイン前に表示される内容です。',
  'branding.form.loginTitle': 'ログインページのタイトル',
  'branding.form.loginSubtitle': 'ログインページのサブタイトル',
  'branding.form.loginBackground': 'ログインページの背景画像',
  'branding.form.loginBackground.tips':
    '横長の画像を推奨します。ファイルサイズにご注意ください。',

  'branding.section.links': 'リンクとドメイン',
  'branding.section.links.description':
    '画面内の外部リンクを自社のリソースに差し替えます。',
  'branding.form.docUrl': 'ドキュメント URL',
  'branding.form.supportUrl': 'サポート URL',
  'branding.form.contactUrl': 'お問い合わせ URL',
  'branding.form.customDomain': 'カスタムドメイン',
  'branding.form.customDomain.tips':
    'ホスト名のみを入力してください（例: ai.example.com）。DNS と証明書は別途設定が必要です。',
  'branding.form.rule.url':
    'http:// または https:// で始まる URL を入力してください',
  'branding.form.rule.domain':
    '有効なホスト名を入力してください（例: ai.example.com）',

  'branding.asset.upload': '画像をアップロード',
  'branding.asset.replace': '変更',
  'branding.asset.empty': '既定値を使用中',
  'branding.asset.hint': 'PNG、JPEG、WebP、SVG、ICO に対応。{size} まで',
  'branding.asset.error.type': 'サポートされていない画像形式です',
  'branding.asset.error.size': '画像が {size} の上限を超えています',

  'branding.message.saved':
    'ブランディング設定を保存しました。変更を適用するため再読み込みしています…',
  'branding.message.assetUpdated': '画像を更新しました',
  'branding.message.assetRemoved': '画像を削除しました',

  'menu.accessControl.auditLogs': '監査ログ',
  'menu.accessControl.ipAccessControl': 'IP アクセス制御',

  'auditLogs.table.time': '時刻',
  'auditLogs.table.actor': '操作者',
  'auditLogs.table.action': '操作',
  'auditLogs.table.resource': 'リソース',
  'auditLogs.table.result': '結果',
  'auditLogs.table.sourceIp': '送信元 IP',
  'auditLogs.filter.search': '操作者またはリソースを検索',
  'auditLogs.filter.action': 'すべての操作',
  'auditLogs.filter.result': 'すべての結果',
  'auditLogs.result.success': '成功',
  'auditLogs.result.failure': '失敗',
  'auditLogs.button.detail': '詳細',
  'auditLogs.button.export': 'CSV をエクスポート',
  'auditLogs.export.failed':
    'エクスポートに失敗しました。期間を狭めてお試しください。',
  'auditLogs.detail.title': '監査レコード',
  'auditLogs.detail.actorType': '操作者の種別',
  'auditLogs.detail.apiKey': 'API キー',
  'auditLogs.detail.organization': '組織',
  'auditLogs.detail.request': 'リクエスト',
  'auditLogs.detail.userAgent': 'ユーザーエージェント',
  'auditLogs.detail.requestId': 'リクエスト ID',
  'auditLogs.detail.error': 'エラー内容',
  'auditLogs.detail.changes': '変更内容',
  'auditLogs.noresult.title': '監査レコードはまだありません',
  'auditLogs.noresult.subTitle':
    'ユーザーがリソースを作成・更新・削除すると、ここに記録が表示されます。',
  'auditLogs.noresult.nofound': '条件に一致するレコードはありません',

  'ipAccess.rule': 'IP アクセスルール',
  'ipAccess.rule.add': 'ルールを追加',
  'ipAccess.rule.edit': 'ルールを編集',
  'ipAccess.page.description':
    'ルールは優先度の小さい順に評価され、最初に一致したものが適用されます。いずれも一致しない場合は既定のポリシーが適用されます。',
  'ipAccess.policy.enabled': 'IP 制御を有効化',
  'ipAccess.policy.defaultAction': '既定のポリシー',
  'ipAccess.policy.confirm.title': 'IP 制御を有効にしますか？',
  'ipAccess.policy.confirm.deny':
    '既定のポリシーが「拒否」のため、許可ルールに一致しないすべてのアドレス（現在お使いのアドレスを含む）が拒否されます。事前に自分の IP をテストしてください。',
  'ipAccess.policy.confirm.allow':
    '既定のポリシーが「許可」のため、拒否ルールに一致するアドレスのみが拒否されます。',
  'ipAccess.policy.denyWarning':
    '既定の拒否が有効です。許可ルールに一致するアドレスのみプラットフォームにアクセスできます。',
  'ipAccess.form.cidr': 'IP / CIDR',
  'ipAccess.form.action': 'アクション',
  'ipAccess.form.priority': '優先度',
  'ipAccess.form.priority.tips': '数値が小さいものから評価されます。',
  'ipAccess.form.enabled': '有効',
  'ipAccess.form.rule.cidr':
    'IP アドレスまたは CIDR を入力してください（例: 10.0.0.0/8）',
  'ipAccess.form.rule.cidrHostBits':
    'ホスト部が 0 ではありません。ネットワークアドレス（例: 10.0.0.0/8）ではありませんか？',
  'ipAccess.action.allow': '許可',
  'ipAccess.action.deny': '拒否',
  'ipAccess.table.priority': '優先度',
  'ipAccess.filter.name': '名前で検索',
  'ipAccess.test.holder': 'IP アドレスをテスト',
  'ipAccess.test.button': 'テスト',
  'ipAccess.test.allowed': '許可',
  'ipAccess.test.blocked': '拒否',
  'ipAccess.test.byDefault': '既定のポリシー',
  'ipAccess.noresult.title': 'IP ルールはまだありません',
  'ipAccess.noresult.subTitle':
    '特定のネットワークを許可または拒否するルールを追加し、制御を有効にしてください。',
  'ipAccess.noresult.nofound': '条件に一致するルールはありません'
};
