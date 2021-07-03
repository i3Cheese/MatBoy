const path = require('path');
const TerserWebpackPlugin = require("terser-webpack-plugin");


module.exports = {
    mode: 'development',
    entry: {
        app: path.join(__dirname, 'src', 'index.tsx')
    },
    target: 'web',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'static'),
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.(ts|tsx)$/,
                loader: 'ts-loader',
                // include: [path.resolve(__dirname, 'yourAppPath')],
                exclude: '/node_modules',
            },
        ]
    },
};