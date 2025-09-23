/**
 * 青龙面板通知推送模块 (简化版)
 * 支持多种通知方式：Telegram、微信、钉钉等
 * 仅依赖 axios，无额外依赖
 * 
 * 作者: CodeBuddy
 * 更新时间: 2025-01-23
 */

const axios = require('axios');

// 通知配置
const NOTIFY_CONFIG = {
    timeout: 10000, // 10秒超时
    retryCount: 2,  // 重试次数
    retryDelay: 1000 // 重试延迟
};

// 日志输出
function log(message, level = 'INFO') {
    const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    console.log(`[${timestamp}] [NOTIFY-${level}] ${message}`);
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Server酱推送
async function serverChanNotify(title, content) {
    const SCKEY = process.env.PUSH_KEY || process.env.SCKEY;
    if (!SCKEY) return false;

    try {
        const url = SCKEY.includes('SCT') 
            ? `https://sctapi.ftqq.com/${SCKEY}.send`
            : `https://sc.ftqq.com/${SCKEY}.send`;
            
        await axios.post(url, {
            title: title,
            desp: content.replace(/\n/g, '\n\n')
        }, { timeout: NOTIFY_CONFIG.timeout });
        
        log('Server酱推送成功');
        return true;
    } catch (error) {
        log(`Server酱推送失败: ${error.message}`, 'ERROR');
        return false;
    }
}

// Telegram Bot推送
async function telegramNotify(title, content) {
    const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
    const TG_USER_ID = process.env.TG_USER_ID;
    
    if (!TG_BOT_TOKEN || !TG_USER_ID) return false;

    try {
        const message = `📢 ${title}\n\n${content}`;
        const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
        
        await axios.post(url, {
            chat_id: TG_USER_ID,
            text: message,
            parse_mode: 'HTML'
        }, { timeout: NOTIFY_CONFIG.timeout });
        
        log('Telegram推送成功');
        return true;
    } catch (error) {
        log(`Telegram推送失败: ${error.message}`, 'ERROR');
        return false;
    }
}

// 钉钉机器人推送
async function dingTalkNotify(title, content) {
    const DD_BOT_TOKEN = process.env.DD_BOT_TOKEN;
    const DD_BOT_SECRET = process.env.DD_BOT_SECRET;
    
    if (!DD_BOT_TOKEN) return false;

    try {
        let url = `https://oapi.dingtalk.com/robot/send?access_token=${DD_BOT_TOKEN}`;
        
        // 如果有密钥，计算签名
        if (DD_BOT_SECRET) {
            const crypto = require('crypto');
            const timestamp = Date.now();
            const stringToSign = `${timestamp}\n${DD_BOT_SECRET}`;
            const sign = crypto.createHmac('sha256', DD_BOT_SECRET)
                .update(stringToSign)
                .digest('base64');
            url += `&timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
        }
        
        await axios.post(url, {
            msgtype: 'text',
            text: {
                content: `${title}\n\n${content}`
            }
        }, { timeout: NOTIFY_CONFIG.timeout });
        
        log('钉钉推送成功');
        return true;
    } catch (error) {
        log(`钉钉推送失败: ${error.message}`, 'ERROR');
        return false;
    }
}

// 企业微信推送
async function workWechatNotify(title, content) {
    const WW_BOT_KEY = process.env.WW_BOT_KEY;
    if (!WW_BOT_KEY) return false;

    try {
        const url = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${WW_BOT_KEY}`;
        
        await axios.post(url, {
            msgtype: 'text',
            text: {
                content: `${title}\n\n${content}`
            }
        }, { timeout: NOTIFY_CONFIG.timeout });
        
        log('企业微信推送成功');
        return true;
    } catch (error) {
        log(`企业微信推送失败: ${error.message}`, 'ERROR');
        return false;
    }
}

// Bark推送 (iOS)
async function barkNotify(title, content) {
    const BARK_PUSH = process.env.BARK_PUSH;
    if (!BARK_PUSH) return false;

    try {
        const url = BARK_PUSH.startsWith('http') 
            ? BARK_PUSH 
            : `https://api.day.app/${BARK_PUSH}`;
            
        await axios.post(`${url}/${encodeURIComponent(title)}/${encodeURIComponent(content)}`, {}, {
            timeout: NOTIFY_CONFIG.timeout
        });
        
        log('Bark推送成功');
        return true;
    } catch (error) {
        log(`Bark推送失败: ${error.message}`, 'ERROR');
        return false;
    }
}

// PushPlus推送
async function pushPlusNotify(title, content) {
    const PUSH_PLUS_TOKEN = process.env.PUSH_PLUS_TOKEN;
    if (!PUSH_PLUS_TOKEN) return false;

    try {
        await axios.post('https://www.pushplus.plus/send', {
            token: PUSH_PLUS_TOKEN,
            title: title,
            content: content.replace(/\n/g, '<br>'),
            template: 'html'
        }, { timeout: NOTIFY_CONFIG.timeout });
        
        log('PushPlus推送成功');
        return true;
    } catch (error) {
        log(`PushPlus推送失败: ${error.message}`, 'ERROR');
        return false;
    }
}

// 飞书推送
async function feishuNotify(title, content) {
    const FEISHU_BOT_TOKEN = process.env.FEISHU_BOT_TOKEN;
    if (!FEISHU_BOT_TOKEN) return false;

    try {
        const url = `https://open.feishu.cn/open-apis/bot/v2/hook/${FEISHU_BOT_TOKEN}`;
        
        await axios.post(url, {
            msg_type: 'text',
            content: {
                text: `${title}\n\n${content}`
            }
        }, { timeout: NOTIFY_CONFIG.timeout });
        
        log('飞书推送成功');
        return true;
    } catch (error) {
        log(`飞书推送失败: ${error.message}`, 'ERROR');
        return false;
    }
}

// 主推送函数
async function sendNotify(title, content, options = {}) {
    if (!title && !content) {
        log('推送标题和内容不能为空', 'WARN');
        return false;
    }

    // 默认标题
    title = title || '青龙面板通知';
    
    // 限制内容长度
    if (content.length > 4000) {
        content = content.substring(0, 4000) + '\n\n...(内容过长已截断)';
    }

    log(`开始发送通知: ${title}`);
    
    // 定义所有推送方法 (移除邮件推送避免依赖问题)
    const notifyMethods = [
        { name: 'Server酱', func: serverChanNotify },
        { name: 'Telegram', func: telegramNotify },
        { name: '钉钉机器人', func: dingTalkNotify },
        { name: '企业微信', func: workWechatNotify },
        { name: 'Bark', func: barkNotify },
        { name: 'PushPlus', func: pushPlusNotify },
        { name: '飞书', func: feishuNotify }
    ];

    let successCount = 0;
    const results = [];

    // 并发执行所有推送方法
    const promises = notifyMethods.map(async (method) => {
        try {
            const success = await method.func(title, content);
            results.push({ name: method.name, success });
            if (success) successCount++;
        } catch (error) {
            log(`${method.name}推送异常: ${error.message}`, 'ERROR');
            results.push({ name: method.name, success: false, error: error.message });
        }
    });

    await Promise.allSettled(promises);

    // 输出推送结果
    if (successCount > 0) {
        const successMethods = results.filter(r => r.success).map(r => r.name);
        log(`通知发送成功 (${successCount}/${notifyMethods.length}): ${successMethods.join(', ')}`);
        return true;
    } else {
        log('所有通知方式都发送失败，可能未配置任何通知方式', 'WARN');
        return false;
    }
}

// 简化版推送函数（兼容旧版本）
async function notify(title, content) {
    return await sendNotify(title, content);
}

// 导出函数
module.exports = {
    sendNotify,
    notify,
    serverChanNotify,
    telegramNotify,
    dingTalkNotify,
    workWechatNotify,
    barkNotify,
    pushPlusNotify,
    feishuNotify
};