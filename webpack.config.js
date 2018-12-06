const Webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const PostCSSPresetEnv = require('postcss-preset-env')

const postcss_loader = {
  loader: 'postcss-loader',
  options: {
    ident: 'postcss',
    plugins: () => [
      PostCSSPresetEnv({
        browsers: ['> 1%', 'last 2 versions', 'Android >= 5.0', 'Explorer >= 11'],
      }),
    ],
  },
}

module.exports = env_ => {
  if (env_ == null) {
    env_ = {}
  }

  return {
    context: `${__dirname}/src/apps/${env_.resource_name}`,
    devtool: 'source-map',
    entry: { bundle: ['@babel/polyfill', './index.ts'] },
    mode: 'development',
    module: {
      rules: [
        { test: /\.(jpg|png|gif|woff|woff2)$/, use: 'url-loader' },
        { test: /\.pug$/, use: 'pug-plain-loader' },
        {
          test: /\.stylus$/,
          oneOf: [
            {
              resourceQuery: /module/,
              use: [
                'vue-style-loader',
                { loader: 'css-loader', options: { modules: true, localIdentName: '[local]_[hash:base64:8]' } },
                postcss_loader,
                'stylus-loader',
              ],
            },
            { use: ['vue-style-loader', 'css-loader', postcss_loader, 'stylus-loader'] },
          ],
        },
        { test: /\.vue$/, use: 'vue-loader' },
        {
          test: /\.ts$/,
          use: ['babel-loader', { loader: 'ts-loader', options: { appendTsSuffixTo: [/\.vue$/], silent: true } }],
          exclude: _ => /node_modules/.test(_) && !/\.vue\.js\.ts/.test(_),
        },
      ],
    },
    output: {
      filename: '[name].js',
      libraryTarget: 'umd',
      path: `${__dirname}/force-app/main/default/staticresources/${env_.resource_name}`,
      sourceMapFilename: '[file].map',
    },
    plugins: [
      new VueLoaderPlugin(),
      new Webpack.DefinePlugin({
        'process.env': { NODE_ENV: JSON.stringify('development') },
        RESOURCE_NAME: JSON.stringify(env_.resource_name),
      }),
    ],
    resolve: { extensions: ['.ts', '.js'], alias: { vue: 'vue/dist/vue.esm.js' } },
  }
}
