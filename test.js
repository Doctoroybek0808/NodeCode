var express = require("express");
const { Telegraf, Markup, Extra } = require("telegraf");
const axios = require("axios");
var multer = require("multer");
const fs = require("fs");
var upload = multer({ dest: "Files/" });
const dotenv = require("dotenv");
const e = require("express");

dotenv.config();
const bot = new Telegraf("1260950187:AAHLxfBbRjRg2mRdrSJjR85XrDS96mi-5QE");
var app = express();

var ctx_g = null;

bot.command("start", (ctx) => {
  //console.log(ctx);
  ctx.reply("Enter Passport ID");
});
bot.on("text", (ctx) => {
  ctx_g = ctx;
  //console.log(ctx)
  var kod_num = validation.isNumber(ctx.message.text);

  if (kod_num === true) {
    try {
      ctx.replyWithChatAction("upload_document");
      const res = axios
        .get(`http://localhost:8808?seria=${ctx.message.text}`, {
          todo: download(),
        })
        .then(
          (response) => {
            console.log(response.data);
            if (response.data.status === 200) {
            } else if (response.data.status === 404) {
              ctx.reply("Person not foud");
            } else {
              response.data.status;
              ctx.reply(response.data);
            }
          },
          (error) => {
            if (error.status !== undefined) {
              if (error.status !== 404) {
                ctx.reply("Person not found");
              }
            } else {
              ctx.reply(error);
            }
          }
        );
    } catch (err) {
      ctx_g.reply(ex);
    }
  } else {
    ctx_g.reply("Person not foud");
  }
});

bot.use((ctx, next) => {
  if (ctx.callbackQuery) {
    if (ctx.callbackQuery.data === "new") {
      ctx.reply("Enter Passport ID");
    }
  }

  return next();
});

//bot.use(menuMiddleware);

bot.launch();

async function download() {
  
  const res = app.post("/", upload.single("image"), async (req, res) => {
    console.log(req)
    try {
      fs.copyFile(req.file.path, "Files/" + req.file.originalname, (err) => {
        if (err) {
          res.send(400, err);
          ctx_g.reply("Bad request");
        } else {
          fs.unlinkSync(req.file.path);
          var path = `./Files/${ctx_g.message.text}.docx`;
          var filename = `${ctx_g.message.text}.docx`;
          if (fs.existsSync(path)) {
            //
            try {
              ctx_g.replyWithChatAction("upload_document");
              return ctx_g
                .replyWithDocument(
                  {
                    source: fs.readFileSync(path),
                    filename: filename,
                  },
                  Extra.HTML().markup((m) =>
                    m.inlineKeyboard([
                      m.callbackButton("New", "new"),
                      m.callbackButton("PDF", "PDF"),
                    ])
                  )
                )
                .then(
                  fs.unlinkSync(path),
                  res.send({ status: 200, message: "success" })
                );
            } catch (err) {
              console.log(err);
            }
          } else {
            ctx_g.reply("Person not foud");
            res.send({ status: 404, message: "Not found" });
          }
        }
      });
    } catch (err) {
      ctx_g.reply("Bad request");
      res.send(400, err);
    }
  });
  app.use((req, res) => {
    ctx_g.reply("Person not foud");
    res.send({ status: 404, message: "Not found" });
  });
}

var validation = {
  isEmailAddress: function (str) {
    var pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return pattern.test(str); // returns a boolean
  },
  isNotEmpty: function (str) {
    var pattern = /\S+/;
    return pattern.test(str); // returns a boolean
  },
  isNumber: function (str) {
    var pattern = /^\d+$/;
    return pattern.test(str); // returns a boolean
  },
  isSame: function (str1, str2) {
    return str1 === str2;
  },
};

app.listen(8090, function () {
  console.log("Server start on 8090");
});
