const net = require("net");

class Request {
  constructor(options) {
    this.method = options.method || "GET";
    this.path = options.path || "/";
    this.host = options.host;
    this.port = options.port || 80;
    this.headers = options.headers || {};
    this.body = options.body || {};
    if (!this.headers["Content-Type"]) {
      this.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    if ((this.headers["Content-Type"] = "application/json")) {
      this.bodyText = JSON.stringify(this.body);
    } else if (
      (this.headers["Content-Type"] = "application/x-www-form-urlencoded")
    ) {
      this.bodyText = Object.keys(this.body)
        .map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
        .join("&");
    }
    this.headers["Content-Length"] = this.bodyText.length;
  }

  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map((key) => `${key}: ${this.headers[key]}`).join("\r\n")}
\r
${this.bodyText}`;
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      if (connection) {
        connection.write(this.toString());
      } else {
        connection = net.createConnection(
          {
            host: this.host,
            port: this.port,
          },
          () => {
            connection.write(this.toString());
          }
        );
      }
      connection.on("data", (data) => {
        resolve(data.toString());
        connection.end();
      });
      connection.on("error", (err) => {
        reject(err)
        connection.end()
        console.log("已从服务器断开");
      });
    });
  }
}

class Response {}

void async function() {
    let request = new Request({
        method: "POST",
        host: "127.0.0.1",
        path: "/",
        port: 8088,
        headers: {
          ["name"]: "zhourh",
        },
        body: {
          name: "zhourh",
        },
      });
      
      let response = await request.send();
      console.log(response);
}()

// const client = net.createConnection({
//     host: '127.0.0.1',
//     port: 8088,
// }, () => {
//   // 'connect' 监听器
//   console.log('已连接到服务器');
//   let request = new Request({
//       method: 'POST',
//       host: '127.0.0.1',
//       path: '/',
//       port: 8088,
//       headers: {
//           ['name']: 'zhourh',
//       },
//       body: {
//           name: 'zhourh',
//       }

//   })
//   client.write(request.toString());
// });
// client.on('data', (data) => {
//   console.log(data.toString());
//   client.end();
// });
// client.on('end', () => {
//   console.log('已从服务器断开');
// });
