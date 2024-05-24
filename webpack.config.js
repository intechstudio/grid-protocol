const path = require('path');

module.exports = {
    entry: './src_js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
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
    externals: {
        // Specify any dependencies you don't want to bundle here.
        // For example: 'react': 'React'
    }
};
