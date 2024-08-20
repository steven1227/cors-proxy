const express = require("express");
const app = express();
const cors = require("cors");
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require("axios");
// 使用 stealth 插件，绕过反爬虫
puppeteer.use(StealthPlugin());

// 启用 CORS
app.use(cors());

// 基本字符串路由，防止 Glitch 错误
app.all('*', async (req, res) => {
    if (req.originalUrl.includes('favicon.ico')) {
        res.status(204).end();
    } else if (req.method === 'OPTIONS') {
        // 处理 CORS 预检请求
        res.send();
    } else {
        let targetURL = req.header('Target-URL');
        if (!targetURL) {
            res.send();
        } else {
            if (targetURL === "https://gmgn.ai") {
                try {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox'
                        ]
                    });

                    const page = await browser.newPage();
                    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
                    await page.setExtraHTTPHeaders({
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Connection': 'keep-alive',
                        'DNT': '1',
                        'Upgrade-Insecure-Requests': '1',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-User': '?1',
                    });

                    await page.goto(targetURL + req.url, { timeout: 60000 });
                    await page.waitForSelector('pre'); // 等待页面中的 <pre> 标签加载完成

                    const preContent = await page.evaluate(() => {
                        const preElement = document.querySelector('pre');
                        return preElement ? preElement.innerText : null;
                    });

                    let jsonContent;
                    try {
                        if (preContent) {
                            jsonContent = JSON.parse(preContent);
                            console.log('Response:', jsonContent.data);
                            res.send(jsonContent.data);
                        } else {
                            console.error('未找到 <pre> 标签或内容为空');
                            res.status(404).send({ error: "content null" });
                        }
                    } catch (error) {
                        console.error('内容无法转换为 JSON:', error);
                        res.status(500).send({ error: 'no json' });
                    } finally {
                        await browser.close();
                    }
                } catch (error) {
                    console.error('访问页面时发生错误:', error);
                    res.status(500).send({ error: 'error' });
                }
            } else {
                // 针对其他 URL 的处理
                axios({
                    url: targetURL+ req.url, 
                    method: req.method, 
                    'Content-Type': 'application/json;charset=UTF-8',
                    "Access-Control-Allow-Origin": "*",
                }).then((response)=>{
                    if (response.status === 200) {
                        console.log(response.status);
                        res.send(response.data);
                    } else {
                        console.error('Failed to fetchinng holders data:', response.status);
                        res.send();
                    }
                });
            }
        }
    }
});

// 设定端口
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});
