/**
 * YBT 签到脚本 for 青龙面板
 * 
 * 环境变量说明:
 * YBT_USERS: YBT用户名，多个账号用换行符或&分隔
 * 例如: user1&user2 或 user1\nuser2
 * 
 * 定时任务建议: 0 8 * * * (每天早上8点执行)
 * 
 * 作者: CodeBuddy
 * 更新时间: 2025-01-23
 */

const axios = require('axios');
const { sendNotify } = require('./sendNotify.js');

// 配置信息
const CONFIG = {
    API_URL: 'https://api-v2.ybt.one/api/user/sign',
    TIMEOUT: 12000, // 12秒超时
    MAX_RETRY: 3,   // 最大重试次数
    RETRY_DELAY: 2000, // 重试延迟(毫秒)
    USER_AGENT: 'Mozilla/5.0 (ScriptCat Smart) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
};

// 日志输出函数
function log(message, level = 'INFO') {
    const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    console.log(`[${timestamp}] [${level}] ${message}`);
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 获取用户列表
function getUserList() {
    const users = process.env.YBT_USERS;
    if (!users) {
        log('未找到环境变量 YBT_USERS，请先配置用户名', 'ERROR');
        return [];
    }
    
    // 支持换行符和&分隔符
    return users.split(/[\n&]/)
        .map(user => user.trim())
        .filter(user => user.length > 0);
}

// 执行签到请求
async function performSign(username, retryCount = 0) {
    try {
        log(`开始为用户 ${username} 执行签到...`);
        
        const response = await axios({
            method: 'POST',
            url: CONFIG.API_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': CONFIG.USER_AGENT
            },
            data: `username=${encodeURIComponent(username)}`,
            timeout: CONFIG.TIMEOUT,
            validateStatus: function (status) {
                // 接受 200 和 400 状态码（400可能是重复签到）
                return status === 200 || status === 400;
            }
        });

        return {
            success: true,
            status: response.status,
            data: response.data
        };

    } catch (error) {
        log(`用户 ${username} 签到请求失败: ${error.message}`, 'ERROR');
        
        // 如果是网络错误且未达到最大重试次数，则重试
        if (retryCount < CONFIG.MAX_RETRY && (
            error.code === 'ECONNRESET' || 
            error.code === 'ETIMEDOUT' || 
            error.code === 'ENOTFOUND' ||
            error.message.includes('timeout')
        )) {
            log(`用户 ${username} 第 ${retryCount + 1} 次重试...`, 'WARN');
            await delay(CONFIG.RETRY_DELAY);
            return performSign(username, retryCount + 1);
        }

        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}

// 处理签到结果
function processSignResult(username, result) {
    if (!result.success) {
        return {
            username,
            success: false,
            message: `签到失败: ${result.error}`,
            details: `错误代码: ${result.code || 'UNKNOWN'}`
        };
    }

    const { status, data } = result;

    // 处理成功签到 (HTTP 200)
    if (status === 200 && data && data.data) {
        const signData = data.data;
        return {
            username,
            success: true,
            message: '签到成功',
            details: `${signData.message || '签到成功'}\n` +
                    `累计签到: ${signData.sign_count || 0} 天\n` +
                    `获得流量: ${signData.get_traffic || 0} MB\n` +
                    `总流量: ${signData.total_traffic || 0} MB`
        };
    }

    // 处理重复签到 (HTTP 400)
    if (status === 400 && data && data.data) {
        const signData = data.data;
        if (signData.sign_status === true) {
            return {
                username,
                success: true,
                message: '今日已签到',
                details: `${signData.message || '今日已签到'}\n` +
                        `累计签到: ${signData.sign_count || 0} 天`
            };
        }
    }

    // 处理用户不存在
    if (data && data.message === '用户不存在') {
        return {
            username,
            success: false,
            message: '用户不存在',
            details: '请检查用户名是否正确'
        };
    }

    // 处理其他情况
    return {
        username,
        success: false,
        message: '签到失败',
        details: `HTTP状态: ${status}, 响应: ${JSON.stringify(data)}`
    };
}

// 格式化通知消息
function formatNotifyMessage(results) {
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    let message = `🎯 YBT 签到结果\n\n`;
    message += `📊 总计: ${totalCount} 个账号\n`;
    message += `✅ 成功: ${successCount} 个\n`;
    message += `❌ 失败: ${totalCount - successCount} 个\n\n`;
    
    message += `📋 详细结果:\n`;
    message += `${'='.repeat(30)}\n`;
    
    results.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        message += `${index + 1}. ${status} ${result.username}\n`;
        message += `   ${result.message}\n`;
        if (result.details) {
            message += `   ${result.details}\n`;
        }
        message += `\n`;
    });
    
    return message;
}

// 主函数
async function main() {
    log('='.repeat(50));
    log('YBT 签到脚本开始执行');
    log('='.repeat(50));
    
    const users = getUserList();
    if (users.length === 0) {
        log('没有找到有效的用户配置，脚本退出', 'ERROR');
        return;
    }
    
    log(`发现 ${users.length} 个用户: ${users.join(', ')}`);
    
    const results = [];
    
    // 逐个处理用户签到
    for (let i = 0; i < users.length; i++) {
        const username = users[i];
        
        try {
            const signResult = await performSign(username);
            const processedResult = processSignResult(username, signResult);
            results.push(processedResult);
            
            log(`用户 ${username}: ${processedResult.message}`);
            if (processedResult.details) {
                log(`详情: ${processedResult.details.replace(/\n/g, ' | ')}`);
            }
            
            // 避免请求过于频繁，添加延迟
            if (i < users.length - 1) {
                await delay(1000);
            }
            
        } catch (error) {
            log(`处理用户 ${username} 时发生未知错误: ${error.message}`, 'ERROR');
            results.push({
                username,
                success: false,
                message: '处理失败',
                details: error.message
            });
        }
    }
    
    // 输出汇总结果
    log('='.repeat(50));
    log('签到任务执行完成');
    
    const successCount = results.filter(r => r.success).length;
    log(`成功: ${successCount}/${results.length}`);
    
    // 发送通知
    try {
        const notifyMessage = formatNotifyMessage(results);
        await sendNotify('YBT 签到结果', notifyMessage);
        log('通知发送成功');
    } catch (error) {
        log(`通知发送失败: ${error.message}`, 'WARN');
    }
    
    log('='.repeat(50));
}

// 错误处理
process.on('uncaughtException', (error) => {
    log(`未捕获的异常: ${error.message}`, 'ERROR');
    console.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`未处理的 Promise 拒绝: ${reason}`, 'ERROR');
});

// 执行主函数
if (require.main === module) {
    main().catch(error => {
        log(`脚本执行失败: ${error.message}`, 'ERROR');
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = { main };