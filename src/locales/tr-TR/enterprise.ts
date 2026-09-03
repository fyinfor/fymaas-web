export default {
  'menu.settings.branding': 'Marka',

  'branding.page.description':
    'Platformu kendi ürününüz hâline getirin: ad, logolar, renkler ve bağlantılar. Değişiklikler tüm kullanıcılar için geçerli olur.',

  'branding.section.identity': 'Kimlik',
  'branding.section.identity.description':
    'Ürün adı kenar çubuğunda, tarayıcı sekmesinde ve giriş sayfasında görünür.',
  'branding.form.productName': 'Ürün adı',
  'branding.form.productName.holder':
    'Varsayılan adı kullanmak için boş bırakın',

  'branding.section.appearance': 'Görünüm',
  'branding.section.appearance.description':
    'Logolar ve tema rengi. Boş bırakılan alanlar varsayılan değerlerini korur.',
  'branding.form.colorPrimary': 'Ana renk',
  'branding.form.logoLight': 'Logo (açık tema)',
  'branding.form.logoLight.tips':
    'Kenar çubuğunun üstünde görünür. Yaklaşık 28 piksel yüksekliğinde yatay bir logo en iyi sonucu verir.',
  'branding.form.logoDark': 'Logo (koyu tema)',
  'branding.form.logoDark.tips':
    'Koyu temada açık tema logosunun kullanılması için boş bırakın.',
  'branding.form.miniLogo': 'Daraltılmış logo',
  'branding.form.miniLogo.tips':
    'Kenar çubuğu daraltıldığında görünür. Kare bir simge en iyi sonucu verir.',
  'branding.form.favicon': 'Site simgesi',
  'branding.form.favicon.tips':
    'Tarayıcı sekmesi simgesi. 32×32 boyutunda PNG veya ICO en iyi sonucu verir.',

  'branding.section.login': 'Giriş sayfası',
  'branding.section.login.description':
    'Kullanıcıların oturum açmadan önce gördükleri içerik.',
  'branding.form.loginTitle': 'Giriş sayfası başlığı',
  'branding.form.loginSubtitle': 'Giriş sayfası alt başlığı',
  'branding.form.loginBackground': 'Giriş sayfası arka planı',
  'branding.form.loginBackground.tips':
    'Geniş bir görsel en iyi sonucu verir. Dosya boyutuna dikkat edin.',

  'branding.section.links': 'Bağlantılar ve alan adı',
  'branding.section.links.description':
    'Arayüzdeki bağlantıları kendi kaynaklarınıza yönlendirin.',
  'branding.form.docUrl': 'Dokümantasyon adresi',
  'branding.form.supportUrl': 'Destek adresi',
  'branding.form.contactUrl': 'İletişim adresi',
  'branding.form.customDomain': 'Özel alan adı',
  'branding.form.customDomain.tips':
    'Yalnızca ana bilgisayar adı, örneğin ai.example.com. DNS ve sertifikalar ayrıca yapılandırılır.',
  'branding.form.rule.url': 'http:// veya https:// ile başlamalıdır',
  'branding.form.rule.domain':
    'Geçerli bir ana bilgisayar adı girin, örneğin ai.example.com',

  'branding.asset.upload': 'Görsel yükle',
  'branding.asset.replace': 'Değiştir',
  'branding.asset.empty': 'Varsayılan kullanılıyor',
  'branding.asset.hint': 'PNG, JPEG, WebP, SVG veya ICO, en fazla {size}',
  'branding.asset.error.type': 'Desteklenmeyen görsel biçimi',
  'branding.asset.error.size': 'Görsel {size} sınırını aşıyor',

  'branding.message.saved':
    'Marka ayarları kaydedildi. Değişiklikleri uygulamak için sayfa yenileniyor…',
  'branding.message.assetUpdated': 'Görsel güncellendi',
  'branding.message.assetRemoved': 'Görsel kaldırıldı',

  'menu.accessControl.auditLogs': 'Denetim Kayıtları',
  'menu.accessControl.ipAccessControl': 'IP Erişimi',

  'auditLogs.table.time': 'Zaman',
  'auditLogs.table.actor': 'İşlemi yapan',
  'auditLogs.table.action': 'İşlem',
  'auditLogs.table.resource': 'Kaynak',
  'auditLogs.table.result': 'Sonuç',
  'auditLogs.table.sourceIp': 'Kaynak IP',
  'auditLogs.filter.search': 'Kişi veya kaynak ara',
  'auditLogs.filter.action': 'Tüm işlemler',
  'auditLogs.filter.result': 'Tüm sonuçlar',
  'auditLogs.result.success': 'Başarılı',
  'auditLogs.result.failure': 'Başarısız',
  'auditLogs.button.detail': 'Ayrıntılar',
  'auditLogs.button.export': "CSV'ye aktar",
  'auditLogs.export.failed':
    'Aktarma başarısız oldu. Tarih aralığını daraltmayı deneyin.',
  'auditLogs.detail.title': 'Denetim kaydı',
  'auditLogs.detail.actorType': 'Kişi türü',
  'auditLogs.detail.apiKey': 'API anahtarı',
  'auditLogs.detail.organization': 'Organizasyon',
  'auditLogs.detail.request': 'İstek',
  'auditLogs.detail.userAgent': 'İstemci',
  'auditLogs.detail.requestId': 'İstek kimliği',
  'auditLogs.detail.error': 'Hata',
  'auditLogs.detail.changes': 'Değişiklikler',
  'auditLogs.noresult.title': 'Henüz denetim kaydı yok',
  'auditLogs.noresult.subTitle':
    'Kullanıcılar kaynak oluşturdukça, güncelledikçe ve sildikçe kayıtlar burada görünür.',
  'auditLogs.noresult.nofound': 'Bu filtrelere uyan kayıt yok',

  'ipAccess.rule': 'IP erişim kuralı',
  'ipAccess.rule.add': 'Kural Ekle',
  'ipAccess.rule.edit': 'Kuralı Düzenle',
  'ipAccess.page.description':
    'Kurallar önceliğe göre artan sırada değerlendirilir; ilk eşleşen geçerli olur. Hiçbiri eşleşmezse varsayılan işlem uygulanır.',
  'ipAccess.policy.enabled': 'IP kurallarını uygula',
  'ipAccess.policy.defaultAction': 'Varsayılan işlem',
  'ipAccess.policy.confirm.title': 'IP denetimi etkinleştirilsin mi?',
  'ipAccess.policy.confirm.deny':
    'Varsayılan işlem Reddet olduğundan, eşleşen bir izin kuralı olmayan tüm adresler — sizin adresiniz dahil — reddedilir. Önce kendi IP adresinizi test edin.',
  'ipAccess.policy.confirm.allow':
    'Varsayılan işlem İzin Ver olduğundan, yalnızca bir reddetme kuralıyla eşleşen adresler reddedilir.',
  'ipAccess.policy.denyWarning':
    'Varsayılan reddetme etkin. Platforma yalnızca bir izin kuralıyla eşleşen adresler erişebilir.',
  'ipAccess.form.cidr': 'IP veya CIDR',
  'ipAccess.form.action': 'İşlem',
  'ipAccess.form.priority': 'Öncelik',
  'ipAccess.form.priority.tips': 'Küçük değerler önce değerlendirilir.',
  'ipAccess.form.enabled': 'Etkin',
  'ipAccess.form.rule.cidr':
    'Bir IP adresi veya CIDR bloğu girin, örn. 10.0.0.0/8',
  'ipAccess.form.rule.cidrHostBits':
    'Ana makine bitleri ayarlanmış. Ağ adresini mi kastettiniz, örn. 10.0.0.0/8?',
  'ipAccess.action.allow': 'İzin ver',
  'ipAccess.action.deny': 'Reddet',
  'ipAccess.table.priority': 'Öncelik',
  'ipAccess.filter.name': 'Ada göre ara',
  'ipAccess.test.holder': 'Bir IP adresini test et',
  'ipAccess.test.button': 'Test et',
  'ipAccess.test.allowed': 'İzin verildi',
  'ipAccess.test.blocked': 'Engellendi',
  'ipAccess.test.byDefault': 'varsayılan olarak',
  'ipAccess.noresult.title': 'Henüz IP kuralı yok',
  'ipAccess.noresult.subTitle':
    'Belirli ağlara izin vermek veya onları reddetmek için kural ekleyin, ardından denetimi etkinleştirin.',
  'ipAccess.noresult.nofound': 'Bu filtrelere uyan kural yok'
};
