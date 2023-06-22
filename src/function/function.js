const path = require("path");
const fs = require("fs").promises;

const LABEL_PATH = path.join(process.cwd(), "label.json");
const { google } = require("googleapis");

const authorize = require("../auth/auth");

const hasRepliedAndFromEmail = async (auth, threadId) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });
    const res = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
    });

    const thread = res.data;
    const messages = thread.messages;

    if (!messages || messages.length === 0) {
      console.log("No messages found in the thread.");
      return false;
    }

    let from = "";
    let hasReplied = false;

    const messageHeader = messages[0].payload.headers.find(
      (header) => header.name === "From"
    );
    from = messageHeader.value.split("<")[1].split(">")[0];

    messages.forEach((message) => {
      const headers = message.payload.headers;
      const subjectHeader = headers.find(
        (header) =>
          header.name === "Subject" && header.value === "automated reply"
      );
      if (subjectHeader) {
        hasReplied = true;
      }
    });

    return { hasReplied, from };
  } catch (error) {
    return error;
  }
};

const checkLabel = async (auth, label) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });
    const labels = await gmail.users.labels.list({
      userId: "me",
    });
    const labelList = labels.data.labels;
    for (let i = 0; i < labelList.length; i++) {
      if (labelList[i].name === label) {
        return {
          isLabel: true,
          label: { id: labelList[i].id, name: labelList[i].name },
        };
      }
    }

    return { isLabel: false };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const createLabel = async (auth, label) => {
  try {
    const auth = await authorize();

    const gmail = google.gmail({ version: "v1", auth });
    const res = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: label,
        type: "user",
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
    console.log(res.data);
    await fs.writeFile(LABEL_PATH, JSON.stringify(res.data));
    return res.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const sendReply = async (auth, threadId, from) => {
  try {
    const auth = await authorize();

    const gmail = google.gmail({ version: "v1", auth });

    const message = {
      to: from,
      subject: "automated reply",
      message: "This is an automated reply. I will get back to you soon.",
    };

    const body = {
      raw: btoa(
        `To: ${message.to}\r\n` +
          `Subject: ${message.subject}\r\n` +
          `\r\n` +
          `${message.message}`
      ),
    };

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: body.raw,
        threadId: threadId,
      },
    });
    console.log(res.data);

    console.log(`Message sent to ${from}`);
  } catch (error) {
    console.log(error);
  }
};

const getLabel = async (auth, labelName) => {
  try {
    const { isLabel, label } = await checkLabel(auth, labelName);
    if (!isLabel) {
      const newLabel = await createLabel(auth, labelName);
      return newLabel;
    }
    return label;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const moveToLabel = async (auth, threadId, labelId) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });
    const newThread = await gmail.users.threads.modify({
      userId: "me",
      addLabelIds: [labelId],
      removeLabelIds: ["INBOX"],
      id: threadId,
    });
    return newThread;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  hasRepliedAndFromEmail,
  checkLabel,
  createLabel,
  sendReply,
  getLabel,
  moveToLabel
};
