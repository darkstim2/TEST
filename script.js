// Основной файл приложения
class NeoLabApp {
    constructor() {
        this.userData = {
            cryo: 0,
            components: 0,
            synthesis_points: 0,
            mods: 0,
            level: 1,
            received_mod: false,
            impulse_level: 0,
            last_cryo_collection: null,
            last_components_collection: null,
            last_synthesis_collection: null,
            last_calibration_play: null,
            last_frequency_play: null,
            upgrades: []
        };
        
        this.aiActive = true;
        this.currentScreen = 'main';
        this.calibrationGrid = [];
        this.calibrationAttempts = 5;
        this.frequencyNumbers = [];
        this.frequencyTimer = null;
        
        this.impulseIntervals = {
            0: {"components": 3600, "cryo": 86400, "synthesis": 86400},
            1: {"components": 2400, "cryo": 72000, "synthesis": 72000},
            2: {"components": 1800, "cryo": 57600, "synthesis": 57600},
            3: {"components": 1200, "cryo": 28800, "synthesis": 28800},
            4: {"components": 600, "cryo": 7200, "synthesis": 7200}
        };
        
        this.aiKnowledgeBase = {
            "крио": {
                "keywords": ["крио", "крио геном", "крио-геном", "геном", "крио ген", "крио-ген", "валюта", "энергия"],
                "responses": [
                    "㉿ Крио-Геном - это основная энергетическая валюта в системе NeoLab.",
                    "Крио-Геном ㉿ - базовый ресурс системы. Добывается в Лаборатории.",
                    "㉿ Крио-Геном можно получить через экстракцию в Лаборатории.",
                ]
            },
            "процессор": {
                "keywords": ["процессор", "проц", "процесс", "центр", "управление", "ресурсы", "хранилище"],
                "responses": [
                    "⊕ Ваш Процессор - это центр управления ресурсами.",
                    "⊕ Процессор осуществляет контроль над всеми операциями NeoLab.",
                ]
            },
            "лаборатория": {
                "keywords": ["лаборатория", "лаба", "лаб", "лаборатор", "добыча", "экстракция", "исследование"],
                "responses": [
                    "∯ Лаборатория позволяет проводить экстракцию Крио-Генома.",
                    "∯ В Лаборатории можно раскрыть потенциал ваших модификаторов.",
                ]
            },
            "бутик": {
                "keywords": ["бутик", "имплант", "импланты", "магазин", "покупка", "улучшение", "приобретение"],
                "responses": [
                    "㊉ Имплант-Бутик предоставляет доступ к редким модификациям.",
                    "㊉ В Бутике можно приобрести импланты для улучшения характеристик.",
                ]
            },
            "модификации": {
                "keywords": ["модификации", "моды", "модули", "улучшения", "апгрейд", "калибровка", "анализатор"],
                "responses": [
                    "∞ Модификации усиливают ваши возможности.",
                    "∞ Система модификаторов позволяет кастомизировать ваши операции.",
                ]
            },
            "компоненты": {
                "keywords": ["компоненты", "компы", "деталя", "запчасти", "расширитель", "сбор"],
                "responses": [
                    "⚙ Компоненты можно получать каждые 60 минут в разделе Лаборатория.",
                    "⚙ Количество компонентов зависит от уровня вашего модификатора.",
                ]
            },
            "синтез": {
                "keywords": ["синтез", "очки синтеза", "синтез очки", "очки", "исследование", "чертежи"],
                "responses": [
                    "✎ Очки синтеза можно получать каждые 24 часа в разделе Модификации.",
                    "✎ Очки синтеза используются для исследования чертежей и покупки имплантов.",
                ]
            },
            "импульс": {
                "keywords": ["импульс", "скорость", "время", "сокращение", "ускорение", "автоматический"],
                "responses": [
                    "⚡ Импульс сокращает время получения ресурсов:",
                    "⚡ Уровень 1: компоненты 40мин, геном 20ч, синтез 20ч",
                    "⚡ Уровень 2: компоненты 30мин, геном 16ч, синтез 16ч", 
                    "⚡ Уровень 3: компоненты 20мин, геном 8ч, синтез 8ч",
                    "⚡ Уровень 4: автоматический сбор (комп. 10мин, геном 2ч, синтез 2ч)"
                ]
            },
        };
        
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.renderMainScreen();
        this.startTimers();
        this.setupPixelDesign();
        
        // Инициализация Telegram WebApp
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
        }
    }

    setupPixelDesign() {
        // Добавляем эффекты пикселизации для элементов
        document.querySelectorAll('.pixel-border').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.boxShadow = '0 0 5px #00ccff';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.boxShadow = 'none';
            });
        });
        
        // Добавляем пиксельный эффект для уведомлений
        const originalShowNotification = this.showNotification;
        this.showNotification = (message, type = 'info') => {
            // Добавляем пиксельный эффект к уведомлению
            const notification = document.getElementById('notification');
            notification.classList.add('pixel-border');
            
            // Вызываем оригинальную функцию
            originalShowNotification.call(this, message, type);
        };
    }

    loadUserData() {
        const savedData = localStorage.getItem('neolab_user_data');
        if (savedData) {
            this.userData = {...this.userData, ...JSON.parse(savedData)};
        }
        this.updateResourceDisplay();
    }

    saveUserData() {
        localStorage.setItem('neolab_user_data', JSON.stringify(this.userData));
        this.updateResourceDisplay();
    }

    updateResourceDisplay() {
        document.getElementById('cryo-count').textContent = `${this.userData.cryo} ㉿`;
        document.getElementById('components-count').textContent = `${this.userData.components} ⚙`;
        document.getElementById('synthesis-count').textContent = `${this.userData.synthesis_points} ✎`;
        document.getElementById('user-level').textContent = `Уровень ${this.userData.level}`;
        
        // Обновляем экран процессора, если он активен
        if (this.currentScreen === 'processor') {
            document.getElementById('processor-cryo').textContent = this.userData.cryo;
            document.getElementById('processor-components').textContent = this.userData.components;
            document.getElementById('processor-synthesis').textContent = this.userData.synthesis_points;
            document.getElementById('processor-impulse').textContent = this.userData.impulse_level;
            
            // Обновляем время до следующего сбора
            this.updateCooldownDisplays();
        }
    }

    setupEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.id !== 'format-btn') {
                btn.addEventListener('click', (e) => {
                    const screen = e.target.dataset.screen;
                    this.changeScreen(screen);
                });
            }
        });

        // Кнопка форматирования
        document.getElementById('format-btn').addEventListener('click', () => {
            this.showFormatConfirmation();
        });
        
        // Обработчики для лаборатории
        document.getElementById('collect-cryo-btn').addEventListener('click', () => {
            this.collectResource('cryo');
        });
        
        document.getElementById('collect-components-btn').addEventListener('click', () => {
            this.collectResource('components');
        });
        
        document.getElementById('research-server-btn').addEventListener('click', () => {
            this.researchServer();
        });
        
        // Обработчики для ИИ-ассистента
        document.getElementById('ai-send').addEventListener('click', () => {
            this.sendAIMessage();
        });
        
        document.getElementById('ai-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendAIMessage();
            }
        });
        
        document.getElementById('activate-ai').addEventListener('click', () => {
            this.activateAI();
        });
        
        document.getElementById('deactivate-ai').addEventListener('click', () => {
            this.deactivateAI();
        });
        
        // Обработчики для магазина
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.dataset.item;
                this.buyItem(item);
            });
        });
        
        // Обработчики для главного экрана
        const mainScreen = document.getElementById('main-screen');
        if (mainScreen) {
            mainScreen.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.target.dataset.action;
                    this.handleMainAction(action);
                });
            });
        }
    }

    changeScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        this.currentScreen = screenName;
        const screenElement = document.getElementById(`${screenName}-screen`);
        if (screenElement) {
            screenElement.classList.add('active');
        }
        
        // Специфическая инициализация для каждого экрана
        switch(screenName) {
            case 'processor':
                this.updateProcessorScreen();
                break;
            case 'modifications':
                this.renderModificationsScreen();
                break;
            case 'boutique':
                this.renderBoutiqueScreen();
                break;
            case 'ai':
                this.renderAIScreen();
                break;
        }
    }

    renderMainScreen() {
        // Уже реализовано в HTML
    }

    handleMainAction(action) {
        switch(action) {
            case 'collect-all':
                this.collectAllResources();
                break;
            case 'boost':
                this.activateBoost();
                break;
            case 'analyze':
                this.runSystemAnalysis();
                break;
            case 'upgrade':
                this.upgradeModule();
                break;
        }
    }

    updateProcessorScreen() {
        document.getElementById('processor-cryo').textContent = this.userData.cryo;
        document.getElementById('processor-components').textContent = this.userData.components;
        document.getElementById('processor-synthesis').textContent = this.userData.synthesis_points;
        document.getElementById('processor-impulse').textContent = this.userData.impulse_level;
        
        this.updateCooldownDisplays();
    }

    updateCooldownDisplays() {
        const cryoCan = this.canCollect('cryo');
        const componentsCan = this.canCollect('components');
        const synthesisCan = this.canCollect('synthesis');
        
        document.getElementById('cryo-cooldown').textContent = 
            `Крио-Геном: ${cryoCan.can ? 'Готово' : cryoCan.timeLeft}`;
            
        document.getElementById('components-cooldown').textContent = 
            `Компоненты: ${componentsCan.can ? 'Готово' : componentsCan.timeLeft}`;
            
        document.getElementById('synthesis-cooldown').textContent = 
            `Очки синтеза: ${synthesisCan.can ? 'Готово' : synthesisCan.timeLeft}`;
    }

    canCollect(resourceType) {
        if (!this.userData[`last_${resourceType}_collection`]) {
            return { can: true, timeLeft: 'Готово' };
        }
        
        const impulseLevel = this.userData.impulse_level || 0;
        const interval = this.impulseIntervals[impulseLevel][resourceType];
        const lastCollection = new Date(this.userData[`last_${resourceType}_collection`]);
        const nextCollection = new Date(lastCollection.getTime() + interval * 1000);
        const now = new Date();
        
        if (now >= nextCollection) {
            return { can: true, timeLeft: 'Готово' };
        }
        
        const timeLeftMs = nextCollection - now;
        const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return { 
            can: false, 
            timeLeft: `${hours}ч ${minutes}м`
        };
    }

    collectResource(resourceType) {
        const canCollect = this.canCollect(resourceType);
        
        if (!canCollect.can) {
            this.showNotification(`До следующего сбора: ${canCollect.timeLeft}`, 'warning');
            return;
        }
        
        let reward, message;
        const modLevel = this.userData.level || 1;
        
        switch(resourceType) {
            case 'cryo':
                reward = Math.max(500, 500 * modLevel) + Math.floor(Math.random() * (1000 * modLevel * 3));
                message = `Получено ${reward}㉿ Крио-Генома`;
                this.userData.cryo += reward;
                break;
            case 'components':
                reward = Math.max(100, 100 * modLevel) + Math.floor(Math.random() * (1000 * modLevel));
                message = `Получено ${reward}⚙ Компонентов`;
                this.userData.components += reward;
                break;
            case 'synthesis':
                reward = Math.max(10, 10 * modLevel) + Math.floor(Math.random() * (20 * modLevel));
                message = `Получено ${reward}✎ Очков синтеза`;
                this.userData.synthesis_points += reward;
                break;
        }
        
        this.userData[`last_${resourceType}_collection`] = new Date().toISOString();
        this.saveUserData();
        this.showNotification(message, 'success');
        this.updateResourceDisplay();
    }

    collectAllResources() {
        const resources = ['cryo', 'components', 'synthesis'];
        let collected = 0;
        
        resources.forEach(resource => {
            const canCollect = this.canCollect(resource);
            if (canCollect.can) {
                this.collectResource(resource);
                collected++;
            }
        });
        
        if (collected === 0) {
            this.showNotification('Нет доступных ресурсов для сбора', 'warning');
        }
    }

    researchServer() {
        this.showNotification('🔬 Исследовательский сервер активирован', 'info');
    }

    activateBoost() {
        if (this.userData.impulse_level < 4) {
            if (this.userData.cryo >= 1000 * (this.userData.impulse_level + 1)) {
                this.userData.cryo -= 1000 * (this.userData.impulse_level + 1);
                this.userData.impulse_level++;
                this.saveUserData();
                this.showNotification(`⚡ Импульс повышен до уровня ${this.userData.impulse_level}`, 'success');
            } else {
                this.showNotification('Недостаточно Крио-Генома для улучшения', 'error');
            }
        } else {
            this.showNotification('Импульс уже на максимальном уровне', 'info');
        }
    }

    runSystemAnalysis() {
        const analysisResults = [
            "✓ Система стабильна",
            "✓ Ресурсы в норме",
            "✓ Модификации функционируют",
            "✓ Соединение безопасно"
        ];
        
        this.showNotification(analysisResults.join('\n'), 'info');
    }

    upgradeModule() {
        if (this.userData.components >= 50 * this.userData.level) {
            this.userData.components -= 50 * this.userData.level;
            this.userData.level++;
            this.saveUserData();
            this.showNotification(`Модуль улучшен до уровня ${this.userData.level}`, 'success');
        } else {
            this.showNotification('Недостаточно компонентов для улучшения', 'error');
        }
    }

    renderModificationsScreen() {
        const modsContainer = document.getElementById('mods-container');
        if (!modsContainer) return;
        
        modsContainer.innerHTML = '';
        
        const mods = [
            { id: 'get-mod', name: 'Получить модификатор', action: () => this.getModifier() },
            { id: 'collect-synth', name: 'Извлечь очки синтеза', action: () => this.collectResource('synthesis') },
            { id: 'calibrate', name: 'Калибровка модуля', action: () => this.startCalibration() },
            { id: 'frequency', name: 'Частотный анализатор', action: () => this.startFrequencyAnalyzer() }
        ];
        
        mods.forEach(mod => {
            const button = document.createElement('button');
            button.className = 'action-btn pixel-border';
            button.textContent = mod.name;
            button.addEventListener('click', mod.action);
            modsContainer.appendChild(button);
        });
    }

    getModifier() {
        if (!this.userData.received_mod) {
            this.userData.received_mod = true;
            this.userData.mods = 1;
            this.saveUserData();
            this.showNotification('✅ Модификатор N84a успешно получен!', 'success');
        } else {
            this.showNotification('❌ Вы уже получали модификатор', 'error');
        }
    }

    startCalibration() {
        const canPlay = this.canPlayMinigame('calibration');
        
        if (!canPlay.can) {
            this.showNotification(`До следующей попытки: ${canPlay.timeLeft}`, 'warning');
            return;
        }
        
        this.calibrationGrid = this.generateCalibrationGrid();
        this.calibrationAttempts = 5;
        this.userData.last_calibration_play = new Date().toISOString();
        this.saveUserData();
        
        this.changeScreen('calibration');
        this.renderCalibrationGrid();
    }

    canPlayMinigame(gameType) {
        if (!this.userData[`last_${gameType}_play`]) {
            return { can: true, timeLeft: '0' };
        }
        
        const lastPlay = new Date(this.userData[`last_${gameType}_play`]);
        const nextPlay = new Date(lastPlay.getTime() + 300000); // 5 минут
        const now = new Date();
        
        if (now >= nextPlay) {
            return { can: true, timeLeft: '0' };
        }
        
        const timeLeftMs = nextPlay - now;
        const minutes = Math.floor(timeLeftMs / (1000 * 60));
        const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);
        
        return { 
            can: false, 
            timeLeft: `${minutes}м ${seconds}с`
        };
    }

    generateCalibrationGrid() {
        const rewards = [1, 1, 1, 2, 2, 0, 0, 0, 0];
        
        // Перемешиваем массив
        for (let i = rewards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rewards[i], rewards[j]] = [rewards[j], rewards[i]];
        }
        
        // Преобразуем в сетку 3x3
        const grid = [];
        for (let i = 0; i < 3; i++) {
            grid.push(rewards.slice(i * 3, i * 3 + 3));
        }
        
        return grid;
    }

    renderCalibrationGrid() {
        const gridContainer = document.getElementById('calibration-grid');
        if (!gridContainer) return;
        
        gridContainer.innerHTML = '';
        document.getElementById('attempts-left').textContent = this.calibrationAttempts;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement('div');
                cell.className = 'calibration-cell pixel-border';
                cell.dataset.i = i;
                cell.dataset.j = j;
                cell.textContent = '⚫';
                
                cell.addEventListener('click', () => {
                    this.handleCalibrationCellClick(i, j);
                });
                
                gridContainer.appendChild(cell);
            }
        }
    }

    handleCalibrationCellClick(i, j) {
        if (this.calibrationAttempts <= 0) return;
        
        const cellValue = this.calibrationGrid[i][j];
        const cellElement = document.querySelector(`.calibration-cell[data-i="${i}"][data-j="${j}"]`);
        
        if (cellElement.classList.contains('revealed')) {
            this.showNotification('Эта ячейка уже открыта', 'warning');
            return;
        }
        
        this.calibrationAttempts--;
        document.getElementById('attempts-left').textContent = this.calibrationAttempts;
        
        let message = '';
        
        if (cellValue === 0) {
            cellElement.textContent = '⚪';
            cellElement.classList.add('revealed');
            message = 'Пусто... Попробуйте другую ячейку.';
        } else if (cellValue === 1) {
            const reward = Math.floor(Math.random() * 401) + 100; // 100-500
            this.userData.cryo += reward;
            cellElement.textContent = '🟢';
            cellElement.classList.add('revealed', 'cryo-reward');
            message = `🎉 Вы нашли ${reward}㉿ Крио-Генома!`;
        } else if (cellValue === 2) {
            const reward = Math.floor(Math.random() * 6) + 5; // 5-10
            this.userData.synthesis_points += reward;
            cellElement.textContent = '🔵';
            cellElement.classList.add('revealed', 'synthesis-reward');
            message = `🎉 Вы нашли ${reward}✎ Очков синтеза!`;
        }
        
        this.saveUserData();
        this.showNotification(message, 'success');
        
        if (this.calibrationAttempts <= 0) {
            setTimeout(() => {
                this.showNotification('🎮 Игра окончена! Попытки закончились.', 'info');
                this.changeScreen('modifications');
            }, 1500);
        }
    }

    startFrequencyAnalyzer() {
        const canPlay = this.canPlayMinigame('frequency');
        
        if (!canPlay.can) {
            this.showNotification(`До следующей попытки: ${canPlay.timeLeft}`, 'warning');
            return;
        }
        
        this.frequencyNumbers = Array.from({length: 5}, () => Math.floor(Math.random() * 900) + 100);
        this.userData.last_frequency_play = new Date().toISOString();
        this.saveUserData();
        
        this.changeScreen('frequency');
        this.renderFrequencyNumbers();
    }

    renderFrequencyNumbers() {
        const numbersDisplay = document.getElementById('frequency-numbers');
        if (!numbersDisplay) return;
        
        numbersDisplay.textContent = this.frequencyNumbers.join(' ');
        
        const timerElement = document.getElementById('frequency-timer');
        let timeLeft = 8;
        
        timerElement.textContent = timeLeft;
        
        this.frequencyTimer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
                        if (timeLeft <= 0) {
                clearInterval(this.frequencyTimer);
                this.showNotification('⏰ Время вышло! Вы не успели ввести числа.', 'error');
                setTimeout(() => {
                    this.changeScreen('modifications');
                }, 2000);
            }
        }, 1000);
        
        // Обработчик отправки ответа
        document.getElementById('frequency-submit').onclick = () => {
            this.checkFrequencyAnswer();
        };
        
        document.getElementById('frequency-input').onkeypress = (e) => {
            if (e.key === 'Enter') {
                this.checkFrequencyAnswer();
            }
        };
    }

    checkFrequencyAnswer() {
        clearInterval(this.frequencyTimer);
        
        const userInput = document.getElementById('frequency-input').value;
        const userNumbers = userInput.trim().split(/\s+/).map(Number);
        
        if (userNumbers.length !== this.frequencyNumbers.length || 
            !userNumbers.every((num, i) => num === this.frequencyNumbers[i])) {
            this.showNotification('❌ Неправильная последовательность чисел!', 'error');
        } else {
            const reward = Math.floor(Math.random() * 100) + 1;
            this.userData.components += reward;
            this.saveUserData();
            this.showNotification(`✅ Отлично! Вы правильно ввели числа!\nНаграда: ${reward}⚙ Компонентов`, 'success');
        }
        
        setTimeout(() => {
            this.changeScreen('modifications');
        }, 2000);
    }

    renderBoutiqueScreen() {
        // Уже реализовано в HTML
    }

    buyItem(item) {
        let success = false;
        let message = '';
        
        switch(item) {
            case 'impulse_1':
                if (this.userData.cryo >= 1000 && this.userData.impulse_level < 1) {
                    this.userData.cryo -= 1000;
                    this.userData.impulse_level = 1;
                    success = true;
                    message = 'Импульс Уровень 1 приобретен!';
                } else if (this.userData.impulse_level >= 1) {
                    message = 'У вас уже есть это улучшение';
                } else {
                    message = 'Недостаточно Крио-Генома';
                }
                break;
                
            case 'better_collection':
                if (this.userData.cryo >= 500 && !this.userData.upgrades.includes('better_collection')) {
                    this.userData.cryo -= 500;
                    this.userData.upgrades.push('better_collection');
                    success = true;
                    message = 'Улучшенный сбор приобретен!';
                } else if (this.userData.upgrades.includes('better_collection')) {
                    message = 'У вас уже есть это улучшение';
                } else {
                    message = 'Недостаточно Крио-Генома';
                }
                break;
        }
        
        if (success) {
            this.saveUserData();
            this.showNotification(message, 'success');
        } else {
            this.showNotification(message, 'error');
        }
    }

    renderAIScreen() {
        // Уже реализовано в HTML
    }

    sendAIMessage() {
        if (!this.aiActive) {
            this.showNotification('ИИ-ассистент деактивирован', 'warning');
            return;
        }
        
        const input = document.getElementById('ai-input');
        const message = input.value.trim();
        
        if (message === '') return;
        
        // Добавляем сообщение пользователя в чат
        this.addAIMessage(message, 'user');
        input.value = '';
        
        // Ищем ответ в базе знаний
        const response = this.findAIResponse(message);
        
        // Добавляем ответ с задержкой для реалистичности
        setTimeout(() => {
            this.addAIMessage(response, 'ai');
        }, 1000);
    }

    addAIMessage(text, type) {
        const chat = document.getElementById('ai-chat');
        const message = document.createElement('div');
        message.className = `message ${type}-message`;
        message.textContent = text;
        
        chat.appendChild(message);
        chat.scrollTop = chat.scrollHeight;
    }

    findAIResponse(userText) {
        const normalized = this.normalizeText(userText);
        
        if (normalized.includes('активировать ии')) {
            this.activateAI();
            return '✅ ИИ-ассистент активирован';
        }
        
        if (normalized.includes('деактивировать ии')) {
            this.deactivateAI();
            return '❌ ИИ-ассистент деактивирован';
        }
        
        for (const [category, data] of Object.entries(this.aiKnowledgeBase)) {
            for (const keyword of data.keywords) {
                if (normalized.includes(keyword)) {
                    return data.responses[Math.floor(Math.random() * data.responses.length)];
                }
            }
        }
        
        return 'Земной язык такой сложный... Мои алгоритмы не могут обработать этот запрос';
    }

    normalizeText(text) {
        text = text.toLowerCase().trim();
        
        const corrections = {
            'крио-геном': 'крио геном',
            'геном': 'крио геном',
            'процессор': 'процессор',
            'лаборатория': 'лаборатория',
            'бутик': 'бутик',
            'модификации': 'модификации',
            'активировать': 'активировать ии',
            'деактивировать': 'деактивировать ии',
            'ии': 'ии',
            'импульс': 'импульс'
        };
        
        for (const [pattern, replacement] of Object.entries(corrections)) {
            text = text.replace(new RegExp(pattern, 'g'), replacement);
        }
        
        text = text.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
        
        return text;
    }

    activateAI() {
        this.aiActive = true;
        this.showNotification('✅ ИИ-ассистент активирован', 'success');
    }

    deactivateAI() {
        this.aiActive = false;
        this.showNotification('❌ ИИ-ассистент деактивирован', 'info');
    }

    showFormatConfirmation() {
        if (confirm('Вы уверены, что хотите начать процесс форматирования? Все данные будут сброшены.')) {
            this.formatSystem();
        }
    }

    formatSystem() {
        this.userData = {
            cryo: 0,
            components: 0,
            synthesis_points: 0,
            mods: 0,
            level: 1,
            received_mod: false,
            impulse_level: 0,
            last_cryo_collection: null,
            last_components_collection: null,
            last_synthesis_collection: null,
            last_calibration_play: null,
            last_frequency_play: null,
            upgrades: []
        };
        
        this.saveUserData();
        this.showNotification('↻ Процесс форматирования завершен. Система сброшена.', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification-toast show ${type}`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    startTimers() {
        // Таймеры для автоматического обновления интерфейса
        setInterval(() => {
            this.updateCooldownDisplays();
        }, 1000);
        
        // Автоматический сбор для высоких уровней импульса
        setInterval(() => {
            this.autoCollectResources();
        }, 60000);
    }

    autoCollectResources() {
        if (this.userData.impulse_level === 4) {
            const resources = ['cryo', 'components', 'synthesis'];
            
            resources.forEach(resource => {
                const canCollect = this.canCollect(resource);
                if (canCollect.can) {
                    this.collectResource(resource);
                }
            });
        }
    }
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.neolabApp = new NeoLabApp();
});

