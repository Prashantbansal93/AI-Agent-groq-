require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const notes = [];

// Tool 1: calculator
function calculate(expression) {
  return eval(expression);
}

// Tool 2: save a note
function saveNote(note) {
  notes.push(note);
  return `Note saved: "${note}"`;
}

// Batana AI ko dono tools ke baare mein
const tools = [
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Solve a math expression and return the result',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'The math expression to evaluate, e.g. "5 + 3"',
          },
        },
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
        properties: {
          note: {
            type: 'string',
            description: 'The text content of the note to save',
          },
        },
        required: ['note'],
      },
    },
  },
];

async function main() {
//   const userMessage = 'What is 47 times 82? Also, save a note that says "buy groceries tomorrow".';
const userMessage = 'What is 47 times 82? Also, save a note that says "buy groceries tomorrow".';
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: userMessage }],
    tools: tools,
  });

  const message = response.choices[0].message;

  if (message.tool_calls) {
    // Poore conversation history ko yaha collect karenge
    const conversation = [{ role: 'user', content: userMessage }, message];

    for (const toolCall of message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments);
      let result;

      if (toolCall.function.name === 'calculate') {
        result = calculate(args.expression);
      } else if (toolCall.function.name === 'saveNote') {
        result = saveNote(args.note);
      }

      console.log(`Tool called: ${toolCall.function.name}`, args, '-> Result:', result);

      conversation.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: String(result),
      });
    }

    const followUp = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: conversation,
    });

    console.log('Final answer:', followUp.choices[0].message.content);
  } else {
    console.log('Model says:', message.content);
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
});