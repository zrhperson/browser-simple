const http = require('http');

const server= http.createServer((req, res) => {
    console.log(req.headers);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('myName', 'zhourh');
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(`<html maaa=a >
    <head>
        <style>
body div #myid{
    width: 100px;
    background: #ff5000;
}
body div img{
    width: 30px;
    background: #ff1111;
}
        </style>
    </head>
    <body>
        <div>
            <img id='myid' />
            <img />
        </div>
    </body>
</html>`);
})

server.listen(8088)