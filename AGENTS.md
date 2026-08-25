# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# STRICT DESIGN RULES
1. **NO SHADOWS AT ALL (ហាមប្រើ Shadow ដាច់ខាត)**: Never use `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, `elevation`, or `box-shadow`. Always use clean, crisp 1px borders (`borderWidth: 1`, `borderColor: '#E2E8F0'` / `'#CBD5E1'`).
2. **NO SUBTITLES IN HEADERS**: All component and module headers must be clean title-only.
3. **NO COLORED BORDER STRIPES ON ROUNDED CHIPS**: Never use `borderLeftWidth: 2` or `borderRightWidth: 2` on rounded pills/chips. Use clean soft tinted pills with tiny dot indicators.
4. **NO DEFAULT BROWSER OUTLINES**: Always include `outlineStyle: 'none'` on inputs and interactive elements.
5. **CONSISTENT PADDING**: Maintain standardized `16px` padding across all views and modules.

