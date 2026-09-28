import { TILE_FENCE, TILE_WATER, TILE_ICE, TILE_BAMBOO, TILE_SAVANNAH, AnimalType, ANIMAL_CONFIGS } from '../types/game';

export interface EnclosureInfo {
  isEnclosed: boolean;
  tiles: { x: number; y: number }[];
  size: number;
  waterCount: number;
  iceCount: number;
  bambooCount: number;
  savannahCount: number;
  treeCount: number;
}

export interface HabitatEvaluation {
  score: number; // 0 - 100
  isSufficient: boolean;
  feedback: string;
}

/**
 * Flood fill to check if grid(x,y) is enclosed by fences
 */
export function checkEnclosure(
  grid: number[][],
  cols: number,
  rows: number,
  startX: number,
  startY: number
): EnclosureInfo {
  if (grid[startY]?.[startX] === TILE_FENCE) {
    return {
      isEnclosed: false,
      tiles: [],
      size: 0,
      waterCount: 0,
      iceCount: 0,
      bambooCount: 0,
      savannahCount: 0,
      treeCount: 0
    };
  }

  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue: [number, number][] = [[startX, startY]];
  visited[startY][startX] = true;

  const tiles: { x: number; y: number }[] = [];
  let reachedEdge = false;
  let waterCount = 0;
  let iceCount = 0;
  let bambooCount = 0;
  let savannahCount = 0;
  let treeCount = 0;

  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    tiles.push({ x: cx, y: cy });

    const tileType = grid[cy][cx];
    if (tileType === TILE_WATER) waterCount++;
    if (tileType === TILE_ICE) iceCount++;
    if (tileType === TILE_BAMBOO) bambooCount++;
    if (tileType === TILE_SAVANNAH) savannahCount++;
    if (tileType === 7 || tileType === 8) treeCount++;

    if (cx === 0 || cx === cols - 1 || cy === 0 || cy === rows - 1) {
      reachedEdge = true;
    }

    const dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0]
    ];

    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        if (!visited[ny][nx]) {
          if (grid[ny][nx] !== TILE_FENCE) {
            visited[ny][nx] = true;
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  return {
    isEnclosed: !reachedEdge && tiles.length >= 2,
    tiles,
    size: tiles.length,
    waterCount,
    iceCount,
    bambooCount,
    savannahCount,
    treeCount
  };
}

/**
 * Evaluates habitat suitability score and provides specific feedback
 */
export function evaluateHabitat(animalType: AnimalType, enc: EnclosureInfo): HabitatEvaluation {
  if (!enc.isEnclosed) {
    return { score: 0, isSufficient: false, feedback: '尚未形成封閉圍欄區域！' };
  }

  const cfg = ANIMAL_CONFIGS[animalType];
  let score = 40; // Base score for being inside a fence
  const issues: string[] = [];

  // Check space
  if (enc.size < cfg.minPenTiles) {
    issues.push(`空間過於擁擠 (目前 ${enc.size} 格，建議 ${cfg.minPenTiles} 格以上)`);
  } else if (enc.size >= cfg.minPenTiles + 4) {
    score += 15;
  } else {
    score += 5;
  }

  // Check species-specific biomes
  switch (animalType) {
    case 'animal_lion':
      if (enc.savannahCount >= 2) score += 25;
      else issues.push('缺乏乾燥的稀樹沙漠生境');
      break;

    case 'animal_penguin':
      if (enc.waterCount >= 1 && enc.iceCount >= 1) score += 35;
      else {
        if (enc.waterCount < 1) issues.push('需要清涼水池游泳');
        if (enc.iceCount < 1) issues.push('需要極地冰原滑行');
      }
      break;

    case 'animal_panda':
      if (enc.bambooCount >= 2) score += 30;
      else issues.push('急需更多翠綠竹林供其進食與翻滾');
      if (enc.treeCount >= 1) score += 10;
      break;

    case 'animal_monkey':
      if (enc.treeCount >= 2) score += 35;
      else issues.push('需要種植松樹或櫻花樹供其攀爬');
      break;

    case 'animal_elephant':
      if (enc.waterCount >= 2) score += 25;
      else issues.push('需要足夠大片水池給大象沖涼噴水');
      if (enc.size < 10) issues.push('亞洲象需要寬闊的活動範圍');
      break;

    case 'animal_giraffe':
      if (enc.savannahCount >= 2) score += 20;
      if (enc.treeCount >= 1) score += 15;
      else issues.push('需要搭配高聳樹木以供覓食高枝綠葉');
      break;

    case 'animal_flamingo':
      if (enc.waterCount >= 2) score += 35;
      else issues.push('極度喜愛淺水池沼，請鋪設更多水池');
      break;

    case 'animal_koala':
      if (enc.treeCount >= 2) score += 35;
      else issues.push('無尾熊需要大量樹木以供睡覺棲息');
      break;

    case 'animal_tiger':
      if (enc.waterCount >= 1) score += 20;
      else issues.push('孟加拉虎熱愛游泳，渴望水池');
      if (enc.treeCount >= 1) score += 15;
      break;

    case 'animal_polar_bear':
      if (enc.iceCount >= 2 && enc.waterCount >= 1) score += 35;
      else {
        if (enc.iceCount < 2) issues.push('極地冰磚數量不足');
        if (enc.waterCount < 1) issues.push('需要深水池以供潛游抓魚');
      }
      break;

    case 'animal_kangaroo':
      if (enc.savannahCount >= 2) score += 25;
      else issues.push('需要沙漠/乾燥地面以供長途彈跳');
      break;

    case 'animal_crocodile':
      if (enc.waterCount >= 2) score += 25;
      else issues.push('尼羅鱷需要深水池以潛伏');
      if (enc.savannahCount >= 1) score += 10;
      break;

    case 'animal_sea_lion':
      if (enc.waterCount >= 2) score += 30;
      else issues.push('加州海獅需要寬敞水池供其翻騰');
      if (enc.iceCount >= 1) score += 10;
      break;

    case 'animal_peacock':
      if (enc.treeCount >= 1 && enc.bambooCount >= 1) score += 35;
      else issues.push('偏好櫻花樹林與翠綠竹林相間的雅致庭園');
      break;

    case 'animal_zebra':
      if (enc.savannahCount >= 2) score += 25;
      else issues.push('需要非洲稀樹草原地塊奔馳');
      break;

    case 'animal_wolf':
      if (enc.treeCount >= 2) score += 25;
      else issues.push('需要長青松樹林以供隱匿與巡邏');
      if (enc.size >= 8) score += 10;
      break;
  }

  const finalScore = Math.min(100, Math.max(25, score));
  const isSufficient = finalScore >= 60;
  const feedback = issues.length > 0 ? issues.join('，') : '✨ 生境極佳！動物感到無比舒適與幸福！';

  return {
    score: finalScore,
    isSufficient,
    feedback
  };
}
