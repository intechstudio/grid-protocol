const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src_js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: 'MyLibrary',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: './src/grid_protocol_bot.json' }
            ]
        })
    ],
    externals: {
        // Specify any dependencies you don't want to bundle here.
        // For example: 'react': 'React'
    }
};
