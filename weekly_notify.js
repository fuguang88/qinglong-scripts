/**
 * 青龙面板 - 7天循环通知脚本
 * 
 * cron: 0 9 * * *
 * const $ = new Env('每日通知');
 * 
 * 环境变量说明:
 * WEEKLY_NOTIFY_CONFIG: 通知配置文件路径 (可选，默认使用 weekly_notify_config.json)
 * WEEKLY_NOTIFY_TITLE: 通知标题前缀 (可选，默认为 "每日提醒")
 * WEEKLY_NOTIFY_ENABLED: 是否启用通知 (可选，默认为 true)
 * 
 * 定时任务建议: 0 9 * * * (每天上午9点执行)
 * 
 * 作者: CodeBuddy
 * 更新时间: 2025-01-23
 * 功能: 根据星期几发送不同的通知内容，支持自定义配置
 */

const fs = require('fs');
const path = require('path');

// 尝试引入通知模块
let sendNotify;
try {
    sendNotify = require('./sendNotify.js').sendNotify;
} catch (error) {
    console.log('未找到 sendNotify.js，将使用内置通知功能');
}

// 配置信息
const CONFIG = {
    DEFAULT_CONFIG_FILE: 'weekly_notify_config.json',
    DEFAULT_TITLE_PREFIX: '每日提醒',
    TIMEZONE: 'Asia/Shanghai'
};

// 日志输出函数
function log(message, level = 'INFO') {
    const timestamp = new Date().toLocaleString('zh-CN', { timeZone: CONFIG.TIMEZONE });
    console.log(`[${timestamp}] [${level}] ${message}`);
}

// 获取当前星期几 (0=周日, 1=周一, ..., 6=周六)
function getCurrentWeekday() {
    const now = new Date();
    return now.getDay();
}

// 获取星期几的中文名称
function getWeekdayName(weekday) {
    const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return names[weekday] || '未知';
}

// 读取配置文件
function loadConfig() {
    const configFile = process.env.WEEKLY_NOTIFY_CONFIG || CONFIG.DEFAULT_CONFIG_FILE;
    const configPath = path.resolve(configFile);
    
    try {
        if (!fs.existsSync(configPath)) {
            log(`配置文件不存在: ${configPath}，将创建默认配置`, 'WARN');
            createDefaultConfig(configPath);
        }
        
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        log(`成功加载配置文件: ${configPath}`);
        return config;
        
    } catch (error) {
        log(`读取配置文件失败: ${error.message}`, 'ERROR');
        log('将使用内置默认配置', 'WARN');
        return getDefaultConfig();
    }
}

// 创建默认配置文件
function createDefaultConfig(configPath) {
    const defaultConfig = getDefaultConfig();
    
    try {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
        log(`已创建默认配置文件: ${configPath}`);
    } catch (error) {
        log(`创建配置文件失败: ${error.message}`, 'ERROR');
    }
}

// 获取默认配置
function getDefaultConfig() {
    return {
        "title_prefix": "每日提醒",
        "notifications": {
            "0": {
                "title": "周日 - 休息日",
                "content": "🌅 美好的周日早上好！\n\n今天是休息日，建议：\n• 🛌 适当睡个懒觉\n• 📚 读一本好书\n• 🚶‍♂️ 户外散步放松\n• 👨‍👩‍👧‍👦 陪伴家人朋友\n\n愿你度过愉快的一天！ 😊"
            },
            "1": {
                "title": "周一 - 新的开始",
                "content": "💪 周一早上好！新的一周开始了！\n\n今日重点：\n• ✅ 制定本周工作计划\n• 📋 整理待办事项清单\n• ☕ 来杯咖啡提提神\n• 🎯 设定本周目标\n\n加油，让这一周充满活力！ 🚀"
            },
            "2": {
                "title": "周二 - 高效工作",
                "content": "⚡ 周二早上好！\n\n今天是高效工作日：\n• 🎯 专注重要任务\n• ⏰ 合理安排时间\n• 💡 保持创新思维\n• 🤝 加强团队协作\n\n保持专注，效率满满！ 💼"
            },
            "3": {
                "title": "周三 - 中场调整",
                "content": "🔄 周三早上好！一周过半了！\n\n中场调整时间：\n• 📊 回顾前半周进展\n• 🔧 调整后半周计划\n• 💪 为冲刺做准备\n• 🧘‍♂️ 适当放松调节\n\n坚持就是胜利！ 🏆"
            },
            "4": {
                "title": "周四 - 冲刺时刻",
                "content": "🏃‍♂️ 周四早上好！冲刺时刻到了！\n\n今日冲刺重点：\n• 🎯 完成重要项目\n• ⚡ 提高执行效率\n• 📞 及时沟通协调\n• 🔥 保持工作热情\n\n距离周末越来越近了！ 💨"
            },
            "5": {
                "title": "周五 - 收官之日",
                "content": "🎉 周五早上好！收官之日！\n\n今日收尾工作：\n• ✅ 完成本周任务\n• 📝 整理工作总结\n• 📋 准备下周计划\n• 🎊 为周末做准备\n\nFriday feeling！周末就要来了！ 🥳"
            },
            "6": {
                "title": "周六 - 自由时光",
                "content": "🌈 周六早上好！自由时光开始！\n\n今日建议：\n• 🎮 享受兴趣爱好\n• 🛍️ 购物或聚餐\n• 🏃‍♂️ 运动健身\n• 🧹 整理生活空间\n\n享受属于你的周末时光！ ✨"
            }
        },
        "settings": {
            "enabled": true,
            "fallback_message": "今天是 {weekday}，祝你有美好的一天！ 😊",
            "description": "配置说明：\n- title_prefix: 通知标题前缀\n- notifications: 每天的通知内容 (0=周日, 1=周一, ..., 6=周六)\n- settings.enabled: 是否启用通知\n- settings.fallback_message: 当找不到对应配置时的默认消息"
        }
    };
}

// 获取今日通知内容
function getTodayNotification(config) {
    const weekday = getCurrentWeekday();
    const weekdayName = getWeekdayName(weekday);
    
    log(`今天是: ${weekdayName} (${weekday})`);
    
    // 检查是否启用通知
    if (config.settings && config.settings.enabled === false) {
        log('通知功能已禁用', 'WARN');
        return null;
    }
    
    // 获取今日配置
    const todayConfig = config.notifications && config.notifications[weekday.toString()];
    
    if (todayConfig) {
        const titlePrefix = process.env.WEEKLY_NOTIFY_TITLE || 
                           config.title_prefix || 
                           CONFIG.DEFAULT_TITLE_PREFIX;
        
        return {
            title: `${titlePrefix} - ${todayConfig.title}`,
            content: todayConfig.content,
            weekday: weekdayName
        };
    } else {
        // 使用备用消息
        const fallbackMessage = (config.settings && config.settings.fallback_message) || 
                               `今天是 {weekday}，祝你有美好的一天！ 😊`;
        
        const titlePrefix = process.env.WEEKLY_NOTIFY_TITLE || 
                           config.title_prefix || 
                           CONFIG.DEFAULT_TITLE_PREFIX;
        
        return {
            title: `${titlePrefix} - ${weekdayName}`,
            content: fallbackMessage.replace('{weekday}', weekdayName),
            weekday: weekdayName
        };
    }
}

// 内置通知发送函数 (当 sendNotify.js 不可用时使用)
async function builtinNotify(title, content) {
    log('使用内置通知功能');
    log(`标题: ${title}`);
    log(`内容: ${content}`);
    
    // 这里可以添加其他通知方式，比如直接调用青龙面板的通知API
    // 或者输出到特定格式供其他程序读取
    
    return { success: true, message: '内置通知已输出到日志' };
}

// 发送通知
async function sendNotification(notification) {
    if (!notification) {
        log('没有通知内容需要发送', 'WARN');
        return;
    }
    
    const { title, content, weekday } = notification;
    
    log(`准备发送通知: ${title}`);
    log(`内容长度: ${content.length} 字符`);
    
    try {
        let result;
        
        if (sendNotify && typeof sendNotify === 'function') {
            log('使用 sendNotify.js 发送通知');
            result = await sendNotify(title, content);
        } else {
            result = await builtinNotify(title, content);
        }
        
        log(`通知发送完成: ${JSON.stringify(result)}`);
        return result;
        
    } catch (error) {
        log(`通知发送失败: ${error.message}`, 'ERROR');
        
        // 备用通知方式
        log('尝试使用备用通知方式');
        return await builtinNotify(title, content);
    }
}

// 验证配置文件格式
function validateConfig(config) {
    const errors = [];
    
    if (!config || typeof config !== 'object') {
        errors.push('配置文件格式错误：必须是有效的JSON对象');
        return errors;
    }
    
    if (!config.notifications || typeof config.notifications !== 'object') {
        errors.push('缺少 notifications 配置');
    } else {
        // 检查每天的配置
        for (let i = 0; i <= 6; i++) {
            const dayConfig = config.notifications[i.toString()];
            if (dayConfig) {
                if (!dayConfig.title || typeof dayConfig.title !== 'string') {
                    errors.push(`第${i}天(${getWeekdayName(i)})缺少有效的 title`);
                }
                if (!dayConfig.content || typeof dayConfig.content !== 'string') {
                    errors.push(`第${i}天(${getWeekdayName(i)})缺少有效的 content`);
                }
            }
        }
    }
    
    return errors;
}

// 主函数
async function main() {
    log('='.repeat(50));
    log('青龙面板 - 7天循环通知脚本开始执行');
    log('='.repeat(50));
    
    // 检查环境变量是否启用通知
    const notifyEnabled = process.env.WEEKLY_NOTIFY_ENABLED;
    if (notifyEnabled !== 'true') {
        log(`通知功能未启用，WEEKLY_NOTIFY_ENABLED=${notifyEnabled || '未设置'}`, 'WARN');
        log('请设置环境变量 WEEKLY_NOTIFY_ENABLED=true 来启用通知功能', 'INFO');
        return;
    }
    
    try {
        // 加载配置
        log('正在加载通知配置...');
        const config = loadConfig();
        
        // 验证配置
        const configErrors = validateConfig(config);
        if (configErrors.length > 0) {
            log('配置验证失败:', 'ERROR');
            configErrors.forEach(error => log(`  - ${error}`, 'ERROR'));
            log('将使用默认配置继续执行', 'WARN');
        }
        
        // 获取今日通知
        const notification = getTodayNotification(config);
        
        if (!notification) {
            log('今日无需发送通知');
            return;
        }
        
        // 发送通知
        await sendNotification(notification);
        
        log('='.repeat(50));
        log('通知脚本执行完成');
        log('='.repeat(50));
        
    } catch (error) {
        log(`脚本执行失败: ${error.message}`, 'ERROR');
        console.error(error.stack);
        throw error;
    }
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

module.exports = { main, loadConfig, getTodayNotification };