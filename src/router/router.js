const express = require("express");
const router = express.Router();

const authorize = require("../auth/auth");
const { google } = require('googleapis');

const {
  hasRepliedAndFromEmail,
  sendReply,
  getLabel,
  moveToLabel,
} = require("../function/function");

router.get("/test", async (req, res) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    const response = await gmail.users.getProfile({
      userId: "me",
    });

    const profile = response.data;

    res.send(profile);
  } catch (error) {
    console.log(error);
  }
});

router.get("/drafts", async (req, res) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });
    const drafts = await gmail.users.drafts.list({
      userId: "me",
    });
    res.send(drafts.data);
  } catch (error) {
    console.log(error);
  }
});

router.get("/labels", async (req, res) => {
  try {
    const auth = await authorize();
    const label = await getLabel(auth, "REPLIED");
    res.send(label);
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

router.get("/threads", async (req, res) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });
    const threads = await gmail.users.threads.list({
      userId: "me",
      q: "label:inbox",
    });

    if (!threads.data.threads || threads.data.threads.length === 0) {
      console.log("No unread threads found");
      return res.send("No unread threads found");
    }

    const threadList = threads.data.threads;
    threadList.forEach(async (thread) => {
      const threadData = await gmail.users.threads.get({
        userId: "me",
        id: thread.id,
      });

      const { hasReplied, from } = await hasRepliedAndFromEmail(
        auth,
        thread.id
      );
      console.log({ hasReplied, from });

      if (!hasReplied) {
        const replyMessage = await sendReply(auth, thread.id, from);
        const label = await getLabel(auth, "REPLIED");
        const labelId = label.id;
        const newThread = await moveToLabel(auth, thread.id, labelId);
      } else {
        console.log("Already replied to this email");
      }
    });

    res.send({ message: "Done"});
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

module.exports = router;
