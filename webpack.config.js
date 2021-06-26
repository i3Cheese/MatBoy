const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'static'),
  },
  module: { rules: [
    {
      test   : /\.js|.jsx|.tsx|.ts$/,
      include: [
        path.resolve(__dirname, 'src')
      ],
      use: ['babel-loader'],
    },
  ]},
};