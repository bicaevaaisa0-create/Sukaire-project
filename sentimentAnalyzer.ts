import { EmotionKey, EmotionAnalysisResult } from '../types';
import { COLOR_MATRIX } from '../data/colorMatrix';
import { findAtlasEmotions } from '../data/atlas87';
import { detectPlutchik, WU_XING, JAPANESE_CONCEPTS } from '../data/wheels';

interface KeywordRule {
  emotion: EmotionKey;
  keywords: string[];
  weight: number;
}

const EMOTION_RULES: KeywordRule[] = [
  {
    emotion: 'burnout',
    keywords: [
      'выгора', 'устал', 'сил нет', 'опустош', 'истощен', 'не могу больше',
      'апатия', 'ничего не хочу', 'тупик', 'тяжело дышать', 'сонлив', 'сессия достала',
      'выжат', 'вымотан', 'руки опускаются', 'бессмысленно', 'пусто внутри'
    ],
    weight: 1.3
  },
  {
    emotion: 'anxiety',
    keywords: [
      'тревог', 'страх', 'боюсь', 'паник', 'паникую', 'пережива', 'нерв',
      'трясет', 'дрожь', 'сердце колотится', 'не успею', 'дедлайн', 'экзамен',
      'ошибка', 'стыдно', 'напряжен', 'боязно', 'страшно', 'давление', 'накручиваю'
    ],
    weight: 1.25
  },
  {
    emotion: 'uncertainty',
    keywords: [
      'не знаю', 'сомнева', 'неуверен', 'потерян', 'растерян', 'запутался',
      'туман', 'не понимаю', 'куда идти', 'что делать', 'выбор', 'странно'
    ],
    weight: 1.1
  },
  {
    emotion: 'sadness',
    keywords: [
      'груст', 'печал', 'плач', 'слез', 'тоск', 'одинок', 'скуча', 'больно',
      'разочарован', 'бросил', 'обид', 'холод', 'пустота', 'потеря'
    ],
    weight: 1.2
  },
  {
    emotion: 'reboot',
    keywords: [
      'перезагруз', 'пауз', 'отдыха', 'начать заново', 'восстанавл', 'перерыв',
      'прогулк', 'полегчало', 'отпускает', 'вдох-выдох', 'передышка', 'замедл'
    ],
    weight: 1.15
  },
  {
    emotion: 'calm',
    keywords: [
      'спокойн', 'тишин', 'тихо', 'мирно', 'уют', 'размерен', 'безмятежн',
      'легко', 'дышу', 'комфорт', 'чай', 'теплый плед', 'расслаблен', 'гармония'
    ],
    weight: 1.1
  },
  {
    emotion: 'hope',
    keywords: [
      'надежд', 'верю', 'получится', 'справлюсь', 'лучше', 'рассвет',
      'завтра', 'свет', 'шанс', 'будущее', 'открыт', 'мечта', 'надеюсь'
    ],
    weight: 1.2
  },
  {
    emotion: 'calm_hope',
    keywords: [
      'ясность', 'принятие', 'лес', 'солнечный луч', 'глубокий вдох',
      'все наладится', 'чистый воздух', 'умиротворение', 'доверие к жизни'
    ],
    weight: 1.2
  },
  {
    emotion: 'joy',
    keywords: [
      'радост', 'счастлив', 'восторг', 'ура', 'смех', 'улыбк', 'круто',
      'кайф', 'супер', 'получилось', 'побед', 'сияю', 'тепло', 'весел'
    ],
    weight: 1.3
  },
  {
    emotion: 'love',
    keywords: [
      'любов', 'нежност', 'забот', 'люблю', 'обнять', 'родной', 'близк',
      'благодар', 'сердце греет', 'теплота', 'ласка', 'привязан'
    ],
    weight: 1.2
  },
  {
    emotion: 'resolve',
    keywords: [
      'решим', 'уверен', 'сделаю', 'цель', 'действоват', 'сила', 'побежд',
      'собран', 'готов', 'контрол', 'воля', 'план', 'вперед'
    ],
    weight: 1.2
  }
];

export function analyzeEmotionalText(text: string, voiceMetrics?: { pitchMean?: number; volumeVariance?: number }): EmotionAnalysisResult {
  const normalized = text.toLowerCase();

  const scores: Partial<Record<EmotionKey, number>> = {};

  EMOTION_RULES.forEach(rule => {
    let matchCount = 0;
    rule.keywords.forEach(kw => {
      const regex = new RegExp(kw, 'gi');
      const matches = normalized.match(regex);
      if (matches) {
        matchCount += matches.length;
      }
    });
    if (matchCount > 0) {
      scores[rule.emotion] = (scores[rule.emotion] || 0) + matchCount * rule.weight;
    }
  });

  // Acoustic voice adjustments if present
  if (voiceMetrics) {
    if (voiceMetrics.pitchMean && voiceMetrics.pitchMean > 240) {
      // higher pitch often corresponds to heightened anxiety, excitement, or tension
      scores['anxiety'] = (scores['anxiety'] || 0) + 1.2;
    } else if (voiceMetrics.pitchMean && voiceMetrics.pitchMean < 140) {
      // lower flat pitch may align with fatigue/burnout or calm
      scores['burnout'] = (scores['burnout'] || 0) + 0.8;
      scores['calm'] = (scores['calm'] || 0) + 0.5;
    }
  }

  // Handle special dual conditions
  const hasHope = (scores['hope'] || 0) > 0;
  const hasCalm = (scores['calm'] || 0) > 0;

  if (hasCalm && hasHope && !scores['calm_hope']) {
    scores['calm_hope'] = ((scores['calm'] || 0) + (scores['hope'] || 0)) * 0.9;
  }

  // --- Atlas of the Heart (87) + Plutchik detection ---
  const atlasHits = findAtlasEmotions(normalized, 6);
  const plutchikHits = detectPlutchik(normalized);

  // Атлас усиливает базовую матрицу: каждая найденная тонкая эмоция добавляет вес своей базе
  atlasHits.forEach((a, idx) => {
    scores[a.base] = (scores[a.base] || 0) + (1.5 - idx * 0.18);
  });
  plutchikHits.forEach(p => {
    scores[p.petal.sukaire] = (scores[p.petal.sukaire] || 0) + p.score * 0.6;
  });

  // Sort scores to determine dominant and secondary emotions
  const sortedEntries = (Object.entries(scores) as [EmotionKey, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  let dominant: EmotionKey = 'calm_hope';
  let secondary: EmotionKey | undefined = undefined;
  let dominantRatio = 0.7;
  let secondaryRatio = 0.3;

  if (sortedEntries.length > 0) {
    dominant = sortedEntries[0][0];
    if (sortedEntries.length > 1 && sortedEntries[1][1] > 0.5) {
      secondary = sortedEntries[1][0];
      const sum = sortedEntries[0][1] + sortedEntries[1][1];
      dominantRatio = Math.round((sortedEntries[0][1] / sum) * 100) / 100;
      secondaryRatio = Math.round((1 - dominantRatio) * 100) / 100;
      // Clamp bounds (60-75% dominant, 25-40% secondary)
      if (dominantRatio < 0.6) dominantRatio = 0.65;
      if (dominantRatio > 0.8) dominantRatio = 0.75;
      secondaryRatio = Math.round((1 - dominantRatio) * 100) / 100;
    }
  } else {
    // Default fallback based on general length or gentle prompt
    if (normalized.length > 10) {
      dominant = 'uncertainty';
      secondary = 'reboot';
    } else {
      dominant = 'calm_hope';
      secondary = 'calm';
    }
  }

  // Tone score: 1 (deep burnout/pain) to 10 (radiant high energy joy)
  const toneMap: Record<EmotionKey, number> = {
    burnout: 2.2,
    sadness: 3.1,
    anxiety: 3.8,
    uncertainty: 4.4,
    reboot: 5.6,
    calm: 6.8,
    calm_hope: 7.4,
    hope: 7.9,
    love: 8.5,
    resolve: 8.2,
    joy: 9.3
  };

  let toneScore = toneMap[dominant];
  if (secondary) {
    toneScore = Math.round((toneMap[dominant] * dominantRatio + toneMap[secondary] * secondaryRatio) * 10) / 10;
  }

  // Generate composite background gradient if secondary emotion exists
  const basePalette = COLOR_MATRIX[dominant];
  let customPalette = { ...basePalette };

  if (secondary) {
    const secPalette = COLOR_MATRIX[secondary];
    customPalette = {
      ...basePalette,
      primaryColorsRu: `${basePalette.nameRu} (${Math.round(dominantRatio * 100)}%) + ${secPalette.nameRu} (${Math.round(secondaryRatio * 100)}%)`,
      bgGradient: `radial-gradient(130% 130% at 45% 20%, ${basePalette.primaryHex}22 0%, ${secPalette.primaryHex}33 50%, #FAF8F5 100%)`,
      accentHex: secPalette.primaryHex
    };
  }

  // Generate warm, non-robotic psychological reflections
  const { summaryTitle, validation, exercise, cultural, realm } = generatePsychologicalGuidance(dominant, secondary, toneScore);

  return {
    dominantEmotion: dominant,
    secondaryEmotion: secondary,
    dominantRatio,
    secondaryRatio,
    toneScore,
    intensity: toneScore > 7.5 ? 'high' : toneScore < 4.0 ? 'low' : 'medium',
    palette: customPalette,
    summaryTitle,
    psychologicalValidation: validation,
    groundingExercise: exercise,
    culturalNote: cultural,
    recommendedRealm: realm,
    atlas: atlasHits.map(a => a.id),
    plutchik: plutchikHits.map(p => p.petal.id),
    wuxing: (WU_XING.find(w => w.sukaire === dominant) || WU_XING[2]).id,
    japanese: (JAPANESE_CONCEPTS.find(j => j.sukaire === dominant) || JAPANESE_CONCEPTS[4]).id
  };
}

function generatePsychologicalGuidance(dominant: EmotionKey, _secondary?: EmotionKey, _toneScore: number = 5): {
  summaryTitle: string;
  validation: string;
  exercise: string;
  cultural: string;
  realm: 'forest' | 'cosmic' | 'steppe';
} {
  switch (dominant) {
    case 'burnout':
      return {
        summaryTitle: 'Пыльный штиль: потребность в тихом коконе',
        validation: 'Вы не обязаны быть продуктивными каждую секунду. Когда энергия иссякает, тело и психика включают естественную защиту — выгорание говорит о том, что вы отдавали слишком много, не успевая наполнять свой сосуд.',
        exercise: 'Опустите плечи, разомкните челюсть. Закройте глаза на 2 минуты. Почувствуйте, как стопы касаются пола — прямо сейчас от вас не требуется никаких решений.',
        cultural: 'В казахской традиции такое состояние бережно называют «сары уайым» — глубокая усталость, требующая тепла родного очага («қара шаңырақ») и тишины.',
        realm: 'steppe'
      };

    case 'anxiety':
      return {
        summaryTitle: 'Лавандовая рябь: натянутая струна и поиск опоры',
        validation: 'Тревога — это не признак слабости, а сверхбдительность нервной системы, пытающейся защитить вас от неизвестности. Мы слышим ваше напряжение. Важно признать: мысль — это еще не факт катастрофы.',
        exercise: 'Техника «5-4-3-2-1»: найдите взглядом 5 предметов лавандового или светлого оттенка, потрогайте 4 разные текстуры рядом, услышьте 3 тихих звука.',
        cultural: 'Лавандовые и серебристые тона матрицы снижают частоту пульса, рассеивая избыточный внутренний «ветер» (в китайской традиции — умиротворение избытка Огня через Металл).',
        realm: 'forest'
      };

    case 'calm_hope':
    case 'hope':
      return {
        summaryTitle: 'Шалфейный рассвет: прорастание света',
        validation: 'Внутри вас начинает расправляться мягкое доверие к себе. Даже если впереди еще много дел и учебы, это состояние — ваш надежный якорь и тихая вера в то, что всё постепенно сложится.',
        exercise: 'Сделайте глубокий медленный вдох носом на 4 счета, наполняя живот, и плавный выдох через чуть приоткрытые губы на 6 счетов. Представьте, как изумрудный свет расширяется.',
        cultural: 'Символ «Ақ жол» (светлый чистый путь) и весенний цвет «Жасыл» (обновление степи) несут благословение на мягкий шаг вперед.',
        realm: 'forest'
      };

    case 'calm':
      return {
        summaryTitle: 'Небесная гладь: простор и чистое дыхание',
        validation: 'Редкое и драгоценное состояние равновесия. Когда внутри штиль, ум видит вещи ясными, без искажений страха и спешки. Сохраните это ощущение в памяти тела.',
        exercise: 'Положите ладонь на центр груди. Почувствуйте ровный, размеренный стук сердца. Побудьте в этом без мыслей еще несколько мгновений.',
        cultural: '«Көк» — небесный лазурный цвет Тенгри, означающий бесконечность, свободу и кристальную чистоту сознания.',
        realm: 'cosmic'
      };

    case 'joy':
      return {
        summaryTitle: 'Золотое свечение: искрящийся теплый импульс',
        validation: 'Ваша радость заразительна и наполняет вас энергией! Зафиксируйте этот момент — пусть этот золотой вечерний свет согреет вас в моменты, когда будет непросто.',
        exercise: 'Улыбнитесь и мысленно поблагодарите себя или человека, благодаря которому этот момент случился.',
        cultural: '«Сары» как солнечный луч и стихия Огня в У-син — естественное тепло радости, озаряющее внутренний путь.',
        realm: 'forest'
      };

    case 'love':
      return {
        summaryTitle: 'Малиновый бархат: тепло и глубокое принятие',
        validation: 'Нежность и забота — величайшая сила. Способность чувствовать тепло и сострадание к себе и окружающим исцеляет старые раны.',
        exercise: 'Обнимите себя за плечи или сожмите руки в замок. Позвольте себе побыть в абсолютной безопасности.',
        cultural: '«Ақ жүрек» — чистое сердце и искреннее благородство помыслов.',
        realm: 'cosmic'
      };

    case 'resolve':
      return {
        summaryTitle: 'Коралловая ясность: собранность и фокус',
        validation: 'Вы чувствуете свою силу и намерение. Сомнения отступают, когда появляется готовность действовать шаг за шагом.',
        exercise: 'Выпрямите спину, расправьте грудную клетку. Сделайте четкий, уверенный вдох.',
        cultural: '«Қызыл» — символ жизненной силы, огня решимости и неугасимой воли.',
        realm: 'steppe'
      };

    case 'sadness':
      return {
        summaryTitle: 'Индиговая глубина: тихое омовение чувств',
        validation: 'Грусть — это не враг. Это бережный способ психики оплакать то, что не сбылось или было дорого. Не торопите себя веселиться, позвольте дождю пролиться.',
        exercise: 'Завернитесь в мягкий плед, налейте теплой воды. Разрешите себе просто посидеть в тишине без чувства вины.',
        cultural: 'Вода в У-син очищает берега и уносит накопленную тяжесть.',
        realm: 'cosmic'
      };

    case 'uncertainty':
      return {
        summaryTitle: 'Серебристый туман: мягкая пауза перед выбором',
        validation: 'Не знать ответ прямо сейчас — абсолютно нормально. В тумане не нужно бежать; достаточно сделать один маленький шаг на расстоянии вытянутой руки.',
        exercise: 'Посмотрите вокруг и назовите три вещи, в которых вы точно уверены прямо сейчас (например: я дышу, пол под ногами твердый, день продолжается).',
        cultural: '«Тұман» над бескрайней степью всегда рассеивается с первыми лучами утреннего солнца.',
        realm: 'steppe'
      };

    case 'reboot':
    default:
      return {
        summaryTitle: 'Коралловый пульс: бережное возвращение к себе',
        validation: 'Вы проходите важную точку переключения. После усталости или шторма пульс жизни восстанавливается. Дайте себе время на акклиматизацию.',
        exercise: 'Выпейте стакан чистой воды медленными глотками, концентрируясь на свежести.',
        cultural: '«Таң шапағы» — первый робкий, но неудержимый луч рассвета.',
        realm: 'forest'
      };
  }
}
