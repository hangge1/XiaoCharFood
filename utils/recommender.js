const store = require('./store.js')

const RECIPES = [
  {
    name: '番茄牛肉豆腐汤',
    minutes: 30,
    mealTypes: ['晚餐', '午餐'],
    tags: ['清淡', '家常', '酸甜', '少油', '减肥'],
    ingredients: ['番茄', '牛肉', '豆腐', '葱'],
    reason: '最近外食偏多时，汤菜更轻松，也适合晚饭。'
  },
  {
    name: '香菇青菜炒蛋',
    minutes: 20,
    mealTypes: ['早餐', '午餐', '晚餐'],
    tags: ['省事', '清淡', '蔬菜', '高蛋白'],
    ingredients: ['香菇', '青菜', '鸡蛋'],
    reason: '做法简单，能补一顿蔬菜。'
  },
  {
    name: '鸡胸肉玉米沙拉',
    minutes: 18,
    mealTypes: ['午餐', '晚餐'],
    tags: ['省事', '清淡', '不油', '减肥', '增肌', '高蛋白'],
    ingredients: ['鸡胸肉', '玉米', '生菜', '鸡蛋'],
    reason: '不需要复杂烹饪，适合想清爽一点的时候。'
  },
  {
    name: '土豆胡萝卜炖牛腩',
    minutes: 45,
    mealTypes: ['午餐', '晚餐'],
    tags: ['家常', '周末', '饱腹', '浓郁', '增肌'],
    ingredients: ['牛腩', '土豆', '胡萝卜'],
    reason: '适合有时间好好做一顿的晚上。'
  },
  {
    name: '虾仁西兰花',
    minutes: 22,
    mealTypes: ['午餐', '晚餐'],
    tags: ['清淡', '蔬菜', '快手', '减肥', '增肌', '高蛋白'],
    ingredients: ['虾仁', '西兰花', '蒜'],
    reason: '快手、清爽，也不容易和重口味餐重复。'
  },
  {
    name: '青椒肉丝盖饭',
    minutes: 25,
    mealTypes: ['午餐', '晚餐'],
    tags: ['省事', '家常', '下饭', '微辣'],
    ingredients: ['青椒', '猪肉', '米饭'],
    reason: '适合下班后快速解决一顿正餐。'
  },
  {
    name: '鸡蛋火腿三明治',
    minutes: 12,
    mealTypes: ['早餐', '加餐'],
    tags: ['省事', '快手', '饱腹', '高蛋白'],
    ingredients: ['吐司', '鸡蛋', '火腿', '生菜'],
    reason: '适合早上不想开火太久，也能吃得有预期。'
  },
  {
    name: '酸辣土豆丝',
    minutes: 15,
    mealTypes: ['午餐', '晚餐'],
    tags: ['省事', '酸辣', '下饭', '素菜'],
    ingredients: ['土豆', '青椒', '醋'],
    reason: '快手下饭，适合已有土豆时快速加一道菜。'
  },
  {
    name: '无糖酸奶燕麦碗',
    minutes: 8,
    mealTypes: ['早餐', '加餐'],
    tags: ['清淡', '省事', '减肥', '少油'],
    ingredients: ['酸奶', '燕麦', '蓝莓', '坚果'],
    reason: '不用开火，适合想吃轻一点的早晨。'
  },
  {
    name: '牛肉藜麦饭',
    minutes: 28,
    mealTypes: ['午餐', '晚餐'],
    tags: ['增肌', '高蛋白', '饱腹', '少油'],
    ingredients: ['牛肉', '藜麦', '西兰花', '鸡蛋'],
    reason: '蛋白质和主食都比较完整，适合想吃扎实一点的时候。'
  },
  {
    name: '紫菜虾皮蛋花汤',
    minutes: 10,
    mealTypes: ['晚餐', '加餐'],
    tags: ['清淡', '快手', '少油'],
    ingredients: ['紫菜', '虾皮', '鸡蛋'],
    reason: '很快能补一道清淡汤，不会增加太多准备负担。'
  },
  {
    name: '西红柿炒鸡蛋',
    minutes: 15,
    mealTypes: ['午餐', '晚餐'],
    tags: ['家常', '酸甜', '快手', '下饭'],
    ingredients: ['西红柿', '鸡蛋', '葱'],
    reason: '经典家常菜，食材简单，适合不知道做什么的时候兜底。'
  },
  {
    name: '麻婆豆腐',
    minutes: 20,
    mealTypes: ['午餐', '晚餐'],
    tags: ['微辣', '下饭', '家常'],
    ingredients: ['豆腐', '肉末', '豆瓣酱', '花椒'],
    reason: '重口下饭，适合想吃点有味道但不想复杂备菜的时候。'
  },
  {
    name: '宫保鸡丁',
    minutes: 28,
    mealTypes: ['午餐', '晚餐'],
    tags: ['酸甜', '微辣', '下饭', '家常'],
    ingredients: ['鸡胸肉', '花生', '黄瓜', '胡萝卜'],
    reason: '口味丰富，适合想吃酸甜微辣的一餐。'
  },
  {
    name: '鱼香肉丝',
    minutes: 30,
    mealTypes: ['午餐', '晚餐'],
    tags: ['酸甜', '微辣', '下饭'],
    ingredients: ['猪肉', '木耳', '胡萝卜', '青椒'],
    reason: '下饭且食材常见，适合家里有青椒胡萝卜时安排。'
  },
  {
    name: '可乐鸡翅',
    minutes: 35,
    mealTypes: ['午餐', '晚餐'],
    tags: ['甜口', '家常', '饱腹'],
    ingredients: ['鸡翅', '可乐', '姜'],
    reason: '适合想吃带点仪式感但做法稳定的一餐。'
  },
  {
    name: '红烧肉',
    minutes: 60,
    mealTypes: ['午餐', '晚餐'],
    tags: ['浓郁', '家常', '饱腹'],
    ingredients: ['五花肉', '冰糖', '姜', '葱'],
    reason: '适合周末或时间充裕时做一顿更有满足感的饭。'
  },
  {
    name: '清蒸鲈鱼',
    minutes: 25,
    mealTypes: ['午餐', '晚餐'],
    tags: ['清淡', '少油', '高蛋白', '减肥'],
    ingredients: ['鲈鱼', '葱', '姜', '蒸鱼豉油'],
    reason: '少油高蛋白，适合想吃清爽但正式一点的晚饭。'
  },
  {
    name: '白灼虾',
    minutes: 15,
    mealTypes: ['午餐', '晚餐'],
    tags: ['清淡', '快手', '高蛋白', '增肌', '减肥'],
    ingredients: ['虾', '姜', '葱'],
    reason: '准备简单，蛋白质足，适合减脂或增肌需求。'
  },
  {
    name: '蒜蓉西兰花',
    minutes: 12,
    mealTypes: ['午餐', '晚餐'],
    tags: ['清淡', '蔬菜', '快手', '减肥', '少油'],
    ingredients: ['西兰花', '蒜'],
    reason: '快手补蔬菜，可以搭配肉菜或主食。'
  },
  {
    name: '蚝油生菜',
    minutes: 10,
    mealTypes: ['午餐', '晚餐'],
    tags: ['清淡', '蔬菜', '快手', '少油'],
    ingredients: ['生菜', '蚝油', '蒜'],
    reason: '十分钟能补一道绿叶菜，适合工作日。'
  },
  {
    name: '冬瓜丸子汤',
    minutes: 30,
    mealTypes: ['午餐', '晚餐'],
    tags: ['清淡', '汤菜', '家常', '少油'],
    ingredients: ['冬瓜', '肉末', '葱', '姜'],
    reason: '清淡有汤，适合想缓一缓油腻感的时候。'
  },
  {
    name: '萝卜牛腩汤',
    minutes: 55,
    mealTypes: ['午餐', '晚餐'],
    tags: ['汤菜', '饱腹', '家常', '增肌'],
    ingredients: ['牛腩', '白萝卜', '姜', '葱'],
    reason: '适合天气凉或想吃热乎一点的时候。'
  },
  {
    name: '葱油拌面',
    minutes: 15,
    mealTypes: ['早餐', '午餐', '晚餐'],
    tags: ['省事', '快手', '主食'],
    ingredients: ['面条', '小葱', '生抽'],
    reason: '食材少、速度快，适合不想大动干戈的一餐。'
  },
  {
    name: '阳春面',
    minutes: 12,
    mealTypes: ['早餐', '加餐', '晚餐'],
    tags: ['清淡', '省事', '主食'],
    ingredients: ['面条', '小葱', '鸡蛋'],
    reason: '清淡省事，适合早餐或晚上简单吃一点。'
  },
  {
    name: '皮蛋瘦肉粥',
    minutes: 35,
    mealTypes: ['早餐', '晚餐'],
    tags: ['清淡', '家常', '暖胃'],
    ingredients: ['大米', '皮蛋', '瘦肉', '姜'],
    reason: '适合想吃热乎、清淡、好消化的时候。'
  },
  {
    name: '小米南瓜粥',
    minutes: 30,
    mealTypes: ['早餐', '加餐'],
    tags: ['清淡', '暖胃', '减肥'],
    ingredients: ['小米', '南瓜'],
    reason: '适合早餐提前煮好，也适合想吃轻一点的时候。'
  },
  {
    name: '鸡蛋灌饼',
    minutes: 18,
    mealTypes: ['早餐', '加餐'],
    tags: ['饱腹', '省事', '主食'],
    ingredients: ['面饼', '鸡蛋', '生菜', '火腿'],
    reason: '早餐饱腹感强，也方便根据家里食材替换。'
  },
  {
    name: '青椒土豆片',
    minutes: 18,
    mealTypes: ['午餐', '晚餐'],
    tags: ['家常', '素菜', '省事'],
    ingredients: ['土豆', '青椒', '蒜'],
    reason: '家里有土豆和青椒时，很适合做一道快手素菜。'
  },
  {
    name: '地三鲜',
    minutes: 30,
    mealTypes: ['午餐', '晚餐'],
    tags: ['家常', '下饭', '素菜'],
    ingredients: ['茄子', '土豆', '青椒'],
    reason: '经典下饭素菜，适合想吃有满足感的家常味。'
  },
  {
    name: '肉末茄子',
    minutes: 25,
    mealTypes: ['午餐', '晚餐'],
    tags: ['家常', '下饭', '浓郁'],
    ingredients: ['茄子', '肉末', '蒜'],
    reason: '很下饭，适合家里有茄子又想吃热菜的时候。'
  },
  {
    name: '手撕包菜',
    minutes: 12,
    mealTypes: ['午餐', '晚餐'],
    tags: ['快手', '蔬菜', '微辣', '下饭'],
    ingredients: ['包菜', '干辣椒', '蒜'],
    reason: '快手蔬菜菜，适合补一盘有锅气的家常味。'
  },
  {
    name: '孜然牛肉',
    minutes: 25,
    mealTypes: ['午餐', '晚餐'],
    tags: ['增肌', '高蛋白', '重口', '下饭'],
    ingredients: ['牛肉', '洋葱', '孜然'],
    reason: '蛋白质足、味道明确，适合想吃香一点的晚饭。'
  },
  {
    name: '黑椒牛柳',
    minutes: 25,
    mealTypes: ['午餐', '晚餐'],
    tags: ['高蛋白', '增肌', '下饭'],
    ingredients: ['牛肉', '洋葱', '彩椒', '黑胡椒'],
    reason: '适合增肌或想吃肉的一餐，搭配米饭也方便。'
  },
  {
    name: '照烧鸡腿饭',
    minutes: 30,
    mealTypes: ['午餐', '晚餐'],
    tags: ['饱腹', '家常', '便当'],
    ingredients: ['鸡腿', '米饭', '西兰花', '胡萝卜'],
    reason: '一碗饭解决主食、肉和蔬菜，适合提前备餐。'
  },
  {
    name: '鸡丝凉面',
    minutes: 25,
    mealTypes: ['午餐', '晚餐'],
    tags: ['清爽', '省事', '高蛋白'],
    ingredients: ['面条', '鸡胸肉', '黄瓜', '芝麻酱'],
    reason: '适合天气热或想吃清爽主食的时候。'
  },
  {
    name: '番茄鸡蛋面',
    minutes: 15,
    mealTypes: ['早餐', '午餐', '晚餐'],
    tags: ['快手', '酸甜', '家常', '主食'],
    ingredients: ['面条', '番茄', '鸡蛋', '葱'],
    reason: '食材常见、速度快，适合不知道吃什么时兜底。'
  },
  {
    name: '香煎豆腐',
    minutes: 18,
    mealTypes: ['午餐', '晚餐'],
    tags: ['家常', '素菜', '高蛋白'],
    ingredients: ['豆腐', '鸡蛋', '葱'],
    reason: '豆腐也能有饱腹感，适合想少吃肉的一餐。'
  },
  {
    name: '凉拌黄瓜木耳',
    minutes: 12,
    mealTypes: ['午餐', '晚餐', '加餐'],
    tags: ['清爽', '减肥', '少油', '蔬菜'],
    ingredients: ['黄瓜', '木耳', '蒜', '醋'],
    reason: '清爽少油，适合搭配较重口的主菜。'
  },
  {
    name: '银耳雪梨羹',
    minutes: 40,
    mealTypes: ['加餐', '早餐'],
    tags: ['甜口', '清淡', '加餐'],
    ingredients: ['银耳', '雪梨', '枸杞'],
    reason: '适合当作温和加餐，提前煮好更省心。'
  }
]

const DAY_SLOTS = [
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' },
  { key: 'snack', label: '加餐' }
]

function includesAny(source, targets) {
  return targets.some(target => source.includes(target))
}

function parseKeywords(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return `${value || ''}`
    .split(/[、,，\s]+/)
    .map(item => item.trim())
    .filter(Boolean)
}

function normalizeGoalKeywords(keywords) {
  const items = parseKeywords(keywords)
  const expanded = []
  items.forEach(item => {
    expanded.push(item)
    if (item === '减脂' || item === '瘦身') expanded.push('减肥', '少油', '清淡')
    if (item === '健身') expanded.push('增肌', '高蛋白')
    if (item === '低脂') expanded.push('少油', '减肥')
    if (item === '蛋白') expanded.push('高蛋白')
    if (item === '川菜' || item === '辣' || item === '重口') expanded.push('微辣', '下饭', '重口')
    if (item === '粤菜') expanded.push('清淡', '少油')
    if (item === '家常菜') expanded.push('家常')
    if (item === '清爽') expanded.push('清淡', '少油')
    if (item === '备餐') expanded.push('便当', '省事')
  })
  return Array.from(new Set(expanded))
}

function suggestRecipes(input = []) {
  const options = Array.isArray(input) ? { sceneTags: input } : input
  const sceneTags = options.sceneTags || []
  const mealType = options.mealType || ''
  const tasteKeywords = parseKeywords(options.tasteKeywords)
  const ingredientKeywords = parseKeywords(options.ingredientKeywords)
  const preferences = store.getPreferences()
  const recentNames = store.getRecentMeals(7).map(meal => `${meal.title} ${meal.note}`)
  const avoidRepeat = sceneTags.includes('别重复')
  const wantQuick = sceneTags.includes('省事')
  const wantLight = sceneTags.includes('清淡一点')
  const maxMinutes = Number(preferences.maxCookMinutes) || 30

  const ranked = RECIPES.map(recipe => {
    let score = 0
    const recentlyHad = recentNames.some(name => name.includes(recipe.name))
    const ingredientHits = ingredientKeywords.filter(keyword => recipe.ingredients.some(item => item.includes(keyword) || keyword.includes(item)))
    const tasteHits = tasteKeywords.filter(keyword => recipe.tags.some(item => item.includes(keyword) || keyword.includes(item)))

    if (wantQuick && recipe.minutes <= maxMinutes) score += 3
    if (wantLight && includesAny(recipe.tags, ['清淡', '蔬菜', '不油'])) score += 3
    if (mealType && recipe.mealTypes.includes(mealType)) score += 4
    if (sceneTags.includes('今晚') && recipe.mealTypes.includes('晚餐')) score += 1
    if (includesAny(recipe.tags, preferences.tasteTags || [])) score += 1
    score += ingredientHits.length * 4
    score += tasteHits.length * 3
    if (avoidRepeat && recentlyHad) score -= 5

    const reasonParts = []
    if (mealType && recipe.mealTypes.includes(mealType)) reasonParts.push(`适合${mealType}`)
    if (ingredientHits.length) reasonParts.push(`用得上：${ingredientHits.join('、')}`)
    if (tasteHits.length) reasonParts.push(`符合口味：${tasteHits.join('、')}`)

    return Object.assign({}, recipe, {
      score,
      recentlyHad,
      displayReason: [
        recentlyHad ? '最近吃过类似的。' : '',
        reasonParts.length ? `${reasonParts.join('，')}。` : '',
        recipe.reason
      ].join('')
    })
  })

  return ranked
    .sort((a, b) => b.score - a.score || a.minutes - b.minutes)
    .slice(0, 3)
}

function scoreRecipeForSlot(recipe, slotLabel, keywords, recentNames) {
  let score = 0
  const recentlyHad = recentNames.some(name => name.includes(recipe.name))
  const ingredientHits = keywords.filter(keyword => recipe.ingredients.some(item => item.includes(keyword) || keyword.includes(item)))
  const tagHits = keywords.filter(keyword => recipe.tags.some(item => item.includes(keyword) || keyword.includes(item)))

  if (recipe.mealTypes.includes(slotLabel)) score += 6
  score += ingredientHits.length * 5
  score += tagHits.length * 4
  if (keywords.includes('省事') || keywords.includes('快手')) {
    if (recipe.minutes <= 20) score += 3
  }
  if (keywords.includes('减肥') || keywords.includes('少油')) {
    if (recipe.tags.includes('清淡') || recipe.tags.includes('少油')) score += 3
  }
  if (keywords.includes('增肌') || keywords.includes('高蛋白')) {
    if (recipe.tags.includes('高蛋白') || recipe.tags.includes('增肌')) score += 3
  }
  if (recentlyHad) score -= 4

  return {
    recipe,
    score,
    recentlyHad,
    ingredientHits,
    tagHits
  }
}

function suggestDayMenu(keywordText = '') {
  const keywords = normalizeGoalKeywords(keywordText)
  const recentNames = store.getRecentMeals(7).map(meal => `${meal.title} ${meal.note}`)
  const selectedNames = new Set()

  const meals = DAY_SLOTS.map(slot => {
    const ranked = RECIPES
      .filter(recipe => recipe.mealTypes.includes(slot.label))
      .map(recipe => scoreRecipeForSlot(recipe, slot.label, keywords, recentNames))
      .sort((a, b) => b.score - a.score || a.recipe.minutes - b.recipe.minutes)

    const picked = ranked.find(item => !selectedNames.has(item.recipe.name)) || ranked[0]
    selectedNames.add(picked.recipe.name)
    const reasons = []
    if (picked.ingredientHits.length) reasons.push(`用得上：${picked.ingredientHits.join('、')}`)
    if (picked.tagHits.length) reasons.push(`匹配：${picked.tagHits.join('、')}`)
    if (picked.recentlyHad) reasons.push('最近吃过类似的，可按心情替换')
    if (!reasons.length) reasons.push(picked.recipe.reason)

    return {
      slot: slot.label,
      name: picked.recipe.name,
      minutes: picked.recipe.minutes,
      ingredients: picked.recipe.ingredients,
      reason: reasons.join('；'),
      tags: picked.recipe.tags
    }
  })

  const ingredientMap = {}
  meals.forEach(meal => {
    meal.ingredients.forEach(item => {
      ingredientMap[item] = (ingredientMap[item] || 0) + 1
    })
  })

  return {
    keywords,
    meals,
    shoppingList: Object.keys(ingredientMap).map(name => ({
      name,
      count: ingredientMap[name]
    })),
    note: keywords.length
      ? `已按「${keywords.slice(0, 6).join('、')}」综合推荐。`
      : '没有输入关键词时，会默认推荐一套省心家常菜单。'
  }
}

module.exports = {
  RECIPES,
  suggestRecipes,
  suggestDayMenu
}
