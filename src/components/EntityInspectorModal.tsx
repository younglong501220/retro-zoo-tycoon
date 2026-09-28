import React from 'react';
import { X, Heart, Utensils, Zap, Sparkles, Compass } from 'lucide-react';
import { Animal, Guest, Staff, ANIMAL_CONFIGS } from '../types/game';

interface EntityInspectorModalProps {
  entity: {
    type: 'animal' | 'guest' | 'staff' | 'tile';
    data: unknown;
  } | null;
  onClose: () => void;
  onFeedSingleAnimal?: (animalId: string) => void;
  onFeedPreferredDiet?: (animalId: string) => void;
  onTriggerSpecialBehavior?: (animalId: string) => void;
  onRenameAnimal?: (animalId: string, newName: string) => void;
  onReleaseAnimal?: (animalId: string) => void;
  onFireStaff?: (staffId: string) => void;
  habitatInfo?: { score: number; isSufficient: boolean; feedback: string } | null;
}

export const EntityInspectorModal: React.FC<EntityInspectorModalProps> = ({
  entity,
  onClose,
  onFeedSingleAnimal,
  onFeedPreferredDiet,
  onTriggerSpecialBehavior,
  onReleaseAnimal,
  onFireStaff,
  habitatInfo
}) => {
  if (!entity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="retro-window-box w-full max-w-lg p-3 relative font-retro">
        {/* Header */}
        <div className="bg-[#413829] text-[#f7f3e8] px-3 py-1.5 flex items-center justify-between mb-3 border-b-2 border-[#2b2419]">
          <span className="font-pixel text-[11px] text-[#ffde59]">
            {entity.type === 'animal' && '🐾 動物檔案庫與互動照料'}
            {entity.type === 'guest' && '🧑 遊客滿意度調查'}
            {entity.type === 'staff' && '👷 員工考核卡'}
            {entity.type === 'tile' && '🗺️ 地塊調查'}
          </span>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-white p-0.5 rounded-xs"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        {entity.type === 'animal' && (
          (() => {
            const animal = entity.data as Animal;
            const cfg = ANIMAL_CONFIGS[animal.type];
            return (
              <div className="flex flex-col gap-2.5">
                {/* Profile Banner */}
                <div className="flex items-center gap-3 bg-[#e8e2cd] p-2.5 border border-[#8f8369]">
                  <div className="text-4xl bg-[#fff] w-14 h-14 rounded-xs border-2 border-[#554b38] flex items-center justify-center shadow-inner shrink-0">
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#261f15]">{animal.name}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-[#4a4030] text-[#ffde59] font-pixel">
                        {cfg.name} {animal.gender}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#554b3a] mt-0.5">
                      年齡：{animal.ageDays} 天 | 習性：{cfg.habit}
                    </div>
                    <div className="text-[10px] text-[#71654f] truncate">
                      棲息偏好：{cfg.preferredBiome}
                    </div>
                  </div>
                </div>

                {/* Status Bars */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#e4dec7] p-2 border border-[#91856b]">
                    <div className="flex items-center gap-1 text-[10px] text-[#4a4031] font-bold">
                      <Utensils size={12} className="text-amber-700" />
                      飽足度
                    </div>
                    <div className="text-sm font-pixel font-bold text-[#2a241b] mt-1">
                      {animal.hunger}%
                    </div>
                    <div className="w-full h-1.5 bg-[#a3977c] mt-1">
                      <div
                        className="h-full bg-amber-600"
                        style={{ width: `${animal.hunger}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-[#e4dec7] p-2 border border-[#91856b]">
                    <div className="flex items-center gap-1 text-[10px] text-[#4a4031] font-bold">
                      <Heart size={12} className="text-rose-600" />
                      心情值
                    </div>
                    <div className="text-sm font-pixel font-bold text-[#2a241b] mt-1">
                      {animal.happiness}%
                    </div>
                    <div className="w-full h-1.5 bg-[#a3977c] mt-1">
                      <div
                        className="h-full bg-rose-600"
                        style={{ width: `${animal.happiness}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-[#e4dec7] p-2 border border-[#91856b]">
                    <div className="flex items-center gap-1 text-[10px] text-[#4a4031] font-bold">
                      <Zap size={12} className="text-blue-600" />
                      精力活力
                    </div>
                    <div className="text-sm font-pixel font-bold text-[#2a241b] mt-1">
                      {animal.energy}%
                    </div>
                    <div className="w-full h-1.5 bg-[#a3977c] mt-1">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${animal.energy}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Habitat Compatibility Meter */}
                {habitatInfo && (
                  <div className="bg-[#e2dcbf] p-2 border border-[#94876b] flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#2f271a]">
                      <span className="flex items-center gap-1">
                        <Compass size={13} className="text-emerald-700" />
                        生境契合度：{habitatInfo.score}%
                      </span>
                      <span className={`text-[10px] font-pixel ${habitatInfo.score >= 70 ? 'text-emerald-800' : 'text-amber-800'}`}>
                        {habitatInfo.score >= 70 ? '✨ 極佳生境' : habitatInfo.score >= 50 ? '⚠️ 普通生境' : '❌ 亟需改善'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#9c9075]">
                      <div
                        className={`h-full ${habitatInfo.score >= 70 ? 'bg-emerald-600' : habitatInfo.score >= 50 ? 'bg-amber-600' : 'bg-red-600'}`}
                        style={{ width: `${habitatInfo.score}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[#5c503b] mt-0.5 leading-tight">
                      建議評估：{habitatInfo.feedback}
                    </div>
                  </div>
                )}

                {/* Diet and Special Behavior Info */}
                <div className="bg-[#fbf9f2] p-2 border border-[#a2967e] text-xs text-[#423829] flex flex-col gap-1">
                  <div>
                    <span className="font-bold text-[#8d531a]">特選愛吃食譜：</span>
                    <span>{cfg.diet.icon} {cfg.diet.name} (${cfg.diet.cost}) - {cfg.diet.desc}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#205c6d]">專屬特技行為：</span>
                    <span>{cfg.specialAction.icon} 【{cfg.specialAction.name}】 - {cfg.specialAction.desc}</span>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Feed Favorite Diet */}
                    <button
                      onClick={() => onFeedPreferredDiet?.(animal.id)}
                      className="retro-btn py-2 px-2 text-xs font-bold bg-[#84a97f] hover:bg-[#92b88c] text-[#132712] flex items-center justify-center gap-1 text-center"
                    >
                      <Sparkles size={13} />
                      餵食專屬愛吃菜 (${cfg.diet.cost})
                    </button>

                    {/* Trigger Special Action */}
                    <button
                      onClick={() => onTriggerSpecialBehavior?.(animal.id)}
                      className="retro-btn py-2 px-2 text-xs font-bold bg-[#dfb26b] hover:bg-[#ecc07a] text-[#311f07] flex items-center justify-center gap-1 text-center"
                    >
                      <span>{cfg.specialAction.icon}</span>
                      引導特技表演
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onFeedSingleAnimal?.(animal.id)}
                      className="flex-1 retro-btn py-1.5 text-[11px] font-bold bg-[#ded8bd] text-[#332b1e]"
                    >
                      投餵普通綜合零食 ($6)
                    </button>

                    <button
                      onClick={() => onReleaseAnimal?.(animal.id)}
                      className="retro-btn py-1.5 px-3 text-[11px] font-bold text-[#912323] hover:bg-[#ebd5d5]"
                      title="野放動物回大自然"
                    >
                      野放返鄉
                    </button>
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {entity.type === 'guest' && (
          (() => {
            const guest = entity.data as Guest;
            const favCfg = ANIMAL_CONFIGS[guest.favoriteAnimal];
            return (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-[#e8e2cd] p-2.5 border border-[#8f8369]">
                  <div
                    className="w-12 h-12 rounded-xs border-2 border-[#554b38] flex items-center justify-center shadow-inner text-2xl"
                    style={{ backgroundColor: guest.color }}
                  >
                    🧑
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#261f15]">{guest.name}</div>
                    <div className="text-[11px] text-[#554b3a] flex items-center gap-2 mt-0.5">
                      <span>錢包資金：${guest.cash}</span>
                      <span>最愛動物：{favCfg?.icon} {favCfg?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Guest Thoughts */}
                <div className="bg-[#fffdf8] p-3 border-2 border-dashed border-[#8d8065] text-xs text-[#2b241a] leading-relaxed">
                  <span className="font-bold text-[#8d531a]">遊客心聲：</span>
                  <div className="italic mt-1 text-sm">
                    「{guest.thoughts || '這裡的動物看起來真精神，散步非常愜意！'}」
                  </div>
                </div>

                {/* Status Bars */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#e4dec7] p-2 border border-[#91856b]">
                    <div className="text-[10px] text-[#4a4031] font-bold">快樂值</div>
                    <div className="text-xs font-pixel font-bold text-[#2a241b] mt-1">{guest.happiness}%</div>
                  </div>
                  <div className="bg-[#e4dec7] p-2 border border-[#91856b]">
                    <div className="text-[10px] text-[#4a4031] font-bold">飽食感</div>
                    <div className="text-xs font-pixel font-bold text-[#2a241b] mt-1">{guest.hunger}%</div>
                  </div>
                  <div className="bg-[#e4dec7] p-2 border border-[#91856b]">
                    <div className="text-[10px] text-[#4a4031] font-bold">體力</div>
                    <div className="text-xs font-pixel font-bold text-[#2a241b] mt-1">{guest.energy}%</div>
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {entity.type === 'staff' && (
          (() => {
            const staff = entity.data as Staff;
            const titles = {
              zookeeper: { name: '專業飼養員', desc: '定時巡邏所有圍欄，主動餵飽飢餓的動物。', icon: '🧑‍🌾' },
              janitor: { name: '園區清潔工', desc: '勤勞清掃道路上的落葉與垃圾袋，維護園區五星環境。', icon: '🧹' },
              entertainer: { name: '歡樂小丑', desc: '隨機在步道表演滑稽魔術，逗樂途經的遊客並發放氣球！', icon: '🤡' }
            };
            const role = titles[staff.type];
            return (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-[#e8e2cd] p-2.5 border border-[#8f8369]">
                  <div className="text-3xl bg-[#fff] w-12 h-12 rounded-xs border-2 border-[#554b38] flex items-center justify-center">
                    {role.icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#261f15]">{staff.name}</div>
                    <div className="text-[11px] text-[#554b3a] mt-0.5">
                      職位：{role.name} | 日薪水：${staff.salary}/天
                    </div>
                  </div>
                </div>

                <div className="text-xs bg-[#fbf9f2] p-2.5 border border-[#a2967e] text-[#423829] leading-relaxed">
                  {role.desc}
                </div>

                <button
                  onClick={() => onFireStaff?.(staff.id)}
                  className="retro-btn py-2 text-xs font-bold text-[#a82222] hover:bg-[#ebd5d5] mt-1"
                >
                  解雇此員工
                </button>
              </div>
            );
          })()
        )}

        {entity.type === 'tile' && (
          (() => {
            const tile = entity.data as { x: number; y: number; tileType: number };
            return (
              <div className="flex flex-col gap-2 text-xs">
                <div className="bg-[#e8e2cd] p-2.5 border border-[#8f8369]">
                  座標：X={tile.x}, Y={tile.y}
                </div>
                <div className="text-[11px] text-stone-700">
                  使用拆除工具可以清理或移除該地塊上的建物與裝飾。
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};
