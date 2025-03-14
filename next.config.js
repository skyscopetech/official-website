require('dotenv').config();
const nextComposePlugins = require('next-compose-plugins');

const headers = require('./config/headers');
const includePolyfills = require('./config/includePolyfills');
const plugins = require('./config/plugins');
const { i18n } = require('./next-i18next.config.js');
const { types } = require('@babel/core');

/**
 * https://github.com/cyrilwanner/next-compose-plugins/issues/59
 */
const { withPlugins } = nextComposePlugins.extend(() => ({}));

/**
 * Exclude `localePath` from the `i18n` configuration to avoid Next.js errors.
 */
const { localePath, ...nextI18nConfig } = i18n;

/**
 * Next config
 * documentation: https://nextjs.org/docs/api-reference/next.config.js/introduction
 */
module.exports = withPlugins(plugins, {
  i18n: nextI18nConfig,
  /**
   * add the environment variables you would like exposed to the client here
   * documentation: https://nextjs.org/docs/api-reference/next.config.js/environment-variables
   */
  env: {
    ENVIRONMENT_NAME: process.env.ENVIRONMENT_NAME,
    CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN,
    CONTENTFUL_PREVIEW_ACCESS_TOKEN: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    SKYSCOPE_CONTACT_EMAIL: process.env.SKYSCOPE_CONTACT_EMAIL,
  },

  /**
   * The experimental option allows you to enable future/experimental options
   * like React 18 concurrent features.
   */
  experimental: {
    // urlImports: true,
    // concurrentFeatures: true,
    // serverComponents: true,
  },

  /**
   * SWC minification opt-in
   * Please note that while not in experimental, the swcMinification may cause issues in your build.
   * example: https://github.com/vercel/next.js/issues/30429 (Yup email validation causes an exception)
   */
  // swcMinify: true,

  poweredByHeader: false,
  reactStrictMode: false,
  compress: true,

  /**
   * add the headers you would like your next server to use
   * documentation: https://nextjs.org/docs/api-reference/next.config.js/headers
   *                https://nextjs.org/docs/advanced-features/security-headers
   */
  headers,

  /**
   * https://nextjs.org/docs/basic-features/image-optimization
   * Settings are the defaults
   */
  images: {
    deviceSizes: [320, 420, 768, 1024, 1200, 1600],
    domains: ['images.ctfassets.net','images.eu.ctfassets.net'],
    path: '/_next/image',
    loader: 'default',
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack(config, options) {
    if (!options.isServer || process.env.circularDependencies) {
      import('circular-dependency-plugin').then(({ default: CircularDependencyPlugin }) => {
        config.plugins.push(
          new CircularDependencyPlugin({
            exclude: /a\.js|node_modules/,
            failOnError: false,
            allowAsyncCycles: true,
            cwd: process.cwd(),
          }),
        );
      });
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    includePolyfills(config);

    return config;
  },
});
