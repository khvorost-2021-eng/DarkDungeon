const { useState, useEffect, useRef, useCallback } = React;

const BIG_MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Генератор уникальных ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Компонент HP бара
const HPBar = ({ hp, maxHp, isVisible }) => {
    const percentage = Math.max(0, (hp / maxHp) * 100);
    let colorClass = 'green';
    if (percentage <= 30) colorClass = 'red';
    else if (percentage <= 60) colorClass = 'yellow';

    return (
        <div className={`hp-bar-container ${isVisible ? 'visible' : ''}`}>
            <div className={`hp-bar-fill ${colorClass}`} style={{ width: `${percentage}%` }} />
        </div>
    );
};

// Компонент осколков врага
const EnemyShards = ({ x, y, onComplete }) => {
    const [shards, setShards] = useState([]);

    useEffect(() => {
        const shardCount = 5 + Math.floor(Math.random() * 3);
        const newShards = Array.from({ length: shardCount }, (_, i) => ({
            id: i,
            dx: (Math.random() - 0.5) * 120,
            dy: (Math.random() - 0.5) * 120,
            rot: Math.random() * 360,
            delay: Math.random() * 0.1
        }));
        setShards(newShards);

        const timer = setTimeout(onComplete, 800);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <>
            {shards.map(shard => (
                <div
                    key={shard.id}
                    className="enemy-shard"
                    style={{
                        left: x,
                        top: y,
                        animation: `shard-fly 0.6s ease-out ${shard.delay}s forwards`,
                        ['--dx']: `${shard.dx}px`,
                        ['--dy']: `${shard.dy}px`,
                        ['--rot']: `${shard.rot}deg`
                    }}
                />
            ))}
            <style>{`
                @keyframes shard-fly {
                    0% { transform: translate(-50%, -50%) rotate(0deg); opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)); opacity: 0; }
                }
            `}</style>
        </>
    );
};

// Компонент частиц крови
const BloodParticles = ({ x, y }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const particleCount = 3 + Math.floor(Math.random() * 3);
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            dx: (Math.random() - 0.5) * 60,
            dy: (Math.random() - 0.5) * 60,
            delay: Math.random() * 0.05
        }));
        setParticles(newParticles);

        const timer = setTimeout(() => setParticles([]), 500);
        return () => clearTimeout(timer);
    }, [x, y]);

    return (
        <>
            {particles.map(p => (
                <div
                    key={p.id}
                    className="blood-particle"
                    style={{
                        left: x,
                        top: y,
                        animation: `blood-fly 0.4s ease-out ${p.delay}s forwards`,
                        ['--dx']: `${p.dx}px`,
                        ['--dy']: `${p.dy}px`
                    }}
                />
            ))}
            <style>{`
                @keyframes blood-fly {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3); opacity: 0; }
                }
            `}</style>
        </>
    );
};

// Компонент заставки
const IntroScreen = ({ onStart, selectedSkin, onSkinChange }) => {
    const [stage, setStage] = useState('closed');

    useEffect(() => {
        const meetTimer = setTimeout(() => setStage('meet'), 800);
        return () => clearTimeout(meetTimer);
    }, []);

    const handleStart = () => {
        setStage('open');
        setTimeout(onStart, 800);
    };

    return (
        <div className={`intro-screen ${stage}`}>
            <div className="intro-bg">
                <div className="intro-red-glow" />
                <div className="intro-red-glow" />
                <div className="intro-red-glow" />
            </div>
            <div className="curtain curtain-left">DARK</div>
            <div className="curtain curtain-right">DUNGEON</div>
            <div className="curtain-title">DARK DUNGEON</div>
            <div className="skin-selector">
                <div 
                    className={`skin-option ${selectedSkin === 'blue' ? 'selected' : ''}`}
                    onClick={() => onSkinChange('blue')}
                    title="Стандартный"
                >
                    <div className="skin-preview-blue" />
                </div>
                <div 
                    className={`skin-option ${selectedSkin === 'dark' ? 'selected' : ''}`}
                    onClick={() => onSkinChange('dark')}
                    title="Тёмный"
                >
                    <div className="skin-preview-dark" />
                </div>
            </div>
            <button className="intro-btn" onClick={handleStart}>
                Войти в подземелье
            </button>
        </div>
    );
};

// Компонент экрана смерти
const DeathScreen = ({ onRestart }) => (
    <div className="death-screen">
        <div className="death-text">YOU DIED</div>
        <button className="death-btn" onClick={onRestart}>Начать заново</button>
    </div>
);

// Основной компонент игры
const Game = () => {
    const [tick, setTick] = useState(0);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [shopTab, setShopTab] = useState('weapons');
    const [money, setMoney] = useState(100);
    const [isAttacking, setIsAttacking] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [isPlayerDead, setIsPlayerDead] = useState(false);
    const [selectedSkin, setSelectedSkin] = useState('blue');
    const [inventory, setInventory] = useState([]);
    
    // Эффекты: осколки, кровь, атаки врагов
    const [shards, setShards] = useState([]);
    const [bloodEffects, setBloodEffects] = useState([]);
    const [attackingEnemies, setAttackingEnemies] = useState(new Set());
    
    // Видимость HP баров
    const [playerHpVisible, setPlayerHpVisible] = useState(false);
    const [enemyHpVisible, setEnemyHpVisible] = useState({});

    const player = useRef({ x: 90, y: 90, hp: 100, maxHp: 100, dmg: 40 });
    const pet = useRef({ x: 60, y: 90, mode: 'follow' });
    const enemies = useRef([
        { id: 1, x: 400, y: 90, hp: 100, maxHp: 100, state: 'idle', angle: 0 },
        { id: 2, x: 800, y: 300, hp: 100, maxHp: 100, state: 'idle', angle: 0 }
    ]);
    const keys = useRef({});
    const playerHpTimer = useRef(null);
    const enemyHpTimers = useRef({});

    const canMoveTo = (nx, ny) => {
        const p = 15;
        const pts = [{x:nx-p, y:ny-p}, {x:nx+p, y:ny-p}, {x:nx-p, y:ny+p}, {x:nx+p, y:ny+p}];
        return !pts.some(pt => BIG_MAP[Math.floor(pt.y/60)]?.[Math.floor(pt.x/60)] === 1);
    };

    // Показать HP бар игрока
    const showPlayerHpBar = useCallback(() => {
        setPlayerHpVisible(true);
        if (playerHpTimer.current) clearTimeout(playerHpTimer.current);
        playerHpTimer.current = setTimeout(() => setPlayerHpVisible(false), 2500);
    }, []);

    // Показать HP бар врага
    const showEnemyHpBar = useCallback((enemyId) => {
        setEnemyHpVisible(prev => ({ ...prev, [enemyId]: true }));
        if (enemyHpTimers.current[enemyId]) clearTimeout(enemyHpTimers.current[enemyId]);
        enemyHpTimers.current[enemyId] = setTimeout(() => {
            setEnemyHpVisible(prev => ({ ...prev, [enemyId]: false }));
        }, 2500);
    }, []);

    // Атака игрока
    const handleAttack = useCallback(() => {
        if (isAttacking || isShopOpen || isPlayerDead) return;
        setIsAttacking(true);
        
        setTimeout(() => {
            let killedEnemies = [];
            enemies.current.forEach(en => {
                const d = Math.sqrt((en.x - player.current.x)**2 + (en.y - player.current.y)**2);
                if (d < 90) { 
                    en.hp -= player.current.dmg;
                    showEnemyHpBar(en.id);
                    
                    if (en.hp <= 0) {
                        killedEnemies.push(en);
                        // Добавляем осколки
                        setShards(prev => [...prev, { id: generateId(), x: en.x, y: en.y }]);
                        // Добавляем кровь
                        setBloodEffects(prev => [...prev, { id: generateId(), x: en.x, y: en.y }]);
                        setMoney(m => m + 50);
                    }
                }
            });
            
            // Удаляем убитых врагов
            enemies.current = enemies.current.filter(en => en.hp > 0);
            setIsAttacking(false);
        }, 200);
    }, [isAttacking, isShopOpen, isPlayerDead, showEnemyHpBar]);

    // Перезапуск игры
    const restartGame = useCallback(() => {
        player.current = { x: 90, y: 90, hp: 100, maxHp: 100, dmg: 40 + (inventory.includes('dark-sword') ? 30 : 0) };
        enemies.current = [
            { id: 1, x: 400, y: 90, hp: 100, maxHp: 100, state: 'idle', angle: 0 },
            { id: 2, x: 800, y: 300, hp: 100, maxHp: 100, state: 'idle', angle: 0 }
        ];
        setIsPlayerDead(false);
        setMoney(100);
        setInventory([]);
        setShards([]);
        setBloodEffects([]);
        setAttackingEnemies(new Set());
        setPlayerHpVisible(false);
        setEnemyHpVisible({});
        setTick(t => t + 1);
    }, []);

    // Покупка предмета
    const buyItem = useCallback((itemId, price) => {
        if (money >= price && !inventory.includes(itemId)) {
            setMoney(m => m - price);
            setInventory(prev => [...prev, itemId]);
            
            // Применяем эффекты предметов
            if (itemId === 'dark-sword') {
                player.current.dmg += 30;
            }
        }
    }, [money, inventory]);

    // Удаление осколка
    const removeShard = useCallback((shardId) => {
        setShards(prev => prev.filter(s => s.id !== shardId));
    }, []);

    // Удаление эффекта крови
    const removeBlood = useCallback((bloodId) => {
        setBloodEffects(prev => prev.filter(b => b.id !== bloodId));
    }, []);

    // Игровой цикл
    useEffect(() => {
        const loop = setInterval(() => {
            if (isShopOpen || isPlayerDead) return;

            // Проверка смерти игрока
            if (player.current.hp <= 0 && !isPlayerDead) {
                setIsPlayerDead(true);
                return;
            }

            // 1. Движение игрока
            const s = 4;
            let nx = player.current.x, ny = player.current.y;
            if (keys.current['ArrowUp'] || keys.current['KeyW']) ny -= s;
            if (keys.current['ArrowDown'] || keys.current['KeyS']) ny += s;
            if (keys.current['ArrowLeft'] || keys.current['KeyA']) nx -= s;
            if (keys.current['ArrowRight'] || keys.current['KeyD']) nx += s;
            if (canMoveTo(nx, player.current.y)) player.current.x = nx;
            if (canMoveTo(player.current.x, ny)) player.current.y = ny;

            // 2. ИИ Врагов
            const newAttacking = new Set();
            enemies.current.forEach(en => {
                const dx = player.current.x - en.x;
                const dy = player.current.y - en.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < 250) {
                    en.state = 'chase';
                    const vx = (dx / dist) * 1.8;
                    const vy = (dy / dist) * 1.8;
                    if (canMoveTo(en.x + vx, en.y + vy)) { en.x += vx; en.y += vy; }
                    
                    if (dist < 45 && Math.random() > 0.95) {
                        // Враг атакует
                        let damage = 2;
                        if (inventory.includes('void-shield')) damage *= 0.5;
                        player.current.hp -= damage;
                        showPlayerHpBar();
                        newAttacking.add(en.id);
                    }
                } else {
                    en.state = 'idle';
                    en.angle += 0.02;
                    const px = Math.cos(en.angle) * 1;
                    const py = Math.sin(en.angle) * 1;
                    if (canMoveTo(en.x + px, en.y + py)) { en.x += px; en.y += py; }
                }
            });
            setAttackingEnemies(newAttacking);

            // 3. Питомец
            pet.current.x += (player.current.x - 40 - pet.current.x) * 0.05;
            pet.current.y += (player.current.y - 30 - pet.current.y) * 0.05;

            setTick(t => t + 1);
        }, 16);

        const kd = (e) => { 
            keys.current[e.code] = true; 
            if (e.code === 'Space') handleAttack(); 
        };
        const ku = (e) => keys.current[e.code] = false;
        window.addEventListener('keydown', kd);
        window.addEventListener('keyup', ku);
        return () => { 
            clearInterval(loop); 
            window.removeEventListener('keydown', kd); 
            window.removeEventListener('keyup', ku); 
        };
    }, [isShopOpen, isPlayerDead, handleAttack, showPlayerHpBar, inventory]);

    const shopItems = [
        { id: 'dark-sword', name: 'Меч Тьмы', price: 200, type: 'weapons', desc: '+30 к урону' },
        { id: 'void-shield', name: 'Щит Пустоты', price: 150, type: 'weapons', desc: '-50% урона' },
        { id: 'shadow-pet', name: 'Теневой питомец', price: 300, type: 'pets', desc: 'Увеличенный урон' },
        { id: 'dark-skin', name: 'Тёмный скин', price: 100, type: 'skins', desc: 'Чёрный с красными глазами' }
    ];

    const playerSkinClass = selectedSkin === 'dark' || inventory.includes('dark-skin') ? 'player-skin-dark' : 'player-skin';

    return (
        <div id="viewport">
            {showIntro && (
                <IntroScreen 
                    onStart={() => setShowIntro(false)} 
                    selectedSkin={selectedSkin}
                    onSkinChange={setSelectedSkin}
                />
            )}

            {isPlayerDead && <DeathScreen onRestart={restartGame} />}

            <div className="hud">
                HP: {Math.max(0, Math.floor(player.current.hp))} | GOLD: {money}
                <div className="hud-stats">
                    Урон: {player.current.dmg} | Защита: {inventory.includes('void-shield') ? '50%' : '0%'}
                </div>
            </div>
            <button className="btn-open-shop" onClick={() => setIsShopOpen(!isShopOpen)}>МАГАЗИН</button>
            <div className="fog" />

            {isShopOpen && (
                <div className="shop-overlay">
                    <h2>КРИПТА ТОРГОВЦА</h2>
                    <div className="shop-tabs">
                        <button className={`tab-btn ${shopTab==='weapons'?'active':''}`} onClick={()=>setShopTab('weapons')}>Оружие</button>
                        <button className={`tab-btn ${shopTab==='pets'?'active':''}`} onClick={()=>setShopTab('pets')}>Питомцы</button>
                        <button className={`tab-btn ${shopTab==='skins'?'active':''}`} onClick={()=>setShopTab('skins')}>Скины</button>
                    </div>
                    <div className="shop-items">
                        {shopItems.filter(item => item.type === shopTab).map(item => {
                            const owned = inventory.includes(item.id);
                            const canAfford = money >= item.price;
                            return (
                                <div key={item.id} className={`item-card ${owned ? 'owned' : ''}`}>
                                    <h4>{item.name}</h4>
                                    <p>{item.desc}</p>
                                    <p>Цена: {item.price}</p>
                                    <button 
                                        onClick={() => buyItem(item.id, item.price)}
                                        disabled={!canAfford || owned}
                                    >
                                        {owned ? 'Куплено' : canAfford ? 'Купить' : 'Недостаточно золота'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {inventory.length > 0 && (
                        <div className="inventory-display">
                            <h4>Инвентарь:</h4>
                            {inventory.map(itemId => {
                                const item = shopItems.find(i => i.id === itemId);
                                return item ? (
                                    <span key={itemId} className="inventory-item">{item.name}</span>
                                ) : null;
                            })}
                        </div>
                    )}
                    <button style={{marginTop:'auto'}} onClick={()=>setIsShopOpen(false)}>ВЫЙТИ</button>
                </div>
            )}

            {/* Осколки */}
            {shards.map(shard => (
                <EnemyShards 
                    key={shard.id} 
                    x={shard.x} 
                    y={shard.y} 
                    onComplete={() => removeShard(shard.id)} 
                />
            ))}

            {/* Кровь */}
            {bloodEffects.map(blood => (
                <BloodParticles 
                    key={blood.id} 
                    x={blood.x} 
                    y={blood.y} 
                />
            ))}

            <div id="game-world" style={{ transform: `translate(${-player.current.x + window.innerWidth/2}px, ${-player.current.y + window.innerHeight/2}px)` }}>
                {BIG_MAP.map((row, y) => row.map((tile, x) => (
                    tile === 1 && <div key={`${x}-${y}`} className="tile wall" style={{ left: x*60, top: y*60 }} />
                )))}

                <div className="char" style={{ left: player.current.x, top: player.current.y }}>
                    <div className={`skin ${playerSkinClass}`}>
                        <div className="eye left"/>
                        <div className="eye right"/>
                    </div>
                    <HPBar hp={player.current.hp} maxHp={player.current.maxHp} isVisible={playerHpVisible} />
                    {isAttacking && <div className="slash" />}
                </div>

                <div className="char" style={{ left: pet.current.x, top: pet.current.y }}>
                    <div className="pet-skin" />
                </div>

                {enemies.current.map(en => (
                    <div key={en.id} className="char" style={{ left: en.x, top: en.y }}>
                        <div className={`skin enemy-skin ${attackingEnemies.has(en.id) ? 'enemy-attacking' : ''}`}>
                            <div className="eye left"/>
                            <div className="eye right"/>
                        </div>
                        <HPBar hp={en.hp} maxHp={en.maxHp} isVisible={enemyHpVisible[en.id] || false} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Game />);
