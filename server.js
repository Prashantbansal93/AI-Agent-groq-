require('dotenv').config();
const express = require('express');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const app = express();
app.use(express.json());
app.use(express.static('public'));

const notes = [];

function calculate(expression) {
  return eval(expression);
}

function saveNote(note) {
  notes.push(note);
  return `Note saved: "${note}"`;
}

const tools = [
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Solve a math expression and return the result',
      parameters: {
        type: 'object',
        properties: { expression: { type: 'string', description: 'e.g. "5 + 3"' } },
        required: ['expression'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'saveNote',
      description: 'Save a short text note for later reference',
      parameters: {
        type: 'object',
        properties: { note: { type: 'string', description: 'The note text' } },
        required: ['note'],
      },
    },
  },
];

app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: userMessage }],
      tools: tools,
    });

    const message = response.choices[0].message;

    if (message.tool_calls) {
      const conversation = [{ role: 'user', content: userMessage }, message];

      for (const toolCall of message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        let result;
        if (toolCall.function.name === 'calculate') result = calculate(args.expression);
        else if (toolCall.function.name === 'saveNote') result = saveNote(args.note);

        conversation.push({ role: 'tool', tool_call_id: toolCall.id, content: String(result) });
      }

      const followUp = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: conversation,
      });

      res.json({ reply: followUp.choices[0].message.content });
    } else {
      res.json({ reply: message.content });
    }
  } catch (err) {
    res.status(500).json({ reply: 'Error: ' + err.message });
  }
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));