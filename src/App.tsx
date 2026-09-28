import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { Toolbar } from './components/Toolbar';
import { StatsHeader } from './components/StatsHeader';
import { EntityInspectorModal } from './components/EntityInspectorModal';
import { ManagementModal } from './components/ManagementModal';
import { NewsTicker } from './components/NewsTicker';
import { sound } from './utils/audio';
import { checkEnclosure, evaluateHabitat } from './utils/enclosure';
import {
  TILE_GRASS,
  TILE_PATH,
  TILE_FENCE,
  TILE_SHOP_HOTDOG,
  TILE_SHOP_ICECREAM,
  TILE_SHOP_DRINKS,
  TILE_SHOP_BALLOON,
  TILE_TREE_PINE,
  TILE_TREE_CHERRY,
  TILE_WATER,
  TILE_ICE,
  TILE_BAMBOO,
  TILE_SAVANNAH,
  TILE_BENCH,
  TILE_TRASH_BIN,
  TILE_FOUNTAIN,
  TILE_RESTROOM,
  TILE_ENTRANCE,
  ToolId,
  Animal,
  Guest,
  Staff,
  Litter,
  FloatingText,
  DailyReport,
  Milestone,
  ANIMAL_CONFIGS,
  AnimalType
} from './types/game';

const COLS = 18;
const ROWS = 13;
const TILE_SIZE = 36;
const SAVE_STORAGE_KEY = 'retro_zoo_save_v1';

// Initial Starter Milestones
const INITIAL_MILESTONES: Milestone[] = [
  { id: 'first_animal', title: '🐾 動物園開張', description: '引進園區的第一隻動物', reward: 100, unlocked: false, icon: '🦁' },
  { id: 'crowd_10', title: '👥 賓客盈門', description: '園內同時擁有超過 12 位遊客', reward: 150, unlocked: false, icon: '🎟️' },
  { id: 'three_species', title: '🌍 生物多樣性', description: '園區同時飼養 3 種以上不同動物', reward: 300, unlocked: false, icon: '🌿' },
  { id: 'six_species', title: '🦁 野生大百科', description: '園區同時飼養 6 種以上不同動物', reward: 600, unlocked: false, icon: '📜' },
  { id: 'happy_zoo', title: '⭐ 五星口碑', description: '園區評價星級達到 4.0 星以上', reward: 400, unlocked: false, icon: '🏆' },
  { id: 'rich_tycoon', title: '💰 樂園大亨', description: '園區資金突破 $5,000 大關', reward: 500, unlocked: false, icon: '💎' },
  { id: 'baby_born', title: '🐣 繁育奇蹟', description: '在細心照料下誕生第一隻動物寶寶', reward: 350, unlocked: false, icon: '🍼' }
];

export default function App() {
  // Grid State
  const [grid, setGrid] = useState<number[][]>(() => {
    const initial = Array.from({ length: ROWS }, () => Array(COLS).fill(TILE_GRASS));
    // Entrance at (0, 6)
    initial[6][0] = TILE_ENTRANCE;
    initial[6][1] = TILE_PATH;
    initial[6][2] = TILE_PATH;
    initial[6][3] = TILE_PATH;
    initial[6][4] = TILE_PATH;
    return initial;
  });

  // Entities
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [visitors, setVisitors] = useState<Guest[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [litters, setLitters] = useState<Litter[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Finances & Management - Starting funds $3,000
  const [money, setMoney] = useState(3000);
  const [ticketPrice, setTicketPrice] = useState(15);
  const [day, setDay] = useState(1);
  const [dayTimer, setDayTimer] = useState(0); // 0 to 800
  const [gameSpeed, setGameSpeed] = useState(1);
  const [weather, setWeather] = useState<'sunny' | 'breeze' | 'rain'>('sunny');
  const [marketingLevel, setMarketingLevel] = useState(0);
  const [marketingDaysLeft, setMarketingDaysLeft] = useState(0);

  // Tools & UI
  const [currentTool, setCurrentTool] = useState<ToolId>('path');
  const [inspectedEntity, setInspectedEntity] = useState<{
    type: 'animal' | 'guest' | 'staff' | 'tile';
    data: unknown;
  } | null>(null);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBgmOn, setIsBgmOn] = useState(false);

  // News and Reports
  const [news, setNews] = useState<string[]>([
    '歡迎來到《懷舊動物王國》！建造圍欄並引進動物，吸引遊客來賺取收入吧！'
  ]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);

  // Tracking Day Cumulative Stats
  const todayStatsRef = useRef({
    ticketIncome: 0,
    shopIncome: 0,
    feedExpenses: 0,
    staffExpenses: 0,
    marketingExpenses: 0
  });

  const addNews = useCallback((text: string) => {
    setNews(prev => [...prev.slice(-30), text]);
  }, []);

  const addFloatingText = useCallback((text: string, x: number, y: number, color = '#ffeb3b') => {
    const id = Math.random().toString(36).substring(2, 9);
    setFloatingTexts(prev => [
      ...prev,
      { id, text, x, y, color, opacity: 1, vy: -0.03, life: 40 }
    ]);
  }, []);

  // Calculate Metrics
  const animalSatisfaction = animals.length > 0
    ? Math.round(animals.reduce((acc, a) => acc + (a.hunger + a.happiness) / 2, 0) / animals.length)
    : 100;

  const cleanliness = Math.max(20, Math.min(100, 100 - litters.length * 6));

  const totalAppeal = animals.reduce((sum, a) => {
    const cfg = ANIMAL_CONFIGS[a.type];
    const conditionMult = (a.hunger / 100) * 0.6 + (a.happiness / 100) * 0.4;
    return sum + (cfg?.appeal || 10) * conditionMult;
  }, 0);

  // Park star rating (1.0 to 5.0)
  const rating = Math.min(
    5.0,
    Math.max(1.0, 1.0 + (totalAppeal / 40) + (cleanliness > 80 ? 0.4 : -0.3))
  );

  // Check Milestones
  const checkMilestones = useCallback((currentMoney: number, animalList: Animal[], guestCount: number, curRating: number) => {
    setMilestones(prev =>
      prev.map(m => {
        if (m.unlocked) return m;
        let isMet = false;

        if (m.id === 'first_animal' && animalList.length >= 1) isMet = true;
        if (m.id === 'crowd_10' && guestCount >= 12) isMet = true;
        if (m.id === 'three_species') {
          const distinctTypes = new Set(animalList.map(a => a.type));
          if (distinctTypes.size >= 3) isMet = true;
        }
        if (m.id === 'six_species') {
          const distinctTypes = new Set(animalList.map(a => a.type));
          if (distinctTypes.size >= 6) isMet = true;
        }
        if (m.id === 'happy_zoo' && curRating >= 4.0) isMet = true;
        if (m.id === 'rich_tycoon' && currentMoney >= 5000) isMet = true;

        if (isMet) {
          sound.milestone();
          setMoney(mon => mon + m.reward);
          addNews(`🎉 達成成就【${m.title}】！獲得特別獎勵金 $${m.reward}！`);
          return { ...m, unlocked: true };
        }
        return m;
      })
    );
  }, [addNews]);

  // Click / Build on cell
  const handleCellClick = (x: number, y: number) => {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
    if (x === 0 && y === 6) {
      sound.error();
      addNews('無法更動大門入口！');
      return;
    }

    const currentTile = grid[y][x];

    // Tool: Demolish
    if (currentTool === 'demolish') {
      // Remove animals on tile
      const hadAnimal = animals.some(a => Math.floor(a.x) === x && Math.floor(a.y) === y);
      if (hadAnimal) {
        setAnimals(prev => prev.filter(a => !(Math.floor(a.x) === x && Math.floor(a.y) === y)));
        addNews('已將該地塊動物野放返鄉。');
      }
      // Remove litter
      setLitters(prev => prev.filter(l => !(l.x === x && l.y === y)));
      // Reset tile to grass
      if (currentTile !== TILE_GRASS) {
        setGrid(prev => {
          const next = prev.map(row => [...row]);
          next[y][x] = TILE_GRASS;
          return next;
        });
        sound.demolish();
      }
      return;
    }

    // Tool: Hiring Staff
    if (currentTool.startsWith('staff_')) {
      const staffType = currentTool.replace('staff_', '') as 'zookeeper' | 'janitor' | 'entertainer';
      const staffCosts = { zookeeper: 150, janitor: 100, entertainer: 120 };
      const cost = staffCosts[staffType];

      if (money < cost) {
        sound.error();
        addNews('資金不足，無法聘請該員工！');
        return;
      }

      setMoney(m => m - cost);
      const names = {
        zookeeper: ['大衛', '志明', '小林', '約翰'][Math.floor(Math.random() * 4)],
        janitor: ['老張', '福伯', '陳叔', '阿榮'][Math.floor(Math.random() * 4)],
        entertainer: ['波波', '皮皮', '樂樂', '小丑傑克'][Math.floor(Math.random() * 4)]
      };

      const newStaff: Staff = {
        id: Math.random().toString(36).substring(2, 9),
        type: staffType,
        name: names[staffType],
        x,
        y,
        destX: x,
        destY: y,
        salary: staffType === 'zookeeper' ? 10 : staffType === 'janitor' ? 8 : 9,
        actionTimer: 0
      };

      setStaff(prev => [...prev, newStaff]);
      sound.coin();
      addFloatingText(`-${cost}`, x, y, '#e53935');
      addNews(`成功聘請員工：${newStaff.name}！將在園區展開巡邏工作。`);
      return;
    }

    // Tool: Introducing Animals
    if (currentTool.startsWith('animal_')) {
      const animalType = currentTool as AnimalType;
      const cfg = ANIMAL_CONFIGS[animalType];
      if (!cfg) return;

      // Validate Enclosure
      const enc = checkEnclosure(grid, COLS, ROWS, x, y);
      if (!enc.isEnclosed) {
        sound.error();
        addNews('❌ 無法安置動物！必須先用【木質圍欄】完整圍起一圈封閉區域！');
        return;
      }

      if (money < cfg.cost) {
        sound.error();
        addNews('資金不足以引進此動物！');
        return;
      }

      setMoney(m => m - cfg.cost);
      sound.coin();

      // Play species specific audio
      if (cfg.soundType === 'roar') sound.animalRoar();
      else if (cfg.soundType === 'trumpet') sound.animalTrumpet();
      else if (cfg.soundType === 'howl') sound.animalHowl();
      else if (cfg.soundType === 'bird') sound.animalBird();
      else if (cfg.soundType === 'splash') sound.animalSplash();
      else sound.animalSqueak();

      const names = ['球球', '皮皮', '奇奇', '霸天', '毛毛', '豆豆', '點點', '嘟嘟', '小乖', '大金', '可可', '奔奔'];
      const chosenName = names[Math.floor(Math.random() * names.length)];

      const hab = evaluateHabitat(animalType, enc);

      const newAnimal: Animal = {
        id: Math.random().toString(36).substring(2, 9),
        type: animalType,
        name: chosenName,
        x: x + 0.5,
        y: y + 0.5,
        hunger: 90,
        happiness: hab.score,
        energy: 100,
        ageDays: 1,
        gender: Math.random() < 0.5 ? '♂' : '♀',
        isSleeping: false,
        moveCooldown: 30,
        dir: 1,
        emote: { text: `${cfg.diet.icon} 報到!`, timer: 45 },
        habitatSuitability: hab.score
      };

      setAnimals(prev => {
        const nextList = [...prev, newAnimal];
        checkMilestones(money - cfg.cost, nextList, visitors.length, rating);
        return nextList;
      });

      addFloatingText(`-${cfg.cost}`, x, y, '#e53935');
      if (!hab.isSufficient) {
        addNews(`🎊 引進新成員：${cfg.name}「${chosenName}」！⚠️ 提示：${hab.feedback}。`);
      } else {
        addNews(`🎊 引進新成員：${cfg.name}「${chosenName}」！生境契合度達 ${hab.score}%，狀態絕佳！`);
      }
      return;
    }

    // Tool: Tile Construction (Paths, Fences, Biomes, Shops, Decorations)
    const toolCosts: Partial<Record<ToolId, number>> = {
      path: 10,
      fence: 25,
      bench: 35,
      trash_bin: 15,
      fountain: 120,
      restroom: 90,
      water: 30,
      ice: 40,
      savannah: 25,
      bamboo: 35,
      tree_pine: 20,
      tree_cherry: 30,
      shop_hotdog: 80,
      shop_icecream: 75,
      shop_drinks: 65,
      shop_balloon: 70
    };

    const cost = toolCosts[currentTool];
    if (cost === undefined) return;

    if (money < cost) {
      sound.error();
      addNews('園區資金不足！');
      return;
    }

    // Map tool to TileType
    const toolToTile: Partial<Record<ToolId, number>> = {
      path: TILE_PATH,
      fence: TILE_FENCE,
      bench: TILE_BENCH,
      trash_bin: TILE_TRASH_BIN,
      fountain: TILE_FOUNTAIN,
      restroom: TILE_RESTROOM,
      water: TILE_WATER,
      ice: TILE_ICE,
      savannah: TILE_SAVANNAH,
      bamboo: TILE_BAMBOO,
      tree_pine: TILE_TREE_PINE,
      tree_cherry: TILE_TREE_CHERRY,
      shop_hotdog: TILE_SHOP_HOTDOG,
      shop_icecream: TILE_SHOP_ICECREAM,
      shop_drinks: TILE_SHOP_DRINKS,
      shop_balloon: TILE_SHOP_BALLOON
    };

    const targetTile = toolToTile[currentTool];
    if (targetTile === undefined) return;

    if (currentTile !== targetTile) {
      setMoney(m => m - cost);
      sound.build();
      addFloatingText(`-${cost}`, x, y, '#e53935');

      setGrid(prev => {
        const next = prev.map(row => [...row]);
        next[y][x] = targetTile;
        return next;
      });

      if (currentTool.startsWith('shop_')) {
        addNews('商店熱鬧開張！路過的遊客會購買餐點飲料，大幅增加收益！');
      }
    }
  };

  // Bulk Feed All Animals
  const handleFeedAll = () => {
    if (animals.length === 0) return;
    const feedCost = animals.length * 8;
    if (money < feedCost) {
      sound.error();
      addNews('資金不足以全員餵食！');
      return;
    }

    setMoney(m => m - feedCost);
    todayStatsRef.current.feedExpenses += feedCost;
    sound.feed();

    setAnimals(prev =>
      prev.map(a => ({
        ...a,
        hunger: 100,
        happiness: Math.min(100, a.happiness + 20),
        emote: { text: '😋 好飽!', timer: 45 }
      }))
    );

    addNews(`飼養員全員餵食完畢！所有動物獲得充足營養，精力充沛！`);
  };

  // Feed Single Animal with basic treat
  const handleFeedSingleAnimal = (animalId: string) => {
    if (money < 6) {
      sound.error();
      addNews('資金不足以購買綜合零食！');
      return;
    }

    setMoney(m => m - 6);
    sound.feed();

    setAnimals(prev =>
      prev.map(a => {
        if (a.id === animalId) {
          addFloatingText('+💖 心情', Math.floor(a.x), Math.floor(a.y), '#e91e63');
          return {
            ...a,
            hunger: 100,
            happiness: Math.min(100, a.happiness + 20),
            emote: { text: '😋 綜合零食!', timer: 45 }
          };
        }
        return a;
      })
    );

    addNews('為動物投餵了普通綜合零食，飢餓度已恢復！');
  };

  // Feed Preferred Specific Diet
  const handleFeedPreferredDiet = (animalId: string) => {
    const animal = animals.find(a => a.id === animalId);
    if (!animal) return;
    const cfg = ANIMAL_CONFIGS[animal.type];
    const cost = cfg.diet.cost;

    if (money < cost) {
      sound.error();
      addNews(`資金不足以購買【${cfg.diet.name}】($${cost})！`);
      return;
    }

    setMoney(m => m - cost);
    sound.feed();
    addFloatingText(`+💖 最愛${cfg.diet.icon}`, Math.floor(animal.x), Math.floor(animal.y), '#e91e63');

    setAnimals(prev =>
      prev.map(a => {
        if (a.id === animalId) {
          return {
            ...a,
            hunger: 100,
            happiness: Math.min(100, a.happiness + 45),
            energy: 100,
            emote: { text: `${cfg.diet.icon} 幸福大餐!`, timer: 60 }
          };
        }
        return a;
      })
    );

    addNews(`投餵了${cfg.name}最喜愛的【${cfg.diet.name}】！動物滿足度達至巔峰！`);
  };

  // Trigger Interactive Behavior
  const handleTriggerSpecialBehavior = (animalId: string) => {
    const animal = animals.find(a => a.id === animalId);
    if (!animal) return;
    const cfg = ANIMAL_CONFIGS[animal.type];

    // Play animal specific sound
    if (cfg.soundType === 'roar') sound.animalRoar();
    else if (cfg.soundType === 'trumpet') sound.animalTrumpet();
    else if (cfg.soundType === 'howl') sound.animalHowl();
    else if (cfg.soundType === 'bird') sound.animalBird();
    else if (cfg.soundType === 'splash') sound.animalSplash();
    else sound.animalSqueak();

    addFloatingText(`⭐ ${cfg.specialAction.name}`, Math.floor(animal.x), Math.floor(animal.y), '#ffd700');

    setAnimals(prev =>
      prev.map(a => {
        if (a.id === animalId) {
          return {
            ...a,
            happiness: Math.min(100, a.happiness + 20),
            emote: { text: `${cfg.specialAction.icon} ${cfg.specialAction.name}!`, timer: 65 }
          };
        }
        return a;
      })
    );

    // Nearby visitors are amazed and toss tips!
    let totalTips = 0;
    setVisitors(prev =>
      prev.map(v => {
        if (Math.hypot(v.x - animal.x, v.y - animal.y) < 4.5) {
          const tip = v.cash >= 10 ? 10 : v.cash >= 5 ? 5 : 0;
          totalTips += tip;
          return {
            ...v,
            cash: v.cash - tip,
            happiness: Math.min(100, v.happiness + 30),
            thoughts: `哇！${cfg.name}展示了【${cfg.specialAction.name}】，太震撼精彩了！`
          };
        }
        return v;
      })
    );

    if (totalTips > 0) {
      setMoney(m => m + totalTips);
      sound.coin();
      todayStatsRef.current.ticketIncome += totalTips;
      addFloatingText(`+$${totalTips} 遊客讚賞`, Math.floor(animal.x), Math.floor(animal.y) - 1, '#66bb6a');
      addNews(`${cfg.name}展現了【${cfg.specialAction.name}】！圍觀遊客爆發熱烈掌聲並投下讚賞金 $${totalTips}！`);
    } else {
      addNews(`${cfg.name}展現了【${cfg.specialAction.name}】！現場歡聲雷動！`);
    }
  };

  // Release animal back into wild
  const handleReleaseAnimal = (animalId: string) => {
    setAnimals(prev => prev.filter(a => a.id !== animalId));
    setInspectedEntity(null);
    sound.coin();
    setMoney(m => m + 40);
    addNews('已為動物辦理野放手續，獲得愛心保育補助 $40。');
  };

  // Fire staff
  const handleFireStaff = (staffId: string) => {
    setStaff(prev => prev.filter(s => s.id !== staffId));
    setInspectedEntity(null);
    sound.demolish();
    addNews('已解雇該名員工。');
  };

  // Launch Marketing
  const handleLaunchMarketing = (level: number, cost: number) => {
    if (money < cost) {
      sound.error();
      addNews('資金不足以發動此行銷活動！');
      return;
    }

    setMoney(m => m - cost);
    todayStatsRef.current.marketingExpenses += cost;
    sound.coin();
    setMarketingLevel(level);
    setMarketingDaysLeft(level === 1 ? 2 : level === 2 ? 3 : 4);
    addNews('行銷宣傳正式展開！大批遊客正蜂擁前往動物園！');
  };

  // Save / Load / Reset Presets
  const handleSaveGame = () => {
    const saveData = {
      grid,
      animals,
      money,
      day,
      ticketPrice,
      milestones,
      staff
    };
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveData));
      sound.coin();
      addNews('💾 遊戲已成功儲存至瀏覽器！');
    } catch {
      sound.error();
    }
  };

  const handleLoadGame = () => {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) {
        sound.error();
        addNews('尚未找到已儲存的存檔！');
        return;
      }
      const data = JSON.parse(raw);
      if (data.grid) setGrid(data.grid);
      if (data.animals) setAnimals(data.animals);
      if (data.money) setMoney(data.money);
      if (data.day) setDay(data.day);
      if (data.ticketPrice) setTicketPrice(data.ticketPrice);
      if (data.milestones) setMilestones(data.milestones);
      if (data.staff) setStaff(data.staff);
      sound.coin();
      addNews('📂 存檔讀取成功！歡迎回到園區！');
      setIsManagementOpen(false);
    } catch {
      sound.error();
      addNews('存檔檔案解析錯誤！');
    }
  };

  const handleExportJson = () => {
    const saveData = { grid, animals, money, day, ticketPrice, milestones, staff };
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retro_zoo_day_${day}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sound.coin();
  };

  const handleImportJson = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.grid) setGrid(data.grid);
      if (data.animals) setAnimals(data.animals);
      if (data.money) setMoney(data.money);
      if (data.day) setDay(data.day);
      if (data.ticketPrice) setTicketPrice(data.ticketPrice);
      sound.coin();
      addNews('已匯入外部存檔檔案！');
      setIsManagementOpen(false);
    } catch {
      sound.error();
      addNews('匯入失敗：JSON 格式無效！');
    }
  };

  const handleResetZoo = (preset: 'blank' | 'starter' | 'safari') => {
    const freshGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(TILE_GRASS));
    freshGrid[6][0] = TILE_ENTRANCE;
    freshGrid[6][1] = TILE_PATH;
    freshGrid[6][2] = TILE_PATH;
    freshGrid[6][3] = TILE_PATH;
    freshGrid[6][4] = TILE_PATH;

    setVisitors([]);
    setLitters([]);
    setFloatingTexts([]);

    if (preset === 'blank') {
      setGrid(freshGrid);
      setAnimals([]);
      setStaff([]);
      setMoney(3000);
      setDay(1);
    } else if (preset === 'starter') {
      // Build Penguin pool enclosure and Lion pen
      // Penguin pen at top
      for (let x = 3; x <= 8; x++) {
        freshGrid[1][x] = TILE_FENCE;
        freshGrid[4][x] = TILE_FENCE;
      }
      for (let y = 1; y <= 4; y++) {
        freshGrid[y][3] = TILE_FENCE;
        freshGrid[y][8] = TILE_FENCE;
      }
      freshGrid[2][5] = TILE_WATER;
      freshGrid[3][5] = TILE_WATER;
      freshGrid[2][6] = TILE_ICE;
      freshGrid[3][6] = TILE_ICE;

      // Path around it
      freshGrid[5][3] = TILE_PATH;
      freshGrid[5][4] = TILE_PATH;
      freshGrid[5][5] = TILE_PATH;
      freshGrid[5][6] = TILE_PATH;
      freshGrid[5][7] = TILE_PATH;
      freshGrid[5][8] = TILE_PATH;
      freshGrid[5][9] = TILE_PATH;
      freshGrid[6][9] = TILE_PATH;
      freshGrid[7][9] = TILE_PATH;
      freshGrid[8][9] = TILE_PATH;

      // Hot dog and bench
      freshGrid[6][5] = TILE_SHOP_HOTDOG;
      freshGrid[7][4] = TILE_BENCH;
      freshGrid[7][5] = TILE_PATH;
      freshGrid[7][6] = TILE_TRASH_BIN;

      setGrid(freshGrid);
      setAnimals([
        {
          id: 'starter_p1',
          type: 'animal_penguin',
          name: '波波',
          x: 4.5,
          y: 2.5,
          hunger: 90,
          happiness: 95,
          energy: 100,
          ageDays: 1,
          gender: '♂',
          isSleeping: false,
          moveCooldown: 30,
          dir: 1
        },
        {
          id: 'starter_p2',
          type: 'animal_penguin',
          name: '小圓',
          x: 6.5,
          y: 3.5,
          hunger: 85,
          happiness: 90,
          energy: 100,
          ageDays: 1,
          gender: '♀',
          isSleeping: false,
          moveCooldown: 40,
          dir: 1
        }
      ]);
      setMoney(3000);
      setDay(1);
    } else if (preset === 'safari') {
      // Safari pen at bottom
      for (let x = 6; x <= 14; x++) {
        freshGrid[7][x] = TILE_FENCE;
        freshGrid[11][x] = TILE_FENCE;
      }
      for (let y = 7; y <= 11; y++) {
        freshGrid[y][6] = TILE_FENCE;
        freshGrid[y][14] = TILE_FENCE;
      }
      for (let x = 7; x <= 13; x++) {
        for (let y = 8; y <= 10; y++) {
          freshGrid[y][x] = TILE_SAVANNAH;
        }
      }
      freshGrid[9][10] = TILE_WATER;
      freshGrid[8][8] = TILE_TREE_PINE;

      // Connecting paths
      for (let x = 1; x <= 6; x++) freshGrid[6][x] = TILE_PATH;
      freshGrid[5][6] = TILE_PATH;
      freshGrid[6][6] = TILE_PATH;
      for (let x = 6; x <= 15; x++) freshGrid[6][x] = TILE_PATH;
      freshGrid[6][15] = TILE_SHOP_HOTDOG;
      freshGrid[5][10] = TILE_FOUNTAIN;

      setGrid(freshGrid);
      setAnimals([
        {
          id: 'safari_lion',
          type: 'animal_lion',
          name: '辛巴',
          x: 9.5,
          y: 9.5,
          hunger: 95,
          happiness: 90,
          energy: 100,
          ageDays: 2,
          gender: '♂',
          isSleeping: false,
          moveCooldown: 30,
          dir: 1
        }
      ]);
      setMoney(3000);
      setDay(1);
    }

    sound.coin();
    setIsManagementOpen(false);
    addNews('已重置為選定園區範本！');
  };

  // Adjust ticket price
  const handleAdjustTicket = (delta: number) => {
    setTicketPrice(prev => {
      const next = Math.max(5, Math.min(60, prev + delta));
      sound.coin();
      return next;
    });
  };

  // Audio toggles
  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleBgm = () => {
    const on = sound.toggleBgm();
    setIsBgmOn(on);
  };

  // Spawn Visitor Algorithm
  const spawnVisitor = useCallback(() => {
    if (visitors.length >= 45) return;

    // Price elasticity: fair price is based on total appeal
    const maxAcceptable = Math.max(12, totalAppeal * 0.75 + (cleanliness > 80 ? 5 : 0));
    if (ticketPrice > maxAcceptable + 15) {
      // Price way too high, high chance of rejection
      if (Math.random() < 0.85) return;
    }

    const marketingMultiplier = marketingLevel === 1 ? 1.3 : marketingLevel === 2 ? 1.7 : marketingLevel === 3 ? 2.2 : 1.0;
    const spawnChance = Math.min(0.85, ((totalAppeal + 10) / 100) * marketingMultiplier);

    if (Math.random() < spawnChance) {
      sound.coin();
      setMoney(m => m + ticketPrice);
      todayStatsRef.current.ticketIncome += ticketPrice;
      addFloatingText(`+$${ticketPrice}`, 0, 6, '#4caf50');

      const guestNames = ['小明', '阿花', '美美', '志豪', '雅婷', '冠宇', '家豪', '淑芬', '大衛', '艾蜜莉', '肯尼', '露西'];
      const shirtColors = ['#e74c3c', '#3498db', '#e67e22', '#9b59b6', '#1abc9c', '#f1c40f', '#34495e'];
      const hairColors = ['#2c3e50', '#8d5524', '#f39c12', '#c0392b', '#111111'];
      const animalTypes = Object.keys(ANIMAL_CONFIGS) as AnimalType[];

      const newGuest: Guest = {
        id: Math.random().toString(36).substring(2, 9),
        name: guestNames[Math.floor(Math.random() * guestNames.length)],
        x: 0,
        y: 6,
        destX: 0,
        destY: 6,
        color: shirtColors[Math.floor(Math.random() * shirtColors.length)],
        hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
        happiness: 85,
        cash: 50 + Math.floor(Math.random() * 80),
        initialCash: 100,
        hunger: 80,
        thirst: 80,
        energy: 100,
        favoriteAnimal: animalTypes[Math.floor(Math.random() * animalTypes.length)],
        thoughts: '剛抵達動物園，好期待看到可愛的動物！',
        stayTime: 450 + Math.floor(Math.random() * 550)
      };

      setVisitors(prev => {
        const nextList = [...prev, newGuest];
        checkMilestones(money + ticketPrice, animals, nextList.length, rating);
        return nextList;
      });
    }
  }, [visitors.length, totalAppeal, cleanliness, ticketPrice, marketingLevel, addFloatingText, checkMilestones, money, animals, rating]);

  // Main Simulation Tick Loop
  useEffect(() => {
    if (gameSpeed === 0) return; // Paused

    const intervalMs = Math.max(16, Math.floor(100 / gameSpeed));

    const simTimer = setInterval(() => {
      // 1. Advance Day Timer
      setDayTimer(prevTimer => {
        const next = prevTimer + 1;
        if (next >= 800) {
          // End of Day!
          setDay(d => d + 1);

          // Weather change chance
          const weathers: ('sunny' | 'breeze' | 'rain')[] = ['sunny', 'sunny', 'breeze', 'rain'];
          setWeather(weathers[Math.floor(Math.random() * weathers.length)]);

          // Decrement marketing
          if (marketingDaysLeft > 0) {
            setMarketingDaysLeft(m => {
              if (m - 1 <= 0) setMarketingLevel(0);
              return m - 1;
            });
          }

          // Calculate daily report
          const curToday = todayStatsRef.current;
          const animalUpkeep = animals.reduce((sum, a) => sum + (ANIMAL_CONFIGS[a.type]?.dailyFoodCost || 10), 0);
          const staffWages = staff.reduce((sum, s) => sum + s.salary, 0);

          const net = curToday.ticketIncome + curToday.shopIncome - animalUpkeep - staffWages - curToday.marketingExpenses;

          setMoney(m => m - animalUpkeep - staffWages);

          const report: DailyReport = {
            day,
            ticketIncome: curToday.ticketIncome,
            shopIncome: curToday.shopIncome,
            feedExpenses: animalUpkeep,
            staffExpenses: staffWages,
            marketingExpenses: curToday.marketingExpenses,
            netProfit: net,
            visitorsToday: visitors.length,
            starRating: rating
          };

          setDailyReports(rep => [...rep, report]);

          // Reset today's accumulator
          todayStatsRef.current = {
            ticketIncome: 0,
            shopIncome: 0,
            feedExpenses: 0,
            staffExpenses: 0,
            marketingExpenses: 0
          };

          // Animal hunger decrement & baby breeding check
          setAnimals(prev => {
            const updated = prev.map(a => {
              const newHunger = Math.max(0, a.hunger - 18);
              const isSleepy = true;
              return {
                ...a,
                hunger: newHunger,
                ageDays: a.ageDays + 1,
                happiness: newHunger < 30 ? Math.max(10, a.happiness - 20) : a.happiness,
                isSleeping: isSleepy
              };
            });

            // Breeding chance if 2+ happy animals
            const counts: Record<string, number> = {};
            updated.forEach(a => counts[a.type] = (counts[a.type] || 0) + 1);
            Object.entries(counts).forEach(([type, count]) => {
              if (count >= 2 && Math.random() < 0.25) {
                const parent = updated.find(a => a.type === type && a.happiness > 80);
                if (parent) {
                  const baby: Animal = {
                    id: Math.random().toString(36).substring(2, 9),
                    type: type as AnimalType,
                    name: `小${parent.name}`,
                    x: parent.x,
                    y: parent.y,
                    hunger: 95,
                    happiness: 100,
                    energy: 100,
                    ageDays: 1,
                    gender: Math.random() < 0.5 ? '♂' : '♀',
                    isSleeping: false,
                    moveCooldown: 30,
                    dir: 1,
                    emote: { text: '🍼 誕生!', timer: 60 }
                  };
                  updated.push(baby);
                  sound.milestone();
                  addNews(`🎉 恭喜！園區誕生了一隻活潑的【${ANIMAL_CONFIGS[baby.type]?.name}】小寶寶！`);
                  setMilestones(mList =>
                    mList.map(m => m.id === 'baby_born' && !m.unlocked ? { ...m, unlocked: true } : m)
                  );
                }
              }
            });

            return updated;
          });

          addNews(`第 ${day + 1} 天早晨到來！昨日營業淨利潤：${net >= 0 ? `+$${net}` : `-$${Math.abs(net)}`}。`);
          return 0;
        }

        // Midday wake up animals
        if (next === 150) {
          setAnimals(prev => prev.map(a => ({ ...a, isSleeping: false })));
        }

        return next;
      });

      // 2. Spawn visitors periodically
      if (Math.random() < 0.08) {
        spawnVisitor();
      }

      // 3. Update Visitors AI
      setVisitors(prevVisitors => {
        const nextList: Guest[] = [];

        for (const v of prevVisitors) {
          v.stayTime--;
          v.hunger = Math.max(0, v.hunger - 0.05);
          v.thirst = Math.max(0, v.thirst - 0.06);

          const cx = Math.floor(v.x);
          const cy = Math.floor(v.y);

          // Reached destination tile?
          if (Math.abs(v.x - v.destX) < 0.06 && Math.abs(v.y - v.destY) < 0.06) {
            v.x = v.destX;
            v.y = v.destY;

            // If time is up and at entrance: guest leaves
            if (v.stayTime <= 0 && v.destX === 0 && v.destY === 6) {
              continue; // remove guest
            }

            // Find valid adjacent walkway paths
            const candidates: [number, number][] = [];
            const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

            dirs.forEach(([dx, dy]) => {
              const nx = v.destX + dx;
              const ny = v.destY + dy;
              if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
                const t = grid[ny][nx];
                if (t === TILE_PATH || t === TILE_ENTRANCE) {
                  candidates.push([nx, ny]);
                }

                // Check Adjacent Shops
                if (v.cash >= 8 && Math.random() < 0.04) {
                  if (t === TILE_SHOP_HOTDOG && v.hunger < 70) {
                    v.cash -= 8;
                    v.hunger = 100;
                    v.holdingFood = '🌭';
                    v.thoughts = '這家熱狗真香真脆，太好吃了！';
                    setMoney(m => m + 8);
                    todayStatsRef.current.shopIncome += 8;
                    sound.coin();
                    addFloatingText('+$8 🌭', nx, ny, '#ff9800');
                  } else if (t === TILE_SHOP_ICECREAM && v.hunger < 70) {
                    v.cash -= 6;
                    v.hunger = 95;
                    v.holdingFood = '🍦';
                    v.thoughts = '好甜爽口的冰淇淋！';
                    setMoney(m => m + 6);
                    todayStatsRef.current.shopIncome += 6;
                    sound.coin();
                    addFloatingText('+$6 🍦', nx, ny, '#03a9f4');
                  } else if (t === TILE_SHOP_DRINKS && v.thirst < 70) {
                    v.cash -= 5;
                    v.thirst = 100;
                    v.holdingFood = '🥤';
                    v.thoughts = '冰涼汽水超解渴！';
                    setMoney(m => m + 5);
                    todayStatsRef.current.shopIncome += 5;
                    sound.coin();
                    addFloatingText('+$5 🥤', nx, ny, '#4caf50');
                  } else if (t === TILE_SHOP_BALLOON && !v.balloonColor && v.cash >= 7) {
                    v.cash -= 7;
                    v.balloonColor = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#ffeb3b'][Math.floor(Math.random() * 5)];
                    v.thoughts = '拿到氣球好開心！';
                    setMoney(m => m + 7);
                    todayStatsRef.current.shopIncome += 7;
                    sound.coin();
                    addFloatingText('+$7 🎈', nx, ny, '#ab47bc');
                  }
                }

                // Check Adjacent Bench
                if (t === TILE_BENCH && v.energy < 60 && Math.random() < 0.05) {
                  v.energy = 100;
                  v.thoughts = '在長椅上小憩片刻，體力滿滿！';
                }
              }
            });

            // Check if looking at an animal across fence
            animals.forEach(a => {
              if (Math.hypot(a.x - v.x, a.y - v.y) < 2.5) {
                v.happiness = Math.min(100, v.happiness + 0.1);
                if (Math.random() < 0.015) {
                  v.thoughts = `正在看${ANIMAL_CONFIGS[a.type]?.name}，好可愛！`;
                  // Small donation tip
                  if (v.cash >= 5 && Math.random() < 0.2) {
                    v.cash -= 5;
                    setMoney(m => m + 5);
                    todayStatsRef.current.ticketIncome += 5;
                    sound.coin();
                    addFloatingText('+$5 讚許', cx, cy, '#ffeb3b');
                  }
                }
              }
            });

            // Litter chance if trash bins aren't near
            if (Math.random() < 0.003 && litters.length < 25) {
              setLitters(l => [...l, { id: Math.random().toString(), x: cx, y: cy }]);
            }

            // Head towards exit when stay time ends
            if (v.stayTime <= 0) {
              candidates.sort((a, b) => Math.hypot(a[0] - 0, a[1] - 6) - Math.hypot(b[0] - 0, b[1] - 6));
            }

            if (candidates.length > 0) {
              const nextTile = candidates[Math.floor(Math.random() * candidates.length)];
              v.destX = nextTile[0];
              v.destY = nextTile[1];
            }
          } else {
            // Smoothly move towards destination
            const dx = v.destX - v.x;
            const dy = v.destY - v.y;
            const speed = 0.05;
            v.x += Math.sign(dx) * Math.min(Math.abs(dx), speed);
            v.y += Math.sign(dy) * Math.min(Math.abs(dy), speed);
          }

          nextList.push(v);
        }

        return nextList;
      });

      // 4. Update Staff AI
      setStaff(prevStaff =>
        prevStaff.map(s => {
          s.actionTimer++;

          // Move along paths
          if (Math.abs(s.x - s.destX) < 0.05 && Math.abs(s.y - s.destY) < 0.05) {
            s.x = s.destX;
            s.y = s.destY;

            // Look for work
            if (s.type === 'zookeeper') {
              // Feed nearby hungry animal
              animals.forEach(a => {
                if (a.hunger < 50 && Math.hypot(a.x - s.x, a.y - s.y) < 3) {
                  a.hunger = 95;
                  a.emote = { text: '🍖 感謝餵食', timer: 30 };
                  addFloatingText('🧑‍🌾 巡邏餵食', Math.floor(s.x), Math.floor(s.y), '#8bc34a');
                }
              });
            } else if (s.type === 'janitor') {
              // Clean litter nearby
              setLitters(prevLitters =>
                prevLitters.filter(l => {
                  if (Math.hypot(l.x - s.x, l.y - s.y) < 1.5) {
                    addFloatingText('🧹 已清理', l.x, l.y, '#00bcd4');
                    return false;
                  }
                  return true;
                })
              );
            }

            // Find adjacent path to patrol
            const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            const candidates: [number, number][] = [];
            dirs.forEach(([dx, dy]) => {
              const nx = s.destX + dx;
              const ny = s.destY + dy;
              if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
                if (grid[ny][nx] === TILE_PATH || grid[ny][nx] === TILE_ENTRANCE) {
                  candidates.push([nx, ny]);
                }
              }
            });

            if (candidates.length > 0) {
              const nextTile = candidates[Math.floor(Math.random() * candidates.length)];
              s.destX = nextTile[0];
              s.destY = nextTile[1];
            }
          } else {
            const dx = s.destX - s.x;
            const dy = s.destY - s.y;
            s.x += Math.sign(dx) * Math.min(Math.abs(dx), 0.04);
            s.y += Math.sign(dy) * Math.min(Math.abs(dy), 0.04);
          }

          return s;
        })
      );

      // 5. Update Animals AI
      setAnimals(prevAnimals =>
        prevAnimals.map(a => {
          if (a.emote && a.emote.timer > 0) {
            a.emote.timer--;
          }

          if (a.isSleeping) return a;

          a.moveCooldown--;
          if (a.moveCooldown <= 0) {
            a.moveCooldown = 50 + Math.floor(Math.random() * 70);
            const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
            const nx = Math.floor(a.x) + dx;
            const ny = Math.floor(a.y) + dy;

            // Animals can only walk on grass, savannah, ice, bamboo or water
            if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
              const t = grid[ny][nx];
              if (
                t === TILE_GRASS ||
                t === TILE_SAVANNAH ||
                t === TILE_ICE ||
                t === TILE_BAMBOO ||
                t === TILE_WATER
              ) {
                a.x = nx + 0.5;
                a.y = ny + 0.5;
                a.dir = dx >= 0 ? 1 : -1;
              }
            }
          }
          return a;
        })
      );

      // 6. Update Floating Text Popups
      setFloatingTexts(prev =>
        prev
          .map(ft => ({
            ...ft,
            y: ft.y + ft.vy,
            opacity: ft.opacity - 0.025,
            life: ft.life - 1
          }))
          .filter(ft => ft.life > 0 && ft.opacity > 0)
      );

    }, intervalMs);

    return () => clearInterval(simTimer);
  }, [
    gameSpeed,
    day,
    animals,
    staff,
    grid,
    marketingDaysLeft,
    rating,
    spawnVisitor,
    addNews,
    addFloatingText,
    litters.length
  ]);

  return (
    <div className="min-h-screen bg-[#1f1e25] flex flex-col items-center justify-start p-2 sm:p-4 text-[#2a241b]">
      {/* Outer Retro Window Container */}
      <div className="retro-window-box w-full max-w-[1020px] flex flex-col gap-2 p-2 sm:p-3 relative">
        {/* Top Header with Status & Navigation */}
        <StatsHeader
          money={money}
          guestCount={visitors.length}
          rating={rating}
          ticketPrice={ticketPrice}
          animalSatisfaction={animalSatisfaction}
          cleanliness={cleanliness}
          day={day}
          dayTimeRatio={dayTimer / 800}
          gameSpeed={gameSpeed}
          isMuted={isMuted}
          isBgmOn={isBgmOn}
          weather={weather}
          onAdjustTicket={handleAdjustTicket}
          onSetGameSpeed={setGameSpeed}
          onToggleMute={handleToggleMute}
          onToggleBgm={handleToggleBgm}
          onOpenManagement={() => setIsManagementOpen(true)}
        />

        {/* Main Stage Layout (Canvas + Sidebar Controls) */}
        <div className="flex flex-col lg:flex-row gap-3 items-start justify-center">
          {/* Game Canvas Container */}
          <div className="flex-1 flex flex-col items-center overflow-x-auto w-full">
            <GameCanvas
              grid={grid}
              cols={COLS}
              rows={ROWS}
              tileSize={TILE_SIZE}
              animals={animals}
              visitors={visitors}
              staff={staff}
              litters={litters}
              floatingTexts={floatingTexts}
              currentTool={currentTool}
              dayTimeRatio={dayTimer / 800}
              weather={weather}
              onCellClick={handleCellClick}
              onSelectEntity={setInspectedEntity}
            />

            {/* Quick Helper Tip Bar */}
            <div className="w-full flex items-center justify-between text-[11px] font-retro bg-[#2b251b] text-[#f7f2e4] px-2.5 py-1 mt-1.5 border border-[#4a4030]">
              <span className="truncate">
                💡 提示：使用「木質圍欄」圍出一塊完整封閉圈，即可引進動物！拖曳滑鼠可連續鋪路與圍欄。
              </span>
              <span className="font-pixel text-[10px] text-amber-400 shrink-0 ml-2">
                18 x 13 網格
              </span>
            </div>
          </div>

          {/* Construction & Operation Sidebar */}
          <Toolbar
            currentTool={currentTool}
            money={money}
            onSelectTool={setCurrentTool}
            onFeedAll={handleFeedAll}
            animalCount={animals.length}
          />
        </div>

        {/* News Ticker */}
        <NewsTicker news={news} />
      </div>

      {/* Entity Inspector Modal */}
      <EntityInspectorModal
        entity={inspectedEntity}
        onClose={() => setInspectedEntity(null)}
        onFeedSingleAnimal={handleFeedSingleAnimal}
        onFeedPreferredDiet={handleFeedPreferredDiet}
        onTriggerSpecialBehavior={handleTriggerSpecialBehavior}
        onReleaseAnimal={handleReleaseAnimal}
        onFireStaff={handleFireStaff}
        habitatInfo={
          inspectedEntity?.type === 'animal'
            ? evaluateHabitat(
                (inspectedEntity.data as Animal).type,
                checkEnclosure(
                  grid,
                  COLS,
                  ROWS,
                  Math.floor((inspectedEntity.data as Animal).x),
                  Math.floor((inspectedEntity.data as Animal).y)
                )
              )
            : null
        }
      />

      {/* Management / Finances / Milestones / Save Modal */}
      <ManagementModal
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
        money={money}
        rating={rating}
        guestCount={visitors.length}
        dailyReports={dailyReports}
        milestones={milestones}
        marketingLevel={marketingLevel}
        onLaunchMarketing={handleLaunchMarketing}
        onClaimMilestone={() => {}}
        onSaveGame={handleSaveGame}
        onLoadGame={handleLoadGame}
        onResetZoo={handleResetZoo}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />
    </div>
  );
}
