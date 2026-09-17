import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

export async function sendChat(messages) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 2500,
        temperature: 0.1
    });

    return response.choices[0]?.message?.content?.trim() || '';
}
