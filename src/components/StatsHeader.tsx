import React from 'react';
import { Volume2, VolumeX, Music, Pause, Play, FastForward, Briefcase } from 'lucide-react';

interface StatsHeaderProps {
  money: number;
  guestCount: number;
  rating: number; // 1.0 to 5.0
  ticketPrice: number;
  animalSatisfaction: number; // 0 - 100
  cleanliness: number; // 0 - 100
  day: number;
  dayTimeRatio: number; // 0..1
  gameSpeed: number; // 0, 1, 2, 3
  isMuted: boolean;
  isBgmOn: boolean;
  weather: 'sunny' | 'breeze' | 'rain';
  onAdjustTicket: (delta: number) => void;
  onSetGameSpeed: (speed: number) => void;
  onToggleMute: () => void;
  onToggleBgm: () => void;
  onOpenManagement: () => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  money,
  guestCount,
  rating,
  ticketPrice,
  animalSatisfaction,
  cleanliness,
  day,
  dayTimeRatio,
  gameSpeed,
  isMuted,
  isBgmOn,
  weather,
  onAdjustTicket,
  onSetGameSpeed,
  onToggleMute,
  onToggleBgm,
  onOpenManagement
}) => {
  // Format simulated 24h clock: 08:00 AM to 08:00 PM
  const simulatedHour = 8 + Math.floor(dayTimeRatio * 13);
  const simulatedMin = Math.floor((dayTimeRatio * 13 * 60) % 60);
  const timeStr = `${simulatedHour.toString().padStart(2, '0')}:${simulatedMin.toString().padStart(2, '0')}`;

  const weatherIcons: Record<string, { icon: string; name: string }> = {
    sunny: { icon: '☀️', name: '晴朗' },
    breeze: { icon: '🌸', name: '春風' },
    rain: { icon: '🌧️', name: '陣雨' }
  };

  return (
    <div className="w-full flex flex-col gap-1.5 select-none">
      {/* Top Banner with Title, Controls & System Toggles */}
      <div className="bg-[#413829] text-[#f7f3e8] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#2b2419]">
        <div className="flex items-center gap-2">
          <span className="text-sm">🐾</span>
          <span className="font-pixel text-[11px] text-[#ffde59] tracking-tight">RETRO ZOO TYCOON</span>
          <span className="font-retro text-xs text-[#e0d6be] hidden sm:inline">懷舊動物王國 v1.2</span>
        </div>

        {/* Status Pills & Controls */}
        <div className="flex items-center gap-2">
          {/* Weather */}
          <div className="flex items-center gap-1 bg-[#2e271c] px-2 py-0.5 border border-[#5d513d] text-[10px] font-retro">
            <span>{weatherIcons[weather].icon}</span>
            <span>{weatherIcons[weather].name}</span>
          </div>

          {/* Time & Day */}
          <div className="bg-[#2e271c] px-2 py-0.5 border border-[#5d513d] text-[10px] font-pixel text-[#6ce380]">
            第 {day} 天 {timeStr}
          </div>

          {/* Speed Controls */}
          <div className="flex items-center bg-[#2e271c] p-0.5 border border-[#5d513d]">
            <button
              onClick={() => onSetGameSpeed(gameSpeed === 0 ? 1 : 0)}
              title={gameSpeed === 0 ? '繼續遊戲' : '暫停遊戲'}
              className={`p-1 hover:bg-[#4d4231] ${gameSpeed === 0 ? 'text-amber-400 font-bold' : 'text-[#d6cdb8]'}`}
            >
              {gameSpeed === 0 ? <Play size={12} /> : <Pause size={12} />}
            </button>
            <button
              onClick={() => onSetGameSpeed(1)}
              title="正常速度 1x"
              className={`px-1.5 text-[9px] font-pixel ${gameSpeed === 1 ? 'bg-[#5e533e] text-yellow-300' : 'text-[#d6cdb8]'}`}
            >
              1x
            </button>
            <button
              onClick={() => onSetGameSpeed(2)}
              title="加速 2x"
              className={`px-1.5 text-[9px] font-pixel ${gameSpeed === 2 ? 'bg-[#5e533e] text-yellow-300' : 'text-[#d6cdb8]'}`}
            >
              2x
            </button>
            <button
              onClick={() => onSetGameSpeed(3)}
              title="極速 3x"
              className={`p-1 hover:bg-[#4d4231] ${gameSpeed === 3 ? 'bg-[#5e533e] text-yellow-300' : 'text-[#d6cdb8]'}`}
            >
              <FastForward size={12} />
            </button>
          </div>

          {/* Audio Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleMute}
              title={isMuted ? '開啟音效' : '靜音'}
              className={`p-1 border border-[#5d513d] bg-[#2e271c] hover:bg-[#473c2a] text-[10px] ${
                isMuted ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>

            <button
              onClick={onToggleBgm}
              title={isBgmOn ? '關閉8-bit背景音樂' : '開啟8-bit背景音樂'}
              className={`p-1 border border-[#5d513d] bg-[#2e271c] hover:bg-[#473c2a] text-[10px] ${
                isBgmOn ? 'text-yellow-300 font-bold' : 'text-stone-400'
              }`}
            >
              <Music size={12} />
            </button>
          </div>

          {/* Open Management Report Button */}
          <button
            onClick={onOpenManagement}
            className="retro-btn py-1 px-2 text-[10px] font-retro font-bold flex items-center gap-1 bg-[#d9a74a] hover:bg-[#e6b559] text-[#2c1d07]"
          >
            <Briefcase size={12} />
            <span>園區管理</span>
          </button>
        </div>
      </div>

      {/* Main Stats Bar */}
      <div className="retro-inset-box p-2 grid grid-cols-2 sm:grid-cols-6 gap-2 text-stone-900 font-retro">
        {/* Money */}
        <div className="flex flex-col">
          <span className="text-[10px] text-[#554b38] font-bold">園區資金</span>
          <span className={`text-xs font-pixel font-bold ${money < 100 ? 'text-red-700 animate-pulse' : 'text-[#184e1b]'}`}>
            ${money.toLocaleString()}
          </span>
        </div>

        {/* Guests */}
        <div className="flex flex-col">
          <span className="text-[10px] text-[#554b38] font-bold">園內遊客</span>
          <span className="text-xs font-pixel font-bold text-[#1b3459]">
            {guestCount} 人
          </span>
        </div>

        {/* Star Rating */}
        <div className="flex flex-col">
          <span className="text-[10px] text-[#554b38] font-bold">園區評價</span>
          <span className="text-xs font-pixel font-bold text-[#b45309]">
            ★ {rating.toFixed(1)}
          </span>
        </div>

        {/* Ticket Price */}
        <div className="flex flex-col">
          <span className="text-[10px] text-[#554b38] font-bold">入園門票</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-pixel font-bold text-[#2d261b]">
              ${ticketPrice}
            </span>
            <div className="flex gap-0.5">
              <button
                onClick={() => onAdjustTicket(5)}
                className="retro-btn px-1 py-0.5 text-[9px] font-pixel font-bold leading-none"
                title="門票 +$5"
              >
                +
              </button>
              <button
                onClick={() => onAdjustTicket(-5)}
                disabled={ticketPrice <= 5}
                className="retro-btn px-1 py-0.5 text-[9px] font-pixel font-bold leading-none disabled:opacity-40"
                title="門票 -$5"
              >
                -
              </button>
            </div>
          </div>
        </div>

        {/* Animal Happiness */}
        <div className="flex flex-col">
          <span className="text-[10px] text-[#554b38] font-bold">動物滿意</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-pixel font-bold text-[#255726]">
              {animalSatisfaction}%
            </span>
            <div className="w-12 h-2.5 bg-[#4a4030] border border-[#231e16] overflow-hidden">
              <div
                className={`h-full ${
                  animalSatisfaction > 70 ? 'bg-emerald-500' : animalSatisfaction > 35 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${animalSatisfaction}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cleanliness */}
        <div className="flex flex-col">
          <span className="text-[10px] text-[#554b38] font-bold">整潔環境</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-pixel font-bold text-[#224f5d]">
              {cleanliness}%
            </span>
            <div className="w-12 h-2.5 bg-[#4a4030] border border-[#231e16] overflow-hidden">
              <div
                className={`h-full ${
                  cleanliness > 70 ? 'bg-cyan-500' : cleanliness > 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${cleanliness}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
