import { ThemeConfig } from 'antd';

// Custom color palette for Budget Tracker
const colors = {
  primary: '#1890ff',
  secondary: '#722ed1',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#13c2c2',
  
  // Neutral colors
  textPrimary: '#262626',
  textSecondary: '#595959',
  textTertiary: '#8c8c8c',
  
  // Background colors
  bgPrimary: '#ffffff',
  bgSecondary: '#fafafa',
  bgTertiary: '#f5f5f5',
  
  // Border colors
  borderLight: '#f0f0f0',
  borderBase: '#d9d9d9',
  borderDark: '#bfbfbf',
};

export const budgetTrackerTheme: ThemeConfig = {
  token: {
    // Primary colors
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorInfo: colors.info,
    
    // Text colors
    colorText: colors.textPrimary,
    colorTextSecondary: colors.textSecondary,
    colorTextTertiary: colors.textTertiary,
    
    // Background colors
    colorBgBase: colors.bgPrimary,
    colorBgContainer: colors.bgPrimary,
    colorBgElevated: colors.bgPrimary,
    colorBgLayout: colors.bgSecondary,
    
    // Border colors
    colorBorder: colors.borderBase,
    colorBorderSecondary: colors.borderLight,
    
    // Typography
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    
    // Layout
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,
    
    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,
    
    // Box shadow
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.08)',
    boxShadowTertiary: '0 6px 24px rgba(0, 0, 0, 0.12)',
    
    // Line height
    lineHeight: 1.5715,
    lineHeightLG: 1.5,
    lineHeightSM: 1.66,
    
    // Control height
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
    controlHeightXS: 24,
    
    // Motion
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
  },
  components: {
    // Button customization
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      fontWeight: 500,
      primaryShadow: '0 2px 4px rgba(24, 144, 255, 0.2)',
    },
    
    // Input customization
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      paddingInline: 12,
    },
    
    // Form customization
    Form: {
      labelFontSize: 14,
      labelColor: colors.textPrimary,
      itemMarginBottom: 20,
    },
    
    // Table customization
    Table: {
      borderRadius: 8,
      headerBg: colors.bgTertiary,
      headerColor: colors.textPrimary,
      headerSortActiveBg: colors.bgSecondary,
      rowHoverBg: colors.bgSecondary,
      cellPaddingBlock: 16,
      cellPaddingInline: 16,
    },
    
    // Modal customization
    Modal: {
      borderRadius: 12,
      titleFontSize: 18,
      titleColor: colors.textPrimary,
      contentBg: colors.bgPrimary,
    },
    
    // Card customization
    Card: {
      borderRadius: 12,
      headerBg: colors.bgPrimary,
      bodyPadding: 24,
      headerFontSize: 16,
      headerHeight: 56,
    },
    
    // Select customization
    Select: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    
    // DatePicker customization
    DatePicker: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    
    // Progress customization
    Progress: {
      defaultColor: colors.primary,
      remainingColor: colors.borderLight,
    },
    
    // Message customization
    Message: {
      borderRadius: 8,
      contentPadding: '12px 16px',
    },
    
    // Notification customization
    Notification: {
      borderRadius: 12,
      padding: 20,
    },
    
    // Menu customization
    Menu: {
      itemBorderRadius: 6,
      itemHeight: 40,
      itemPaddingInline: 16,
      subMenuItemBorderRadius: 6,
    },
    
    // Layout customization
    Layout: {
      headerBg: colors.bgPrimary,
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: colors.bgPrimary,
      triggerBg: colors.bgSecondary,
      triggerColor: colors.textPrimary,
    },
  },
  algorithm: undefined, // Use default algorithm for light theme
};

// Dark theme variant (optional)
export const budgetTrackerDarkTheme: ThemeConfig = {
  ...budgetTrackerTheme,
  token: {
    ...budgetTrackerTheme.token,
    colorBgBase: '#141414',
    colorBgContainer: '#1f1f1f',
    colorBgElevated: '#262626',
    colorBgLayout: '#000000',
    colorText: '#ffffff',
    colorTextSecondary: '#bfbfbf',
    colorTextTertiary: '#8c8c8c',
    colorBorder: '#434343',
    colorBorderSecondary: '#303030',
  },
};

export default budgetTrackerTheme;
