// const { Telegraf } = require('telegraf');
const {
  Telegraf,
  session,
  Scenes: { BaseScene, Stage, WizardScene },
  Markup,
  Scenes,
} = require('telegraf');
const fetch = require('node-fetch');
const cron = require('node-cron');

const PORT = process.env.PORT || 5000;
const express = require('express');
require('dotenv').config();

// globals

const bot = new Telegraf(process.env.BOT_TOKEN);

const VIP = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'Да', callback_data: 'yes' },
        { text: 'Нет', callback_data: 'not' },
      ],
    ],
  },
};

const re = new RegExp('^[a-zA-Z0-9]+$');
const cifri = new RegExp('/^d{1,6}$/');
const c = new RegExp(/^\d+$/);
const contactDataWizard = new Scenes.WizardScene(
  'CONTACT_DATA_WIZARD_SCENE_ID', // first argument is Scene_ID, same as for BaseScene
  (ctx) => {
    ctx.reply('Логин абонента');
    ctx.wizard.state.contactData = {};
    return ctx.wizard.next();
  },
  (ctx) => {
    // validation example
    // let resLog = ctx.message.text;

    if (ctx.message.text.length < 2) {
      ctx.reply('Введите реальный логин');
      return;
    } else if (ctx.message.text == 'Старт') {
      ctx.reply('не нажимайте Старт в данном поле!');
      return;
    } else if (!re.test(ctx.message.text)) {
      ctx.reply(
        'В логине должны быть только английские буквы и цифры (meg123)'
      );
      return;
    }
    console.log(ctx.wizard.cursor);
    ctx.wizard.state.contactData.login_abontnta = ctx.message.text;
    console.log(ctx.wizard.state.contactData.login_abontnta);
    ctx.reply('Номер муфты(номер выноса)');
    return ctx.wizard.next();
  },
  (ctx) => {
    if (ctx.message.text == '<') {
      ctx.reply('Логин абонента');
      return ctx.wizard.back();
    }
    if (ctx.message.text.length > 6) {
      ctx.reply('Слишком больше количество символов');
      return;
    } else if (!c.test(ctx.message.text)) {
      ctx.reply('Вы должны указать только цифры');
      return;
    } else if (ctx.message.text == 'Старт') {
      ctx.reply('не нажимайте Старт в данном поле!');
      return;
    }

    ctx.reply('номер порта(номер порта в выносе)');
    ctx.wizard.state.contactData.num_mufta = ctx.message.text;
    // ctx.reply(ctx.message.text);
    return ctx.wizard.next();
  },
  (ctx) => {
    console.log(ctx.message.text);
    if (ctx.message.text == '<') {
      ctx.reply('Номер муфты(номер выноса)');
      return ctx.wizard.back();
    }
    if (ctx.message.text.length > 2) {
      ctx.reply('Должно быть не больше двух символов');
      return;
    } else if (ctx.message.text > 32) {
      ctx.reply('число должно быть в диапазоне от 1 до 32');
      return;
    } else if (!c.test(ctx.message.text)) {
      ctx.reply('Вы должны указать только цифры');
      return;
    } else if (ctx.message.text == 'Старт') {
      ctx.reply('не нажимайте Старт в данном поле!');
      return;
    }
    ctx.wizard.state.contactData.num_passport = ctx.message.text;
    ctx.reply('Серийный номер ONU');
    return ctx.wizard.next();
  },
  (ctx) => {
    if (ctx.message.text.length < 4) {
      ctx.reply('Должно быть не меньше четырех символов');
      return;
    } else if (!re.test(ctx.message.text)) {
      ctx.reply('должны указаны быть только английские буквы и цифры');
      return;
    } else if (ctx.message.text == 'Старт') {
      ctx.reply('не нажимайте Старт в данном поле!');
      return;
    }

    ctx.wizard.state.contactData.hzz = ctx.message.text;
    ctx.wizard.state.contactData.ser_num_ONU = ctx.message.text;
    ctx.reply('Акция ВИП на 12', VIP);
    return ctx.wizard.next();
  },
  async (ctx) => {
    let VIPTEXT;
    // console.log(ctx.callbackQuery.data);
    // if (ctx.callbackQuery.data < 1) {
    //   ctx.reply('Должно быть не меньше четырех символов');
    //   return;
    // } else if (
    //   ctx.callbackQuery.data !== 'yes' ||
    //   ctx.callbackQuery.data !== 'not'
    // ) {
    //   ctx.reply('Выберите кнопочный вариант ответа');
    // }

    if (ctx.callbackQuery == undefined) {
      ctx.reply('Серийный номер ONU');
      return ctx.wizard.back();
    } else {
      ctx.reply('dsa');
      console.log(ctx.callbackQuery.data);
      colldata = ctx.callbackQuery.data;
      VIPTEXT = colldata;
    }

    // if (ctx.message.text == '<') {
    // }
    console.log(ctx.wizard.state.contactData);
    // ctx.reply(ctx.wizard.state.contactData).then((data) => {
    //   chatId = data.chat.id;
    //   mesId = data.message_id;

    //   console.log(data);
    // });

    let logAbon = ctx.wizard.state.contactData.login_abontnta;
    let numberMufta = ctx.wizard.state.contactData.num_mufta;
    let numberPass = ctx.wizard.state.contactData.num_passport;
    let OnuText = ctx.wizard.state.contactData.ser_num_ONU;

    let nameOtpravitel = ctx.callbackQuery.from.username;

    // ctx.wizard.state.contactData.login_abontnta;

    chanelId = -1001160560461;
    let texForward = ctx.wizard.state.contactData.text;
    let parse_mod = 'HTML';
    // ctx.reply(vipText);

    ctx.reply('Информация добавлена');
    ctx.reply(
      `<b>Логин абонента</b>: ${logAbon} \n<b>Номер муфты</b>: ${numberMufta} \n<b>Номер порта</b>: ${numberPass} \n<b>Серийный номер ONU</b>: ${OnuText} \n<b>Акция ВИП на 12</b>: ${VIPTEXT} \n<b>Отправитель</b>: @${nameOtpravitel}`,
      { parse_mode: 'HTML' }
    );
    // bot.telegram.sendMessage(
    //   chanelId,
    //   `<b>Логин абонента</b>: ${logAbon} \n<b>Номер муфты</b>: ${numberMufta} \n<b>Номер порта</b>: ${numberPass} \n<b>Серийный номер ONU</b>: ${OnuText} \n<b>Акция ВИП на 12</b>: ${VIPTEXT} \n<b>Отправитель</b>: @${nameOtpravitel}`,
    //   { parse_mode: 'HTML' }
    // );

    return ctx.scene.leave();
  }
);
const stage = new Stage([contactDataWizard]);
bot.use(session());
bot.use(stage.middleware());

// bot.start((ctx) => {
//   ctx.reply(Markup.keyboard([['Старт']]).resize());
//   ctx.scene.enter('CONTACT_DATA_WIZARD_SCENE_ID');
//   let tta = ctx.update.message.chat.id;
//   bot.telegram.getChat(tta).then(console.log(tta));
//   console.log(ctx.message.from);
// });

bot.start((ctx) =>
  ctx.reply(
    `Привет ${ctx.message.from.first_name}`,
    Markup.keyboard(['<', 'Старт']).resize()
  )
);

bot.on('text', (ctx) => {
  let starting = ctx.message.text;

  if (starting == 'Старт') {
    ctx.scene.enter('CONTACT_DATA_WIZARD_SCENE_ID');
  }
});

bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.launch();

express().listen(PORT, () => console.log(`Listening on ${PORT}`));
