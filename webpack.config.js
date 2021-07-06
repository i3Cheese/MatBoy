const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");


module.exports = {
    mode: 'development',
    entry: {
        app: path.join(__dirname, 'src', 'index.tsx')
    },
    target: 'web',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
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
            {
                test: /\.html$/,
                loader: "html-loader"
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template:  path.join(__dirname, 'public', 'index.html'),
            filename: "./index.html"
        })
    ],
    devServer: {
        historyApiFallback: true,
        contentBase: path.join(__dirname, '/dist'),
        port: 8000,
        proxy: {
            "/api": {
                target: "http://localhost:5000",
                pathRewrite: {"^/api" : ""}
            }
        },
        hot: true
    }
};