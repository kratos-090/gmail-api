const cron = require("node-cron");

const authorize = require("../auth/auth");

const { google } = require("googleapis");
const {
  hasRepliedAndFromEmail,
  sendReply,
  getLabel,
  moveToLabel,
} = require("../function/function");

const checkMail = cron.schedule(
  "*/45 * * * * *",
  async () => {
    try {
      const auth = await authorize();
      const gmail = google.gmail({ version: "v1", auth });
      const threads = await gmail.users.threads.list({
        userId: "me",
        q: "label:inbox is:unread",
      });

      if (!threads.data.threads || threads.data.threads.length === 0) {
        console.log("No unread threads found");
        return;
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
          console.log("Replied to email");
        } else {
          console.log("Already replied to this email");
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  { scheduled: false }
);

module.exports = checkMail;
