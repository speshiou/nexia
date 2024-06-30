const themeProperties = {
  bg_color: '--tg-theme-bg-color',
  text_color: '--tg-theme-text-color',
  hint_color: '--tg-theme-hint-color',
  link_color: '--tg-theme-link-color',
  button_color: '--tg-theme-button-color',
  button_text_color: '--tg-theme-button-text-color',
  secondary_bg_color: '--tg-theme-secondary-bg-color',
  header_bg_color: '--tg-theme-header-bg-color',
  accent_text_color: '--tg-theme-accent-text-color',
  section_bg_color: '--tg-theme-section-bg-color',
  section_header_text_color: '--tg-theme-section-header-text-color',
  subtitle_text_color: '--tg-theme-subtitle-text-color',
  destructive_text_color: '--tg-theme-destructive-text-color',
}

type ThemeKeys = keyof typeof themeProperties

export const themeProps = Object.keys(themeProperties).reduce(
  (prev, curr) => {
    ;(prev as Partial<Record<ThemeKeys, string>>)[curr as ThemeKeys] =
      `var(${themeProperties[curr as ThemeKeys]})`
    return prev
  },
  {} satisfies Partial<Record<ThemeKeys, string>>,
) as typeof themeProperties
