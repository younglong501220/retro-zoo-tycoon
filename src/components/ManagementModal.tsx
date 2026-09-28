import React, { useState } from 'react';
import { X, TrendingUp, Award, Megaphone, Save, RotateCcw, Download, Upload } from 'lucide-react';
import { DailyReport, Milestone } from '../types/game';

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  money: number;
  rating: number;
  guestCount: number;
  dailyReports: DailyReport[];
  milestones: Milestone[];
  marketingLevel: number;
  onLaunchMarketing: (level: number, cost: number) => void;
  onClaimMilestone: (id: string) => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
  onResetZoo: (preset: 'blank' | 'starter' | 'safari') => void;
  onExportJson: () => void;
  onImportJson: (json: string) => void;
}

export const ManagementModal: React.FC<ManagementModalProps> = ({
  isOpen,
  onClose,
  money,
  rating,
  guestCount,
  dailyReports,
  milestones,
  marketingLevel,
  onLaunchMarketing,
  onClaimMilestone,
  onSaveGame,
  onLoadGame,
  onResetZoo,
  onExportJson,
  onImportJson
}) => {
  const [activeTab, setActiveTab] = useState<'finance' | 'marketing' | 'milestones' | 'save'>('finance');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const latestReport = dailyReports[dailyReports.length - 1] || {
    day: 1,
    ticketIncome: 0,
    shopIncome: 0,
    feedExpenses: 0,
    staffExpenses: 0,
    marketingExpenses: 0,
    netProfit: 0,
    visitorsToday: guestCount,
    starRating: rating
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onImportJson(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
      <div className="retro-window-box w-full max-w-2xl max-h-[90vh] flex flex-col p-3 relative font-retro">
        {/* Header */}
        <div className="bg-[#413829] text-[#f7f3e8] px-3 py-2 flex items-center justify-between border-b-2 border-[#2b2419]">
          <div className="flex items-center gap-2">
            <span className="text-base">💼</span>
            <span className="font-pixel text-xs text-[#ffde59]">動物王國管理中心</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-white p-0.5 rounded-xs"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b-2 border-[#554b38] bg-[#c3b99e] mt-1 text-xs">
          <button
            onClick={() => setActiveTab('finance')}
            className={`py-2 px-3 flex items-center gap-1.5 font-bold ${
              activeTab === 'finance'
                ? 'bg-[#dcd6be] border-t-2 border-l-2 border-r-2 border-[#4a4031] text-[#1f1a13]'
                : 'text-[#524636] hover:bg-[#d0c6ac]'
            }`}
          >
            <TrendingUp size={14} />
            財務損益
          </button>

          <button
            onClick={() => setActiveTab('marketing')}
            className={`py-2 px-3 flex items-center gap-1.5 font-bold ${
              activeTab === 'marketing'
                ? 'bg-[#dcd6be] border-t-2 border-l-2 border-r-2 border-[#4a4031] text-[#1f1a13]'
                : 'text-[#524636] hover:bg-[#d0c6ac]'
            }`}
          >
            <Megaphone size={14} />
            行銷廣告
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-2 px-3 flex items-center gap-1.5 font-bold ${
              activeTab === 'milestones'
                ? 'bg-[#dcd6be] border-t-2 border-l-2 border-r-2 border-[#4a4031] text-[#1f1a13]'
                : 'text-[#524636] hover:bg-[#d0c6ac]'
            }`}
          >
            <Award size={14} />
            成就里程碑
          </button>

          <button
            onClick={() => setActiveTab('save')}
            className={`py-2 px-3 flex items-center gap-1.5 font-bold ${
              activeTab === 'save'
                ? 'bg-[#dcd6be] border-t-2 border-l-2 border-r-2 border-[#4a4031] text-[#1f1a13]'
                : 'text-[#524636] hover:bg-[#d0c6ac]'
            }`}
          >
            <Save size={14} />
            檔案管理
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-3 overflow-y-auto flex-1 bg-[#ebe5d3] min-h-[320px]">
          {/* 1. Finance Tab */}
          {activeTab === 'finance' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#e0d9c3] p-2.5 border border-[#8f8268]">
                  <div className="text-[11px] text-[#6b5f4c] font-bold">目前可用資金</div>
                  <div className="text-base font-pixel font-bold text-emerald-800 mt-1">
                    ${money.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[#e0d9c3] p-2.5 border border-[#8f8268]">
                  <div className="text-[11px] text-[#6b5f4c] font-bold">昨日淨利潤</div>
                  <div className={`text-base font-pixel font-bold mt-1 ${latestReport.netProfit >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                    {latestReport.netProfit >= 0 ? `+$${latestReport.netProfit}` : `-$${Math.abs(latestReport.netProfit)}`}
                  </div>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="retro-inset-box p-3">
                <div className="font-bold text-xs text-[#332b1f] border-b border-[#7d7159] pb-1 mb-2">
                  📜 最新營收細項結算（第 {latestReport.day} 天）
                </div>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>門票門金收入</span>
                    <span>+${latestReport.ticketIncome}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>熱狗/甜點/氣球小棧營業額</span>
                    <span>+${latestReport.shopIncome}</span>
                  </div>
                  <div className="flex justify-between text-red-800">
                    <span>動物飼料及維護費</span>
                    <span>-${latestReport.feedExpenses}</span>
                  </div>
                  <div className="flex justify-between text-red-800">
                    <span>員工薪俸支出</span>
                    <span>-${latestReport.staffExpenses}</span>
                  </div>
                  {latestReport.marketingExpenses > 0 && (
                    <div className="flex justify-between text-red-800">
                      <span>行銷宣傳費用</span>
                      <span>-${latestReport.marketingExpenses}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-[#544837] pt-1.5 flex justify-between font-bold text-sm">
                    <span>結算淨收益</span>
                    <span className={latestReport.netProfit >= 0 ? 'text-emerald-900 font-pixel' : 'text-red-800 font-pixel'}>
                      ${latestReport.netProfit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#665a46] italic">
                提示：引進高吸引力動物可吸引大量遊客並提高門票承擔力；配置熱狗與甜品攤位可賺取高額人流副業收入！
              </div>
            </div>
          )}

          {/* 2. Marketing Tab */}
          {activeTab === 'marketing' && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-[#453a2a] leading-relaxed">
                發動宣傳攻勢可以短時間內為動物園帶來大量湧入的遊客潮！
              </div>

              <div className="flex flex-col gap-2.5">
                {/* Level 1 */}
                <div className="bg-[#ded6be] p-2.5 border border-[#8e8167] flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-xs text-[#261f15] flex items-center gap-1.5">
                      <span>📢</span> 地方傳單派發 ($80)
                    </div>
                    <div className="text-[10px] text-[#5e513e] mt-0.5">
                      在街頭派發彩色宣傳單，遊客吸引力提升 25% (持續 2 天)
                    </div>
                  </div>
                  <button
                    onClick={() => onLaunchMarketing(1, 80)}
                    disabled={money < 80}
                    className="retro-btn py-1.5 px-3 text-xs font-bold bg-[#a7c59b] hover:bg-[#b5d3a9] text-[#1d3319] shrink-0"
                  >
                    發動宣傳
                  </button>
                </div>

                {/* Level 2 */}
                <div className="bg-[#ded6be] p-2.5 border border-[#8e8167] flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-xs text-[#261f15] flex items-center gap-1.5">
                      <span>📰</span> 報紙全版特別企劃 ($220)
                    </div>
                    <div className="text-[10px] text-[#5e513e] mt-0.5">
                      登上市區日報頭版推薦，遊客吸引力提升 60% (持續 3 天)
                    </div>
                  </div>
                  <button
                    onClick={() => onLaunchMarketing(2, 220)}
                    disabled={money < 220}
                    className="retro-btn py-1.5 px-3 text-xs font-bold bg-[#a7c59b] hover:bg-[#b5d3a9] text-[#1d3319] shrink-0"
                  >
                    發動宣傳
                  </button>
                </div>

                {/* Level 3 */}
                <div className="bg-[#ded6be] p-2.5 border border-[#8e8167] flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-xs text-[#261f15] flex items-center gap-1.5">
                      <span>📺</span> 電視旅遊專題報導 ($500)
                    </div>
                    <div className="text-[10px] text-[#5e513e] mt-0.5">
                      黃金檔電視台熱烈推薦，遊客吸引力飆升 120% (持續 4 天)
                    </div>
                  </div>
                  <button
                    onClick={() => onLaunchMarketing(3, 500)}
                    disabled={money < 500}
                    className="retro-btn py-1.5 px-3 text-xs font-bold bg-[#a7c59b] hover:bg-[#b5d3a9] text-[#1d3319] shrink-0"
                  >
                    發動宣傳
                  </button>
                </div>
              </div>

              {marketingLevel > 0 && (
                <div className="text-xs bg-[#d4edda] text-[#155724] p-2 border border-[#c3e6cb] font-bold">
                  🔥 目前正處於行銷宣傳期！遊客流量大幅加倍中！
                </div>
              )}
            </div>
          )}

          {/* 3. Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="flex flex-col gap-2">
              {milestones.map(m => (
                <div
                  key={m.id}
                  className={`p-2.5 border flex items-center justify-between gap-3 ${
                    m.unlocked
                      ? 'bg-[#e2f0d9] border-[#81b376]'
                      : 'bg-[#ded6be] border-[#91856c] opacity-85'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <div className="font-bold text-xs text-[#211b13] flex items-center gap-2">
                        <span>{m.title}</span>
                        {m.unlocked && (
                          <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-xs font-pixel">
                            已達成
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#554b3a] mt-0.5">
                        {m.description}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-pixel text-[10px] text-amber-800 font-bold">
                      +${m.reward}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. Save & Presets Tab */}
          {activeTab === 'save' && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-[#ded6be] p-2.5 border border-[#8e8167] flex flex-col gap-2">
                <span className="font-bold text-stone-900">瀏覽器快速存檔 / 讀檔</span>
                <div className="flex gap-2">
                  <button
                    onClick={onSaveGame}
                    className="flex-1 retro-btn py-2 flex items-center justify-center gap-1.5 font-bold bg-[#8ea885] hover:bg-[#9cb893] text-[#1a2d18]"
                  >
                    <Save size={14} />
                    手動儲存至瀏覽器
                  </button>
                  <button
                    onClick={onLoadGame}
                    className="flex-1 retro-btn py-2 flex items-center justify-center gap-1.5 font-bold"
                  >
                    <RotateCcw size={14} />
                    讀取已儲存進度
                  </button>
                </div>
              </div>

              {/* JSON Export / Import */}
              <div className="bg-[#ded6be] p-2.5 border border-[#8e8167] flex flex-col gap-2">
                <span className="font-bold text-stone-900">存檔匯出與匯入 (跨設備備份)</span>
                <div className="flex gap-2">
                  <button
                    onClick={onExportJson}
                    className="flex-1 retro-btn py-2 flex items-center justify-center gap-1.5 font-bold"
                  >
                    <Download size={14} />
                    下載存檔檔 (.json)
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 retro-btn py-2 flex items-center justify-center gap-1.5 font-bold"
                  >
                    <Upload size={14} />
                    匯入外部存檔
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {/* Reset to Presets */}
              <div className="bg-[#ded6be] p-2.5 border border-[#8e8167] flex flex-col gap-2">
                <span className="font-bold text-stone-900">重新開始 / 預設樂園範本</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onResetZoo('blank')}
                    className="retro-btn py-2 px-1 text-[11px] font-bold text-red-800"
                  >
                    空白畫布重新開始
                  </button>
                  <button
                    onClick={() => onResetZoo('starter')}
                    className="retro-btn py-2 px-1 text-[11px] font-bold text-emerald-900"
                  >
                    綠意新手示範園
                  </button>
                  <button
                    onClick={() => onResetZoo('safari')}
                    className="retro-btn py-2 px-1 text-[11px] font-bold text-amber-900"
                  >
                    野生非洲大草原
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
