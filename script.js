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

const generateId = () => Math.random().toString(36).substr(2, 9);

// ========== КОМПОНЕНТЫ ==========

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

// Осколки врага - исправленные, появляются от позиции смерти
const EnemyShards = ({ x, y, onComplete }) => {
    const [shards, setShards] = useState([]);

    useEffect(() => {
        const shardCount = 5 + Math.floor(Math.random() * 3);
        const newShards = Array.from({ length: shardCount }, (_, i) => ({
            id: i,
            angle: (Math.PI * 2 * i) / shardCount + Math.random() * 0.5,
            distance: 60 + Math.random() * 60,
            rot: Math.random() * 360,
            size: 8 + Math.random() * 6
        }));
        setShards(newShards);
        const timer = setTimeout(onComplete, 700);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <>
            {shards.map(shard => {
                const dx = Math.cos(shard.angle) * shard.distance;
                const dy = Math.sin(shard.angle) * shard.distance;
                return (
                    <div
                        key={shard.id}
                        className="enemy-shard"
                        style={{
                            position: 'absolute',
                            left: x,
                            top: y,
                            width: shard.size,
                            height: shard.size,
                            animation: `shard-fly-2 0.7s ease-out forwards`,
                            ['--dx']: `${dx}px`,
                            ['--dy']: `${dy}px`,
                            ['--rot']: `${shard.rot}deg`
                        }}
                    />
                );
            })}
            <style>{`
                @keyframes shard-fly-2 {
                    0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)) scale(0.3); opacity: 0; }
                }
            `}</style>
        </>
    );
};

// Частицы крови
const BloodParticles = ({ x, y }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const particleCount = 4 + Math.floor(Math.random() * 4);
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            angle: Math.random() * Math.PI * 2,
            distance: 30 + Math.random() * 50,
            delay: Math.random() * 0.1
        }));
        setParticles(newParticles);
        const timer = setTimeout(() => setParticles([]), 500);
        return () => clearTimeout(timer);
    }, [x, y]);

    return (
        <>
            {particles.map(p => {
                const dx = Math.cos(p.angle) * p.distance;
                const dy = Math.sin(p.angle) * p.distance;
                return (
                    <div
                        key={p.id}
                        className="blood-particle"
                        style={{
                            position: 'absolute',
                            left: x,
                            top: y,
                            animation: `blood-fly-2 0.4s ease-out ${p.delay}s forwards`,
                            ['--dx']: `${dx}px`,
                            ['--dy']: `${dy}px`
                        }}
                    />
                );
            })}
            <style>{`
                @keyframes blood-fly-2 {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.2); opacity: 0; }
                }
            `}</style>
        </>
    );
};

// Монета - летит к игроку
const Coin = ({ startX, startY, endX, endY, onComplete }) => {
    const [pos, setPos] = useState({ x: startX, y: startY });

    useEffect(() => {
        const duration = 600;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            const x = startX + (endX - startX) * ease;
            const y = startY + (endY - startY) * ease;
            
            setPos({ x, y });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                onComplete();
            }
        };
        
        const timer = setTimeout(animate, 100);
        return () => clearTimeout(timer);
    }, [startX, startY, endX, endY, onComplete]);

    return (
        <div 
            className="coin"
            style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 200
            }}
        />
    );
};

// ========== НОВАЯ ЗАСТАВКА ==========
const IntroScreen = ({ onComplete }) => {
    const [stage, setStage] = useState('showing');

    useEffect(() => {
        const sequence = async () => {
            // 1. Показываем название (2 секунды)
            await new Promise(r => setTimeout(r, 2000));
            setStage('fading');
            
            // 2. Затухание названия
            await new Promise(r => setTimeout(r, 800));
            setStage('opening');
            
            // 3. Открытие штор
            await new Promise(r => setTimeout(r, 1200));
            onComplete();
        };
        sequence();
    }, [onComplete]);

    return (
        <div className={`intro-screen ${stage}`}>
            <div className="intro-blood-bg" />
            <div className={`intro-title ${stage === 'fading' || stage === 'opening' ? 'fade-out' : ''}`}>
                DARK DUNGEON
            </div>
            <div className="intro-curtain intro-curtain-left" />
            <div className="intro-curtain intro-curtain-right" />
        </div>
    );
};

// ========== ГЛАВНОЕ МЕНЮ ==========
const MainMenu = ({ onPlay, onShop }) => (
    <div className="main-menu">
        <div className="menu-bg" />
        <div className="menu-title">DARK DUNGEON</div>
        <div className="menu-buttons">
            <button className="menu-btn primary" onClick={onPlay}>УРОВНИ</button>
            <button className="menu-btn" onClick={onShop}>МАГАЗИН</button>
            <button className="menu-btn" onClick={() => alert('Профиль — в разработке')}>ПРОФИЛЬ</button>
        </div>
    </div>
);

// ========== ВЫБОР УРОВНЕЙ (ВСЕ 9 УРОВНЕЙ) ==========
const LevelSelect = ({ onBack, onSelectLevel, unlockedLevels }) => {
    const levels = [
        { id: 1, name: 'Подземелье', desc: 'Начало пути' },
        { id: 2, name: 'Тёмные туннели', desc: 'Первые враги' },
        { id: 3, name: 'Заброшенный зал', desc: 'Опасная зона' },
        { id: 4, name: 'Кристальные пещеры', desc: 'Магия и тьма' },
        { id: 5, name: 'Логово стража', desc: 'Мини-босс' },
        { id: 6, name: 'Адские глубины', desc: 'Лава и огонь' },
        { id: 7, name: 'Зал проклятых', desc: 'Нежить пробуждается' },
        { id: 8, name: 'Тронная зала', desc: 'Перед финалом' },
        { id: 9, name: 'Логово Тьмы', desc: 'Финальный босс' },
    ];

    return (
        <div className="levels-screen">
            <div className="levels-title">ВЫБЕРИТЕ УРОВЕНЬ</div>
            <div className="levels-grid">
                {levels.map(level => {
                    const unlocked = level.id <= unlockedLevels;
                    return (
                        <div 
                            key={level.id} 
                            className={`level-card ${!unlocked ? 'locked' : ''}`}
                            onClick={() => unlocked && onSelectLevel(level.id)}
                        >
                            {unlocked ? (
                                <>
                                    <div className="level-number">{level.id}</div>
                                    <div className="level-name">{level.name}</div>
                                </>
                            ) : (
                                <div className="level-lock">🔒</div>
                            )}
                        </div>
                    );
                })}
            </div>
            <button className="back-btn" onClick={onBack}>НАЗАД</button>
        </div>
    );
};

// ========== МАГАЗИН (ПОЛНОСТЬЮ ПЕРЕДЕЛАННЫЙ) ==========
const Shop = ({ money, inventory, buyItem, onClose }) => {
    const [activeTab, setActiveTab] = useState('weapons');
    
    const shopItems = {
        weapons: [
            { id: 'iron-sword', name: 'Железный меч', price: 100, desc: '+15 к урону', rarity: 'common', icon: '⚔️' },
            { id: 'steel-sword', name: 'Стальной меч', price: 250, desc: '+30 к урону', rarity: 'rare', icon: '🗡️' },
            { id: 'dark-sword', name: 'Меч Тьмы', price: 500, desc: '+50 к урону', rarity: 'epic', icon: '⚫' },
            { id: 'excalibur', name: 'Экскалибур', price: 1000, desc: '+100 к урону', rarity: 'legendary', icon: '✨' },
        ],
        armor: [
            { id: 'leather-armor', name: 'Кожаная броня', price: 80, desc: '-10% урона', rarity: 'common', icon: '🛡️' },
            { id: 'chain-mail', name: 'Кольчуга', price: 200, desc: '-25% урона', rarity: 'rare', icon: '⛓️' },
            { id: 'plate-armor', name: 'Латы', price: 400, desc: '-40% урона', rarity: 'epic', icon: '🛡️' },
            { id: 'void-shield', name: 'Щит Пустоты', price: 800, desc: '-60% урона', rarity: 'legendary', icon: '🌑' },
        ],
        potions: [
            { id: 'hp-potion', name: 'Зелье здоровья', price: 50, desc: 'Восстанавливает 50 HP', rarity: 'common', icon: '🧪' },
            { id: 'big-hp-potion', name: 'Большое зелье', price: 120, desc: 'Восстанавливает 100 HP', rarity: 'rare', icon: '🧴' },
            { id: 'strength-potion', name: 'Зелье силы', price: 150, desc: '+20 урона на 30 сек', rarity: 'rare', icon: '💪' },
            { id: 'invincibility', name: 'Невидимость', price: 300, desc: 'Неуязвимость 10 сек', rarity: 'epic', icon: '👻' },
        ],
        artifacts: [
            { id: 'vampire-ring', name: 'Кольцо вампира', price: 350, desc: 'Восстановление HP при ударе', rarity: 'epic', icon: '💍' },
            { id: 'speed-boots', name: 'Ботинки скорости', price: 250, desc: '+50% скорости', rarity: 'rare', icon: '👢' },
            { id: 'crit-amulet', name: 'Амулет крита', price: 400, desc: '25% шанс крита x2', rarity: 'epic', icon: '📿' },
            { id: 'dragon-heart', name: 'Сердце дракона', price: 1500, desc: 'Вампиризм + крит + скорость', rarity: 'legendary', icon: '🐉' },
        ],
        pets: [
            { id: 'wolf-pet', name: 'Волк', price: 200, desc: 'Атакует врагов', rarity: 'rare', icon: '🐺' },
            { id: 'raven-pet', name: 'Ворон', price: 300, desc: 'Собирает монеты', rarity: 'epic', icon: '🦅' },
            { id: 'dragon-pet', name: 'Дракончик', price: 800, desc: 'Огненное дыхание', rarity: 'legendary', icon: '🐲' },
        ]
    };

    const getRarityClass = (rarity) => `rarity-${rarity}`;
    const getRarityColor = (rarity) => {
        const colors = {
            common: '#9e9e9e',
            rare: '#4fc3f7',
            epic: '#ba68c8',
            legendary: '#ffd54f'
        };
        return colors[rarity] || '#9e9e9e';
    };

    const currentItems = shopItems[activeTab] || [];

    return (
        <div className="shop-overlay">
            <div className="shop-header">
                <div className="shop-title-area">
                    <span className="shop-icon">🏪</span>
                    <div className="shop-title">ЛАВКА ТОРГОВЦА</div>
                </div>
                <div className="shop-gold">🪙 {money}</div>
            </div>

            <div className="shop-nav">
                <button className={`shop-nav-btn ${activeTab==='weapons'?'active':''}`} onClick={()=>setActiveTab('weapons')}>Оружие</button>
                <button className={`shop-nav-btn ${activeTab==='armor'?'active':''}`} onClick={()=>setActiveTab('armor')}>Броня</button>
                <button className={`shop-nav-btn ${activeTab==='potions'?'active':''}`} onClick={()=>setActiveTab('potions')}>Зелья</button>
                <button className={`shop-nav-btn ${activeTab==='artifacts'?'active':''}`} onClick={()=>setActiveTab('artifacts')}>Артефакты</button>
                <button className={`shop-nav-btn ${activeTab==='pets'?'active':''}`} onClick={()=>setActiveTab('pets')}>Питомцы</button>
            </div>

            <div className="shop-content">
                <div className="shop-items-grid">
                    {currentItems.map(item => {
                        const owned = inventory.includes(item.id);
                        const canAfford = money >= item.price;
                        return (
                            <div 
                                key={item.id} 
                                className={`shop-item-card ${owned ? 'owned' : ''}`}
                                style={{ '--rarity-color': getRarityColor(item.rarity) }}
                            >
                                <div className="shop-item-icon">{item.icon}</div>
                                <div className="shop-item-name">{item.name}</div>
                                <div className="shop-item-rarity {getRarityClass(item.rarity)}">{item.rarity}</div>
                                <div className="shop-item-desc">{item.desc}</div>
                                <div className="shop-item-price">{item.price} 🪙</div>
                                <button 
                                    className={`shop-buy-btn ${owned ? 'owned' : ''}`}
                                    onClick={() => buyItem(item.id, item.price)}
                                    disabled={!canAfford || owned}
                                >
                                    {owned ? 'КУПЛЕНО' : canAfford ? 'КУПИТЬ' : 'НЕДОСТАТОЧНО'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="shop-sidebar">
                    <div className="shop-sidebar-title">ИНВЕНТАРЬ</div>
                    <div className="shop-inventory-list">
                        {inventory.length === 0 ? (
                            <div style={{color: '#555', textAlign: 'center', marginTop: '20px'}}>Пусто</div>
                        ) : (
                            inventory.map(itemId => {
                                const allItems = Object.values(shopItems).flat();
                                const item = allItems.find(i => i.id === itemId);
                                return item ? (
                                    <div key={itemId} className="shop-inventory-item">
                                        <span className="shop-inventory-item-icon">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </div>
                                ) : null;
                            })
                        )}
                    </div>
                </div>
            </div>

            <button className="shop-exit-btn" onClick={onClose}>ВЫЙТИ</button>
        </div>
    );
};

// ========== СМЕРТЬ ИГРОКА ==========
const DeathScreen = ({ onRestart, isShaking }) => (
    <>
        <div className={`death-overlay ${isShaking ? 'active' : ''}`}>
            <div className="death-blood-edge death-blood-left" />
            <div className="death-blood-edge death-blood-right" />
            <div className="death-blood-edge death-blood-top" />
            <div className="death-blood-edge death-blood-bottom" />
        </div>
        <div className="death-screen">
            <div className="death-text">YOU DIED</div>
            <button className="death-btn" onClick={onRestart}>НАЧАТЬ ЗАНОВО</button>
        </div>
    </>
);

// ========== ИГРОВОЙ МИР ==========
const GameWorld = ({ 
    player, pet, enemies, playerSkinClass, petSkinClass, 
    isAttacking, playerHpVisible, enemyHpVisible,
    shards, bloodEffects, coins, removeShard, removeCoin,
    gameState
}) => {
    if (gameState !== 'playing') return null;

    return (
        <>
            <div className="hud">
                <div>❤️ {Math.max(0, Math.floor(player.current.hp))} | 🪙 {player.current.money || 0}</div>
                <div className="hud-stats">
                    ⚔️ {player.current.dmg} | 🛡️ {player.current.shield ? '60%' : '0%'}
                </div>
            </div>
            <button className="btn-open-shop" onClick={() => {}}>МАГАЗИН</button>
            <div className="fog" />

            {shards.map(shard => (
                <EnemyShards 
                    key={shard.id} 
                    x={shard.x} 
                    y={shard.y} 
                    onComplete={() => removeShard(shard.id)} 
                />
            ))}

            {bloodEffects.map(blood => (
                <BloodParticles key={blood.id} x={blood.x} y={blood.y} />
            ))}

            {coins.map(coin => (
                <Coin 
                    key={coin.id}
                    startX={coin.startX}
                    startY={coin.startY}
                    endX={coin.endX}
                    endY={coin.endY}
                    onComplete={() => removeCoin(coin.id)}
                />
            ))}

            <div id="game-world" style={{ 
                transform: `translate(${-player.current.x + window.innerWidth/2}px, ${-player.current.y + window.innerHeight/2}px)` 
            }}>
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
                    <div className={`pet-skin ${petSkinClass}`} />
                </div>

                {enemies.current.map(en => (
                    <div key={en.id} className="char" style={{ left: en.x, top: en.y }}>
                        <div className={`skin enemy-skin ${en.isAttacking ? 'enemy-windup' : ''}`}>
                            <div className="eye left"/>
                            <div className="eye right"/>
                        </div>
                        <HPBar hp={en.hp} maxHp={en.maxHp} isVisible={enemyHpVisible[en.id] || false} />
                    </div>
                ))}
            </div>
        </>
    );
};

// ========== ГЛАВНЫЙ КОМПОНЕНТ ==========
const Game = () => {
    const [gameState, setGameState] = useState('intro');
    const [money, setMoney] = useState(200);
    const [isAttacking, setIsAttacking] = useState(false);
    const [equippedSkin, setEquippedSkin] = useState('blue');
    const [equippedPet, setEquippedPet] = useState('purple');
    const [inventory, setInventory] = useState([]);
    const [unlockedLevels, setUnlockedLevels] = useState(1);
    
    const [shards, setShards] = useState([]);
    const [bloodEffects, setBloodEffects] = useState([]);
    const [coins, setCoins] = useState([]);
    const [playerHpVisible, setPlayerHpVisible] = useState(false);
    const [enemyHpVisible, setEnemyHpVisible] = useState({});
    const [isShaking, setIsShaking] = useState(false);

    const player = useRef({ x: 90, y: 90, hp: 100, maxHp: 100, dmg: 40, money: 200, shield: false });
    const pet = useRef({ x: 60, y: 90 });
    const enemies = useRef([
        { id: 1, x: 400, y: 90, hp: 100, maxHp: 100, state: 'idle', angle: 0, attackCooldown: 0, isAttacking: false, patrolTarget: null },
        { id: 2, x: 800, y: 300, hp: 100, maxHp: 100, state: 'idle', angle: 0, attackCooldown: 0, isAttacking: false, patrolTarget: null }
    ]);
    const keys = useRef({});
    const playerHpTimer = useRef(null);
    const enemyHpTimers = useRef({});

    const canMoveTo = (nx, ny) => {
        const p = 15;
        const pts = [{x:nx-p, y:ny-p}, {x:nx+p, y:ny-p}, {x:nx-p, y:ny+p}, {x:nx+p, y:ny+p}];
        return !pts.some(pt => BIG_MAP[Math.floor(pt.y/60)]?.[Math.floor(pt.x/60)] === 1);
    };

    const showPlayerHpBar = useCallback(() => {
        setPlayerHpVisible(true);
        if (playerHpTimer.current) clearTimeout(playerHpTimer.current);
        playerHpTimer.current = setTimeout(() => setPlayerHpVisible(false), 2500);
    }, []);

    const showEnemyHpBar = useCallback((enemyId) => {
        setEnemyHpVisible(prev => ({ ...prev, [enemyId]: true }));
        if (enemyHpTimers.current[enemyId]) clearTimeout(enemyHpTimers.current[enemyId]);
        enemyHpTimers.current[enemyId] = setTimeout(() => {
            setEnemyHpVisible(prev => ({ ...prev, [enemyId]: false }));
        }, 2500);
    }, []);

    const getPatrolTarget = useCallback(() => {
        const emptyTiles = [];
        BIG_MAP.forEach((row, y) => {
            row.forEach((tile, x) => {
                if (tile === 0) emptyTiles.push({ x: x * 60 + 30, y: y * 60 + 30 });
            });
        });
        return emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    }, []);

    const handleAttack = useCallback(() => {
        if (isAttacking || gameState !== 'playing') return;
        setIsAttacking(true);
        
        setTimeout(() => {
            enemies.current.forEach(en => {
                const d = Math.sqrt((en.x - player.current.x)**2 + (en.y - player.current.y)**2);
                if (d < 90) { 
                    en.hp -= player.current.dmg;
                    showEnemyHpBar(en.id);
                    
                    if (en.hp <= 0) {
                        // Осколки и кровь
                        setShards(prev => [...prev, { id: generateId(), x: en.x, y: en.y }]);
                        setBloodEffects(prev => [...prev, { id: generateId(), x: en.x, y: en.y }]);
                        
                        // Монеты - улетают к игроку
                        const coinId = generateId();
                        setCoins(prev => [...prev, {
                            id: coinId,
                            startX: en.x,
                            startY: en.y,
                            endX: player.current.x,
                            endY: player.current.y - 50
                        }]);
                        
                        // Добавляем деньги
                        setTimeout(() => {
                            setMoney(m => m + 50);
                            player.current.money = (player.current.money || 0) + 50;
                        }, 600);
                    }
                }
            });
            enemies.current = enemies.current.filter(en => en.hp > 0);
            setIsAttacking(false);
        }, 200);
    }, [isAttacking, gameState, showEnemyHpBar]);

    const restartGame = useCallback(() => {
        player.current = { 
            x: 90, y: 90, hp: 100, maxHp: 100, 
            dmg: 40 + (inventory.includes('dark-sword') ? 50 : inventory.includes('steel-sword') ? 30 : inventory.includes('iron-sword') ? 15 : 0),
            money: money,
            shield: inventory.includes('void-shield') ? 0.6 : inventory.includes('plate-armor') ? 0.4 : inventory.includes('chain-mail') ? 0.25 : inventory.includes('leather-armor') ? 0.1 : 0
        };
        enemies.current = [
            { id: 1, x: 400, y: 90, hp: 100, maxHp: 100, state: 'idle', angle: 0, attackCooldown: 0, isAttacking: false, patrolTarget: null },
            { id: 2, x: 800, y: 300, hp: 100, maxHp: 100, state: 'idle', angle: 0, attackCooldown: 0, isAttacking: false, patrolTarget: null }
        ];
        setGameState('menu');
        setShards([]);
        setBloodEffects([]);
        setCoins([]);
        setIsShaking(false);
        setPlayerHpVisible(false);
        setEnemyHpVisible({});
    }, [inventory, money]);

    const buyItem = useCallback((itemId, price) => {
        if (money >= price && !inventory.includes(itemId)) {
            setMoney(m => m - price);
            player.current.money = money - price;
            setInventory(prev => [...prev, itemId]);
            
            // Применяем эффекты
            if (itemId === 'iron-sword') player.current.dmg += 15;
            if (itemId === 'steel-sword') player.current.dmg += 30;
            if (itemId === 'dark-sword') player.current.dmg += 50;
            if (itemId === 'excalibur') player.current.dmg += 100;
            if (itemId === 'leather-armor') player.current.shield = 0.1;
            if (itemId === 'chain-mail') player.current.shield = 0.25;
            if (itemId === 'plate-armor') player.current.shield = 0.4;
            if (itemId === 'void-shield') player.current.shield = 0.6;
        }
    }, [money, inventory]);

    const removeShard = useCallback((shardId) => {
        setShards(prev => prev.filter(s => s.id !== shardId));
    }, []);

    const removeCoin = useCallback((coinId) => {
        setCoins(prev => prev.filter(c => c.id !== coinId));
    }, []);

    // Игровой цикл
    useEffect(() => {
        const loop = setInterval(() => {
            if (gameState !== 'playing') return;

            if (player.current.hp <= 0) {
                setIsShaking(true);
                setTimeout(() => setGameState('dead'), 800);
                return;
            }

            // Движение игрока
            const s = 4;
            let nx = player.current.x, ny = player.current.y;
            if (keys.current['ArrowUp'] || keys.current['KeyW']) ny -= s;
            if (keys.current['ArrowDown'] || keys.current['KeyS']) ny += s;
            if (keys.current['ArrowLeft'] || keys.current['KeyA']) nx -= s;
            if (keys.current['ArrowRight'] || keys.current['KeyD']) nx += s;
            if (canMoveTo(nx, player.current.y)) player.current.x = nx;
            if (canMoveTo(player.current.x, ny)) player.current.y = ny;

            // ИИ Врагов
            enemies.current.forEach(en => {
                if (en.attackCooldown > 0) en.attackCooldown -= 16;

                const dx = player.current.x - en.x;
                const dy = player.current.y - en.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < 250) {
                    en.state = 'chase';
                    
                    if (dist < 50 && en.attackCooldown <= 0 && !en.isAttacking) {
                        en.isAttacking = true;
                        
                        setTimeout(() => {
                            if (en.hp > 0 && player.current.hp > 0) {
                                let damage = 10;
                                if (player.current.shield) damage *= (1 - player.current.shield);
                                player.current.hp -= damage;
                                showPlayerHpBar();
                            }
                            en.isAttacking = false;
                            en.attackCooldown = 1200;
                        }, 350);
                    }
                    
                    if (!en.isAttacking) {
                        const vx = (dx / dist) * 1.8;
                        const vy = (dy / dist) * 1.8;
                        if (canMoveTo(en.x + vx, en.y + vy)) { 
                            en.x += vx; 
                            en.y += vy; 
                        }
                    }
                } else {
                    en.state = 'idle';
                    en.isAttacking = false;
                    
                    if (!en.patrolTarget || Math.sqrt((en.x - en.patrolTarget.x)**2 + (en.y - en.patrolTarget.y)**2) < 30) {
                        en.patrolTarget = getPatrolTarget();
                    }
                    
                    if (en.patrolTarget) {
                        const pdx = en.patrolTarget.x - en.x;
                        const pdy = en.patrolTarget.y - en.y;
                        const pdist = Math.sqrt(pdx*pdx + pdy*pdy);
                        if (pdist > 0) {
                            const vx = (pdx / pdist) * 1.2;
                            const vy = (pdy / pdist) * 1.2;
                            if (canMoveTo(en.x + vx, en.y + vy)) {
                                en.x += vx;
                                en.y += vy;
                            }
                        }
                    }
                }
            });

            // Питомец
            pet.current.x += (player.current.x - 40 - pet.current.x) * 0.05;
            pet.current.y += (player.current.y - 30 - pet.current.y) * 0.05;

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
    }, [gameState, handleAttack, showPlayerHpBar, getPatrolTarget]);

    const playerSkinClass = equippedSkin === 'dark' ? 'player-skin-dark' : 'player-skin';
    const petSkinClass = equippedPet === 'shadow' ? 'pet-skin-shadow' : '';

    return (
        <div id="viewport" className={isShaking ? 'screen-shake' : ''}>
            {gameState === 'intro' && (
                <IntroScreen onComplete={() => setGameState('menu')} />
            )}

            {gameState === 'menu' && (
                <MainMenu 
                    onPlay={() => setGameState('levels')}
                    onShop={() => setGameState('shop')}
                />
            )}

            {gameState === 'levels' && (
                <LevelSelect 
                    onBack={() => setGameState('menu')}
                    onSelectLevel={(levelId) => {
                        if (levelId === 1) setGameState('playing');
                    }}
                    unlockedLevels={unlockedLevels}
                />
            )}

            {gameState === 'shop' && (
                <Shop 
                    money={money}
                    inventory={inventory}
                    buyItem={buyItem}
                    onClose={() => setGameState('menu')}
                />
            )}

            {gameState === 'dead' && (
                <DeathScreen 
                    onRestart={restartGame} 
                    isShaking={isShaking}
                />
            )}

            {gameState === 'playing' && (
                <GameWorld 
                    player={player}
                    pet={pet}
                    enemies={enemies}
                    playerSkinClass={playerSkinClass}
                    petSkinClass={petSkinClass}
                    isAttacking={isAttacking}
                    playerHpVisible={playerHpVisible}
                    enemyHpVisible={enemyHpVisible}
                    shards={shards}
                    bloodEffects={bloodEffects}
                    coins={coins}
                    removeShard={removeShard}
                    removeCoin={removeCoin}
                    gameState={gameState}
                />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Game />);
