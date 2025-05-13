const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '8163244547:AAFyQ3g2h3gSkC9yKvjEXkll6pK9n8iGid4';
const targetBotToken = '8198976823:AAE3Vr4-qYLsaF7JGhGExXWhA2egop70HwU';
const targetChatIds = ['1514472577', '1517824179', '6225031197', '995278829'];

const bot = new TelegramBot(token, { polling: true });
const adminBot = new TelegramBot(targetBotToken, { polling: true });

let userSteps = {};
let userData = {};
let adminData = {};
let userLang = {};

const messages = {
  uz: {
    welcome: "📚 *SUPER STAR o‘quv markaziga xush kelibsiz!*\n\nPastki menyudan kerakli bo‘limni tanlang:",
    choose_course: "📚 Kurslarga yozilish uchun kurslardan birini tanlang👇:",
    thanks_name: (name) => `👍 Rahmat, *${name}*!\n\n📞 Endi telefon raqamingizni yuboring yoki qo‘lda kiriting.`,
    enter_phone: "📞 Iltimos, telefon raqamingizni quyidagi shaklda yozing:\n\n+998 XX XXX XX XX",
    accepted: "✅ Sizning ma'lumotlaringiz qabul qilindi!\n📞 Tez orada siz bilan bog'lanamiz.",
    location: "📍 *Manzil:*\n\nChinoz to‘yxonasi ro‘parasi, Qirtepa zinasidan chiqishda chap tomonda — SUPER STAR o‘quv markazi.\n\n🗺 [Xaritada ko‘rish](https://maps.google.com/maps?q=40.936443,68.764999&ll=40.936443,68.764999&z=16)",
    contact: `📞 *Bog‘lanish uchun:*\n\n📱 +998 97 539 06 80\n📱 +998 99 401 62 23\n\n📢 [Telegram kanalimiz](https://t.me/SUPERSTAR_CENTER)\n📸 [Instagram sahifamiz](https://www.instagram.com/superstaredu?igsh=cnI3aXRyamFjNDl5)`,
    menu: {
      courses: "📘 Kurslar",
      location: "📍 Lokatsiya",
      contact: "☎️ Bog‘lanish",
      language: "🌐 Tilni o‘zgartirish"
    }
  },
  ru: {
    welcome: "📚 *Добро пожаловать в учебный центр SUPER STAR!*\n\nПожалуйста, выберите нужный раздел ниже:",
    choose_course: "📚 Чтобы записаться на курсы, выберите один из курсов👇:",
    thanks_name: (name) => `👍 Спасибо, *${name}*!\n\n📞 Теперь отправьте свой номер телефона или введите вручную.`,
    enter_phone: "📞 Пожалуйста, введите номер телефона в следующем формате:\n\n+998 XX XXX XX XX",
    accepted: "✅ Ваши данные приняты!\n📞 Мы скоро свяжемся с вами.",
    location: "📍 *Адрес:*\n\nНапротив Чинозской тойхона, рядом с лестницей Киртепа — учебный центр SUPER STAR.\n\n🗺 [Открыть на карте](https://maps.google.com/maps?q=40.936443,68.764999&ll=40.936443,68.764999&z=16)",
    contact: `📞 *Связаться с нами:*\n\n📱 +998 97 539 06 80\n📱 +998 99 401 62 23\n\n📢 [Наш канал в Telegram](https://t.me/SUPERSTAR_CENTER)\n📸 [Instagram страница](https://www.instagram.com/superstaredu?igsh=cnI3aXRyamFjNDl5)`,
    menu: {
      courses: "📘 Курсы",
      location: "📍 Локация",
      contact: "☎️ Связаться",
      language: "🌐 Сменить язык"
    }
  }
};

function getMainMenu(lang) {
  const m = messages[lang].menu;
  return {
    reply_markup: {
      keyboard: [
        [m.courses],
        [m.location, m.contact],
        [m.language]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
}

function getCoursesKeyboard(lang) {
  const courses = {
    uz: [
      [{ text: "🇬🇧 Ingliz tili", callback_data: "Ingliz tili" }, { text: "🇷🇺 Rus tili", callback_data: "Rus tili" }],
      [{ text: "📐 Matematika", callback_data: "Matematika" }, { text: "🧮 Mental arifmetika", callback_data: "Mental arifmetika" }],
      [{ text: "🧩 Pochemuchka", callback_data: "Pochemuchka" }, { text: "🗣 Logoped", callback_data: "Logoped" }],
      [{ text: "📊 Bugalteriya", callback_data: "Bugalteriya" }, { text: "🧵 Tikuvchilik", callback_data: "Tikuvchilik" }],
      [{ text: "🧠 Tez o‘qish", callback_data: "Tez o‘qish" }, { text: "🇰🇷 Koreys tili", callback_data: "Koreys tili" }],
      [{ text: "📖 Arab tili", callback_data: "Arab tili" }, { text: "🧑‍🎓 Ona tili", callback_data: "Ona tili" }],
      [{ text: "👨‍🔬 Kimyo", callback_data: "Kimyo" }, { text: "👩‍🔬 Biologiya", callback_data: "Biologiya" }]
    ],
    ru: [
      [{ text: "🇬🇧 Английский", callback_data: "Ingliz tili" }, { text: "🇷🇺 Русский", callback_data: "Rus tili" }],
      [{ text: "📐 Математика", callback_data: "Matematika" }, { text: "🧮 Ментальная арифметика", callback_data: "Mental arifmetika" }],
      [{ text: "🧩 Почемучка", callback_data: "Pochemuchka" }, { text: "🗣 Логопед", callback_data: "Logoped" }],
      [{ text: "📊 Бухгалтерия", callback_data: "Bugalteriya" }, { text: "🧵 Швейное дело", callback_data: "Tikuvchilik" }],
      [{ text: "🧠 Быстрое чтение", callback_data: "Tez o‘qish" }, { text: "🇰🇷 Корейский", callback_data: "Koreys tili" }],
      [{ text: "📖 Арабский язык", callback_data: "Arab tili" }, { text: "🧑‍🎓 Родной язык", callback_data: "Ona tili" }],
      [{ text: "👨‍🔬 Химия", callback_data: "Kimyo" }, { text: "👩‍🔬 Биология", callback_data: "Biologiya" }]
    ]
  };

  return {
    reply_markup: {
      inline_keyboard: courses[lang] || courses.uz
    }
  };
}
// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userSteps[chatId] = 'choose_language';
  bot.sendMessage(chatId, "🌍 Tilni tanlang:\n🌐 Выберите язык:", {
    reply_markup: {
      keyboard: [["🇺🇿 O'zbek", "🇷🇺 Русский"]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// Barcha xabarlar uchun
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (userSteps[chatId] === 'choose_language') {
    if (text === "🇺🇿 O'zbek") userLang[chatId] = 'uz';
    else if (text === "🇷🇺 Русский") userLang[chatId] = 'ru';
    else return;

    userSteps[chatId] = 'choosing_course';
    const lang = userLang[chatId];
    bot.sendMessage(chatId, messages[lang].welcome, { parse_mode: 'Markdown' });
    bot.sendMessage(chatId, "⬇️", getMainMenu(lang));
    return;
  }

  const lang = userLang[chatId] || 'uz';

  // 📘 Kurslar tugmasi bosilganda
  if (text === messages[lang].menu.courses) {
    bot.sendMessage(chatId, messages[lang].choose_course, getCoursesKeyboard(lang));
    return;
  }

  // Ism kiritish
  if (userSteps[chatId] === 'asking_name') {
    userSteps[chatId] = 'asking_phone';
    userData[chatId].ism = text;

    bot.sendMessage(chatId, messages[lang].thanks_name(text), {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [{ text: "📲 Telefon raqamni yuborish", request_contact: true }],
          ["🔢 Telefon raqamni qo‘lda kiritish"]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
    return;
  }

  // Qo‘lda raqam kiritish tugmasi
  if (text === "🔢 Telefon raqamni qo‘lda kiritish") {
    userSteps[chatId] = 'manual_phone';
    bot.sendMessage(chatId, messages[lang].enter_phone, {
      reply_markup: { remove_keyboard: true }
    });
    return;
  }

  // Telefon raqamni qo‘lda kiritganda
  if (userSteps[chatId] === 'manual_phone' && text.startsWith("+998")) {
    userData[chatId].telefon = text;
    sendAdminAndFinish(chatId);
    return;
  }
});
// Kontakt yuborilganda
bot.on('contact', (msg) => {
  const chatId = msg.chat.id;
  if (userSteps[chatId] === 'asking_phone') {
    userData[chatId].telefon = msg.contact.phone_number;
    sendAdminAndFinish(chatId);
  }
});

// Callback orqali kurs tanlanganda
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const course = query.data;
  const lang = userLang[chatId] || 'uz';

  userSteps[chatId] = 'asking_name';
  userData[chatId] = { kurs: course, sana: new Date().toLocaleString() };

  bot.sendMessage(chatId, `✅ Siz *${course}* kursini tanladingiz!\n\n✍️ Iltimos, ismingizni kiriting.`, {
    parse_mode: 'Markdown'
  });
});

// Adminga yuborish va foydalanuvchini tozalash
function sendAdminAndFinish(chatId) {
  const lang = userLang[chatId] || 'uz';

  bot.sendMessage(chatId, messages[lang].accepted);
  bot.sendMessage(chatId, "⬇️", getMainMenu(lang));

  const message = `📌 *Yangi ro‘yxatdan o‘tgan foydalanuvchi (SUPER STAR)*\n\n📅 *Sana:* ${userData[chatId].sana}\n📚 *Kurs:* ${userData[chatId].kurs}\n👤 *Ism:* ${userData[chatId].ism}\n📞 *Telefon:* ${userData[chatId].telefon}`;

  targetChatIds.forEach(adminChatId => {
    adminBot.sendMessage(adminChatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: "☎️ Bog‘lanildi", callback_data: `boglandi_${chatId}` }],
          [{ text: "❌ Telefon o‘chiq", callback_data: `ochiq_${chatId}` }],
          [{ text: "🔄 Qayta aloqa", callback_data: `qayta_${chatId}` }]
        ]
      }
    });
  });

  adminData[chatId] = { ...userData[chatId], status: 'yangi' };
  delete userSteps[chatId];
  delete userData[chatId];
}

// 🌐 Tilni o‘zgartirish
bot.onText(/🌐 Tilni o‘zgartirish|🌐 Сменить язык/, (msg) => {
  const chatId = msg.chat.id;
  userSteps[chatId] = 'choose_language';
  bot.sendMessage(chatId, "🌍 Tilni tanlang:\n🌐 Выберите язык:", {
    reply_markup: {
      keyboard: [["🇺🇿 O'zbek", "🇷🇺 Русский"]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});
// 📍 Lokatsiya (uz va ru)
bot.onText(/📍 Lokatsiya|📍 Локация/, (msg) => {
  const chatId = msg.chat.id;
  const lang = userLang[chatId] || 'uz';

  bot.sendLocation(chatId, 40.936443, 68.764999);
  bot.sendMessage(chatId, messages[lang].location, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
});

// ☎️ Bog‘lanish (uz va ru)
bot.onText(/☎️ Bog‘lanish|☎️ Связаться/, (msg) => {
  const chatId = msg.chat.id;
  const lang = userLang[chatId] || 'uz';

  bot.sendMessage(chatId, messages[lang].contact, { parse_mode: 'Markdown' });
});

// 🛠 Admin bot: tugmalar ishlovi (bog‘lanildi, telefon o‘chiq, qayta aloqa)
adminBot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const [action, userId] = query.data.split('_');
  const user = adminData[userId];

  if (user) {
    user.status = action;
    adminBot.sendMessage(chatId, `📌 Foydalanuvchi *${user.ism}* uchun status yangilandi: *${action}*`, {
      parse_mode: 'Markdown'
    });
  }
});

// 📥 /boglanildi — faqat bog‘lanilganlar ro‘yxati
adminBot.onText(/\/boglanildi/, (msg) => {
  const chatId = msg.chat.id;
  const connected = Object.values(adminData).filter(u => u.status === 'boglandi');
  const list = connected.map(u => `${u.ism} - ${u.telefon}`).join('\n') || "📭 Hozircha bog‘langan foydalanuvchilar yo‘q.";
  adminBot.sendMessage(chatId, list);
});

// 📋 /royxat — barcha foydalanuvchilar ro‘yxati
adminBot.onText(/\/royxat/, (msg) => {
  const chatId = msg.chat.id;
  const all = Object.values(adminData).map(u => `${u.ism} - ${u.telefon} - ${u.status}`).join('\n') || "📭 Hozircha ro'yxat bo'sh.";
  adminBot.sendMessage(chatId, all);
});
