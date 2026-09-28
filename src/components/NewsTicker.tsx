import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Bell } from 'lucide-react';

interface NewsTickerProps {
  news: string[];
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ news }) => {
  const [showHistory, setShowHistory] = useState(false);
  const latestNews = news[news.length - 1] || '歡迎來到《懷舊動物王國》！建造圍欄並引進動物，吸引遊客來賺取收入吧！';

  return (
    <div className="w-full flex flex-col font-retro select-none">
      <div className="bg-[#18181f] text-[#4fe770] px-3 py-1.5 flex items-center justify-between border-2 border-[#09090c] text-xs">
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          <span className="font-pixel text-[9px] bg-[#272733] text-[#ffde59] px-1.5 py-0.5 shrink-0 border border-[#3b3b4f]">
            [快訊]
          </span>
          <span className="truncate tracking-wide">{latestNews}</span>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-[#9ea3b5] hover:text-white flex items-center gap-1 text-[10px] shrink-0 font-bold bg-[#292936] px-1.5 py-0.5 border border-[#3c3c4e]"
          title="查看園區歷史快訊紀錄"
        >
          <Bell size={11} />
          <span>歷史 ({news.length})</span>
          {showHistory ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
        </button>
      </div>

      {showHistory && (
        <div className="bg-[#121217] text-[#c9cddb] border-x-2 border-b-2 border-[#09090c] p-2 max-h-36 overflow-y-auto text-[11px] flex flex-col gap-1">
          {news.slice().reverse().map((item, idx) => (
            <div key={idx} className="border-b border-[#22222e] pb-1 text-[#b1f5c0]">
              • {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
