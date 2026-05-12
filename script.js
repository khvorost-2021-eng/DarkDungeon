const { useState, useEffect, useRef, useCallback, useReducer } = React;

// ========== МОБИЛЬНЫЕ КОНТРОЛЫ ==========
const DynamicJoystick = ({ onMove }) => {
    const joystickRef = useRef(null);
    const handleRef = useRef(null);
    const isActive = useRef(false);
    const centerX = useRef(0);
    const centerY = useRef(0);

    useEffect(() => {
        const joystick = joystickRef.current;
        const handle = handleRef.current;
        if (!joystick || !handle) return;

        const handleStart = (e) => {
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            
            // Проверяем, что касание в правой половине экрана
            if (touch.clientX < window.innerWidth / 2) return;
            
            isActive.current = true;
            centerX.current = touch.clientX;
            centerY.current = touch.clientY;
            
            // Позиционируем джойстик в точке касания
            joystick.style.left = `${touch.clientX - 60}px`;
            joystick.style.top = `${touch.clientY - 60}px`;
            joystick.style.display = 'block';
            
            handle.style.transform = 'translate(0, 0)';
        };

        const handleMove = (e) => {
            if (!isActive.current) return;
            e.preventDefault();
            
            const touch = e.touches ? e.touches[0] : e;
            
            let deltaX = touch.clientX - centerX.current;
            let deltaY = touch.clientY - centerY.current;
            
            const maxDistance = 60;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Ограничиваем расстояние
            if (distance > maxDistance) {
                deltaX = (deltaX / distance) * maxDistance;
                deltaY = (deltaY / distance) * maxDistance;
            }
            
            handle.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            
            // Нормализуем и передаем движение
            const normalizedX = deltaX / maxDistance;
            const normalizedY = deltaY / maxDistance;
            
            onMove({ x: normalizedX, y: normalizedY });
        };

        const handleEnd = (e) => {
            e.preventDefault();
            isActive.current = false;
            joystick.style.display = 'none';
            handle.style.transform = 'translate(0, 0)';
            onMove({ x: 0, y: 0 });
        };

        // Touch события на всем экране
        document.addEventListener('touchstart', handleStart, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd, { passive: false });
        document.addEventListener('touchcancel', handleEnd, { passive: false });

        return () => {
            document.removeEventListener('touchstart', handleStart);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
            document.removeEventListener('touchcancel', handleEnd);
        };
    }, [onMove]);

    return (
        <div className="dynamic-joystick-container" ref={joystickRef} style={{ display: 'none' }}>
            <div className="joystick-base">
                <div className="joystick-handle" ref={handleRef} />
            </div>
        </div>
    );
};

const MobileAttackButton = ({ onAttack }) => {
    const handleAttack = useCallback((e) => {
        e.preventDefault();
        onAttack();
    }, [onAttack]);
    
    return (
        <div className="attack-button-container">
            <button 
                className="attack-button" 
                onTouchStart={handleAttack}
                onMouseDown={handleAttack}
            >
                УДАР
            </button>
        </div>
    );
};

const MobileControls = ({ onMove, onAttack, isVisible }) => {
    if (!isVisible) return null;
    
    return (
        <div className="mobile-controls">
            <MobileAttackButton onAttack={onAttack} />
            <DynamicJoystick onMove={onMove} />
        </div>
    );
};

const RotationWarning = ({ isVisible }) => {
    if (!isVisible) return null;
    
    return (
        <div className="rotation-warning">
            <div className="rotation-icon">↻</div>
            <div className="rotation-text">Поверните устройство</div>
            <div className="rotation-subtext">Для лучшего игрового опыта</div>
        </div>
    );
};

// ========== МУЗЫКАЛЬНЫЙ МЕНЕДЖЕР ==========
const MusicManager = {
    audioContext: null,
    isPlaying: false,
    currentNote: 0,
    noteInterval: null,
    
    // Мрачная минорная гамма для темной атмосферы
    notes: [65.41, 73.42, 77.78, 82.41, 87.31, 92.50, 98.00, 103.83], // C2, D2, Eb2, E2, F2, Gb2, G2, Ab2
    
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    playDarkAmbient() {
        if (this.isPlaying || !this.audioContext) return;
        this.isPlaying = true;
        
        const playDrone = () => {
            if (!this.isPlaying) return;
            
            // Основной дрон (низкий гул)
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.value = this.notes[Math.floor(Math.random() * this.notes.length)];
            
            filter.type = 'lowpass';
            filter.frequency.value = 200 + Math.random() * 300;
            
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 2);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 6);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 6);
        };
        
        const playDarkPad = () => {
            if (!this.isPlaying) return;
            
            // Пад (фоновый звук)
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.value = this.notes[Math.floor(Math.random() * 4)] * 2; // Октава выше
            
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.03, this.audioContext.currentTime + 3);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 8);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 8);
        };
        
        // Интервалы для создания атмосферы
        this.noteInterval = setInterval(() => {
            if (Math.random() > 0.3) playDrone();
            if (Math.random() > 0.5) playDarkPad();
        }, 2000);
        
        // Начать сразу
        playDrone();
        playDarkPad();
    },
    
    stop() {
        this.isPlaying = false;
        if (this.noteInterval) {
            clearInterval(this.noteInterval);
            this.noteInterval = null;
        }
    }
};

// ========== SFX МЕНЕДЖЕР ==========
const SFXManager = {
    audioContext: null,
    
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    // Звук клика кнопки
    playClick() {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.05);
    },
    
    // Звук удара меча
    playAttack() {
        if (!this.audioContext) return;
        // Свист меча + удар
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.15);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    },
    
    // Звук победы
    playVictory() {
        if (!this.audioContext) return;
        const now = this.audioContext.currentTime;
        
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.08, now + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.5);
        });
    },
    
    // Звук смерти
    playDeath() {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 1);
        
        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 1);
    },
    
    // Звук покупки
    playBuy() {
        if (!this.audioContext) return;
        const now = this.audioContext.currentTime;
        
        [880, 1100].forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, now + i * 0.05);
            gain.gain.linearRampToValueAtTime(0.05, now + i * 0.05 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.2);
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.25);
        });
    },
    
    // Звук ошибки / недостаточно денег
    playError() {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }
};

// ========== КОМПОНЕНТЫ ==========

const SpinningSword = ({ weapon }) => {
    const swordStyles = {
        stick: { blade: '#8B4513', guard: '#654321', handle: '#4a3728' },
        steel: { blade: '#C0C0C0', guard: '#A0A0A0', handle: '#444444' },
        dark: { blade: '#2d1b4e', guard: '#1a1a2e', handle: '#0f0f1a' },
        fire: { blade: '#ff4500', guard: '#8b0000', handle: '#4a0000' },
        ice: { blade: '#87CEEB', guard: '#4682B4', handle: '#2F4F4F' },
        excalibur: { blade: '#FFD700', guard: '#DAA520', handle: '#8B7508' }
    };
    
    const style = swordStyles[weapon] || swordStyles.stick;
    
    return (
        <div className="spinning-sword">
            <div className="sword-blade" style={{ background: `linear-gradient(90deg, ${style.blade} 0%, ${style.blade}dd 50%, ${style.blade} 100%)` }} />
            <div className="sword-guard" style={{ background: style.guard }} />
            <div className="sword-handle" style={{ background: style.handle }} />
        </div>
    );
};

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

const EnemyShards = ({ x, y, onComplete }) => {
    const [shards, setShards] = useState([]);
    useEffect(() => {
        const shardCount = 5 + Math.floor(Math.random() * 3);
        const newShards = Array.from({ length: shardCount }, (_, i) => ({
            id: i, angle: (Math.PI * 2 * i) / shardCount + Math.random() * 0.5,
            distance: 60 + Math.random() * 60, rot: Math.random() * 360, size: 8 + Math.random() * 6
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
                    <div key={shard.id} className="enemy-shard"
                        style={{ position: 'absolute', left: x, top: y, width: shard.size, height: shard.size,
                            animation: `shard-fly 0.7s ease-out forwards`, ['--dx']: `${dx}px`, ['--dy']: `${dy}px`, ['--rot']: `${shard.rot}deg` }} />
                );
            })}
            <style>{`
                @keyframes shard-fly {
                    0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)) scale(0.3); opacity: 0; }
                }
            `}</style>
        </>
    );
};

const BloodParticles = ({ x, y, isPlayer = false }) => {
    const [particles, setParticles] = useState([]);
    
    useEffect(() => {
        // 15-25 particles for player, 5-10 for enemy
        const particleCount = isPlayer ? 15 + Math.floor(Math.random() * 11) : 5 + Math.floor(Math.random() * 6);
        const newParticles = Array.from({ length: particleCount }, (_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 60;
            const size = 8 + Math.random() * 4;
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            return {
                id: i,
                startX: x,
                startY: y,
                endX: endX,
                endY: endY,
                size: size,
                delay: Math.random() * 0.1
            };
        });
        setParticles(newParticles);
        
        // Clear particles after animation
        const timer = setTimeout(() => setParticles([]), 800);
        
        return () => clearTimeout(timer);
    }, [x, y, isPlayer]);
    
    return (
        <>
            {particles.map(p => (
                <div 
                    key={p.id} 
                    className="blood-particle"
                    style={{
                        position: 'absolute',
                        left: p.startX + 'px',
                        top: p.startY + 'px',
                        width: p.size + 'px',
                        height: p.size + 'px',
                        animation: `blood-particle-anim 0.8s ease-out ${p.delay}s forwards`,
                        '--start-x': p.startX + 'px',
                        '--start-y': p.startY + 'px',
                        '--end-x': p.endX + 'px',
                        '--end-y': p.endY + 'px'
                    }}
                />
            ))}
            <style>{`
                @keyframes blood-particle-anim {
                    0% {
                        left: var(--start-x);
                        top: var(--start-y);
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    100% {
                        left: var(--end-x);
                        top: var(--end-y);
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0);
                    }
                }
            `}</style>
        </>
    );
};

const Coin = ({ startX, startY, endX, endY, onComplete }) => {
    const [pos, setPos] = useState({ x: startX, y: startY });
    const [scale, setScale] = useState(1);
    const [isVisible, setIsVisible] = useState(true);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
        const duration = 600;
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const x = startX + (endX - startX) * ease;
            const y = startY + (endY - startY) * ease;
            // Монета уменьшается от 1 до 0.4 (размер иконки в HUD)
            const newScale = 1 - (progress * 0.6);
            setPos({ x, y });
            setScale(newScale);
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsVisible(false);
                setTimeout(() => onCompleteRef.current(), 50);
            }
        };
        const timer = setTimeout(animate, 100);
        return () => clearTimeout(timer);
    }, [startX, startY, endX, endY]);

    if (!isVisible) return null;

    return (
        <div className="coin" style={{ position: 'absolute', left: pos.x, top: pos.y, transform: `translate(-50%, -50%) scale(${scale})`, zIndex: 200 }} />
    );
};

// ========== 20 УРОВНЕЙ С КАРТАМИ ==========
const LEVELS_DATA = [
    // Уровень 1 - Простое подземелье
    {
        id: 1, name: 'Подземелье',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 400, y: 90 }, { x: 700, y: 300 }]
    },
    // Уровень 2 - Лабиринт
    {
        id: 2, name: 'Лабиринт',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],[1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 400, y: 200 }, { x: 700, y: 90 }, { x: 700, y: 300 }]
    },
    // Уровень 3 - Зал с колоннами
    {
        id: 3, name: 'Колонны',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],[1,0,1,1,0,0,0,1,0,0,0,1,1,0,1],[1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],[1,0,1,1,0,0,0,1,0,0,0,1,1,0,1],[1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 400, y: 150 }, { x: 600, y: 250 }, { x: 400, y: 250 }]
    },
    // Уровень 4 - Спираль
    {
        id: 4, name: 'Спираль',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],[1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 500, y: 200 }, { x: 750, y: 300 }, { x: 500, y: 300 }]
    },
    // Уровень 5 - Крест
    {
        id: 5, name: 'Крест',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,0,1,1,1,1,1,0,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,0,1,1,1,1,1,0,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 400, y: 150 }, { x: 600, y: 150 }, { x: 500, y: 300 }, { x: 750, y: 300 }]
    },
    // Уровень 6 - Туннели
    {
        id: 6, name: 'Туннели',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,1,0,0,0,0,1,0,0,0,0,1,0,1],[1,0,1,0,1,1,0,1,0,1,1,0,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,0,1,1,0,1,0,1,1,0,1,0,1],[1,0,1,0,0,0,0,1,0,0,0,0,1,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 300, y: 150 }, { x: 600, y: 150 }, { x: 300, y: 300 }, { x: 600, y: 300 }]
    },
    // Уровень 7 - Змейка
    {
        id: 7, name: 'Змейка',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],[1,1,1,1,1,0,1,0,1,0,1,0,1,1,1],[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],[1,1,1,1,1,0,1,0,1,0,1,1,1,1,1],[1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 400, y: 200 }, { x: 600, y: 200 }, { x: 800, y: 200 }, { x: 500, y: 300 }]
    },
    // Уровень 8 - Клетка
    {
        id: 8, name: 'Клетка',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],[1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],[1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 350, y: 150 }, { x: 550, y: 150 }, { x: 750, y: 150 }, { x: 450, y: 300 }, { x: 650, y: 300 }]
    },
    // Уровень 9 - Двойной лабиринт
    {
        id: 9, name: 'Двойной лабиринт',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],[1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 400, y: 150 }, { x: 800, y: 150 }, { x: 400, y: 300 }, { x: 800, y: 300 }, { x: 600, y: 225 }]
    },
    // Уровень 10 - Кольцо
    {
        id: 10, name: 'Кольцо',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 400, y: 200 }, { x: 700, y: 200 }, { x: 550, y: 100 }, { x: 550, y: 320 }, { x: 850, y: 320 }]
    },
    // Уровень 11 - Волна
    {
        id: 11, name: 'Волна',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 300, y: 150 }, { x: 500, y: 150 }, { x: 700, y: 150 }, { x: 900, y: 150 }, { x: 400, y: 300 }, { x: 800, y: 300 }]
    },
    // Уровень 12 - Коридоры
    {
        id: 12, name: 'Коридоры',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 250, y: 150 }, { x: 450, y: 150 }, { x: 650, y: 150 }, { x: 850, y: 150 }, { x: 350, y: 300 }, { x: 550, y: 300 }, { x: 750, y: 300 }]
    },
    // Уровень 13 - Крестообразный
    {
        id: 13, name: 'Крестообразный',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 350, y: 150 }, { x: 550, y: 150 }, { x: 750, y: 150 }, { x: 350, y: 300 }, { x: 550, y: 300 }, { x: 750, y: 300 }, { x: 550, y: 225 }]
    },
    // Уровень 14 - Паутина
    {
        id: 14, name: 'Паутина',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],[1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],[1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 300, y: 100 }, { x: 600, y: 100 }, { x: 900, y: 100 }, { x: 300, y: 300 }, { x: 600, y: 300 }, { x: 900, y: 300 }, { x: 450, y: 200 }, { x: 750, y: 200 }]
    },
    // Уровень 15 - Гнездо
    {
        id: 15, name: 'Гнездо',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,1,1,1,1,1,0,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 400, y: 150 }, { x: 600, y: 150 }, { x: 800, y: 150 }, { x: 400, y: 300 }, { x: 600, y: 300 }, { x: 800, y: 300 }, { x: 600, y: 225 }, { x: 700, y: 225 }]
    },
    // Уровень 16 - Круги
    {
        id: 16, name: 'Круги',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,0,1,1,1,0,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,1,1,1,0,1,1,1,0,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 350, y: 150 }, { x: 550, y: 150 }, { x: 750, y: 150 }, { x: 950, y: 150 }, { x: 450, y: 300 }, { x: 650, y: 300 }, { x: 850, y: 300 }, { x: 600, y: 200 }, { x: 600, y: 250 }]
    },
    // Уровень 17 - Зигзаг
    {
        id: 17, name: 'Зигзаг',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],[1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],[1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 250, y: 100 }, { x: 500, y: 100 }, { x: 750, y: 100 }, { x: 350, y: 225 }, { x: 600, y: 225 }, { x: 850, y: 225 }, { x: 250, y: 320 }, { x: 500, y: 320 }, { x: 750, y: 320 }]
    },
    // Уровень 18 - Кольцевой
    {
        id: 18, name: 'Кольцевой',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 400, y: 150 }, { x: 600, y: 150 }, { x: 800, y: 150 }, { x: 400, y: 300 }, { x: 600, y: 300 }, { x: 800, y: 300 }, { x: 600, y: 225 }, { x: 500, y: 225 }, { x: 700, y: 225 }, { x: 900, y: 225 }]
    },
    // Уровень 19 - Лабиринт смерти
    {
        id: 19, name: 'Лабиринт смерти',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],[1,0,1,0,1,0,1,0,1,1,1,0,1,0,1],[1,0,1,0,1,0,0,0,0,0,0,0,1,0,1],[1,0,1,0,1,1,1,1,1,0,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 300, y: 150 }, { x: 500, y: 150 }, { x: 700, y: 150 }, { x: 900, y: 150 }, { x: 400, y: 300 }, { x: 600, y: 300 }, { x: 800, y: 300 }, { x: 600, y: 225 }, { x: 500, y: 225 }, { x: 700, y: 225 }, { x: 350, y: 225 }]
    },
    // Уровень 20 - Финальная арена
    {
        id: 20, name: 'Финальная арена',
        map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
        playerStart: { x: 90, y: 90 },
        enemies: [{ x: 300, y: 150 }, { x: 500, y: 150 }, { x: 700, y: 150 }, { x: 900, y: 150 }, { x: 400, y: 300 }, { x: 600, y: 300 }, { x: 800, y: 300 }, { x: 600, y: 225 }, { x: 500, y: 225 }, { x: 700, y: 225 }, { x: 400, y: 225 }, { x: 800, y: 225 }]
    }
];

// ========== ФОРМУЛЫ СЛОЖНОСТИ ДЛЯ УРОВНЕЙ 21-100 ==========
const calculateLevelParams = (levelId) => ({
    id: levelId, name: `Уровень ${levelId}`,
    enemyCount: Math.ceil(2 + (levelId - 1) * 0.5),
    enemyHp: 80 + (levelId * 20),
    enemySpeed: 1.2 + (levelId * 0.1),
    enemyDamage: 2 + (levelId * 0.5),
    coinCount: 3 + (levelId * 2),
    map: LEVELS_DATA[19].map,
    playerStart: { x: 90, y: 90 }
});

const getLevelData = (levelId) => levelId <= 20 ? LEVELS_DATA[levelId - 1] : calculateLevelParams(levelId);

// Helper function to generate unique IDs
const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

// ========== ТИПЫ ОРУЖИЯ ==========
const WEAPONS = {
    sword: { id: 'sword', name: 'Меч', price: 0, damage: 0, icon: '⚔️', rarity: 'common', desc: 'Базовое оружие' },
    axe: { id: 'axe', name: 'Топор', price: 300, damage: 15, icon: '🪓', rarity: 'rare', desc: '+15 к урону' },
    hammer: { id: 'hammer', name: 'Молот', price: 500, damage: 30, icon: '🔨', rarity: 'epic', desc: '+30 к урону' },
    scythe: { id: 'scythe', name: 'Коса', price: 800, damage: 50, icon: '🔱', rarity: 'legendary', desc: '+50 к урону' }
};

// ========== ГЛАВНОЕ МЕНЮ ==========
const MainMenu = ({ onPlay, onShop, onSettings }) => (
    <div className="main-menu">
        <div className="menu-bg" />
        <div className="menu-title">DARK DUNGEON</div>
        <div className="menu-buttons">
            <button className="menu-btn primary" onClick={() => { SFXManager.playClick(); onPlay(); }}>УРОВНИ</button>
            <button className="menu-btn" onClick={() => { SFXManager.playClick(); onShop(); }}>МАГАЗИН</button>
            <button className="menu-btn" onClick={() => { SFXManager.playClick(); onSettings(); }}>НАСТРОЙКИ</button>
        </div>
    </div>
);

// ========== НАСТРОЙКИ ==========
const Settings = ({ playerName, setPlayerName, musicEnabled, setMusicEnabled, onBack }) => {
    const handleToggleMusic = () => {
        SFXManager.playClick();
        const newState = !musicEnabled;
        setMusicEnabled(newState);
        if (newState) {
            MusicManager.playDarkAmbient();
        } else {
            MusicManager.stop();
        }
    };

    return (
        <div className="settings-screen">
            <button className="settings-back-btn" onClick={() => { SFXManager.playClick(); onBack(); }}>◀</button>
            <div className="settings-title">НАСТРОЙКИ</div>
            
            <div className="settings-content">
                <div className="settings-section">
                    <label className="settings-label">Имя игрока:</label>
                    <input 
                        type="text" 
                        className="settings-input"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Введите имя"
                        maxLength={20}
                    />
                </div>

                <div className="settings-section">
                    <label className="settings-label">Музыка:</label>
                    <button 
                        className={`settings-toggle ${musicEnabled ? 'active' : ''}`}
                        onClick={handleToggleMusic}
                    >
                        {musicEnabled ? 'ВКЛ' : 'ВЫКЛ'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ========== ВЫБОР УРОВНЕЙ (100 УРОВНЕЙ) ==========
const LevelSelect = ({ onBack, onSelectLevel, unlockedLevels }) => {
    const [page, setPage] = useState(0);
    const levelsPerPage = 15; // 5x3 grid

    const levels = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: i < 20 ? LEVELS_DATA[i]?.name || `Уровень ${i + 1}` : `Уровень ${i + 1}`,
    }));

    const totalPages = Math.ceil(levels.length / levelsPerPage);
    const startIndex = page * levelsPerPage;
    const visibleLevels = levels.slice(startIndex, startIndex + levelsPerPage);

    const goPrev = () => setPage(p => Math.max(0, p - 1));
    const goNext = () => setPage(p => Math.min(totalPages - 1, p + 1));

    return (
        <div className="levels-screen">
            <button className="levels-back-btn" onClick={onBack}>◀</button>
            <div className="levels-title">ВЫБЕРИТЕ УРОВЕНЬ</div>
            <div className="levels-nav-container">
                <button className="levels-arrow" onClick={goPrev} disabled={page === 0}>◀</button>
                <div className="levels-grid">
                    {visibleLevels.map(level => {
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
                <button className="levels-arrow" onClick={goNext} disabled={page === totalPages - 1}>▶</button>
            </div>
            <div className="levels-page-indicator">{page + 1} / {totalPages}</div>
        </div>
    );
};

// ========== МАГАЗИН ==========
const Shop = ({ money, inventory, equippedPet, equippedWeapon, buyItem, onClose, onEquipPet, onEquipWeapon }) => {
    const [activeTab, setActiveTab] = useState('weapons');

    const handleClose = () => {
        SFXManager.playClick();
        onClose();
    };
    
    const shopItems = {
        weapons: [
            { id: 'iron-sword', name: 'Железный меч', price: 100, desc: '+15 к урону', rarity: 'common', icon: '⚔️', weaponType: 'steel' },
            { id: 'steel-sword', name: 'Стальной меч', price: 250, desc: '+30 к урону', rarity: 'rare', icon: '🗡️', weaponType: 'steel' },
            { id: 'dark-sword', name: 'Меч Тьмы', price: 500, desc: '+50 к урону', rarity: 'epic', icon: '⚫', weaponType: 'dark' },
            { id: 'fire-blade', name: 'Огненный клинок', price: 600, desc: '+70 к урону', rarity: 'epic', icon: '🔥', weaponType: 'fire' },
            { id: 'ice-blade', name: 'Ледяной клинок', price: 600, desc: '+70 к урону', rarity: 'epic', icon: '❄️', weaponType: 'ice' },
            { id: 'excalibur', name: 'Экскалибур', price: 1000, desc: '+100 к урону', rarity: 'legendary', icon: '✨', weaponType: 'excalibur' },
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
            { id: 'wolf-pet', name: 'Волк', price: 200, desc: 'Атакует врагов', rarity: 'rare', icon: '🐺', type: 'wolf' },
            { id: 'raven-pet', name: 'Ворон', price: 300, desc: 'Собирает монеты', rarity: 'epic', icon: '🦅', type: 'raven' },
            { id: 'dragon-pet', name: 'Дракончик', price: 800, desc: 'Огненное дыхание', rarity: 'legendary', icon: '🐲', type: 'dragon' },
        ]
    };

    const getRarityColor = (rarity) => {
        const colors = {
            common: '#9e9e9e',
            rare: '#4fc3f7',
            epic: '#ba68c8',
            legendary: '#ffd54f'
        };
        return colors[rarity] || '#9e9e9e';
    };

    const handleBuy = (item) => {
        const owned = inventory.includes(item.id);
        if (!owned && money < item.price) {
            SFXManager.playError();
            return;
        }
        
        if (item.type) {
            // Это питомец - экипируем сразу
            onEquipPet(item.type);
            SFXManager.playBuy();
        } else if (item.weaponType) {
            // Это оружие - экипируем сразу
            onEquipWeapon(item.weaponType);
            if (!owned) SFXManager.playBuy();
        } else {
            if (!owned) SFXManager.playBuy();
        }
        buyItem(item.id, item.price);
    };

    const currentItems = shopItems[activeTab] || [];

    return (
        <div className="shop-overlay">
            <button className="shop-close-btn" onClick={handleClose}>◀</button>
            
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
                        const equipped = item.type ? equippedPet === item.type : 
                                        item.weaponType ? equippedWeapon === item.weaponType : false;
                        const canAfford = money >= item.price;
                        return (
                            <div 
                                key={item.id} 
                                className={`shop-item-card ${owned ? 'owned' : ''}`}
                                style={{ '--rarity-color': getRarityColor(item.rarity) }}
                            >
                                <div className="shop-item-icon">{item.icon}</div>
                                <div className="shop-item-name">{item.name}</div>
                                <div className={`shop-item-rarity rarity-${item.rarity}`}>{item.rarity}</div>
                                <div className="shop-item-desc">{item.desc}</div>
                                <div className="shop-item-price">{item.price} 🪙</div>
                                <button 
                                    className={`shop-buy-btn ${owned ? 'owned' : ''}`}
                                    onClick={() => handleBuy(item)}
                                    disabled={!canAfford || owned}
                                >
                                    {equipped ? 'ЭКИПИРОВАН' : owned ? 'КУПЛЕНО' : canAfford ? 'КУПИТЬ' : 'НЕДОСТАТОЧНО'}
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
                    {equippedPet && (
                        <div style={{marginTop: '15px', padding: '10px', background: 'rgba(139,0,0,0.2)', borderRadius: '6px', border: '1px solid #8b0000'}}>
                            <div style={{fontSize: '11px', color: '#888', marginBottom: '5px'}}>ТЕКУЩИЙ ПИТОМЕЦ:</div>
                            <div style={{color: '#d4af37'}}>🐾 {equippedPet === 'wolf' ? 'Волк' : equippedPet === 'raven' ? 'Ворон' : equippedPet === 'dragon' ? 'Дракончик' : 'Нет'}</div>
                        </div>
                    )}
                </div>
            </div>
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
            <div className="death-text">СМЕРТЬ</div>
            <button className="death-btn" onClick={onRestart}>НАЧАТЬ ЗАНОВО</button>
        </div>
    </>
);

// ========== ЭКРАН ПОБЕДЫ ==========
const VictoryScreen = ({ onNextLevel, onMenu, level, coinsEarned }) => (
    <div className="victory-screen">
        <div className="victory-text">ПОБЕДА!</div>
        <div className="victory-stats">
            Уровень {level} пройден<br />
            Заработано: {coinsEarned} 🪙
        </div>
        <button className="victory-btn" onClick={onNextLevel}>СЛЕДУЮЩИЙ УРОВЕНЬ</button>
        <button className="victory-btn" onClick={onMenu} style={{ marginTop: '20px' }}>В МЕНЮ</button>
    </div>
);

// ========== ИГРОВОЙ МИР ==========
const GameWorld = ({
    player, pet, enemies, playerSkinClass, petSkinClass, equippedPet, equippedWeapon, playerName,
    isAttacking, playerHpVisible, enemyHpVisible,
    shards, bloodEffects, coins, removeShard, removeCoin,
    gameState, onOpenShop, onExitToMenu, currentMap
}) => {
    if (gameState !== 'playing') return null;

    const handleMenuClick = () => {
        onExitToMenu();
    };


    // Используем forceUpdate для обновления позиции
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate();
        }, 16);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="hud">
                <div className="hud-player-name">👤 {playerName || 'Игрок'}</div>
                <div>❤️ {Math.max(0, Math.floor(player.hp))} | 🪙 {player.money || 0}</div>
                <div className="hud-stats">
                    ⚔️ {player.dmg} | 🛡️ {player.shield > 0 ? Math.round(player.shield * 100) + '%' : '0%'}
                </div>
            </div>
            <div className="game-buttons">
                <button className="btn-open-shop" onClick={onOpenShop}>МАГАЗИН</button>
                <button className="btn-exit-menu" onClick={onExitToMenu}>МЕНЮ</button>
            </div>
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
                <BloodParticles 
                    key={blood.id} 
                    x={blood.x} 
                    y={blood.y} 
                    isPlayer={blood.isPlayer || false} 
                />
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
                transform: `translate(${-player.x + window.innerWidth/2}px, ${-player.y + window.innerHeight/2}px)` 
            }}>
                {currentMap.map((row, y) => row.map((tile, x) => (
                    tile === 1 && <div key={`${x}-${y}`} className="tile wall" style={{ left: x*60, top: y*60 }} />
                )))}

                <div className="char" style={{ left: player.x, top: player.y }}>
                    <div className={`skin ${playerSkinClass}`}>
                        <div className="eye left"/>
                        <div className="eye right"/>
                    </div>
                    <HPBar hp={player.hp} maxHp={player.maxHp} isVisible={playerHpVisible} />
                    {isAttacking && <SpinningSword weapon={equippedWeapon} />}
                </div>

                {equippedPet && equippedPet !== 'none' && (
                    <div className="char" style={{ left: pet.x, top: pet.y }}>
                        <div className={`pet-${petSkinClass}`} />
                    </div>
                )}

                {enemies.map(en => (
                    <div key={en.id} className="char" style={{ left: en.x, top: en.y }}>
                        <div className={`skin enemy-skin ${en.isAttacking ? 'enemy-windup' : ''} ${en.state === 'patrol' ? 'enemy-patrol' : ''}`}>
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
    const [gameState, setGameState] = useState('menu');
    const [money, setMoney] = useState(200);
    const [isAttacking, setIsAttacking] = useState(false);
    const [equippedSkin, setEquippedSkin] = useState('blue');
    const [equippedPet, setEquippedPet] = useState('none');
    const [equippedWeapon, setEquippedWeapon] = useState('stick'); // Начальное оружие - палка
    const [inventory, setInventory] = useState([]);
    const [unlockedLevels, setUnlockedLevels] = useState(1);
    const [currentLevel, setCurrentLevel] = useState(1);
    
    // Настройки
    const [playerName, setPlayerName] = useState('');
    const [musicEnabled, setMusicEnabled] = useState(true);
    
    const [shards, setShards] = useState([]);
    const [bloodEffects, setBloodEffects] = useState([]);
    const [coins, setCoins] = useState([]);
    const [playerHpVisible, setPlayerHpVisible] = useState(false);
    const [enemyHpVisible, setEnemyHpVisible] = useState({});
    const [isShaking, setIsShaking] = useState(false);
    const [coinsEarned, setCoinsEarned] = useState(0);

    // Используем useState вместо useRef для позиций (фикс движения)
    const [player, setPlayer] = useState({ x: 90, y: 90, hp: 100, maxHp: 100, dmg: 40, money: 200, shield: 0, currentWeapon: 'stick' });
    const [pet, setPet] = useState({ x: 60, y: 90 });
    const [enemies, setEnemies] = useState([]);
    const [currentMap, setCurrentMap] = useState(LEVELS_DATA[0].map);
    
    // Force update для гарантии рендеринга
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    
    // Мобильные контролы
    const [isMobile, setIsMobile] = useState(false);
    const joystickInput = useRef({ x: 0, y: 0 });
    const [isPortrait, setIsPortrait] = useState(false);
    
    const keys = useRef({});
    const playerHpTimer = useRef(null);
    const enemyHpTimers = useRef({});
    const gameLoopRef = useRef(null);
    
    // Определение мобильного устройства
    useEffect(() => {
        const checkMobile = () => {
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isMobileWidth = window.innerWidth <= 1024;
            setIsMobile(isTouchDevice && isMobileWidth);
            
            // Отслеживание ориентации
            const isPortraitMode = window.innerHeight > window.innerWidth;
            setIsPortrait(isPortraitMode);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        window.addEventListener('orientationchange', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('orientationchange', checkMobile);
        };
    }, []);
    
    // Обработчики мобильных контролов
    const handleJoystickMove = useCallback((input) => {
        joystickInput.current = input;
    }, []);
    
    const handleAttack = useCallback(() => {
        if (isAttacking || gameState !== 'playing') return;
        setIsAttacking(true);
        SFXManager.playAttack();
        
        setTimeout(() => {
            setEnemies(prevEnemies => {
                return prevEnemies.map(en => {
                    const d = Math.sqrt((en.x - player.x)**2 + (en.y - player.y)**2);
                    if (d < 90) {
                        const newHp = en.hp - player.dmg;
                        showEnemyHpBar(en.id);
                        
                        if (newHp <= 0) {
                            // Враг умер - создаём эффекты
                            setShards(s => [...s, { id: Date.now(), x: en.x, y: en.y }]);
                            setBloodEffects(b => [...b, { id: Date.now(), x: en.x, y: en.y, isPlayer: false }]);
                            
                            // Монеты - летят к счётчику монет (🪙) в HUD
                            const hudCoinX = 125;
                            const hudCoinY = 35;
                            const worldOffsetX = -player.x + window.innerWidth / 2;
                            const worldOffsetY = -player.y + window.innerHeight / 2;
                            const coinId = Date.now();
                            setCoins(c => [...c, {
                                id: coinId,
                                startX: en.x + worldOffsetX,
                                startY: en.y + worldOffsetY,
                                endX: hudCoinX,
                                endY: hudCoinY
                            }]);
                            
                            setTimeout(() => {
                                setMoney(m => m + 50);
                                setPlayer(p => ({ ...p, money: p.money + 50 }));
                                setCoinsEarned(c => c + 50);
                            }, 600);
                            
                            return null;
                        }
                        
                        // Враг получил урон - если путь заблокирован, убегаем с ускорением
                        const canReach = canReachPlayer(en.x, en.y, player.x, player.y, currentMap);
                        return { ...en, hp: newHp, retreatTimer: canReach ? 0 : 1500 };
                    }
                    return en;
                }).filter(Boolean);
            });
            
            setIsAttacking(false);
            
            // Проверка победы
            setEnemies(currentEnemies => {
                if (currentEnemies.length === 0 || currentEnemies.every(e => e === null)) {
                    setTimeout(() => {
                        const nextLevel = currentLevel + 1;
                        if (nextLevel > unlockedLevels) {
                            setUnlockedLevels(nextLevel);
                        }
                        setGameState('victory');
                        SFXManager.playVictory();
                        if (gameLoopRef.current) {
                            clearInterval(gameLoopRef.current);
                            gameLoopRef.current = null;
                        }
                    }, 500);
                }
                return currentEnemies;
            });
        }, 200);
    }, [isAttacking, gameState, player.x, player.y, player.dmg, showEnemyHpBar, currentLevel, unlockedLevels]);
    
    const handleMobileAttack = useCallback(() => {
        handleAttack();
    }, [handleAttack]);

    // Формулы сложности
    const calculateEnemyStats = (levelId) => {
        return {
            hp: 80 + (levelId * 20),
            speed: 1.2 + (levelId * 0.1),
            damage: 2 + (levelId * 0.5)
        };
    };

    const canMoveTo = (nx, ny, map) => {
        const p = 15;
        const pts = [{x:nx-p, y:ny-p}, {x:nx+p, y:ny-p}, {x:nx-p, y:ny+p}, {x:nx+p, y:ny+p}];
        return !pts.some(pt => map[Math.floor(pt.y/60)]?.[Math.floor(pt.x/60)] === 1);
    };

    const canReachPlayer = (enemyX, enemyY, playerX, playerY, map) => {
        // Simple line-of-sight check - check points along the line
        const dx = playerX - enemyX;
        const dy = playerY - enemyY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const steps = Math.ceil(dist / 20); // Check every 20px
        
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const checkX = enemyX + dx * t;
            const checkY = enemyY + dy * t;
            if (!canMoveTo(checkX, checkY, map)) {
                return false;
            }
        }
        return true;
    };

    const isPositionReachableFromPlayer = (posX, posY, playerStart, map) => {
        // Check if enemy position is reachable from player start position
        return canReachPlayer(posX, posY, playerStart.x, playerStart.y, map);
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

    const initLevel = (levelId) => {
        const levelData = getLevelData(levelId);
        setCurrentMap(levelData.map);
        setCurrentLevel(levelId);
        setCoinsEarned(0);

        // Устанавливаем позицию игрока и сбрасываем HP
        const playerStart = levelData.playerStart;
        setPlayer(prev => ({
            ...prev,
            x: playerStart.x,
            y: playerStart.y,
            hp: 100,
            maxHp: 100
        }));

        // Создаём врагов
        const stats = calculateEnemyStats(levelId);
        const enemyPositions = levelData.enemies || [];

        // Валидация позиций врагов - проверяем что они не на стенах, не слишком близко к игроку и достижимы
        const validEnemyPositions = enemyPositions.filter(pos => {
            if (!canMoveTo(pos.x, pos.y, levelData.map)) return false;
            // Check distance to player >= 80px
            const distToPlayer = Math.sqrt((pos.x - playerStart.x)**2 + (pos.y - playerStart.y)**2);
            if (distToPlayer < 80) return false;
            // Check if position is reachable from player start
            if (!isPositionReachableFromPlayer(pos.x, pos.y, playerStart, levelData.map)) return false;
            return true;
        });
        
        // Гарантируем минимум 3 врага или столько, сколько было в уровне
        const targetEnemyCount = Math.max(3, enemyPositions.length);
        const finalPositions = [...validEnemyPositions];
        
        // Генерируем новых врагов если нужно
        let attempts = 0;
        while (finalPositions.length < targetEnemyCount && attempts < 200) {
            const patrolPos = getPatrolTarget(levelData.map);
            if (patrolPos && 
                !finalPositions.some(p => Math.abs(p.x - patrolPos.x) < 30 && Math.abs(p.y - patrolPos.y) < 30)) {
                // Check distance to player >= 80px
                const distToPlayer = Math.sqrt((patrolPos.x - playerStart.x)**2 + (patrolPos.y - playerStart.y)**2);
                if (distToPlayer >= 80 && isPositionReachableFromPlayer(patrolPos.x, patrolPos.y, playerStart, levelData.map)) {
                    finalPositions.push(patrolPos);
                }
            }
            attempts++;
        }

        const newEnemies = finalPositions.map((pos, index) => {
            const angle = Math.random() * Math.PI * 2;
            return {
                id: index + 1,
                x: pos.x,
                y: pos.y,
                hp: stats.hp,
                maxHp: stats.hp,
                state: 'patrol',
                angle: angle,
                patrolDirX: Math.cos(angle),
                patrolDirY: Math.sin(angle),
                attackCooldown: 0,
                isAttacking: false,
                patrolTarget: null,
                damage: stats.damage,
                speed: stats.speed,
                retreatTimer: 0
            };
        });
        
        setEnemies(newEnemies);
        setPet({ x: levelData.playerStart.x - 30, y: levelData.playerStart.y });
        setShards([]);
        setBloodEffects([]);
        setCoins([]);
    };

    const getPatrolTarget = useCallback((map) => {
        const emptyTiles = [];
        map.forEach((row, y) => {
            row.forEach((tile, x) => {
                if (tile === 0) emptyTiles.push({ x: x * 60 + 30, y: y * 60 + 30 });
            });
        });
        return emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    }, []);

    
    const restartGame = useCallback(() => {
        setPlayer({ 
            x: 90, y: 90, hp: 100, maxHp: 100, 
            dmg: 40 + (inventory.includes('dark-sword') ? 50 : inventory.includes('steel-sword') ? 30 : inventory.includes('iron-sword') ? 15 : 0),
            money: money,
            shield: inventory.includes('void-shield') ? 0.6 : inventory.includes('plate-armor') ? 0.4 : inventory.includes('chain-mail') ? 0.25 : inventory.includes('leather-armor') ? 0.1 : 0
        });
        setGameState('menu');
        setShards([]);
        setBloodEffects([]);
        setCoins([]);
        setIsShaking(false);
        setPlayerHpVisible(false);
        setEnemyHpVisible({});
        setEnemies([]);
    }, [inventory, money]);

    const buyItem = useCallback((itemId, price) => {
        const owned = inventory.includes(itemId);
        if (!owned && money >= price) {
            setMoney(m => m - price);
            setPlayer(p => ({ ...p, money: p.money - price }));
            setInventory(prev => [...prev, itemId]);

            // Применяем эффекты только при первой покупке
            setPlayer(p => {
                let newDmg = p.dmg;
                let newShield = p.shield;

                if (itemId === 'iron-sword') newDmg += 15;
                if (itemId === 'steel-sword') newDmg += 30;
                if (itemId === 'dark-sword') newDmg += 50;
                if (itemId === 'excalibur') newDmg += 100;
                if (itemId === 'fire-blade') newDmg += 70;
                if (itemId === 'ice-blade') newDmg += 70;
                if (itemId === 'leather-armor') newShield = 0.1;
                if (itemId === 'chain-mail') newShield = 0.25;
                if (itemId === 'plate-armor') newShield = 0.4;
                if (itemId === 'void-shield') newShield = 0.6;

                return { ...p, dmg: newDmg, shield: newShield };
            });
        }
    }, [money, inventory]);

    // Синхронизация equippedWeapon с player.currentWeapon
    useEffect(() => {
        setPlayer(p => ({ ...p, currentWeapon: equippedWeapon }));
    }, [equippedWeapon]);

    // Кнопки навигации в LevelSelect со звуками
    const LevelSelectWithSound = ({ onBack, onSelectLevel, unlockedLevels }) => {
        const [page, setPage] = useState(0);
        const levelsPerPage = 15;

        const levels = Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            name: i < 20 ? LEVELS_DATA[i]?.name || `Уровень ${i + 1}` : `Уровень ${i + 1}`,
        }));

        const totalPages = Math.ceil(levels.length / levelsPerPage);
        const startIndex = page * levelsPerPage;
        const visibleLevels = levels.slice(startIndex, startIndex + levelsPerPage);

        const goPrev = () => { SFXManager.playClick(); setPage(p => Math.max(0, p - 1)); };
        const goNext = () => { SFXManager.playClick(); setPage(p => Math.min(totalPages - 1, p + 1)); };
        const handleBack = () => { SFXManager.playClick(); onBack(); };
        const handleSelect = (levelId) => { SFXManager.playClick(); onSelectLevel(levelId); };

        return (
            <div className="levels-screen">
                <button className="levels-back-btn" onClick={handleBack}>◀</button>
                <div className="levels-title">ВЫБЕРИТЕ УРОВЕНЬ</div>
                <div className="levels-nav-container">
                    <button className="levels-arrow" onClick={goPrev} disabled={page === 0}>◀</button>
                    <div className="levels-grid">
                        {visibleLevels.map(level => {
                            const unlocked = level.id <= unlockedLevels;
                            return (
                                <div
                                    key={level.id}
                                    className={`level-card ${!unlocked ? 'locked' : ''}`}
                                    onClick={() => unlocked && handleSelect(level.id)}
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
                    <button className="levels-arrow" onClick={goNext} disabled={page === totalPages - 1}>▶</button>
                </div>
                <div className="levels-page-indicator">{page + 1} / {totalPages}</div>
            </div>
        );
    };

    const removeShard = useCallback((shardId) => {
        setShards(prev => prev.filter(s => s.id !== shardId));
    }, []);

    const removeCoin = useCallback((coinId) => {
        setCoins(prev => prev.filter(c => c.id !== coinId));
    }, []);

    // Игровой цикл - основной фикс движения
    useEffect(() => {
        if (gameState !== 'playing') {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
                gameLoopRef.current = null;
            }
            return;
        }

        gameLoopRef.current = setInterval(() => {
            // Проверка смерти
            if (player.hp <= 0) {
                setIsShaking(true);
                SFXManager.playDeath();
                // Add blood particles for player death
                setBloodEffects(b => [...b, { id: Date.now(), x: player.x, y: player.y, isPlayer: true }]);
                setTimeout(() => setGameState('dead'), 800);
                return;
            }

            // Движение игрока
            const s = 4;
            setPlayer(prev => {
                let nx = prev.x, ny = prev.y;
                
                // Клавиатурное управление
                if (keys.current['ArrowUp'] || keys.current['KeyW']) ny -= s;
                if (keys.current['ArrowDown'] || keys.current['KeyS']) ny += s;
                if (keys.current['ArrowLeft'] || keys.current['KeyA']) nx -= s;
                if (keys.current['ArrowRight'] || keys.current['KeyD']) nx += s;
                
                // Мобильное управление (джойстик)
                if (isMobile && (joystickInput.current.x !== 0 || joystickInput.current.y !== 0)) {
                    nx += joystickInput.current.x * s;
                    ny += joystickInput.current.y * s;
                }
                
                const newX = canMoveTo(nx, prev.y, currentMap) ? nx : prev.x;
                const newY = canMoveTo(prev.x, ny, currentMap) ? ny : prev.y;
                
                return { ...prev, x: newX, y: newY };
            });

            // Движение питомца
            setPet(prev => ({
                x: prev.x + (player.x - 40 - prev.x) * 0.05,
                y: prev.y + (player.y - 30 - prev.y) * 0.05
            }));

            // ИИ Врагов
            setEnemies(prevEnemies => {
                return prevEnemies.map(en => {
                    let newEn = { ...en };
                    
                    // Убедимся что angle инициализирован
                    if (typeof newEn.angle !== 'number') {
                        newEn.angle = Math.random() * Math.PI * 2;
                    }
                    
                    if (newEn.attackCooldown > 0) newEn.attackCooldown -= 16;
                    if (newEn.retreatTimer > 0) newEn.retreatTimer -= 16;

                    const dx = player.x - newEn.x;
                    const dy = player.y - newEn.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const canReach = canReachPlayer(newEn.x, newEn.y, player.x, player.y, currentMap);

                    // State machine
                    if (newEn.retreatTimer > 0) {
                        // RETREAT state - enemy was damaged and path blocked, run away fast
                        newEn.state = 'retreat';
                    } else if (dist < 100) {
                        // Can see player
                        if (canReach) {
                            // Can reach player - chase
                            newEn.state = 'chase';
                        } else {
                            // Can see but can't reach - patrol (move away)
                            newEn.state = 'patrol';
                        }
                    } else {
                        // Can't see player - patrol
                        newEn.state = 'patrol';
                    }

                    if (newEn.state === 'retreat') {
                        // Убегаем от игрока с ускорением x2
                        const speed = (newEn.speed || 1.8) * 2;
                        const retreatAngle = Math.atan2(-dy, -dx) + (Math.random() - 0.5) * Math.PI * 0.5;
                        const retreatX = newEn.x + Math.cos(retreatAngle) * speed;
                        const retreatY = newEn.y + Math.sin(retreatAngle) * speed;
                        if (canMoveTo(retreatX, retreatY, currentMap)) {
                            newEn.x = retreatX;
                            newEn.y = retreatY;
                        }
                    } else if (newEn.state === 'chase') {
                        // Атака
                        if (dist < 50 && newEn.attackCooldown <= 0 && !newEn.isAttacking) {
                            newEn.isAttacking = true;
                            
                            setTimeout(() => {
                                setPlayer(p => {
                                    if (p.hp > 0) {
                                        let damage = newEn.damage || 10;
                                        if (p.shield) damage *= (1 - p.shield);
                                        const newHp = Math.max(0, p.hp - damage);
                                        if (newHp <= 0) {
                                            setIsShaking(true);
                                            setTimeout(() => setGameState('dead'), 800);
                                        }
                                        showPlayerHpBar();
                                        return { ...p, hp: newHp };
                                    }
                                    return p;
                                });
                                
                                setEnemies(ens => ens.map(e => 
                                    e.id === newEn.id ? { ...e, isAttacking: false, attackCooldown: 1200 } : e
                                ));
                            }, 350);
                        }
                        
                        // Движение к игроку
                        if (!newEn.isAttacking) {
                            const speed = newEn.speed || 1.8;
                            const vx = (dx / dist) * speed;
                            const vy = (dy / dist) * speed;
                            if (canMoveTo(newEn.x + vx, newEn.y + vy, currentMap)) { 
                                newEn.x += vx; 
                                newEn.y += vy; 
                            } else {
                                // Если путь заблокирован - отходим в случайном направлении
                                const retreatAngle = Math.atan2(-dy, -dx) + (Math.random() - 0.5) * Math.PI;
                                const retreatX = newEn.x + Math.cos(retreatAngle) * speed;
                                const retreatY = newEn.y + Math.sin(retreatAngle) * speed;
                                if (canMoveTo(retreatX, retreatY, currentMap)) {
                                    newEn.x = retreatX;
                                    newEn.y = retreatY;
                                }
                            }
                        }
                    } else {
                        // PATROL - move away from wall
                        newEn.isAttacking = false;
                        
                        // Плавное движение по кругу с проверкой на стены
                        const time = Date.now() / 1000;
                        const radius = 80;
                        const centerX = newEn.id * 200 + 200;
                        const centerY = 200;
                        
                        // Вычисляем целевую позицию
                        const targetX = centerX + Math.cos(time * 0.5 + newEn.id) * radius;
                        const targetY = centerY + Math.sin(time * 0.5 + newEn.id) * radius;
                        
                        // Плавное движение к цели
                        const moveSpeed = (newEn.speed || 1.8) * 0.3;
                        const pdx = targetX - newEn.x;
                        const pdy = targetY - newEn.y;
                        const pdist = Math.sqrt(pdx*pdx + pdy*pdy);
                        
                        if (pdist > 0) {
                            const moveX = newEn.x + (pdx / pdist) * moveSpeed;
                            const moveY = newEn.y + (pdy / pdist) * moveSpeed;
                            
                            // Проверяем можно ли двигаться
                            if (canMoveTo(moveX, moveY, currentMap)) {
                                newEn.x = moveX;
                                newEn.y = moveY;
                            } else {
                                // Если уперлись в стену - меняем направление
                                const angle = Math.random() * Math.PI * 2;
                                const safeX = newEn.x + Math.cos(angle) * moveSpeed;
                                const safeY = newEn.y + Math.sin(angle) * moveSpeed;
                                
                                if (canMoveTo(safeX, safeY, currentMap)) {
                                    newEn.x = safeX;
                                    newEn.y = safeY;
                                }
                            }
                        }
                    }
                    
                    return newEn;
                });
            });

            // Принудительное обновление для гарантии рендеринга врагов
            forceUpdate();

        }, 16);

        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
                gameLoopRef.current = null;
            }
        };
    }, [gameState, player.x, player.y, player.hp, currentMap, showPlayerHpBar, getPatrolTarget]);

    // Keyboard handlers
    useEffect(() => {
        const kd = (e) => { 
            keys.current[e.code] = true; 
            if (e.code === 'Space') handleAttack(); 
        };
        const ku = (e) => keys.current[e.code] = false;
        
        window.addEventListener('keydown', kd);
        window.addEventListener('keyup', ku);
        
        return () => { 
            window.removeEventListener('keydown', kd); 
            window.removeEventListener('keyup', ku); 
        };
    }, [handleAttack]);

    // Инициализация музыки и SFX
    useEffect(() => {
        MusicManager.init();
        SFXManager.init();
    }, []);
    
    // Управление музыкой при смене состояния игры
    useEffect(() => {
        if (gameState === 'playing' && musicEnabled) {
            MusicManager.playDarkAmbient();
        } else {
            MusicManager.stop();
        }
    }, [gameState, musicEnabled]);

    const playerSkinClass = equippedSkin === 'dark' ? 'player-skin-dark' : 'player-skin';

    // Определяем класс питомца
    const getPetClass = () => {
        switch(equippedPet) {
            case 'wolf': return 'wolf';
            case 'raven': return 'raven';
            case 'dragon': return 'dragon';
            default: return ''; // Нет питомца
        }
    };

    const handleOpenShop = () => {
        setGameState('shop');
    };

    const handleStartLevel = (levelId) => {
        // Сбрасываем состояние перед началом уровня
        setShards([]);
        setBloodEffects([]);
        setCoins([]);
        setPlayerHpVisible(false);
        setEnemyHpVisible({});
        setIsShaking(false);
        setIsAttacking(false);
        setCurrentLevel(levelId);
        initLevel(levelId);
        setGameState('playing');
    };

    const handleExitToMenu = () => {
        setGameState('menu');
        if (gameLoopRef.current) {
            clearInterval(gameLoopRef.current);
            gameLoopRef.current = null;
        }
        // Сбрасываем эффекты при выходе в меню
        setShards([]);
        setBloodEffects([]);
        setCoins([]);
    };

    const handleNextLevel = () => {
        const nextLevel = currentLevel + 1;
        if (nextLevel > unlockedLevels) {
            setUnlockedLevels(nextLevel);
        }
        handleStartLevel(nextLevel);
    };

    const handleVictoryToMenu = () => {
        setGameState('menu');
    };

    return (
        <div id="viewport">
            <RotationWarning isVisible={isPortrait && ('ontouchstart' in window || navigator.maxTouchPoints > 0)} />
            
            {gameState === 'menu' && (
                <MainMenu 
                    onPlay={() => setGameState('levels')}
                    onShop={() => setGameState('shop')}
                    onSettings={() => setGameState('settings')}
                />
            )}

            {gameState === 'settings' && (
                <Settings
                    playerName={playerName}
                    setPlayerName={setPlayerName}
                    musicEnabled={musicEnabled}
                    setMusicEnabled={setMusicEnabled}
                    onBack={() => setGameState('menu')}
                />
            )}

            {gameState === 'levels' && (
                <LevelSelectWithSound 
                    onBack={() => setGameState('menu')}
                    onSelectLevel={handleStartLevel}
                    unlockedLevels={unlockedLevels}
                />
            )}

            {gameState === 'shop' && (
                <Shop 
                    money={money}
                    inventory={inventory}
                    equippedPet={equippedPet}
                    equippedWeapon={equippedWeapon}
                    buyItem={buyItem}
                    onClose={() => setGameState('menu')}
                    onEquipPet={setEquippedPet}
                    onEquipWeapon={setEquippedWeapon}
                />
            )}

            {gameState === 'dead' && (
                <DeathScreen 
                    onRestart={restartGame} 
                    isShaking={isShaking}
                />
            )}

            {gameState === 'victory' && (
                <VictoryScreen 
                    onNextLevel={handleNextLevel}
                    onMenu={handleVictoryToMenu}
                    level={currentLevel}
                    coinsEarned={coinsEarned}
                />
            )}

            {gameState === 'playing' && (
                <>
                    <GameWorld
                        player={player}
                        pet={pet}
                        enemies={enemies}
                        playerSkinClass={playerSkinClass}
                        petSkinClass={getPetClass()}
                        equippedPet={equippedPet}
                        equippedWeapon={equippedWeapon}
                        playerName={playerName}
                        isAttacking={isAttacking}
                        playerHpVisible={playerHpVisible}
                        enemyHpVisible={enemyHpVisible}
                        shards={shards}
                        bloodEffects={bloodEffects}
                        coins={coins}
                        removeShard={removeShard}
                        removeCoin={removeCoin}
                        gameState={gameState}
                        onOpenShop={handleOpenShop}
                        onExitToMenu={handleExitToMenu}
                        currentMap={currentMap}
                    />
                    <MobileControls 
                        onMove={handleJoystickMove}
                        onAttack={handleMobileAttack}
                        isVisible={isMobile}
                    />
                </>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Game />);
