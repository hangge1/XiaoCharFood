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
