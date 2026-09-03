import { COLOR_PRIMARY } from './constants';

export default {
  'root-entry-name': 'variable',
  hashed: false,
  components: {
    Layout: {
      headerHeight: 56
    },
    Input: {
      inputFontSize: 13,
      inputFontSizeLG: 13
    },
    InputNumber: {
      handleWidth: 32
    },
    Tag: {
      defaultBg: '#f6f8f8'
    },
    Steps: {
      descriptionMaxWidth: 200,
      iconSizeSM: 20
    },
    Table: {
      headerBorderRadius: 8,
      cellPaddingInline: 16,
      cellPaddingBlock: 8,
      cellFontSize: 13,
      rowSelectedHoverBg: '#f7faf9',
      rowHoverBg: '#f7faf9',
      rowSelectedBg: 'transparent',
      headerSortActiveBg: 'transparent',
      headerSortHoverBg: 'transparent',
      bodySortBg: 'transparent',
      headerSplitColor: '#edf0f0',
      headerBg: '#f8fafa'
    },
    Button: {
      contentFontSizeLG: 13,
      contentFontSize: 13,
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
      borderRadius: 6,
      borderRadiusLG: 6,
      controlHeight: 32,
      controlHeightLG: 36
    },
    Tabs: {
      titleFontSizeLG: 14
    },
    DatePicker: {
      fontSizeLG: 13
    },
    Alert: {
      withDescriptionPadding: '12px 16px',
      withDescriptionIconSize: 18
    },
    Card: {
      headerHeight: 48
    },
    Menu: {
      iconSize: 16,
      iconMarginInlineEnd: 10,
      itemBorderRadius: 6,
      itemSelectedColor: '#0B7773',
      itemHeight: 36,
      groupTitleColor: '#182022',
      itemHoverColor: '#182022',
      itemColor: '#182022',
      itemHoverBg: '#F0F5F4',
      itemActiveBg: '#E8F7F6',
      menuItemSelectedBg: '#E8F7F6'
    },
    Progress: {
      lineBorderRadius: 3
    },
    Dropdown: {
      controlItemBgActive: '#E8F7F6',
      controlItemBgActiveHover: '#E8F7F6'
    },
    Select: {
      optionSelectedBg: '#E8F7F6',
      fontSizeLG: 13
    },
    Message: {
      contentPadding: '12px 16px'
    },
    Tooltip: {
      colorBgSpotlight: '#3e3e3e'
    },
    Cascader: {
      dropdownHeight: 240,
      optionSelectedFontWeight: 400
    },
    Slider: {
      handleSize: 8,
      handleSizeHover: 8,
      railSize: 4,
      handleActiveOutlineColor: '#B4B4B4',
      handleActiveColor: '#D0D0D0',
      handleColor: '#D0D0D0',
      handleHoverColor: '#B4B4B4',
      trackBg: 'rgba(0,0,0,0.15)',
      trackHoverBg: '#B4B4B4',
      dotActiveBorderColor: 'rgba(0,0,0,0.25)',
      dotBorderColor: 'rgba(0,0,0,0.25)'
    },
    Descriptions: {
      itemPaddingBottom: 8
    }
  },
  token: {
    darkMode: false,
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
    colorText: '#182022',
    colorTextSecondary: '#58666A',
    colorTextTertiary: '#8B989C',
    colorFillSecondary: '#edf0f0',
    colorFillTertiary: '#f1f5f5',
    colorFillQuaternary: '#f6f8f8',
    colorPrimary: COLOR_PRIMARY,
    colorInfo: '#2563EB',
    colorSuccess: '#18A875',
    colorWarning: '#EA8A16',
    colorError: '#DC3E42',
    colorBorder: '#E3E8E8',
    colorSplit: '#EDF0F0',
    borderRadiusOuter: 10,
    borderRadiusLG: 10,
    borderRadius: 6,
    borderRadiusSM: 4,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#F6F8F8',
    fontSize: 13,
    controlHeight: 36,
    controlHeightLG: 36,
    controlHeightSM: 28,
    motion: true
  }
};
