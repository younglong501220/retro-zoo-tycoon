export const TILE_GRASS = 0;
export const TILE_PATH = 1;
export const TILE_FENCE = 2;
export const TILE_SHOP_HOTDOG = 3;
export const TILE_SHOP_ICECREAM = 4;
export const TILE_SHOP_DRINKS = 5;
export const TILE_SHOP_BALLOON = 6;
export const TILE_TREE_PINE = 7;
export const TILE_TREE_CHERRY = 8;
export const TILE_WATER = 9;
export const TILE_ICE = 10;
export const TILE_BAMBOO = 11;
export const TILE_SAVANNAH = 12;
export const TILE_BENCH = 13;
export const TILE_TRASH_BIN = 14;
export const TILE_FOUNTAIN = 15;
export const TILE_RESTROOM = 16;
export const TILE_ENTRANCE = 99;

export type TileType = number;

export type AnimalType = 
  | 'animal_lion'
  | 'animal_penguin'
  | 'animal_panda'
  | 'animal_monkey'
  | 'animal_elephant'
  | 'animal_giraffe'
  | 'animal_flamingo'
  | 'animal_koala'
  | 'animal_tiger'
  | 'animal_polar_bear'
  | 'animal_kangaroo'
  | 'animal_crocodile'
  | 'animal_sea_lion'
  | 'animal_peacock'
  | 'animal_zebra'
  | 'animal_wolf';

export interface AnimalDiet {
  name: string;
  icon: string;
  cost: number;
  desc: string;
}

export interface AnimalSpeciesInfo {
  type: AnimalType;
  name: string;
  enName: string;
  icon: string;
  cost: number;
  appeal: number;
  dailyFoodCost: number;
  preferredBiome: string;
  description: string;
  habit: string;
  diet: AnimalDiet;
  minPenTiles: number;
  favoriteTiles: number[];
  specialAction: {
    name: string;
    icon: string;
    desc: string;
  };
  soundType: 'roar' | 'squeak' | 'trumpet' | 'howl' | 'bird' | 'splash';
}

export const ANIMAL_CONFIGS: Record<AnimalType, AnimalSpeciesInfo> = {
  animal_lion: {
    type: 'animal_lion',
    name: '非洲獅',
    enName: 'Lion',
    icon: '🦁',
    cost: 280,
    appeal: 35,
    dailyFoodCost: 16,
    preferredBiome: '稀樹沙漠 + 草地',
    description: '萬獸之王，威武霸氣，是吸引遊客的絕對焦點！',
    habit: '午後喜愛打盹、巡視領地與震撼低吼',
    diet: { name: '頂級厚切鮮肉排', icon: '🥩', cost: 15, desc: '高蛋白紅肉，能大幅恢復體力與滿足萬獸之王食量' },
    minPenTiles: 6,
    favoriteTiles: [TILE_SAVANNAH, TILE_GRASS],
    specialAction: { name: '王者長嘯', icon: '👑', desc: '震撼咆哮，使周圍遊客讚嘆不已並投擲額外打賞' },
    soundType: 'roar'
  },
  animal_penguin: {
    type: 'animal_penguin',
    name: '國王企鵝',
    enName: 'Penguin',
    icon: '🐧',
    cost: 150,
    appeal: 20,
    dailyFoodCost: 8,
    preferredBiome: '極地冰原 + 清涼水池',
    description: '搖搖擺擺走路超逗趣，在冰雪與水池中最有活力！',
    habit: '成群結隊滑冰、跳入水池暢游嬉戲',
    diet: { name: '深海鮮甜磷蝦桶', icon: '🦐', cost: 9, desc: '極地新鮮磷蝦與小鯡魚，羽翼光澤的關鍵營養' },
    minPenTiles: 4,
    favoriteTiles: [TILE_ICE, TILE_WATER],
    specialAction: { name: '冰上滑行跳水', icon: '❄️', desc: '在冰原與水池間滑行跳水，濺起逗趣水花' },
    soundType: 'splash'
  },
  animal_panda: {
    type: 'animal_panda',
    name: '大貓熊',
    enName: 'Panda',
    icon: '🐼',
    cost: 450,
    appeal: 48,
    dailyFoodCost: 22,
    preferredBiome: '翠綠竹林 + 櫻花樹',
    description: '圓滾滾的國寶級明星，只要啃竹子就能征服所有遊客！',
    habit: '專注啃咬新鮮竹筍、在草地上伸懶腰翻滾',
    diet: { name: '高山現摘鮮脆竹', icon: '🎋', cost: 14, desc: '清甜幼嫩的高山箭竹，貓熊寶寶一天的心靈慰藉' },
    minPenTiles: 6,
    favoriteTiles: [TILE_BAMBOO, TILE_TREE_CHERRY],
    specialAction: { name: '軟萌抱頭翻滾', icon: '🎋', desc: '抱著嫩竹在地上滾一圈，遊客快樂度瞬間拉滿' },
    soundType: 'squeak'
  },
  animal_monkey: {
    type: 'animal_monkey',
    name: '環尾狐猴',
    enName: 'Monkey',
    icon: '🐒',
    cost: 160,
    appeal: 22,
    dailyFoodCost: 10,
    preferredBiome: '長青松樹 + 櫻花樹',
    description: '敏捷靈巧、活潑好動，經常做出搞笑的互動姿勢！',
    habit: '攀爬在樹幹間擺盪、向遊客展示尾巴特技',
    diet: { name: '熱帶香甜熟香蕉', icon: '🍌', cost: 8, desc: '香氣濃郁的熟香蕉與熱帶鮮果丁' },
    minPenTiles: 4,
    favoriteTiles: [TILE_TREE_PINE, TILE_TREE_CHERRY],
    specialAction: { name: '鬼臉倒掛盪鞦韆', icon: '🐒', desc: '在圍欄邊做鬼臉並晃動長尾巴逗樂群眾' },
    soundType: 'squeak'
  },
  animal_elephant: {
    type: 'animal_elephant',
    name: '亞洲象',
    enName: 'Elephant',
    icon: '🐘',
    cost: 520,
    appeal: 55,
    dailyFoodCost: 28,
    preferredBiome: '寬闊草地 + 大片水池',
    description: '體型龐大且智慧極高，會用長鼻噴水逗樂遊客！',
    habit: '悠閒走動、吸取池水給自己沖澡沐浴',
    diet: { name: '甘蔗甜瓜鮮草堆', icon: '🍉', cost: 18, desc: '大量高纖維甘蔗、甜西瓜與新鮮多汁的蔬果' },
    minPenTiles: 10,
    favoriteTiles: [TILE_WATER, TILE_GRASS],
    specialAction: { name: '長鼻噴彩虹水霧', icon: '💦', desc: '吸起池水向天空噴灑出彩虹薄霧，帶來極致視覺盛宴' },
    soundType: 'trumpet'
  },
  animal_giraffe: {
    type: 'animal_giraffe',
    name: '網紋長頸鹿',
    enName: 'Giraffe',
    icon: '🦒',
    cost: 340,
    appeal: 38,
    dailyFoodCost: 16,
    preferredBiome: '稀樹沙漠 + 綠蔭高樹',
    description: '優雅長脖子能探過圍欄俯瞰人群，是拍照打卡名角！',
    habit: '優雅踱步、伸長脖頸啃食高枝綠葉',
    diet: { name: '金合歡鮮嫩高梢葉', icon: '🌿', cost: 12, desc: '高梢採摘的金合歡嫩葉，保留充足露水與養分' },
    minPenTiles: 8,
    favoriteTiles: [TILE_SAVANNAH, TILE_TREE_PINE],
    specialAction: { name: '高空探頭互動', icon: '🦒', desc: '探出長頸低頭親近圍欄邊的遊客，引爆拍照狂潮' },
    soundType: 'squeak'
  },
  animal_flamingo: {
    type: 'animal_flamingo',
    name: '大紅鶴',
    enName: 'Flamingo',
    icon: '🦩',
    cost: 160,
    appeal: 24,
    dailyFoodCost: 9,
    preferredBiome: '大片淺水池沼',
    description: '粉紅羽翼宛如仙境精靈，單腳站立的模樣令人驚嘆！',
    habit: '涉水漫步、在淺水中濾食浮游生物與群聚舞蹈',
    diet: { name: '胡蘿蔔素螺旋藻凍', icon: '🦐', cost: 7, desc: '富含蝦紅素與螺旋藻的特製水生營養凍' },
    minPenTiles: 5,
    favoriteTiles: [TILE_WATER],
    specialAction: { name: '仙境雙飛舞姿', icon: '🦩', desc: '展開鮮粉色雙翼優雅展翅起舞，營造夢幻景致' },
    soundType: 'bird'
  },
  animal_koala: {
    type: 'animal_koala',
    name: '澳洲無尾熊',
    enName: 'Koala',
    icon: '🐨',
    cost: 300,
    appeal: 32,
    dailyFoodCost: 12,
    preferredBiome: '長青松樹 / 櫻花樹林',
    description: '整天抱著樹幹睡覺的毛茸茸小可愛，療癒感滿分！',
    habit: '一天有 18 小時都在樹幹頂端香甜入睡',
    diet: { name: '特選尤加利嫩芽', icon: '🍃', cost: 11, desc: '特定樹種的頂級嫩芽，帶著清涼薄荷芳香' },
    minPenTiles: 4,
    favoriteTiles: [TILE_TREE_PINE, TILE_TREE_CHERRY],
    specialAction: { name: '無敵治癒呼嚕', icon: '🐨', desc: '抱緊樹幹揉眼睛打哈欠，瞬間融化全場遊客' },
    soundType: 'squeak'
  },
  animal_tiger: {
    type: 'animal_tiger',
    name: '孟加拉虎',
    enName: 'Bengal Tiger',
    icon: '🐯',
    cost: 360,
    appeal: 42,
    dailyFoodCost: 20,
    preferredBiome: '清涼水池 + 茂密樹林',
    description: '罕見熱愛游泳的大型貓科猛獸，橘黑斑紋霸氣絕倫！',
    habit: '在水池中暢游降溫、於樹林陰影中無聲巡邏',
    diet: { name: '整塊厚切鮮牛肉', icon: '🥩', cost: 16, desc: '帶筋鮮嫩黃牛肉，維持猛虎結實肌肉與奔馳速度' },
    minPenTiles: 8,
    favoriteTiles: [TILE_WATER, TILE_TREE_PINE],
    specialAction: { name: '深水潛獵突襲', icon: '🌊', desc: '跳入水池露出霸氣眼神，激起全場驚呼聲' },
    soundType: 'roar'
  },
  animal_polar_bear: {
    type: 'animal_polar_bear',
    name: '北極熊',
    enName: 'Polar Bear',
    icon: '🐻‍❄️',
    cost: 480,
    appeal: 50,
    dailyFoodCost: 26,
    preferredBiome: '極地冰原 + 大片水池',
    description: '冰原上的白色巨無霸，厚實白毛與巨大肉掌超級吸睛！',
    habit: '在雪地上打滾拍肚皮、跳入冷冽池水潛游',
    diet: { name: '阿拉斯加肥美鮭魚', icon: '🐟', cost: 19, desc: '肥美肥厚的大鮭魚，提供抵禦寒冷的優質脂肪' },
    minPenTiles: 8,
    favoriteTiles: [TILE_ICE, TILE_WATER],
    specialAction: { name: '大雪球推推樂', icon: '❄️', desc: '在冰磚上推動雪球滑行，呆萌大身軀引發全場歡笑' },
    soundType: 'splash'
  },
  animal_kangaroo: {
    type: 'animal_kangaroo',
    name: '紅袋鼠',
    enName: 'Red Kangaroo',
    icon: '🦘',
    cost: 240,
    appeal: 28,
    dailyFoodCost: 11,
    preferredBiome: '稀樹沙漠 + 寬廣草地',
    description: '澳洲跳躍健將，充滿肌肉線條與極具活力的彈跳步態！',
    habit: '長距離連續彈跳、站立觀察遊客並展示育兒袋',
    diet: { name: '甜燕麥與苜蓿草捆', icon: '🌾', cost: 8, desc: '乾燥甜燕麥與頂級紫花苜蓿草捆，富含礦物質' },
    minPenTiles: 6,
    favoriteTiles: [TILE_SAVANNAH, TILE_GRASS],
    specialAction: { name: '特技大跳躍', icon: '🦘', desc: '連續大角度後空翻彈跳，展示驚人的腿部彈跳力' },
    soundType: 'squeak'
  },
  animal_crocodile: {
    type: 'animal_crocodile',
    name: '尼羅鱷',
    enName: 'Nile Crocodile',
    icon: '🐊',
    cost: 310,
    appeal: 34,
    dailyFoodCost: 15,
    preferredBiome: '大片水池 + 泥灘沙漠',
    description: '史前活化石霸主，冷血沉靜卻擁有極具爆發力的咬合力！',
    habit: '在岸邊張嘴曬太陽進行體溫調節、只露雙眼浮於水面',
    diet: { name: '全禽生肉巨塊', icon: '🍗', cost: 13, desc: '帶骨禽肉大塊，滿足鱷魚強悍的撕裂進食本能' },
    minPenTiles: 6,
    favoriteTiles: [TILE_WATER, TILE_SAVANNAH],
    specialAction: { name: '死亡翻滾擺尾', icon: '🐊', desc: '在水中展現震撼的旋轉翻滾，驚險刺激程度五顆星' },
    soundType: 'roar'
  },
  animal_sea_lion: {
    type: 'animal_sea_lion',
    name: '加州海獅',
    enName: 'California Sea Lion',
    icon: '🦭',
    cost: 260,
    appeal: 30,
    dailyFoodCost: 13,
    preferredBiome: '清涼水池 + 岸邊冰原',
    description: '海洋馬戲巨星，性情親人活潑，喜歡與觀眾掌聲互動！',
    habit: '在水面旋轉翻騰、爬上岸邊岩石拍打胸鰭大聲叫喚',
    diet: { name: '活跳跳小秋刀魚', icon: '🐟', cost: 10, desc: '當天現撈的銀白秋刀魚與烏賊切片' },
    minPenTiles: 6,
    favoriteTiles: [TILE_WATER, TILE_ICE],
    specialAction: { name: '頂球拍鰭鼓掌', icon: '🎪', desc: '用鼻尖頂球平衡並拍手致敬，觀眾爆發熱烈掌聲' },
    soundType: 'splash'
  },
  animal_peacock: {
    type: 'animal_peacock',
    name: '綠孔雀',
    enName: 'Green Peacock',
    icon: '🦚',
    cost: 210,
    appeal: 27,
    dailyFoodCost: 7,
    preferredBiome: '粉紅櫻花 + 翠綠竹林',
    description: '百鳥之王的美麗化身，尾羽流光溢彩，宛若寶石！',
    habit: '昂首闊步在樹下散步、向同伴展示華美無比的屏羽',
    diet: { name: '綜合野莓穀果粒', icon: '🌰', cost: 6, desc: '葵花籽、南瓜子與野生藍莓凍乾混合穀料' },
    minPenTiles: 4,
    favoriteTiles: [TILE_TREE_CHERRY, TILE_BAMBOO],
    specialAction: { name: '萬紫千紅大開屏', icon: '✨', desc: '優雅展開五彩斑斕的孔雀屏羽，引發全園拍照狂潮' },
    soundType: 'bird'
  },
  animal_zebra: {
    type: 'animal_zebra',
    name: '平原斑馬',
    enName: 'Plains Zebra',
    icon: '🦓',
    cost: 250,
    appeal: 29,
    dailyFoodCost: 12,
    preferredBiome: '稀樹沙漠 + 寬闊草地',
    description: '黑白斑紋極具視覺衝擊力，每隻斑馬的斑紋皆是獨一無二！',
    habit: '成群奔馳小跑、互相梳理鬃毛（與長頸鹿同圈有默契加成）',
    diet: { name: '香甜野燕麥草塊', icon: '🌾', cost: 8, desc: '壓製燕麥草塊，纖維豐富且易於腸胃消化' },
    minPenTiles: 6,
    favoriteTiles: [TILE_SAVANNAH, TILE_GRASS],
    specialAction: { name: '草原奔馳小合唱', icon: '🦓', desc: '歡快揚蹄飛馳並發出親切叫聲，激發遊客喜悅' },
    soundType: 'squeak'
  },
  animal_wolf: {
    type: 'animal_wolf',
    name: '北美灰狼',
    enName: 'Timber Wolf',
    icon: '🐺',
    cost: 330,
    appeal: 36,
    dailyFoodCost: 17,
    preferredBiome: '長青松樹 + 寬廣草地',
    description: '神秘忠誠的群居掠食者，具有高度嚴謹的狼群社會階級！',
    habit: '狼群並肩巡行、黃昏與夜幕降臨時昂首長嚎',
    diet: { name: '帶肉大牛骨與鮮鹿排', icon: '🍖', cost: 14, desc: '帶有濃郁骨髓的大骨與鮮肉，狼群的最愛' },
    minPenTiles: 7,
    favoriteTiles: [TILE_TREE_PINE, TILE_GRASS],
    specialAction: { name: '月夜群狼長嚎', icon: '🌕', desc: '朝向天空發出悠遠長嚎，夜晚遊客興奮度暴增' },
    soundType: 'howl'
  }
};

export interface Animal {
  id: string;
  type: AnimalType;
  name: string;
  x: number; // grid float coordinates
  y: number;
  hunger: number; // 0 - 100
  happiness: number; // 0 - 100
  energy: number; // 0 - 100
  ageDays: number;
  gender: '♂' | '♀';
  isSleeping: boolean;
  moveCooldown: number;
  dir: number; // 1 = right, -1 = left
  emote?: { text: string; timer: number };
  habitatSuitability?: number; // 0 - 100
}

export interface Guest {
  id: string;
  name: string;
  x: number;
  y: number;
  destX: number;
  destY: number;
  color: string;
  hairColor: string;
  happiness: number; // 0 - 100
  cash: number;
  initialCash: number;
  hunger: number; // 0 - 100 (100 = full, 0 = starving)
  thirst: number; // 0 - 100
  energy: number; // 0 - 100
  favoriteAnimal: AnimalType;
  thoughts: string;
  stayTime: number;
  balloonColor?: string;
  holdingFood?: string;
  isSitting?: boolean;
}

export type StaffType = 'zookeeper' | 'janitor' | 'entertainer';

export interface Staff {
  id: string;
  type: StaffType;
  name: string;
  x: number;
  y: number;
  destX: number;
  destY: number;
  salary: number; // daily
  actionTimer: number;
}

export interface Litter {
  id: string;
  x: number;
  y: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  vy: number;
  life: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  reward: number;
  unlocked: boolean;
  icon: string;
  progressText?: string;
}

export interface DailyReport {
  day: number;
  ticketIncome: number;
  shopIncome: number;
  feedExpenses: number;
  staffExpenses: number;
  marketingExpenses: number;
  netProfit: number;
  visitorsToday: number;
  starRating: number;
}

export type ToolId = 
  | 'inspect'
  | 'demolish'
  | 'path'
  | 'fence'
  | 'water'
  | 'ice'
  | 'bamboo'
  | 'savannah'
  | 'tree_pine'
  | 'tree_cherry'
  | 'bench'
  | 'trash_bin'
  | 'fountain'
  | 'restroom'
  | 'shop_hotdog'
  | 'shop_icecream'
  | 'shop_drinks'
  | 'shop_balloon'
  | AnimalType
  | 'staff_zookeeper'
  | 'staff_janitor'
  | 'staff_entertainer';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  category: 'build' | 'nature' | 'shops' | 'animals' | 'staff' | 'actions';
  cost: number;
  icon: string;
  desc: string;
  requiresEnclosure?: boolean;
}
