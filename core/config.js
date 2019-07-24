module.exports = {
    server: {
        isDev: false,
        port: 80,
        baseUrl: 'http://127.0.0.1:80/',
        name: 'Block Reducer2',
        description: 'Block Reducer2',
        author: 'Zhenlong J.',
        secret: 'blockreducer2@@',
        // sslKey: './sslcert/localhost.key',
        // sslCert: './sslcert/localhost.cert',
        // sslCA: './sslcert/alphasslrootcabundle.crt',
        environment: 'development',
    },
    mysql: {
        connectionLimit: 10,
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'blockreducer2',
        port: 3306
    },
    session: {
        name: 'BlockReducer2',
        key: 'blockreducer2',
        secret: 'blockreducer2@@',
    },
    dbTblName: {
        users: 'users',
    },
};
