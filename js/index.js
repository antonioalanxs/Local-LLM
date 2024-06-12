import { CreateWebWorkerMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const MODEL = "Llama-3-8B-Instruct-q4f32_1-MLC-1k";

const USER = "user";
const BOT = "bot";

const $ = (e) => document.querySelector(e);

const $form = $("form");
const $input = $("input");
const $template = $("#message-template");
const $messages = $("ul");
const $container = $("main");
const $button = $("button");
const $information = $("small");
const $spinner = $(".spinner");

let messages = [];

const engine = await CreateWebWorkerMLCEngine(
  new Worker("./js/worker.js", { type: "module" }),
  MODEL,
  {
    initProgressCallback: (information) => {
      $information.textContent = `${information.text}`;

      if (information.progress === 1) {
        $spinner.remove();

        $button.disabled = false;

        if (messages.length === 0) {
          addMessage("How can I help you?", BOT);

          messages.push({
            role: "assistant",
            content: "How can I help you?",
          });
        }

        $input.focus();
      }
    },
  }
);

$form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = $input.value.trim();

  if (text === "") return;

  $input.value = "";

  addMessage(text, USER);

  $button.disabled = true;

  messages.push({
    role: "user",
    content: text,
  });

  const chunks = await engine.chat.completions.create({
    messages,
    stream: true,
  });

  let reply = "";
  const $botParagraph = addMessage("", BOT);

  for await (const chunk of chunks) {
    const choice = chunk.choices[0];
    const content = choice?.delta?.content ?? "";
    reply += content;
    $botParagraph.textContent = reply;
  }

  $button.disabled = false;

  messages.push({
    role: "assistant",
    content: reply,
  });

  $container.scrollTop = $container.scrollHeight;
});

/**
 * Clone the template, add the message to the chat, and scroll to the bottom.
 *
 * @param {string} text - The message text.
 * @param {string} sender - The message sender. Can be "user" or "bot" defined in the constants.
 *
 * @returns {HTMLParagraphElement} The message element.
 */
function addMessage(text, sender) {
  const clonedTemplate = $template.content.cloneNode(true);

  const $newMessage = clonedTemplate.querySelector(".message");

  const $who = $newMessage.querySelector("span");
  const $text = $newMessage.querySelector("p");

  $who.textContent = sender === USER ? "You" : "BOT";
  $text.textContent = text;
  $newMessage.classList.add(sender);

  $messages.appendChild($newMessage);

  $container.scrollTop = $container.scrollHeight;

  return $text;
}
