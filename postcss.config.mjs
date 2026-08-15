/**
 * FortifySec uses plain global CSS and does not require Tailwind/PostCSS plugins.
 * Keep this file minimal so old repository PostCSS/Tailwind configs are overwritten
 * when deploying the production package to Vercel.
 */
const config = {
  plugins: {},
}

export default config
