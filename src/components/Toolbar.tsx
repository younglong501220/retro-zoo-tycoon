import React, { useState } from 'react';
import { ToolId, ANIMAL_CONFIGS } from '../types/game';

interface ToolbarProps {
  currentTool: ToolId;
  money: number;
  onSelectTool: (tool: ToolId) => void;
  onFeedAll: () => void;
  animalCount: number;
}

type TabType = 'build' | 'nature' | 'shops' | 'animals' | 'staff';

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  money,
  onSelectTool,
  onFeedAll,
  animalCount
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('build');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'build', label: '基礎建造', icon: '🧱' },
    { id: 'nature', label: '地形植被', icon: '🌿' },
    { id: 'shops', label: '商店休閒', icon: '🌭' },
    { id: 'animals', label: '引進動物', icon: '🐾' },
    { id: 'staff', label: '員工團隊', icon: '👷' }
  ];

  return (
    <div className="flex flex-col gap-2 w-full lg:w-72 select-none">
      {/* Category Tabs */}
      <div className="grid grid-cols-5 gap-1 text-[9px] font-retro">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-1.5 px-0.5 text-center flex flex-col items-center justify-center rounded-t-xs transition-colors ${
              activeTab === tab.id
                ? 'bg-[#dcd6be] border-t-2 border-l-2 border-r-2 border-[#4a4031] text-[#1c1813] font-bold shadow-xs'
                : 'bg-[#b6ab90] border border-[#5a4e3c] text-[#473e31] hover:bg-[#c8be9f]'
            }`}
          >
            <span className="text-xs leading-none">{tab.icon}</span>
            <span className="truncate scale-90 origin-center mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tools Content Box */}
      <div className="retro-window-box p-2.5 flex flex-col gap-2 min-h-[220px]">
        {/* Tab 1: Build */}
        {activeTab === 'build' && (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onSelectTool('path')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'path' ? 'active' : ''}`}
            >
              <span className="text-sm">🪨</span>
              <span className="text-[10px] font-retro font-bold mt-1">石板步道</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$10</span>
            </button>

            <button
              onClick={() => onSelectTool('fence')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'fence' ? 'active' : ''}`}
            >
              <span className="text-sm">🪵</span>
              <span className="text-[10px] font-retro font-bold mt-1">木質圍欄</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$25</span>
            </button>

            <button
              onClick={() => onSelectTool('bench')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'bench' ? 'active' : ''}`}
            >
              <span className="text-sm">🪑</span>
              <span className="text-[10px] font-retro font-bold mt-1">休憩長椅</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$35</span>
            </button>

            <button
              onClick={() => onSelectTool('trash_bin')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'trash_bin' ? 'active' : ''}`}
            >
              <span className="text-sm">🗑️</span>
              <span className="text-[10px] font-retro font-bold mt-1">園區垃圾桶</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$15</span>
            </button>

            <button
              onClick={() => onSelectTool('fountain')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'fountain' ? 'active' : ''}`}
            >
              <span className="text-sm">⛲</span>
              <span className="text-[10px] font-retro font-bold mt-1">景觀噴泉</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$120</span>
            </button>

            <button
              onClick={() => onSelectTool('restroom')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'restroom' ? 'active' : ''}`}
            >
              <span className="text-sm">🚻</span>
              <span className="text-[10px] font-retro font-bold mt-1">公共洗手間</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$90</span>
            </button>
          </div>
        )}

        {/* Tab 2: Nature & Biomes */}
        {activeTab === 'nature' && (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onSelectTool('water')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'water' ? 'active' : ''}`}
            >
              <span className="text-sm">🌊</span>
              <span className="text-[10px] font-retro font-bold mt-1">清涼水池</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$30</span>
            </button>

            <button
              onClick={() => onSelectTool('ice')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'ice' ? 'active' : ''}`}
            >
              <span className="text-sm">❄️</span>
              <span className="text-[10px] font-retro font-bold mt-1">極地冰原</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$40</span>
            </button>

            <button
              onClick={() => onSelectTool('savannah')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'savannah' ? 'active' : ''}`}
            >
              <span className="text-sm">🏜️</span>
              <span className="text-[10px] font-retro font-bold mt-1">稀樹沙漠</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$25</span>
            </button>

            <button
              onClick={() => onSelectTool('bamboo')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'bamboo' ? 'active' : ''}`}
            >
              <span className="text-sm">🎋</span>
              <span className="text-[10px] font-retro font-bold mt-1">翠綠竹林</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$35</span>
            </button>

            <button
              onClick={() => onSelectTool('tree_pine')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'tree_pine' ? 'active' : ''}`}
            >
              <span className="text-sm">🌲</span>
              <span className="text-[10px] font-retro font-bold mt-1">長青松樹</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$20</span>
            </button>

            <button
              onClick={() => onSelectTool('tree_cherry')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'tree_cherry' ? 'active' : ''}`}
            >
              <span className="text-sm">🌸</span>
              <span className="text-[10px] font-retro font-bold mt-1">粉紅櫻花</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$30</span>
            </button>
          </div>
        )}

        {/* Tab 3: Shops */}
        {activeTab === 'shops' && (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onSelectTool('shop_hotdog')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'shop_hotdog' ? 'active' : ''}`}
            >
              <span className="text-sm">🌭</span>
              <span className="text-[10px] font-retro font-bold mt-1">熱狗攤位</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$80</span>
            </button>

            <button
              onClick={() => onSelectTool('shop_icecream')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'shop_icecream' ? 'active' : ''}`}
            >
              <span className="text-sm">🍦</span>
              <span className="text-[10px] font-retro font-bold mt-1">冰淇淋車</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$75</span>
            </button>

            <button
              onClick={() => onSelectTool('shop_drinks')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'shop_drinks' ? 'active' : ''}`}
            >
              <span className="text-sm">🥤</span>
              <span className="text-[10px] font-retro font-bold mt-1">汽水小棧</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$65</span>
            </button>

            <button
              onClick={() => onSelectTool('shop_balloon')}
              className={`retro-btn p-2 flex flex-col items-center text-center ${currentTool === 'shop_balloon' ? 'active' : ''}`}
            >
              <span className="text-sm">🎈</span>
              <span className="text-[10px] font-retro font-bold mt-1">氣球小舖</span>
              <span className="text-[9px] text-emerald-800 font-pixel">$70</span>
            </button>
          </div>
        )}

        {/* Tab 4: Animals */}
        {activeTab === 'animals' && (
          <div className="flex flex-col gap-1.5">
            <div className="text-[10px] text-[#4a4030] font-retro flex items-center justify-between border-b border-[#a1967c] pb-1">
              <span>引進物種 (共 16 種)</span>
              <span className="text-[9px] text-[#706450]">需在圍欄內</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-[260px] overflow-y-auto pr-0.5">
              {Object.values(ANIMAL_CONFIGS).map(cfg => (
                <button
                  key={cfg.type}
                  onClick={() => onSelectTool(cfg.type)}
                  title={`${cfg.name} (${cfg.preferredBiome}) - 喜愛：${cfg.diet.name}`}
                  className={`retro-btn p-1.5 flex flex-col items-center text-center relative ${currentTool === cfg.type ? 'active' : ''}`}
                >
                  <div className="flex items-center justify-between w-full px-0.5">
                    <span className="text-base">{cfg.icon}</span>
                    <span className="text-[9px]" title={`喜愛食物：${cfg.diet.name}`}>{cfg.diet.icon}</span>
                  </div>
                  <span className="text-[10px] font-retro font-bold mt-0.5 truncate w-full">{cfg.name}</span>
                  <div className="flex items-center justify-between w-full px-1 mt-0.5 text-[8px] font-pixel">
                    <span className="text-emerald-800">${cfg.cost}</span>
                    <span className="text-amber-700">+{cfg.appeal}★</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Staff */}
        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => onSelectTool('staff_zookeeper')}
              className={`retro-btn p-2 flex items-center gap-2 text-left ${currentTool === 'staff_zookeeper' ? 'active' : ''}`}
            >
              <span className="text-xl">🧑‍🌾</span>
              <div>
                <div className="text-[11px] font-retro font-bold text-[#1f1a14]">專業飼養員 ($150)</div>
                <div className="text-[9px] text-[#554b3c] font-retro">自動巡邏餵食動物 ($10/天)</div>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('staff_janitor')}
              className={`retro-btn p-2 flex items-center gap-2 text-left ${currentTool === 'staff_janitor' ? 'active' : ''}`}
            >
              <span className="text-xl">🧹</span>
              <div>
                <div className="text-[11px] font-retro font-bold text-[#1f1a14]">園區清潔工 ($100)</div>
                <div className="text-[9px] text-[#554b3c] font-retro">清掃步道垃圾維持整潔 ($8/天)</div>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('staff_entertainer')}
              className={`retro-btn p-2 flex items-center gap-2 text-left ${currentTool === 'staff_entertainer' ? 'active' : ''}`}
            >
              <span className="text-xl">🤡</span>
              <div>
                <div className="text-[11px] font-retro font-bold text-[#1f1a14]">歡樂小丑 ($120)</div>
                <div className="text-[9px] text-[#554b3c] font-retro">表演魔術提升遊客心情 ($9/天)</div>
              </div>
            </button>
          </div>
        )}

        {/* Universal Actions Box */}
        <div className="mt-auto pt-2 border-t-2 border-dashed border-[#96896f] flex flex-col gap-1.5 font-retro">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onSelectTool('inspect')}
              className={`retro-btn py-1.5 px-2 text-[10px] font-bold flex items-center justify-center gap-1 ${
                currentTool === 'inspect' ? 'active bg-[#e3d79f]' : 'bg-[#ded8be]'
              }`}
            >
              <span>🔍</span> 檢查資訊
            </button>

            <button
              onClick={() => onSelectTool('demolish')}
              className={`retro-btn py-1.5 px-2 text-[10px] font-bold flex items-center justify-center gap-1 text-[#a82222] ${
                currentTool === 'demolish' ? 'active bg-[#f7c0be]' : ''
              }`}
            >
              <span>🔨</span> 拆除/清理
            </button>
          </div>

          <button
            onClick={onFeedAll}
            disabled={animalCount === 0 || money < animalCount * 8}
            className="retro-btn py-2 px-2 text-[11px] font-bold flex items-center justify-center gap-1.5 bg-[#8ea885] hover:bg-[#9cb893] text-[#1a2d18] disabled:opacity-50"
          >
            <span>🥩</span> 全員餵食 (${animalCount * 8})
          </button>
        </div>
      </div>
    </div>
  );
};
