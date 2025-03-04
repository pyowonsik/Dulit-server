module.export = function(options){
    return {
        ...options,
        devtool: 'source-map',
    }
}