export default {
  'menu.settings.branding': 'Брендирование',

  'branding.page.description':
    'Настройте платформу под собственный продукт: название, логотипы, цвета и ссылки. Изменения применяются ко всем пользователям.',

  'branding.section.identity': 'Идентификация',
  'branding.section.identity.description':
    'Название продукта отображается в боковом меню, во вкладке браузера и на странице входа.',
  'branding.form.productName': 'Название продукта',
  'branding.form.productName.holder':
    'Оставьте пустым, чтобы использовать название по умолчанию',

  'branding.section.appearance': 'Оформление',
  'branding.section.appearance.description':
    'Логотипы и основной цвет. Незаполненные поля сохраняют значения по умолчанию.',
  'branding.form.colorPrimary': 'Основной цвет',
  'branding.form.logoLight': 'Логотип (светлая тема)',
  'branding.form.logoLight.tips':
    'Отображается в верхней части бокового меню. Лучше всего подходит горизонтальный логотип высотой около 28 пикселей.',
  'branding.form.logoDark': 'Логотип (тёмная тема)',
  'branding.form.logoDark.tips':
    'Оставьте пустым, чтобы в тёмной теме использовался светлый логотип.',
  'branding.form.miniLogo': 'Логотип в свёрнутом виде',
  'branding.form.miniLogo.tips':
    'Отображается, когда боковое меню свёрнуто. Лучше всего подходит квадратный знак.',
  'branding.form.favicon': 'Значок сайта',
  'branding.form.favicon.tips':
    'Значок во вкладке браузера. Лучше всего подходит PNG или ICO размером 32×32.',

  'branding.section.login': 'Страница входа',
  'branding.section.login.description': 'То, что видят пользователи до входа.',
  'branding.form.loginTitle': 'Заголовок страницы входа',
  'branding.form.loginSubtitle': 'Подзаголовок страницы входа',
  'branding.form.loginBackground': 'Фон страницы входа',
  'branding.form.loginBackground.tips':
    'Лучше всего подходит широкое изображение. Следите за размером файла.',

  'branding.section.links': 'Ссылки и домен',
  'branding.section.links.description':
    'Замените ссылки в интерфейсе на собственные ресурсы.',
  'branding.form.docUrl': 'Ссылка на документацию',
  'branding.form.supportUrl': 'Ссылка на поддержку',
  'branding.form.contactUrl': 'Ссылка для связи',
  'branding.form.customDomain': 'Собственный домен',
  'branding.form.customDomain.tips':
    'Только имя хоста, например ai.example.com. DNS и сертификаты настраиваются отдельно.',
  'branding.form.rule.url': 'Должно начинаться с http:// или https://',
  'branding.form.rule.domain':
    'Укажите корректное имя хоста, например ai.example.com',

  'branding.asset.upload': 'Загрузить изображение',
  'branding.asset.replace': 'Заменить',
  'branding.asset.empty': 'Используется по умолчанию',
  'branding.asset.hint': 'PNG, JPEG, WebP, SVG или ICO, до {size}',
  'branding.asset.error.type': 'Неподдерживаемый формат изображения',
  'branding.asset.error.size': 'Изображение превышает лимит {size}',

  'branding.message.saved':
    'Настройки брендирования сохранены. Перезагружаем страницу, чтобы применить изменения…',
  'branding.message.assetUpdated': 'Изображение обновлено',
  'branding.message.assetRemoved': 'Изображение удалено',

  'menu.accessControl.auditLogs': 'Журнал аудита',
  'menu.accessControl.ipAccessControl': 'Доступ по IP',

  'auditLogs.table.time': 'Время',
  'auditLogs.table.actor': 'Пользователь',
  'auditLogs.table.action': 'Действие',
  'auditLogs.table.resource': 'Ресурс',
  'auditLogs.table.result': 'Результат',
  'auditLogs.table.sourceIp': 'IP-адрес источника',
  'auditLogs.filter.search': 'Поиск по пользователю или ресурсу',
  'auditLogs.filter.action': 'Все действия',
  'auditLogs.filter.result': 'Все результаты',
  'auditLogs.result.success': 'Успешно',
  'auditLogs.result.failure': 'Ошибка',
  'auditLogs.button.detail': 'Подробнее',
  'auditLogs.button.export': 'Экспорт в CSV',
  'auditLogs.export.failed':
    'Не удалось выполнить экспорт. Попробуйте сузить период.',
  'auditLogs.detail.title': 'Запись аудита',
  'auditLogs.detail.actorType': 'Тип пользователя',
  'auditLogs.detail.apiKey': 'API-ключ',
  'auditLogs.detail.organization': 'Организация',
  'auditLogs.detail.request': 'Запрос',
  'auditLogs.detail.userAgent': 'User agent',
  'auditLogs.detail.requestId': 'ID запроса',
  'auditLogs.detail.error': 'Ошибка',
  'auditLogs.detail.changes': 'Изменения',
  'auditLogs.noresult.title': 'Записей аудита пока нет',
  'auditLogs.noresult.subTitle':
    'Записи появятся здесь, когда пользователи начнут создавать, изменять и удалять ресурсы.',
  'auditLogs.noresult.nofound': 'Нет записей, удовлетворяющих фильтрам',

  'ipAccess.rule': 'Правило доступа по IP',
  'ipAccess.rule.add': 'Добавить правило',
  'ipAccess.rule.edit': 'Изменить правило',
  'ipAccess.page.description':
    'Правила проверяются по возрастанию приоритета; применяется первое совпавшее. Если совпадений нет, действует политика по умолчанию.',
  'ipAccess.policy.enabled': 'Применять правила IP',
  'ipAccess.policy.defaultAction': 'Действие по умолчанию',
  'ipAccess.policy.confirm.title': 'Включить контроль по IP?',
  'ipAccess.policy.confirm.deny':
    'Действие по умолчанию — «Запретить», поэтому все адреса без совпадающего разрешающего правила будут отклонены, включая ваш. Сначала проверьте свой IP.',
  'ipAccess.policy.confirm.allow':
    'Действие по умолчанию — «Разрешить», поэтому будут отклонены только адреса, совпавшие с запрещающим правилом.',
  'ipAccess.policy.denyWarning':
    'Запрет по умолчанию активен. Доступ к платформе есть только у адресов, совпавших с разрешающим правилом.',
  'ipAccess.form.cidr': 'IP или CIDR',
  'ipAccess.form.action': 'Действие',
  'ipAccess.form.priority': 'Приоритет',
  'ipAccess.form.priority.tips': 'Меньшие значения проверяются раньше.',
  'ipAccess.form.enabled': 'Включено',
  'ipAccess.form.rule.cidr':
    'Укажите IP-адрес или блок CIDR, например 10.0.0.0/8',
  'ipAccess.form.rule.cidrHostBits':
    'Заданы биты узла. Возможно, вы имели в виду адрес сети, например 10.0.0.0/8?',
  'ipAccess.action.allow': 'Разрешить',
  'ipAccess.action.deny': 'Запретить',
  'ipAccess.table.priority': 'Приоритет',
  'ipAccess.filter.name': 'Поиск по названию',
  'ipAccess.test.holder': 'Проверить IP-адрес',
  'ipAccess.test.button': 'Проверить',
  'ipAccess.test.allowed': 'Разрешён',
  'ipAccess.test.blocked': 'Запрещён',
  'ipAccess.test.byDefault': 'по умолчанию',
  'ipAccess.noresult.title': 'Правил IP пока нет',
  'ipAccess.noresult.subTitle':
    'Добавьте правила, чтобы разрешить или запретить конкретные сети, затем включите контроль.',
  'ipAccess.noresult.nofound': 'Нет правил, удовлетворяющих фильтрам'
};
