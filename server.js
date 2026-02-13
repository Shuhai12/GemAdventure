const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const CONFIG_FILE = path.join(__dirname, 'level-config.json');

// 中间件
app.use(cors());
app.use(express.json());
app.use('/admin', express.static('admin'));
app.use(express.static('demo'));

// 读取配置文件
function readConfig() {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { levels: [] };
  }
}

// 写入配置文件
function writeConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// API 路由

// 获取所有关卡配置
app.get('/api/levels', (req, res) => {
  const config = readConfig();
  res.json(config.levels);
});

// 获取单个关卡配置
app.get('/api/levels/:id', (req, res) => {
  const config = readConfig();
  const level = config.levels.find(l => l.id === parseInt(req.params.id));
  if (level) {
    res.json(level);
  } else {
    res.status(404).json({ error: '关卡不存在' });
  }
});

// 创建新关卡
app.post('/api/levels', (req, res) => {
  const config = readConfig();
  const newLevel = {
    id: config.levels.length > 0 ? Math.max(...config.levels.map(l => l.id)) + 1 : 1,
    ...req.body
  };
  config.levels.push(newLevel);
  writeConfig(config);
  res.status(201).json(newLevel);
});

// 更新关卡配置
app.put('/api/levels/:id', (req, res) => {
  const config = readConfig();
  const index = config.levels.findIndex(l => l.id === parseInt(req.params.id));
  if (index !== -1) {
    config.levels[index] = { ...config.levels[index], ...req.body, id: parseInt(req.params.id) };
    writeConfig(config);
    res.json(config.levels[index]);
  } else {
    res.status(404).json({ error: '关卡不存在' });
  }
});

// 删除关卡
app.delete('/api/levels/:id', (req, res) => {
  const config = readConfig();
  const index = config.levels.findIndex(l => l.id === parseInt(req.params.id));
  if (index !== -1) {
    config.levels.splice(index, 1);
    writeConfig(config);
    res.json({ message: '删除成功' });
  } else {
    res.status(404).json({ error: '关卡不存在' });
  }
});

app.listen(PORT, () => {
  console.log(`API 服务器运行在 http://localhost:${PORT}`);
});
