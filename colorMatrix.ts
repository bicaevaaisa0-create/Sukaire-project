import { EmotionKey, ColorDefinition } from '../types';

export const COLOR_MATRIX: Record<EmotionKey, ColorDefinition> = {
  calm: {
    nameRu: 'Спокойствие',
    primaryHex: '#A8D0E6',
    secondaryHex: '#E2E8F0',
    accentHex: '#C4D7D1',
    bgGradient: 'radial-gradient(130% 130% at 50% 20%, #E8F4F8 0%, #D4E9F2 45%, #E2E8F0 100%)',
    textColor: '#1E293B',
    particleColor: 'rgba(168, 208, 230, 0.65)',
    grainIntensity: 0.1,
    blurAmount: '24px',
    primaryColorsRu: 'Нежный голубой + серебристый',
    undertonesRu: 'Молочный, туманный, шалфейный',
    saturationRu: 'Низкая–средняя, мягкие акварельные переходы',
    atmosphereRu: 'Большой объём «воздуха», медленные слои, размытые края, мягкий свет',
    promptExample: 'Soft abstract emotional landscape, delicate pastel blue and silver gradients, milky fog layers, sage green accents, large empty space, slow gentle forms, soft diffused light, dreamy and airy atmosphere, digital art, watercolor texture --ar 16:9',
    kazakhSymbolism: 'Көк (голубой/синий) — священный символ чистого неба, свободы, Тенгри, мира и душевного равновесия.',
    chineseSymbolism: 'Металл и Вода — чистота, тишина, глубокая внутренняя ясность.'
  },
  hope: {
    nameRu: 'Надежда',
    primaryHex: '#86EFAC',
    secondaryHex: '#FEF08A',
    accentHex: '#FBCFE8',
    bgGradient: 'radial-gradient(120% 120% at 40% 15%, #F0FDF4 0%, #DCFCE7 40%, #FEF9C3 80%, #FFF1F2 100%)',
    textColor: '#14532D',
    particleColor: 'rgba(134, 239, 172, 0.7)',
    grainIntensity: 0.15,
    blurAmount: '18px',
    primaryColorsRu: 'Зелёный + белый + мягкий жёлтый',
    undertonesRu: 'Персиковый, светлый циан, розово-белый',
    saturationRu: 'Средняя, чистые раскрывающиеся линии',
    atmosphereRu: 'Раскрытие композиции, прорывающийся сквозь тучи утренний свет',
    promptExample: 'Abstract digital painting of hope, soft green and peach tones with warm golden light breaking through, clean expanding lines, light cyan and rose-white highlights, sense of opening and renewal, gentle glow, ethereal atmosphere',
    kazakhSymbolism: 'Жасыл (зеленый) — весна, обновление земли, юность и расцвет жизни.',
    chineseSymbolism: 'Дерево (Му) — пробуждение природы, росток, пробивающийся к свету.'
  },
  calm_hope: {
    nameRu: 'Спокойствие + Надежда',
    primaryHex: '#95C1AE',
    secondaryHex: '#FDE68A',
    accentHex: '#BAE6FD',
    bgGradient: 'radial-gradient(130% 130% at 50% 30%, #ECFDF5 0%, #D1FAE5 35%, #FEF3C7 70%, #E0F2FE 100%)',
    textColor: '#064E3B',
    particleColor: 'rgba(149, 193, 174, 0.75)',
    grainIntensity: 0.12,
    blurAmount: '20px',
    primaryColorsRu: 'Зелёный + мягкий золотистый + голубой',
    undertonesRu: 'Лес, листва, солнечные блики, порхающие искры',
    saturationRu: 'Средняя, естественная гармония',
    atmosphereRu: 'Живой, дышащий сад, никого вокруг, тихий шелест, волшебство, отсутствие суеты',
    promptExample: 'Magical forest clearing at golden hour, soft green foliage, sunlight filtering through leaves, butterflies and tiny glowing fairies, no people, peaceful empty fields and trees, dreamy atmosphere, pastel and soft golden tones, digital art, highly detailed',
    kazakhSymbolism: 'Ақ жол (светлый путь) и Көк-Жасыл — гармония бескрайней степи и лазурного неба.',
    chineseSymbolism: 'Дерево и Вода — мягкое течение жизни, питающее новый рост.'
  },
  joy: {
    nameRu: 'Радость',
    primaryHex: '#FBBF24',
    secondaryHex: '#FB923C',
    accentHex: '#FEF08A',
    bgGradient: 'radial-gradient(130% 130% at 60% 20%, #FFFBEB 0%, #FEF3C7 35%, #FED7AA 75%, #FDE68A 100%)',
    textColor: '#78350F',
    particleColor: 'rgba(251, 191, 36, 0.8)',
    grainIntensity: 0.18,
    blurAmount: '16px',
    primaryColorsRu: 'Яркий жёлтый + тёплый оранжевый',
    undertonesRu: 'Золотые блики, искры, мягкий фонарный свет',
    saturationRu: 'Высокая, вибрирующая теплота',
    atmosphereRu: 'Лёгкая вибрация, блики, тепло, вечерний золотой свет старых улочек',
    promptExample: 'Bright joyful abstract composition, vibrant yellow and warm orange with golden sparkles and light flares, energetic soft glow like Italian street lamps at evening, high saturation, playful light particles, digital painting',
    kazakhSymbolism: 'Сары (солнце/золото) — озарение разума, тепло домашнего очага.',
    chineseSymbolism: 'Огонь (Хо) — праздник, тепло сердца, проявленная радость.'
  },
  love: {
    nameRu: 'Любовь / Нежность',
    primaryHex: '#F472B6',
    secondaryHex: '#FB7185',
    accentHex: '#FDF2F8',
    bgGradient: 'radial-gradient(130% 130% at 40% 30%, #FDF2F8 0%, #FCE7F3 40%, #FBCFE8 75%, #FFE4E6 100%)',
    textColor: '#831843',
    particleColor: 'rgba(244, 114, 182, 0.7)',
    grainIntensity: 0.1,
    blurAmount: '22px',
    primaryColorsRu: 'Нежный розовый + малиновый',
    undertonesRu: 'Мягкий градиент, бархатная текстура, розовый кварц',
    saturationRu: 'Средняя, обволакивающая',
    atmosphereRu: 'Плавные текучие формы, тёплое внутреннее свечение, защита и принятие',
    promptExample: 'Soft romantic abstract forms, delicate pink and raspberry gradients, velvet texture, gentle warm glow, smooth flowing shapes, tender and intimate atmosphere, pastel digital art',
    kazakhSymbolism: 'Қызыл (нежный красный/розовый) — искренность, сердечное тепло, забота.',
    chineseSymbolism: 'Огонь сердца — нежность, сопереживание и эмпатия.'
  },
  resolve: {
    nameRu: 'Решимость / Уверенность',
    primaryHex: '#E11D48',
    secondaryHex: '#BE123C',
    accentHex: '#FB7185',
    bgGradient: 'radial-gradient(130% 130% at 50% 20%, #FFF1F2 0%, #FFE4E6 35%, #FECDD3 70%, #FDA4AF 100%)',
    textColor: '#881337',
    particleColor: 'rgba(225, 29, 72, 0.75)',
    grainIntensity: 0.2,
    blurAmount: '14px',
    primaryColorsRu: 'Глубокий тёплый красный (не кричащий)',
    undertonesRu: 'Коралловый, тёплый бордовый, терракота',
    saturationRu: 'Средняя–высокая, выверенная плотность',
    atmosphereRu: 'Чёткие направленные линии, активное контролируемое движение, фокус',
    promptExample: 'Strong abstract composition in deep coral-red and warm burgundy, clear directional lines, controlled energy, confident and focused mood, medium saturation, modern digital painting',
    kazakhSymbolism: 'Қызыл — сила духа, жизненный огонь, смелость в преодолении пути.',
    chineseSymbolism: 'Огонь и Металл — ясность воли, непоколебимость и сила намерения.'
  },
  sadness: {
    nameRu: 'Печаль / Грусть',
    primaryHex: '#64748B',
    secondaryHex: '#3B82F6',
    accentHex: '#818CF8',
    bgGradient: 'radial-gradient(130% 130% at 50% 25%, #F1F5F9 0%, #E2E8F0 40%, #CBD5E1 75%, #BFDBFE 100%)',
    textColor: '#1E293B',
    particleColor: 'rgba(100, 116, 139, 0.65)',
    grainIntensity: 0.22,
    blurAmount: '26px',
    primaryColorsRu: 'Тёмно-синий + приглушённый фиолетовый',
    undertonesRu: 'Холодный, глубокий, акварельно-водянистый',
    saturationRu: 'Низкая–средняя, прозрачная вуаль',
    atmosphereRu: 'Медленное движение, тяжёлые тихие слои, ощущение дождя за окном',
    promptExample: 'Melancholic abstract landscape, deep blue and muted purple tones, heavy slow-moving layers, cold atmosphere, low light, emotional depth, digital art with soft watercolor edges',
    kazakhSymbolism: 'Қара көк — глубина переживания, тихий вечер размышлений.',
    chineseSymbolism: 'Вода (Шуй) — слезы, омовение души, естественный уход в глубину.'
  },
  burnout: {
    nameRu: 'Депрессия / Выгорание',
    primaryHex: '#A8A29E',
    secondaryHex: '#C4B5FD',
    accentHex: '#E7E5E4',
    bgGradient: 'radial-gradient(130% 130% at 50% 20%, #F5F5F4 0%, #E7E5E4 40%, #E2E8F0 70%, #DDD6FE 100%)',
    textColor: '#292524',
    particleColor: 'rgba(168, 162, 158, 0.55)',
    grainIntensity: 0.28,
    blurAmount: '30px',
    primaryColorsRu: 'Тёмно-фиолетовый + пыльный беж + серый',
    undertonesRu: 'Низкая яркость, выцветший холст, сухой песок',
    saturationRu: 'Очень низкая, минимальный контраст',
    atmosphereRu: 'Статичность, большая защитная пустота, замедленный пульс, потребность в покое',
    promptExample: 'Empty static composition, dusty beige, faded purple and grey, very low brightness and saturation, large empty space, almost no movement, washed-out and exhausted atmosphere',
    kazakhSymbolism: 'Сары уайым — глубокая усталость и тяжесть, требующая бережного молчания родного дома.',
    chineseSymbolism: 'Земля без влаги — истощение энергии Ци, призыв остановиться.'
  },
  anxiety: {
    nameRu: 'Тревога',
    primaryHex: '#C084FC',
    secondaryHex: '#F472B6',
    accentHex: '#94A3B8',
    bgGradient: 'radial-gradient(130% 130% at 45% 25%, #FAF5FF 0%, #F3E8FF 35%, #FCE7F3 70%, #E2E8F0 100%)',
    textColor: '#3B0764',
    particleColor: 'rgba(192, 132, 252, 0.65)',
    grainIntensity: 0.35,
    blurAmount: '20px',
    primaryColorsRu: 'Приглушённый лавандовый + холодный розовый + серебристо-серый',
    undertonesRu: 'Лёгкий шум, мелкая зернистость, натянутая струна',
    saturationRu: 'Средняя, трепетная',
    atmosphereRu: 'Вибрация, тугие переплетающиеся линии, нехватка опоры',
    promptExample: 'Anxious abstract scene, muted lavender, cold pink and silver-grey, subtle grain and noise, tight vibrating lines, uneasy atmosphere, soft but tense digital art',
    kazakhSymbolism: 'Түнгі жел (ночной степной ветер) — тревожное предчувствие, поиск тихой юрты.',
    chineseSymbolism: 'Дисбаланс Ветра и Огня — внутреннее беспокойство, требующее заземления в Земле.'
  },
  uncertainty: {
    nameRu: 'Неуверенность',
    primaryHex: '#94A3B8',
    secondaryHex: '#D6D3D1',
    accentHex: '#E2E8F0',
    bgGradient: 'radial-gradient(130% 130% at 50% 30%, #F8FAFC 0%, #F1F5F9 40%, #E7E5E4 75%, #E2E8F0 100%)',
    textColor: '#334155',
    particleColor: 'rgba(148, 163, 184, 0.55)',
    grainIntensity: 0.25,
    blurAmount: '28px',
    primaryColorsRu: 'Серый + приглушённый бежевый',
    undertonesRu: 'Низкая насыщенность, рассеянный туман, неясный берег',
    saturationRu: 'Низкая, полупрозрачная',
    atmosphereRu: 'Размытые границы, отсутствие чёткого фокуса, нерешительный вдох',
    promptExample: 'Blurred uncertain forms, desaturated grey and muted beige, soft unfocused edges, lack of clear center, low contrast, hesitant atmosphere',
    kazakhSymbolism: 'Тұман (туман над равниной) — ожидание восхода солнца.',
    chineseSymbolism: 'Вода и Туман — время не действовать силой, а дать осадку осесть.'
  },
  reboot: {
    nameRu: 'Перезагрузка',
    primaryHex: '#FB7185',
    secondaryHex: '#F59E0B',
    accentHex: '#9333EA',
    bgGradient: 'radial-gradient(130% 130% at 50% 20%, #FFF1F2 0%, #FFE4E6 35%, #FEF3C7 70%, #FAF5FF 100%)',
    textColor: '#4C0519',
    particleColor: 'rgba(251, 113, 133, 0.7)',
    grainIntensity: 0.18,
    blurAmount: '18px',
    primaryColorsRu: 'Тёплый коралловый + мутный янтарный',
    undertonesRu: 'Сдержанный цвет, нарастающий ритм, пробуждающийся пульс',
    saturationRu: 'Средняя, возвращение красок',
    atmosphereRu: 'Дробные края, сгущение света, уверенное внутреннее движение и восстановление',
    promptExample: 'Abstract transition scene, warm coral and amber tones with dark raspberry accents, building rhythm, slightly fragmented edges, emerging light, sense of internal movement and recovery',
    kazakhSymbolism: 'Таң шапағы (первый луч зари) — рождение нового дня после долгой ночи.',
    chineseSymbolism: 'Возвращение Ян — искра после зимней спячки.'
  }
};

export const PSYCHOLOGY_RESOURCES = [
  {
    title: 'Emotional Intelligence',
    author: 'Daniel Goleman',
    desc: 'Фундаментальная работа о роли понимания своих чувств в учебе, мышлении и отношениях.',
    badge: 'Классика'
  },
  {
    title: 'Atlas of the Heart',
    author: 'Brené Brown',
    desc: 'Глубокое картографирование 87 оттенков человеческих эмоций, уязвимости и связи.',
    badge: '87 Эмоций'
  },
  {
    title: 'The Emotional Lives of Teenagers',
    author: 'Lisa Damour',
    desc: 'Как подросткам и студентам справляться со штормом эмоций без стыда и самокритики.',
    badge: 'Для учащихся'
  },
  {
    title: 'The Emotionally Intelligent Teen',
    author: 'Melanie McNally',
    desc: 'Практические техники заземления при перегрузках, дедлайнах и подготовке к экзаменам.',
    badge: 'Практика'
  },
  {
    title: 'Колесо эмоций',
    author: 'Robert Plutchik',
    desc: 'Научная модель взаимодействия первичных и вторичных эмоциональных состояний.',
    badge: 'Теория матрицы'
  },
  {
    title: 'Psychology of Color',
    author: 'Eva Heller',
    desc: 'Масштабное исследование культурных и психофизиологических связей цвета и чувств.',
    badge: 'Хроматика'
  }
];

export const INITIAL_ARCHIVE_ENTRIES = [
  {
    id: 'demo-1',
    timestamp: Date.now() - 86400000 * 5,
    dateString: '5 дней назад',
    rawText: 'Очень боялся зачета по математике. Казалось, что всё забыл, сердце колотилось всю ночь.',
    dominantEmotion: 'anxiety' as EmotionKey,
    secondaryEmotion: 'burnout' as EmotionKey,
    toneScore: 3.4
  },
  {
    id: 'demo-2',
    timestamp: Date.now() - 86400000 * 4,
    dateString: '4 дня назад',
    rawText: 'Сдал на отлично! Устал невероятно, но почувствовал облегчение и маленькую надежду.',
    dominantEmotion: 'hope' as EmotionKey,
    secondaryEmotion: 'calm' as EmotionKey,
    toneScore: 6.8
  },
  {
    id: 'demo-3',
    timestamp: Date.now() - 86400000 * 3,
    dateString: '3 дня назад',
    rawText: 'Просто сидел у окна, слушал дождь и пил чай. Никаких мыслей, полная тишина.',
    dominantEmotion: 'calm' as EmotionKey,
    secondaryEmotion: 'calm_hope' as EmotionKey,
    toneScore: 7.9
  },
  {
    id: 'demo-4',
    timestamp: Date.now() - 86400000 * 2,
    dateString: 'Позавчера',
    rawText: 'Встретился с друзьями после пар. Смеялись до слез над глупыми мемами, стало так тепло на душе.',
    dominantEmotion: 'joy' as EmotionKey,
    secondaryEmotion: 'love' as EmotionKey,
    toneScore: 8.7
  },
  {
    id: 'demo-5',
    timestamp: Date.now() - 86400000 * 1,
    dateString: 'Вчера',
    rawText: 'Опять навалилось много заданий, почувствовал сухость внутри, но решил сделать паузу.',
    dominantEmotion: 'reboot' as EmotionKey,
    secondaryEmotion: 'uncertainty' as EmotionKey,
    toneScore: 5.6
  }
];
